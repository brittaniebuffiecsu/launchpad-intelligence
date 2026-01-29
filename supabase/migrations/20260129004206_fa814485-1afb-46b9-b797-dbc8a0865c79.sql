-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('platform_admin', 'researcher', 'sales_rep', 'analyst', 'integration_manager');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Profiles table for user info
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Research databases table
CREATE TABLE public.research_databases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    data JSONB DEFAULT '{}',
    source TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Market data table
CREATE TABLE public.market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    industry TEXT,
    metrics JSONB DEFAULT '{}',
    trends JSONB DEFAULT '{}',
    source TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leads table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    source TEXT,
    notes TEXT,
    score INTEGER DEFAULT 0,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analytics data table
CREATE TABLE public.analytics_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    page_path TEXT,
    page_visits INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    source TEXT,
    device_type TEXT,
    country TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Integrations table
CREATE TABLE public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT,
    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
    config JSONB DEFAULT '{}',
    api_key_hint TEXT,
    webhook_url TEXT,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ads campaigns table
CREATE TABLE public.ads_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    budget DECIMAL(12,2) DEFAULT 0,
    spend DECIMAL(12,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0,
    cpc DECIMAL(10,4) DEFAULT 0,
    roas DECIMAL(10,4) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    target_audience JSONB DEFAULT '{}',
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Research database access (membership table)
CREATE TABLE public.research_database_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    database_id UUID REFERENCES public.research_databases(id) ON DELETE CASCADE NOT NULL,
    permission_level TEXT DEFAULT 'read' CHECK (permission_level IN ('read', 'write', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, database_id)
);

-- Lead assignments table
CREATE TABLE public.lead_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (lead_id, user_id)
);

-- Helper function: Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function: Check if user can access research database
CREATE OR REPLACE FUNCTION public.can_access_research_database(_user_id UUID, _database_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.research_databases WHERE id = _database_id AND owner_id = _user_id
    UNION
    SELECT 1 FROM public.research_database_access WHERE database_id = _database_id AND user_id = _user_id
  ) OR public.has_role(_user_id, 'platform_admin')
$$;

-- Helper function: Check if user is lead owner or assigned
CREATE OR REPLACE FUNCTION public.can_access_lead(_user_id UUID, _lead_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.leads WHERE id = _lead_id AND (owner_id = _user_id OR assigned_to = _user_id)
    UNION
    SELECT 1 FROM public.lead_assignments WHERE lead_id = _lead_id AND user_id = _user_id
  ) OR public.has_role(_user_id, 'platform_admin')
$$;

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Auto-assign platform_admin role to first user, otherwise default to analyst
  IF NOT EXISTS (SELECT 1 FROM public.user_roles LIMIT 1) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'platform_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'analyst');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_research_databases_updated_at BEFORE UPDATE ON public.research_databases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_market_data_updated_at BEFORE UPDATE ON public.market_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ads_campaigns_updated_at BEFORE UPDATE ON public.ads_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_database_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'platform_admin'));

-- Research databases policies
CREATE POLICY "Users can view accessible databases" ON public.research_databases FOR SELECT USING (public.can_access_research_database(auth.uid(), id));
CREATE POLICY "Researchers and admins can insert" ON public.research_databases FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'researcher') OR public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Owners and admins can update" ON public.research_databases FOR UPDATE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Owners and admins can delete" ON public.research_databases FOR DELETE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'platform_admin'));

-- Market data policies
CREATE POLICY "Analysts and admins can view all" ON public.market_data FOR SELECT USING (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'platform_admin') OR owner_id = auth.uid());
CREATE POLICY "Analysts and admins can insert" ON public.market_data FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Owners and admins can update" ON public.market_data FOR UPDATE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Owners and admins can delete" ON public.market_data FOR DELETE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'platform_admin'));

-- Leads policies
CREATE POLICY "Users can view accessible leads" ON public.leads FOR SELECT USING (public.can_access_lead(auth.uid(), id));
CREATE POLICY "Sales and admins can insert" ON public.leads FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'sales_rep') OR public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Owners and admins can update" ON public.leads FOR UPDATE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Owners and admins can delete" ON public.leads FOR DELETE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'platform_admin'));

-- Analytics data policies
CREATE POLICY "Analysts and admins can view" ON public.analytics_data FOR SELECT USING (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'platform_admin') OR owner_id = auth.uid());
CREATE POLICY "Analysts and admins can insert" ON public.analytics_data FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Owners and admins can delete" ON public.analytics_data FOR DELETE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'platform_admin'));

-- Integrations policies
CREATE POLICY "Managers and admins can view" ON public.integrations FOR SELECT USING (public.has_role(auth.uid(), 'integration_manager') OR public.has_role(auth.uid(), 'platform_admin') OR owner_id = auth.uid());
CREATE POLICY "Managers and admins can insert" ON public.integrations FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'integration_manager') OR public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Owners and admins can update" ON public.integrations FOR UPDATE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Owners and admins can delete" ON public.integrations FOR DELETE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'platform_admin'));

-- Ads campaigns policies
CREATE POLICY "Owners and admins can view" ON public.ads_campaigns FOR SELECT USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Admins can insert" ON public.ads_campaigns FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Owners and admins can update" ON public.ads_campaigns FOR UPDATE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'platform_admin'));
CREATE POLICY "Owners and admins can delete" ON public.ads_campaigns FOR DELETE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'platform_admin'));

-- Research database access policies
CREATE POLICY "Owners and admins can manage access" ON public.research_database_access FOR ALL USING (
  EXISTS (SELECT 1 FROM public.research_databases WHERE id = database_id AND owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'platform_admin')
);

-- Lead assignments policies
CREATE POLICY "Lead owners and admins can manage assignments" ON public.lead_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id AND owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'platform_admin')
  OR public.has_role(auth.uid(), 'sales_rep')
);