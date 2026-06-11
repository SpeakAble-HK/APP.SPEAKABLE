/**
 * SpeakAble StoryVerse — Core Type Definitions
 *
 * Unified story engine that connects:
 *   - Therapist progress (phonemes, tones, words)
 *   - Story progression (scenes, missions, rewards)
 *   - Speech analysis (UtteranceAnalysis from Phase 0.1)
 *   - Adaptive difficulty (based on performance)
 *
 * Builds on existing infrastructure:
 *   - Aura Journey (cinematic story chapters)
 *   - Forest Games (quiz-style mini-games)
 *   - MiniGame Builder (procedural game generation)
 *   - Quest system (lesson progression)
 *
 * Version: 1.0.0
 */

import type { UtteranceAnalysis, ToneLabel, PhonemeType } from "@/shared/types/utteranceAnalysis";

// ─── Story Identity ──────────────────────────────────────────────────────────

export type StoryWorldId =
  | "bear-adventure"
  | "bus-travel"
  | "underwater-friends"
  | "magic-forest"
  | "dragon-quest";

export type StoryChapterId = string;
export type SceneId = string;
export type MissionId = string;

// ─── Difficulty Tiers ────────────────────────────────────────────────────────

export type StoryDifficulty = "easy" | "medium" | "hard";

export interface DifficultyConfig {
  level: StoryDifficulty;
  label: string;
  labelZh: string;
  ttsSpeed: "slow" | "normal" | "fast";
  maxPhonemesPerWord: number;
  toneComplexity: 1 | 2 | 3;
  retryAttempts: number;
  hintLevel: "full" | "partial" | "none";
}

export const STORY_DIFFICULTY_CONFIG: Record<StoryDifficulty, DifficultyConfig> = {
  easy: {
    level: "easy",
    label: "Easy",
    labelZh: "簡單",
    ttsSpeed: "slow",
    maxPhonemesPerWord: 2,
    toneComplexity: 1,
    retryAttempts: 3,
    hintLevel: "full",
  },
  medium: {
    level: "medium",
    label: "Medium",
    labelZh: "中等",
    ttsSpeed: "normal",
    maxPhonemesPerWord: 3,
    toneComplexity: 2,
    retryAttempts: 2,
    hintLevel: "partial",
  },
  hard: {
    level: "hard",
    label: "Hard",
    labelZh: "進階",
    ttsSpeed: "fast",
    maxPhonemesPerWord: 4,
    toneComplexity: 3,
    retryAttempts: 1,
    hintLevel: "none",
  },
};

// ─── Speech Mission ──────────────────────────────────────────────────────────

export interface SpeechMissionTarget {
  word: string;
  jyutping: string;
  meaning?: string;
  target_phonemes: string[];
  target_tone?: ToneLabel;
  target_phoneme_type?: PhonemeType;
  audio_reference_url?: string;
}

export interface MissionSuccessCriteria {
  min_overall_accuracy: number;
  min_tone_accuracy: number;
  min_articulation_score: number;
  max_timing_deviation_ms: number;
  allow_low_confidence: boolean;
}

export const DEFAULT_SUCCESS_CRITERIA: Record<StoryDifficulty, MissionSuccessCriteria> = {
  easy: {
    min_overall_accuracy: 0.6,
    min_tone_accuracy: 0.5,
    min_articulation_score: 0.6,
    max_timing_deviation_ms: 150,
    allow_low_confidence: true,
  },
  medium: {
    min_overall_accuracy: 0.7,
    min_tone_accuracy: 0.65,
    min_articulation_score: 0.7,
    max_timing_deviation_ms: 100,
    allow_low_confidence: false,
  },
  hard: {
    min_overall_accuracy: 0.8,
    min_tone_accuracy: 0.75,
    min_articulation_score: 0.8,
    max_timing_deviation_ms: 75,
    allow_low_confidence: false,
  },
};

export type MissionResult = "success" | "almost" | "needs_practice";

