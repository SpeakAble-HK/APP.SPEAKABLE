/** Frontend-only models for logging / institutions (design §2.x). No API changes. */

export type UserRole = "student" | "admin" | "teacher";

export type LearnerSegment = "general" | "SEN" | "elderly" | "student";

export interface UserProfile {
  user_id: string;
  age_group?: string;
  user_type?: LearnerSegment;
  /** Dataset / voice logging gate */
  consent_given?: boolean;
  organization_id?: string | null;
  preferred_role?: UserRole;
}

export interface LearningSession {
  session_id: string;
  lesson_id: string;
  timestamp: string;
}

export type AttemptTag = "tone_error" | "consonant_error" | "vowel_error";

export interface AttemptRecord {
  attempt_id: string;
  session_id?: string;
  lesson_id: string;
  timestamp: string;
  accuracy_score: number;
  phoneme_flags: AttemptTag[];
  /** API outputs only — optional clone ref id */
  intended_summary?: string;
  spoken_summary?: string;
}

export interface DashboardStatsPayload {
  user_id: string;
  lessons_completed: number;
  avg_score: number;
  weak_areas: string[];
  trend_data: { date: string; avg: number }[];
}
