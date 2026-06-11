import type { GameEvent, StorySceneEvent, UnifiedEvent } from '../minigame-sdk/types';

// Supabase table schemas for migrations

export const SESSION_RESULTS_SCHEMA = `
CREATE TABLE IF NOT EXISTS session_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  learner_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  total_attempts INTEGER NOT NULL,
  success_rate REAL NOT NULL,
  avg_latency_ms REAL NOT NULL,
  fatigue_marker JSONB NOT NULL,
  reward_payout INTEGER NOT NULL,
  carryover_recommendation TEXT,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_results_learner ON session_results(learner_id);
CREATE INDEX IF NOT EXISTS idx_session_results_game ON session_results(game_id);
CREATE INDEX IF NOT EXISTS idx_session_results_completed ON session_results(completed_at);
`;

export const LEARNER_MODEL_SCHEMA = `
CREATE TABLE IF NOT EXISTS learner_model (
  learner_id TEXT PRIMARY KEY,
  weakest_phonemes TEXT[] DEFAULT '{}',
  improved_phonemes TEXT[] DEFAULT '{}',
  avg_session_duration REAL DEFAULT 0,
  fatigue_trend TEXT DEFAULT 'stable',
  last_game_played TEXT,
  total_sessions INTEGER DEFAULT 0,
  time_of_day_preference TEXT,
  therapist_assignments TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export const THERAPIST_PHONEME_TAGS_SCHEMA = `
CREATE TABLE IF NOT EXISTS therapist_phoneme_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id TEXT NOT NULL,
  learner_id TEXT NOT NULL,
  phoneme_symbol TEXT NOT NULL,
  priority TEXT DEFAULT 'primary',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(therapist_id, learner_id, phoneme_symbol)
);

CREATE INDEX IF NOT EXISTS idx_therapist_phoneme_tags_learner ON therapist_phoneme_tags(learner_id);
`;

export const GAME_METADATA_SCHEMA = `
CREATE TABLE IF NOT EXISTS game_metadata (
  game_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mechanic_type TEXT NOT NULL,
  therapeutic_objective TEXT NOT NULL,
  difficulties JSONB NOT NULL,
  min_age_years INTEGER NOT NULL,
  estimated_session_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export const THERAPIST_DASHBOARD_EVENTS_SCHEMA = `
CREATE TABLE IF NOT EXISTS therapist_dashboard_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  success_rate REAL NOT NULL,
  fatigue_flag BOOLEAN DEFAULT FALSE,
  carryover_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_events_learner ON therapist_dashboard_events(learner_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_events_date ON therapist_dashboard_events(session_date);
`;

export const STORY_SCENES_SCHEMA = `
CREATE TABLE IF NOT EXISTS story_scenes (
  scene_id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  scene_order INTEGER NOT NULL,
  narrative_state TEXT NOT NULL,
  target_phoneme JSONB NOT NULL,
  character_line TEXT NOT NULL,
  learner_task TEXT NOT NULL,
  success_condition JSONB NOT NULL,
  branching_outcome JSONB NOT NULL,
  unlock_condition TEXT,
  reward_on_complete INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_scenes_story ON story_scenes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_scenes_chapter ON story_scenes(chapter_id);
`;

export const LEARNER_STORY_STATE_SCHEMA = `
CREATE TABLE IF NOT EXISTS learner_story_state (
  learner_id TEXT NOT NULL,
  story_id TEXT NOT NULL,
  current_scene_id TEXT NOT NULL,
  completed_scenes TEXT[] DEFAULT '{}',
  phoneme_progress JSONB DEFAULT '{}',
  emotional_state TEXT DEFAULT 'neutral',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (learner_id, story_id)
);
`;

export const STORY_TELEMETRY_SCHEMA = `
CREATE TABLE IF NOT EXISTS story_telemetry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id TEXT NOT NULL,
  story_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  scene_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL,
  attempts INTEGER NOT NULL,
  phoneme_symbol TEXT NOT NULL,
  confidence_score REAL NOT NULL,
  branch_taken TEXT NOT NULL,
  time_on_scene_ms INTEGER NOT NULL,
  abandoned BOOLEAN DEFAULT FALSE,
  re_engaged BOOLEAN DEFAULT FALSE,
  frustration_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_telemetry_learner ON story_telemetry(learner_id);
CREATE INDEX IF NOT EXISTS idx_story_telemetry_scene ON story_telemetry(scene_id);
CREATE INDEX IF NOT EXISTS idx_story_telemetry_created ON story_telemetry(created_at);
`;

export const UNIFIED_TELEMETRY_SCHEMA = `
CREATE TABLE IF NOT EXISTS unified_telemetry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  learner_id TEXT NOT NULL,
  context_id TEXT NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unified_telemetry_learner ON unified_telemetry(learner_id);
CREATE INDEX IF NOT EXISTS idx_unified_telemetry_type ON unified_telemetry(event_type);
CREATE INDEX IF NOT EXISTS idx_unified_telemetry_created ON unified_telemetry(created_at);
`;

export const THERAPIST_VOICE_CLONES_SCHEMA = `
CREATE TABLE IF NOT EXISTS therapist_voice_clones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id TEXT NOT NULL UNIQUE,
  elevenlabs_voice_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export const LEARNER_REWARDS_SCHEMA = `
CREATE TABLE IF NOT EXISTS learner_rewards (
  learner_id TEXT PRIMARY KEY,
  total_stars INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  last_session_stars INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export const COOP_SESSIONS_SCHEMA = `
CREATE TABLE IF NOT EXISTS coop_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  child_id TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  mode TEXT DEFAULT 'cooperative',
  state JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coop_sessions_room ON coop_sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_coop_sessions_child ON coop_sessions(child_id);
`;

export const THERAPIST_ASSIGNMENTS_SCHEMA = `
CREATE TABLE IF NOT EXISTS therapist_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id TEXT NOT NULL,
  learner_ids TEXT[] NOT NULL,
  game_id TEXT NOT NULL,
  phoneme_targets TEXT[] NOT NULL,
  difficulty_config JSONB NOT NULL,
  custom_prompt TEXT,
  pass_threshold REAL DEFAULT 0.7,
  scheduled_for TIMESTAMPTZ,
  allow_coop BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_therapist_assignments_therapist ON therapist_assignments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_assignments_scheduled ON therapist_assignments(scheduled_for);
`;

export function getAllSchemas(): string[] {
  return [
    SESSION_RESULTS_SCHEMA,
    LEARNER_MODEL_SCHEMA,
    THERAPIST_PHONEME_TAGS_SCHEMA,
    GAME_METADATA_SCHEMA,
    THERAPIST_DASHBOARD_EVENTS_SCHEMA,
    STORY_SCENES_SCHEMA,
    LEARNER_STORY_STATE_SCHEMA,
    STORY_TELEMETRY_SCHEMA,
    UNIFIED_TELEMETRY_SCHEMA,
    THERAPIST_VOICE_CLONES_SCHEMA,
    LEARNER_REWARDS_SCHEMA,
    COOP_SESSIONS_SCHEMA,
    THERAPIST_ASSIGNMENTS_SCHEMA,
  ];
}