export interface MissionAttempt {
  attempt_id: string;
  mission_id: MissionId;
  timestamp: string;
  audio_url?: string;
  analysis?: UtteranceAnalysis;
  result: MissionResult;
  scores: {
    overall: number;
    tone_accuracy: number;
    articulation: number;
    smoothness: number;
  };
  errors: Array<{
    category: string;
    phoneme?: string;
    suggestion?: string;
  }>;
  duration_ms: number;
}

// ─── Scene ───────────────────────────────────────────────────────────────────

export type SceneType = "intro" | "dialogue" | "mission" | "reward" | "branch" | "finale";

export interface SceneCharacter {
  id: string;
  name: string;
  nameZh: string;
  avatar_url?: string;
  emotion?: "happy" | "sad" | "excited" | "thinking" | "encouraging";
}

export interface SceneDialogue {
  character_id: string;
  text: string;
  textZh: string;
  emotion?: SceneCharacter["emotion"];
  tts_audio_url?: string;
}

export interface SceneBranch {
  condition: "success" | "almost" | "needs_practice" | "always";
  next_scene_id: SceneId;
  label?: string;
  labelZh?: string;
}

export interface StoryScene {
  id: SceneId;
  chapter_id: StoryChapterId;
  type: SceneType;
  title: string;
  titleZh: string;

  background: {
    type: "image" | "video" | "3d_scene";
    url: string;
    overlay_color?: string;
  };

  characters: SceneCharacter[];
  dialogue: SceneDialogue[];

  mission?: {
    id: MissionId;
    type: "speech" | "listening" | "choice";
    target: SpeechMissionTarget;
    success_criteria: MissionSuccessCriteria;
    prompt: string;
    promptZh: string;
    hint?: string;
    hintZh?: string;
  };

  reward?: {
    type: "sticker" | "badge" | "unlock" | "xp";
    id: string;
    name: string;
    nameZh: string;
    icon_url?: string;
    xp_amount?: number;
  };

  branches: SceneBranch[];

  therapist_note?: string;
  adaptation_key?: string;
}

// ─── Chapter ─────────────────────────────────────────────────────────────────

export interface StoryChapter {
  id: StoryChapterId;
  world_id: StoryWorldId;
  chapter_number: number;
  title: string;
  titleZh: string;
  subtitle: string;
  subtitleZh: string;

  description: string;
  descriptionZh: string;

  therapist_goal: string;
  therapist_goal_zh: string;

  target_phonemes: string[];
  target_tones: ToneLabel[];
  target_words: string[];

  difficulty: StoryDifficulty;
  estimated_minutes: number;

  scenes: StoryScene[];
  entry_scene_id: SceneId;

  unlock_condition?: {
    type: "chapter_complete" | "phoneme_mastery" | "therapist_approval";
    chapter_id?: StoryChapterId;
    phoneme?: string;
    min_accuracy?: number;
  };
}

// ─── Story World ─────────────────────────────────────────────────────────────

export interface StoryWorld {
  id: StoryWorldId;
  title: string;
  titleZh: string;
  emoji: string;

  description: string;
  descriptionZh: string;

  cover_image_url: string;
  theme_color: string;

  characters: SceneCharacter[];

  chapters: StoryChapter[];

  total_missions: number;
  total_xp: number;

  age_range: { min: number; max: number };
  phoneme_focus: string[];
  tone_focus: ToneLabel[];
}

// ─── Story Progress ──────────────────────────────────────────────────────────

export interface SceneProgress {
  scene_id: SceneId;
  status: "locked" | "unlocked" | "completed";
  attempts: MissionAttempt[];
  best_score?: number;
  completed_at?: string;
  rewards_earned: string[];
}

export interface ChapterProgress {
  chapter_id: StoryChapterId;
  status: "locked" | "unlocked" | "in_progress" | "completed";
  scenes: Record<SceneId, SceneProgress>;
  completion_pct: number;
  started_at?: string;
  completed_at?: string;
}

export interface StoryProgress {
  world_id: StoryWorldId;
  child_id: string;
  chapters: Record<StoryChapterId, ChapterProgress>;
  total_xp_earned: number;
  total_stickers: number;
  total_badges: number;
  current_scene_id?: SceneId;
  streak_days: number;
  last_played_at?: string;
}

// ─── Therapist Story Mapping ─────────────────────────────────────────────────

