      calibration_audit: {
        Row: {
          id: string;
          user_id: string;
          therapist_name: string;
          calibration_profile: Json;
          voice_clone_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          therapist_name: string;
          calibration_profile: Json;
          voice_clone_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          therapist_name?: string;
          calibration_profile?: Json;
          voice_clone_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      }
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
      achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_challenge_completions: {
        Row: {
          bonus_xp: number
          challenge_date: string
          challenge_id: string
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          bonus_xp?: number
          challenge_date?: string
          challenge_id: string
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          bonus_xp?: number
          challenge_date?: string
          challenge_id?: string
          completed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      explorer_profiles: {
        Row: {
          age: number | null
          created_at: string | null
          daily_reminder: boolean | null
          gender: string | null
          id: string
          nickname: string
          onboarding_audio_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          daily_reminder?: boolean | null
          gender?: string | null
          id?: string
          nickname: string
          onboarding_audio_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string | null
          daily_reminder?: boolean | null
          gender?: string | null
          id?: string
          nickname?: string
          onboarding_audio_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      guest_usage: {
        Row: {
          created_at: string
          id: string
          request_count: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_count?: number
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_count?: number
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          accuracy_score: number | null
          attempts: number | null
          completed: boolean | null
          created_at: string | null
          id: string
          lesson_id: string
          updated_at: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          accuracy_score?: number | null
          attempts?: number | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          lesson_id: string
          updated_at?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          accuracy_score?: number | null
          attempts?: number | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          updated_at?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          preferred_language: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      pronunciation_results: {
        Row: {
          created_at: string
          final_accuracy: number
          id: string
          initial_accuracy: number
          intended_phonemes: Json
          intended_text: string
          overall_accuracy: number
          spoken_phonemes: Json
          tone_accuracy: number
          user_id: string
        }
        Insert: {
          created_at?: string
          final_accuracy?: number
          id?: string
          initial_accuracy?: number
          intended_phonemes: Json
          intended_text: string
          overall_accuracy?: number
          spoken_phonemes: Json
          tone_accuracy?: number
          user_id: string
        }
        Update: {
          created_at?: string
          final_accuracy?: number
          id?: string
          initial_accuracy?: number
          intended_phonemes?: Json
          intended_text?: string
          overall_accuracy?: number
          spoken_phonemes?: Json
          tone_accuracy?: number
          user_id?: string
        }
        Relationships: []
      }
      quest_progress: {
        Row: {
          completed_lessons: Json
          created_at: string
          id: string
          spent_points: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_lessons?: Json
          created_at?: string
          id?: string
          spent_points?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_lessons?: Json
          created_at?: string
          id?: string
          spent_points?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      st_assignments: {
        Row: {
          assigned_at: string | null
          category: string
          id: string
          student_id: string
          therapist_id: string
        }
        Insert: {
          assigned_at?: string | null
          category: string
          id?: string
          student_id: string
          therapist_id: string
        }
        Update: {
          assigned_at?: string | null
          category?: string
          id?: string
          student_id?: string
          therapist_id?: string
        }
        Relationships: []
      }
      st_students: {
        Row: {
          created_at: string | null
          id: string
          student_id: string
          therapist_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          student_id: string
          therapist_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          student_id?: string
          therapist_id?: string
        }
        Relationships: []
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
      user_stats: {
        Row: {
          best_streak: number
          created_at: string
          daily_goal_minutes: number
          daily_progress_minutes: number
          fluency_change: number
          fluency_score: number
          id: string
          last_activity_date: string | null
          streak_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          created_at?: string
          daily_goal_minutes?: number
          daily_progress_minutes?: number
          fluency_change?: number
          fluency_score?: number
          id?: string
          last_activity_date?: string | null
          streak_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number
          created_at?: string
          daily_goal_minutes?: number
          daily_progress_minutes?: number
          fluency_change?: number
          fluency_score?: number
          id?: string
          last_activity_date?: string | null
          streak_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          name_zh: string | null
          monthly_price_hkd: number
          annual_price_hkd: number
          max_child_accounts: number
          features: Json
          active: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          name_zh?: string | null
          monthly_price_hkd?: number
          annual_price_hkd?: number
          max_child_accounts?: number
          features?: Json
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_zh?: string | null
          monthly_price_hkd?: number
          annual_price_hkd?: number
          max_child_accounts?: number
          features?: Json
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          billing_cycle: string
          current_period_start: string
          current_period_end: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: string
          billing_cycle?: string
          current_period_start?: string
          current_period_end?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          billing_cycle?: string
          current_period_start?: string
          current_period_end?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      leaderboard_view: {
        Row: {
          avatar_url: string | null
          best_streak: number | null
          display_name: string | null
          lessons_completed: number | null
          streak_days: number | null
          total_xp: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      get_user_subscription: {
        Args: {
          _user_id: string
        }
        Returns: Json
      }
      has_feature: {
        Args: {
          _user_id: string
          _feature: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "explorer" | "therapist" | "parent"
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
      app_role: ["explorer", "therapist", "parent"],
    },
  },
} as const
