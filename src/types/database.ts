// Minimal hand-written Supabase database types for the tables used so far.
// Replace with generated Supabase types after the schema is applied in a later phase.

export type Json =
  | boolean
  | number
  | string
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          auth_user_id: string;
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          onboarding_completed_at: string | null;
          selected_language_pair_id: string | null;
          selected_level_id: string | null;
          updated_at: string;
        };
        Insert: {
          auth_user_id: string;
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          onboarding_completed_at?: string | null;
          selected_language_pair_id?: string | null;
          selected_level_id?: string | null;
          updated_at?: string;
        };
        Update: {
          auth_user_id?: string;
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          onboarding_completed_at?: string | null;
          selected_language_pair_id?: string | null;
          selected_level_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      language_pairs: {
        Row: {
          created_at: string;
          display_name: string;
          id: string;
          is_active: boolean;
          launch_priority: number;
          slug: string;
          source_language_id: string;
          target_language_id: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      levels: {
        Row: {
          code: "A1" | "A2" | "B1" | "B2" | "C1";
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
