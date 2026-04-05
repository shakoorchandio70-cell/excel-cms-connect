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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      complaints: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          category: string
          category_other: string | null
          complainant_email: string | null
          complainant_name: string | null
          complainant_phone: string | null
          complaint_number: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          last_updated_at: string | null
          last_updated_by: string | null
          priority: string
          reopen_count: number | null
          reopened_at: string | null
          resolution_notes: string | null
          resolved_at: string | null
          section: string | null
          sms_sent: boolean | null
          sms_sent_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          category?: string
          category_other?: string | null
          complainant_email?: string | null
          complainant_name?: string | null
          complainant_phone?: string | null
          complaint_number: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          last_updated_at?: string | null
          last_updated_by?: string | null
          priority?: string
          reopen_count?: number | null
          reopened_at?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          section?: string | null
          sms_sent?: boolean | null
          sms_sent_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          category?: string
          category_other?: string | null
          complainant_email?: string | null
          complainant_name?: string | null
          complainant_phone?: string | null
          complaint_number?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          last_updated_at?: string | null
          last_updated_by?: string | null
          priority?: string
          reopen_count?: number | null
          reopened_at?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          section?: string | null
          sms_sent?: boolean | null
          sms_sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          action: string
          comment: string | null
          complaint_id: string
          id: string
          rating: number | null
          reopen_reason: string | null
          submitted_at: string | null
          submitted_by: string
        }
        Insert: {
          action: string
          comment?: string | null
          complaint_id: string
          id?: string
          rating?: number | null
          reopen_reason?: string | null
          submitted_at?: string | null
          submitted_by: string
        }
        Update: {
          action?: string
          comment?: string | null
          complaint_id?: string
          id?: string
          rating?: number | null
          reopen_reason?: string | null
          submitted_at?: string | null
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string
          created_at: string
          current_stock: number
          id: string
          item_name: string
          min_level: number
          total_consumed: number
          total_inward: number
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          current_stock?: number
          id?: string
          item_name: string
          min_level?: number
          total_consumed?: number
          total_inward?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          current_stock?: number
          id?: string
          item_name?: string
          min_level?: number
          total_consumed?: number
          total_inward?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          complaint_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          complaint_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          complaint_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_alert_time: string | null
          email: string | null
          email_notifications: boolean | null
          full_name: string | null
          id: string
          is_assignable: boolean | null
          is_excluded: boolean | null
          location: string | null
          mobile_number: string | null
          mobile_updated_at: string | null
          trade: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_alert_time?: string | null
          email?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          is_assignable?: boolean | null
          is_excluded?: boolean | null
          location?: string | null
          mobile_number?: string | null
          mobile_updated_at?: string | null
          trade?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_alert_time?: string | null
          email?: string | null
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          is_assignable?: boolean | null
          is_excluded?: boolean | null
          location?: string | null
          mobile_number?: string | null
          mobile_updated_at?: string | null
          trade?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          item_id: string | null
          min_level: number | null
          sent_at: string | null
          sms_sent: boolean | null
          stock_at_alert: number | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          item_id?: string | null
          min_level?: number | null
          sent_at?: string | null
          sms_sent?: boolean | null
          stock_at_alert?: number | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          item_id?: string | null
          min_level?: number | null
          sent_at?: string | null
          sms_sent?: boolean | null
          stock_at_alert?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_log: {
        Row: {
          complaint_id: string | null
          date_received: string | null
          direction: string
          id: string
          item_id: string
          logged_at: string
          qty: number
          remarks: string | null
          supplier: string | null
          used_by: string | null
        }
        Insert: {
          complaint_id?: string | null
          date_received?: string | null
          direction: string
          id?: string
          item_id: string
          logged_at?: string
          qty: number
          remarks?: string | null
          supplier?: string | null
          used_by?: string | null
        }
        Update: {
          complaint_id?: string | null
          date_received?: string | null
          direction?: string
          id?: string
          item_id?: string
          logged_at?: string
          qty?: number
          remarks?: string | null
          supplier?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_log_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      create_notification: {
        Args: {
          _body: string
          _complaint_id?: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: string
      }
      get_public_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          full_name: string
          is_assignable: boolean
          is_excluded: boolean
          location: string
          trade: string
          user_id: string
        }[]
      }
      has_role:
        | {
            Args: { _role: Database["public"]["Enums"]["app_role"] }
            Returns: boolean
          }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
