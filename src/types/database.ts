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
      practice_sessions: {
        Row: {
          accuracy_percent: number | null;
          audio_replay_count: number;
          completed_at: string | null;
          created_at: string;
          duration_seconds: number | null;
          id: string;
          language_pair_id: string;
          level_id: string | null;
          mode: "dictation" | "visible_sentence";
          profile_id: string | null;
          sentences_completed: number;
          session_type: "daily_workout" | "guest" | "practice";
          started_at: string;
          status: "abandoned" | "completed" | "started";
          target_duration_seconds: number | null;
          updated_at: string;
          wpm: number | null;
        };
        Insert: {
          accuracy_percent?: number | null;
          audio_replay_count?: number;
          completed_at?: string | null;
          created_at?: string;
          duration_seconds?: number | null;
          id?: string;
          language_pair_id: string;
          level_id?: string | null;
          mode?: "dictation" | "visible_sentence";
          profile_id?: string | null;
          sentences_completed?: number;
          session_type: "daily_workout" | "guest" | "practice";
          started_at?: string;
          status?: "abandoned" | "completed" | "started";
          target_duration_seconds?: number | null;
          updated_at?: string;
          wpm?: number | null;
        };
        Update: never;
        Relationships: [];
      };
      sentence_attempts: {
        Row: {
          accuracy_percent: number;
          audio_replay_count: number;
          created_at: string;
          id: string;
          is_correct: boolean;
          normalized_typed_text: string;
          practice_session_id: string;
          profile_id: string | null;
          sentence_id: string;
          submitted_at: string;
          time_to_complete_ms: number | null;
          typed_text: string;
        };
        Insert: {
          accuracy_percent: number;
          audio_replay_count?: number;
          created_at?: string;
          id?: string;
          is_correct?: boolean;
          normalized_typed_text?: string;
          practice_session_id: string;
          profile_id?: string | null;
          sentence_id: string;
          submitted_at?: string;
          time_to_complete_ms?: number | null;
          typed_text?: string;
        };
        Update: never;
        Relationships: [];
      };
      attempt_mistakes: {
        Row: {
          actual_text: string | null;
          attempt_id: string;
          created_at: string;
          expected_text: string | null;
          id: string;
          mistake_type:
            | "capitalization"
            | "extra_word"
            | "missing_word"
            | "punctuation"
            | "spelling"
            | "word_order"
            | "wrong_word";
          position_end: number | null;
          position_start: number | null;
          profile_id: string | null;
          sentence_id: string;
          word_text: string | null;
        };
        Insert: {
          actual_text?: string | null;
          attempt_id: string;
          created_at?: string;
          expected_text?: string | null;
          id?: string;
          mistake_type:
            | "capitalization"
            | "extra_word"
            | "missing_word"
            | "punctuation"
            | "spelling"
            | "word_order"
            | "wrong_word";
          position_end?: number | null;
          position_start?: number | null;
          profile_id?: string | null;
          sentence_id: string;
          word_text?: string | null;
        };
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
