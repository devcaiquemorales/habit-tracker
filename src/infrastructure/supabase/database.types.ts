/**
 * Regenerate with: `bun run supabase:types` when the Supabase CLI is available.
 * Column names must match your Supabase project (adjust if your schema differs).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Stored on `habits.schedule_type` (Postgres enum or text). */
export type HabitScheduleTypeDb =
  | "fixed_days"
  | "weekly_target"
  | "flexible"
  | "every_other_day";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          motivation_phrase: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          motivation_phrase?: string | null;
        };
        Update: {
          display_name?: string | null;
          motivation_phrase?: string | null;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color_variant: string;
          schedule_type: HabitScheduleTypeDb;
          weekly_target: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color_variant: string;
          schedule_type: HabitScheduleTypeDb;
          weekly_target?: number | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          color_variant?: string;
          schedule_type?: HabitScheduleTypeDb;
          weekly_target?: number | null;
        };
        Relationships: [];
      };
      habit_fixed_days: {
        Row: {
          habit_id: string;
          weekday: number;
        };
        Insert: {
          habit_id: string;
          weekday: number;
        };
        Update: {
          weekday?: number;
        };
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          log_date: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          log_date: string;
        };
        Update: {
          log_date?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
