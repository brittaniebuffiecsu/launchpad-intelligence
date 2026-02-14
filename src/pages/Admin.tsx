import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Plug, 
  Megaphone,
  LogOut,
  Shield
} from "lucide-react";
import ResearchDatabases from "@/components/admin/ResearchDatabases";
import MarketData from "@/components/admin/MarketData";
import LeadsManagement from "@/components/admin/LeadsManagement";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import IntegrationsHub from "@/components/admin/IntegrationsHub";
import AdsCampaigns from "@/components/admin/AdsCampaigns";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Verify user has an admin role before granting access
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const adminRoles = ["platform_admin", "researcher", "sales_rep", "analyst", "integration_manager"];
      const userRole = roles?.find(r => adminRoles.includes(r.role));

      if (!userRole) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setUser(session.user);
      setUserRole(userRole.role);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/auth");
        } else if (session) {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {user?.email} • {userRole || "No role"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="research" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid bg-muted/50 p-1">
            <TabsTrigger value="research" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Research</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Market Data</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Plug className="w-4 h-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Ads</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="research" className="space-y-4">
            <ResearchDatabases />
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            <MarketData />
          </TabsContent>

          <TabsContent value="leads" className="space-y-4">
            <LeadsManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <IntegrationsHub />
          </TabsContent>

          <TabsContent value="ads" className="space-y-4">
            <AdsCampaigns />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
