export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ads_campaigns: {
        Row: {
          budget: number | null
          clicks: number | null
          conversions: number | null
          cpc: number | null
          created_at: string
          ctr: number | null
          end_date: string | null
          id: string
          impressions: number | null
          name: string
          owner_id: string | null
          platform: string
          roas: number | null
          spend: number | null
          start_date: string | null
          status: string | null
          target_audience: Json | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          name: string
          owner_id?: string | null
          platform: string
          roas?: number | null
          spend?: number | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          name?: string
          owner_id?: string | null
          platform?: string
          roas?: number | null
          spend?: number | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      analytics_data: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          conversions: number | null
          country: string | null
          created_at: string
          date: string
          device_type: string | null
          id: string
          owner_id: string | null
          page_path: string | null
          page_visits: number | null
          source: string | null
          unique_visitors: number | null
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          conversions?: number | null
          country?: string | null
          created_at?: string
          date?: string
          device_type?: string | null
          id?: string
          owner_id?: string | null
          page_path?: string | null
          page_visits?: number | null
          source?: string | null
          unique_visitors?: number | null
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          conversions?: number | null
          country?: string | null
          created_at?: string
          date?: string
          device_type?: string | null
          id?: string
          owner_id?: string | null
          page_path?: string | null
          page_visits?: number | null
          source?: string | null
          unique_visitors?: number | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          api_key_hint: string | null
          config: Json | null
          created_at: string
          id: string
          last_synced_at: string | null
          name: string
          owner_id: string | null
          provider: string | null
          status: string | null
          type: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key_hint?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          name: string
          owner_id?: string | null
          provider?: string | null
          status?: string | null
          type: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key_hint?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          name?: string
          owner_id?: string | null
          provider?: string | null
          status?: string | null
          type?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      lead_assignments: {
        Row: {
          assigned_at: string
          id: string
          lead_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          lead_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          lead_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string | null
          phone: string | null
          score: number | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      market_data: {
        Row: {
          created_at: string
          date: string
          id: string
          industry: string | null
          metrics: Json | null
          owner_id: string | null
          source: string | null
          trends: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          industry?: string | null
          metrics?: Json | null
          owner_id?: string | null
          source?: string | null
          trends?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          industry?: string | null
          metrics?: Json | null
          owner_id?: string | null
          source?: string | null
          trends?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      research_database_access: {
        Row: {
          created_at: string
          database_id: string
          id: string
          permission_level: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          database_id: string
          id?: string
          permission_level?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          database_id?: string
          id?: string
          permission_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_database_access_database_id_fkey"
            columns: ["database_id"]
            isOneToOne: false
            referencedRelation: "research_databases"
            referencedColumns: ["id"]
          },
        ]
      }
      research_databases: {
        Row: {
          category: string | null
          created_at: string
          data: Json | null
          description: string | null
          id: string
          name: string
          owner_id: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          data?: Json | null
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          data?: Json | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_lead: {
        Args: { _lead_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_research_database: {
        Args: { _database_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "platform_admin"
        | "researcher"
        | "sales_rep"
        | "analyst"
        | "integration_manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "platform_admin",
        "researcher",
        "sales_rep",
        "analyst",
        "integration_manager",
      ],
    },
  },
} as const
