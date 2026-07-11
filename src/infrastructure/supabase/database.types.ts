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
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          color_variant: "green" | "blue" | "amber" | "purple" | "red"
          schedule_type: "daily" | "specific_days" | "every_other_day" | "weekly_target" | "flexible"
          weekly_target: number | null
          fixed_days: number[] | null
          anchor_date: string
          position: number
          archived_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color_variant?: "green" | "blue" | "amber" | "purple" | "red"
          schedule_type: "daily" | "specific_days" | "every_other_day" | "weekly_target" | "flexible"
          weekly_target?: number | null
          fixed_days?: number[] | null
          anchor_date?: string
          position?: number
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color_variant?: "green" | "blue" | "amber" | "purple" | "red"
          schedule_type?: "daily" | "specific_days" | "every_other_day" | "weekly_target" | "flexible"
          weekly_target?: number | null
          fixed_days?: number[] | null
          anchor_date?: string
          position?: number
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          habit_id: string
          user_id: string
          log_date: string
          created_at: string
        }
        Insert: {
          habit_id: string
          user_id: string
          log_date: string
          created_at?: string
        }
        Update: {
          habit_id?: string
          user_id?: string
          log_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          display_name: string
          motivation_phrase: string | null
          timezone: string
          locale: "en" | "pt"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string
          motivation_phrase?: string | null
          timezone?: string
          locale?: "en" | "pt"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          motivation_phrase?: string | null
          timezone?: string
          locale?: "en" | "pt"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          user_agent: string | null
          created_at: string
          last_used_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          user_agent?: string | null
          created_at?: string
          last_used_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          user_agent?: string | null
          created_at?: string
          last_used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          reminder_time: string
          enabled: boolean
          days_of_week: number[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reminder_time: string
          enabled?: boolean
          days_of_week?: number[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reminder_time?: string
          enabled?: boolean
          days_of_week?: number[] | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_deliveries: {
        Row: {
          id: string
          user_id: string
          local_date: string
          reminder_time: string
          sent_at: string
          done_count: number
          pending_count: number
        }
        Insert: {
          id?: string
          user_id: string
          local_date: string
          reminder_time: string
          sent_at?: string
          done_count: number
          pending_count: number
        }
        Update: {
          id?: string
          user_id?: string
          local_date?: string
          reminder_time?: string
          sent_at?: string
          done_count?: number
          pending_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reorder_habits: {
        Args: {
          p_ids: string[]
        }
        Returns: undefined
      }
    }
    Enums: {
      color_variant: "green" | "blue" | "amber" | "purple" | "red"
      schedule_type: "daily" | "specific_days" | "every_other_day" | "weekly_target" | "flexible"
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
      color_variant: {
        green: "green",
        blue: "blue",
        amber: "amber",
        purple: "purple",
        red: "red",
      },
      schedule_type: {
        daily: "daily",
        specific_days: "specific_days",
        every_other_day: "every_other_day",
        weekly_target: "weekly_target",
        flexible: "flexible",
      },
    },
  },
} as const