export interface TherapistStoryAssignment {
  child_id: string;
  therapist_id: string;
  world_id: StoryWorldId;
  assigned_at: string;

  target_phonemes: string[];
  target_tones: ToneLabel[];
  target_words: string[];

  difficulty_override?: StoryDifficulty;
  chapter_whitelist?: StoryChapterId[];
  chapter_blacklist?: StoryChapterId[];

  notes?: string;
}

export interface StoryRecommendation {
  world_id: StoryWorldId;
  chapter_id: StoryChapterId;
  reason: string;
  reasonZh: string;
  match_score: number;
  target_phonemes: string[];
  target_tones: ToneLabel[];
  difficulty: StoryDifficulty;
}

// ─── Adaptive Story Intelligence ─────────────────────────────────────────────

export interface AdaptiveStoryConfig {
  enable_adaptive_difficulty: boolean;
  enable_personalized_path: boolean;
  enable_emotional_feedback: boolean;

  difficulty_adjustment_threshold: {
    upgrade_after_consecutive_successes: number;
    downgrade_after_consecutive_failures: number;
  };

  emotional_feedback: {
    encourage_after_failures: number;
    celebrate_after_successes: number;
  };
}

export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveStoryConfig = {
  enable_adaptive_difficulty: true,
  enable_personalized_path: true,
  enable_emotional_feedback: true,
  difficulty_adjustment_threshold: {
    upgrade_after_consecutive_successes: 3,
    downgrade_after_consecutive_failures: 2,
  },
  emotional_feedback: {
    encourage_after_failures: 2,
    celebrate_after_successes: 1,
  },
};

// ─── Story Engine Events ─────────────────────────────────────────────────────

export type StoryEvent =
  | { type: "scene_enter"; scene_id: SceneId; timestamp: string }
  | { type: "scene_exit"; scene_id: SceneId; timestamp: string }
  | { type: "mission_start"; mission_id: MissionId; timestamp: string }
  | { type: "mission_attempt"; attempt: MissionAttempt; timestamp: string }
  | { type: "mission_complete"; mission_id: MissionId; result: MissionResult; timestamp: string }
  | { type: "reward_earned"; reward: StoryScene["reward"]; timestamp: string }
  | { type: "chapter_complete"; chapter_id: StoryChapterId; timestamp: string }
  | { type: "world_complete"; world_id: StoryWorldId; timestamp: string }
  | { type: "difficulty_adjusted"; from: StoryDifficulty; to: StoryDifficulty; reason: string; timestamp: string };

// ─── API Contracts ───────────────────────────────────────────────────────────

export interface GetNextSceneRequest {
  child_id: string;
  world_id?: StoryWorldId;
  chapter_id?: StoryChapterId;
}

export interface GetNextSceneResponse {
  success: boolean;
  scene: StoryScene;
  chapter: StoryChapter;
  world: StoryWorld;
  progress: StoryProgress;
  adaptive_config: AdaptiveStoryConfig;
}

export interface SubmitMissionResultRequest {
  child_id: string;
  mission_id: MissionId;
  attempt: MissionAttempt;
}

export interface SubmitMissionResultResponse {
  success: boolean;
  result: MissionResult;
  next_scene_id?: SceneId;
  rewards_earned?: StoryScene["reward"][];
  progress_updated: StoryProgress;
  adaptive_feedback?: {
    difficulty_adjusted?: boolean;
    new_difficulty?: StoryDifficulty;
    encouragement_message?: string;
    encouragement_message_zh?: string;
  };
}

export interface GetStoryProgressRequest {
  child_id: string;
  world_id?: StoryWorldId;
}

export interface GetStoryProgressResponse {
  success: boolean;
  progress: StoryProgress;
  worlds: StoryWorld[];
  recommendations: StoryRecommendation[];
}

export interface GetTherapistRecommendationsRequest {
  child_id: string;
  therapist_id: string;
}

export interface GetTherapistRecommendationsResponse {
  success: boolean;
  recommendations: StoryRecommendation[];
  assigned_stories: TherapistStoryAssignment[];
  child_progress: StoryProgress;
}
