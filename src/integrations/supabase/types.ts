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
    PostgrestVersion: "14.5"
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
      calibration_audit: {
        Row: {
          calibration_profile: Json
          created_at: string
          id: string
          therapist_name: string
          user_id: string
          voice_clone_url: string | null
        }
        Insert: {
          calibration_profile?: Json
          created_at?: string
          id?: string
          therapist_name: string
          user_id: string
          voice_clone_url?: string | null
        }
        Update: {
          calibration_profile?: Json
          created_at?: string
          id?: string
          therapist_name?: string
          user_id?: string
          voice_clone_url?: string | null
        }
        Relationships: []
      }
      coop_sessions: {
        Row: {
          child_id: string
          created_at: string | null
          game_id: string
          id: string
          mode: string | null
          parent_id: string
          room_code: string
          state: Json | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          game_id: string
          id?: string
          mode?: string | null
          parent_id: string
          room_code: string
          state?: Json | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          game_id?: string
          id?: string
          mode?: string | null
          parent_id?: string
          room_code?: string
          state?: Json | null
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
      game_metadata: {
        Row: {
          created_at: string | null
          difficulties: Json
          estimated_session_minutes: number
          game_id: string
          mechanic_type: string
          min_age_years: number
          name: string
          therapeutic_objective: string
        }
        Insert: {
          created_at?: string | null
          difficulties: Json
          estimated_session_minutes: number
          game_id: string
          mechanic_type: string
          min_age_years: number
          name: string
          therapeutic_objective: string
        }
        Update: {
          created_at?: string | null
          difficulties?: Json
          estimated_session_minutes?: number
          game_id?: string
          mechanic_type?: string
          min_age_years?: number
          name?: string
          therapeutic_objective?: string
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
      journey_progress: {
        Row: {
          adaptation_key: string
          attempts: number
          created_at: string
          id: string
          scene_index: number | null
          signal: number
          student_id: string
          updated_at: string
        }
        Insert: {
          adaptation_key: string
          attempts?: number
          created_at?: string
          id?: string
          scene_index?: number | null
          signal?: number
          student_id: string
          updated_at?: string
        }
        Update: {
          adaptation_key?: string
          attempts?: number
          created_at?: string
          id?: string
          scene_index?: number | null
          signal?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      learner_model: {
        Row: {
          avg_session_duration: number | null
          fatigue_trend: string | null
          improved_phonemes: string[] | null
          last_game_played: string | null
          learner_id: string
          therapist_assignments: string[] | null
          time_of_day_preference: string | null
          total_sessions: number | null
          updated_at: string | null
          weakest_phonemes: string[] | null
        }
        Insert: {
          avg_session_duration?: number | null
          fatigue_trend?: string | null
          improved_phonemes?: string[] | null
          last_game_played?: string | null
          learner_id: string
          therapist_assignments?: string[] | null
          time_of_day_preference?: string | null
          total_sessions?: number | null
          updated_at?: string | null
          weakest_phonemes?: string[] | null
        }
        Update: {
          avg_session_duration?: number | null
          fatigue_trend?: string | null
          improved_phonemes?: string[] | null
          last_game_played?: string | null
          learner_id?: string
          therapist_assignments?: string[] | null
          time_of_day_preference?: string | null
          total_sessions?: number | null
          updated_at?: string | null
          weakest_phonemes?: string[] | null
        }
        Relationships: []
      }
      learner_rewards: {
        Row: {
          last_session_stars: number | null
          learner_id: string
          streak_count: number | null
          total_stars: number | null
          updated_at: string | null
        }
        Insert: {
          last_session_stars?: number | null
          learner_id: string
          streak_count?: number | null
          total_stars?: number | null
          updated_at?: string | null
        }
        Update: {
          last_session_stars?: number | null
          learner_id?: string
          streak_count?: number | null
          total_stars?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      learner_story_state: {
        Row: {
          completed_scenes: string[] | null
          current_scene_id: string
          emotional_state: string | null
          last_updated: string | null
          learner_id: string
          phoneme_progress: Json | null
          story_id: string
        }
        Insert: {
          completed_scenes?: string[] | null
          current_scene_id: string
          emotional_state?: string | null
          last_updated?: string | null
          learner_id: string
          phoneme_progress?: Json | null
          story_id: string
        }
        Update: {
          completed_scenes?: string[] | null
          current_scene_id?: string
          emotional_state?: string | null
          last_updated?: string | null
          learner_id?: string
          phoneme_progress?: Json | null
          story_id?: string
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
      narrative_assessments: {
        Row: {
          assessed_at: string
          band: string
          created_at: string
          evidence: Json
          id: string
          notes: string | null
          result: Json
          scores: Json
          student_id: string
          therapist_id: string | null
          total_proficiency: number
        }
        Insert: {
          assessed_at?: string
          band?: string
          created_at?: string
          evidence?: Json
          id?: string
          notes?: string | null
          result?: Json
          scores?: Json
          student_id: string
          therapist_id?: string | null
          total_proficiency?: number
        }
        Update: {
          assessed_at?: string
          band?: string
          created_at?: string
          evidence?: Json
          id?: string
          notes?: string | null
          result?: Json
          scores?: Json
          student_id?: string
          therapist_id?: string | null
          total_proficiency?: number
        }
        Relationships: []
      }
      parent_students: {
        Row: {
          created_at: string | null
          id: string
          parent_id: string
          relationship: string | null
          student_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          parent_id: string
          relationship?: string | null
          student_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          parent_id?: string
          relationship?: string | null
          student_id?: string
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
      session_results: {
        Row: {
          avg_latency_ms: number
          carryover_recommendation: string | null
          completed_at: string
          created_at: string | null
          fatigue_marker: Json
          game_id: string
          id: string
          learner_id: string
          reward_payout: number
          session_id: string
          success_rate: number
          total_attempts: number
        }
        Insert: {
          avg_latency_ms: number
          carryover_recommendation?: string | null
          completed_at: string
          created_at?: string | null
          fatigue_marker: Json
          game_id: string
          id?: string
          learner_id: string
          reward_payout: number
          session_id: string
          success_rate: number
          total_attempts: number
        }
        Update: {
          avg_latency_ms?: number
          carryover_recommendation?: string | null
          completed_at?: string
          created_at?: string | null
          fatigue_marker?: Json
          game_id?: string
          id?: string
          learner_id?: string
          reward_payout?: number
          session_id?: string
          success_rate?: number
          total_attempts?: number
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
      story_scenes: {
        Row: {
          branching_outcome: Json
          chapter_id: string
          character_line: string
          created_at: string | null
          learner_task: string
          narrative_state: string
          reward_on_complete: number | null
          scene_id: string
          scene_order: number
          status: string | null
          story_id: string
          success_condition: Json
          target_phoneme: Json
          unlock_condition: string | null
          updated_at: string | null
        }
        Insert: {
          branching_outcome: Json
          chapter_id: string
          character_line: string
          created_at?: string | null
          learner_task: string
          narrative_state: string
          reward_on_complete?: number | null
          scene_id: string
          scene_order: number
          status?: string | null
          story_id: string
          success_condition: Json
          target_phoneme: Json
          unlock_condition?: string | null
          updated_at?: string | null
        }
        Update: {
          branching_outcome?: Json
          chapter_id?: string
          character_line?: string
          created_at?: string | null
          learner_task?: string
          narrative_state?: string
          reward_on_complete?: number | null
          scene_id?: string
          scene_order?: number
          status?: string | null
          story_id?: string
          success_condition?: Json
          target_phoneme?: Json
          unlock_condition?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      story_telemetry: {
        Row: {
          abandoned: boolean | null
          attempts: number
          branch_taken: string
          chapter_id: string
          completed: boolean
          confidence_score: number
          created_at: string | null
          frustration_flag: boolean | null
          id: string
          learner_id: string
          phoneme_symbol: string
          re_engaged: boolean | null
          scene_id: string
          story_id: string
          time_on_scene_ms: number
        }
        Insert: {
          abandoned?: boolean | null
          attempts: number
          branch_taken: string
          chapter_id: string
          completed: boolean
          confidence_score: number
          created_at?: string | null
          frustration_flag?: boolean | null
          id?: string
          learner_id: string
          phoneme_symbol: string
          re_engaged?: boolean | null
          scene_id: string
          story_id: string
          time_on_scene_ms: number
        }
        Update: {
          abandoned?: boolean | null
          attempts?: number
          branch_taken?: string
          chapter_id?: string
          completed?: boolean
          confidence_score?: number
          created_at?: string | null
          frustration_flag?: boolean | null
          id?: string
          learner_id?: string
          phoneme_symbol?: string
          re_engaged?: boolean | null
          scene_id?: string
          story_id?: string
          time_on_scene_ms?: number
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          active: boolean
          annual_price_hkd: number
          created_at: string | null
          features: Json
          id: string
          max_child_accounts: number | null
          monthly_price_hkd: number
          name: string
          name_zh: string | null
        }
        Insert: {
          active?: boolean
          annual_price_hkd?: number
          created_at?: string | null
          features?: Json
          id: string
          max_child_accounts?: number | null
          monthly_price_hkd?: number
          name: string
          name_zh?: string | null
        }
        Update: {
          active?: boolean
          annual_price_hkd?: number
          created_at?: string | null
          features?: Json
          id?: string
          max_child_accounts?: number | null
          monthly_price_hkd?: number
          name?: string
          name_zh?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_assignments: {
        Row: {
          allow_coop: boolean | null
          created_at: string | null
          custom_prompt: string | null
          difficulty_config: Json
          game_id: string
          id: string
          learner_ids: string[]
          pass_threshold: number | null
          phoneme_targets: string[]
          scheduled_for: string | null
          therapist_id: string
        }
        Insert: {
          allow_coop?: boolean | null
          created_at?: string | null
          custom_prompt?: string | null
          difficulty_config: Json
          game_id: string
          id?: string
          learner_ids: string[]
          pass_threshold?: number | null
          phoneme_targets: string[]
          scheduled_for?: string | null
          therapist_id: string
        }
        Update: {
          allow_coop?: boolean | null
          created_at?: string | null
          custom_prompt?: string | null
          difficulty_config?: Json
          game_id?: string
          id?: string
          learner_ids?: string[]
          pass_threshold?: number | null
          phoneme_targets?: string[]
          scheduled_for?: string | null
          therapist_id?: string
        }
        Relationships: []
      }
      therapist_dashboard_events: {
        Row: {
          carryover_note: string | null
          created_at: string | null
          fatigue_flag: boolean | null
          game_id: string
          id: string
          learner_id: string
          session_date: string
          success_rate: number
        }
        Insert: {
          carryover_note?: string | null
          created_at?: string | null
          fatigue_flag?: boolean | null
          game_id: string
          id?: string
          learner_id: string
          session_date: string
          success_rate: number
        }
        Update: {
          carryover_note?: string | null
          created_at?: string | null
          fatigue_flag?: boolean | null
          game_id?: string
          id?: string
          learner_id?: string
          session_date?: string
          success_rate?: number
        }
        Relationships: []
      }
      therapist_phoneme_tags: {
        Row: {
          created_at: string | null
          id: string
          learner_id: string
          note: string | null
          phoneme_symbol: string
          priority: string | null
          therapist_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          learner_id: string
          note?: string | null
          phoneme_symbol: string
          priority?: string | null
          therapist_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          learner_id?: string
          note?: string | null
          phoneme_symbol?: string
          priority?: string | null
          therapist_id?: string
        }
        Relationships: []
      }
      therapist_voice_clones: {
        Row: {
          created_at: string | null
          elevenlabs_voice_id: string
          id: string
          is_active: boolean | null
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          elevenlabs_voice_id: string
          id?: string
          is_active?: boolean | null
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          elevenlabs_voice_id?: string
          id?: string
          is_active?: boolean | null
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      unified_telemetry: {
        Row: {
          context_id: string
          created_at: string | null
          event_data: Json
          event_type: string
          id: string
          learner_id: string
        }
        Insert: {
          context_id: string
          created_at?: string | null
          event_data: Json
          event_type: string
          id?: string
          learner_id: string
        }
        Update: {
          context_id?: string
          created_at?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          learner_id?: string
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
      get_user_subscription: { Args: { _user_id: string }; Returns: Json }
      has_feature: {
        Args: { _feature: string; _user_id: string }
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
