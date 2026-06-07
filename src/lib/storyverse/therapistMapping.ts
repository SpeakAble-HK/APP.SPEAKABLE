/**
 * StoryVerse — Therapist → Story Mapping Engine
 *
 * Maps therapist clinical selections (phonemes, tones, words)
 * to story missions, scenes, and difficulty levels.
 *
 * This is the bridge between clinical intent and narrative delivery.
 */

import type {
  StoryWorld,
  StoryChapter,
  StoryScene,
  StoryDifficulty,
  TherapistStoryAssignment,
  StoryRecommendation,
  ToneLabel,
  SpeechMissionTarget,
  MissionSuccessCriteria,
} from "@/types/storyverse";
import { getAllStoryWorlds, recommendStories, type RecommendationInput } from "@/data/storyverse";
import { DEFAULT_SUCCESS_CRITERIA, STORY_DIFFICULTY_CONFIG } from "@/types/storyverse";

// ─── Therapist Input ─────────────────────────────────────────────────────────

export interface TherapistPrescription {
  child_id: string;
  therapist_id: string;

  target_phonemes: string[];
  target_tones: ToneLabel[];
  target_words?: string[];

  preferred_difficulty?: StoryDifficulty;
  age?: number;
  diagnosis?: string;

  session_goals?: string[];
  notes?: string;
}

// ─── Mapping Result ──────────────────────────────────────────────────────────

export interface StoryPrescription {
  assignment: TherapistStoryAssignment;
  recommended_chapters: StoryChapter[];
  recommended_scenes: StoryScene[];
  difficulty_adjustment?: {
    from: StoryDifficulty;
    to: StoryDifficulty;
    reason: string;
  };
  estimated_session_minutes: number;
  total_missions: number;
}

// ─── Core Mapping Function ───────────────────────────────────────────────────

export function mapTherapistToStory(prescription: TherapistPrescription): StoryPrescription[] {
  const results: StoryPrescription[] = [];
  const allWorlds = getAllStoryWorlds();

  for (const world of allWorlds) {
    const matchScore = calculateWorldMatch(world, prescription);
    if (matchScore <= 0) continue;

    const matchedChapters = findMatchingChapters(world, prescription);
    if (matchedChapters.length === 0) continue;

    const matchedScenes = matchedChapters.flatMap((c) =>
      c.scenes.filter((s) => s.mission && matchesMission(s.mission.target, prescription))
    );

    const difficultyAdj = computeDifficultyAdjustment(world, prescription);
    const totalMissions = matchedScenes.length;
    const estimatedMinutes = matchedChapters.reduce((sum, c) => sum + c.estimated_minutes, 0);

    const assignment: TherapistStoryAssignment = {
      child_id: prescription.child_id,
      therapist_id: prescription.therapist_id,
      world_id: world.id,
      assigned_at: new Date().toISOString(),
      target_phonemes: prescription.target_phonemes,
      target_tones: prescription.target_tones,
      target_words: prescription.target_words,
      difficulty_override: difficultyAdj?.to,
      chapter_whitelist: matchedChapters.map((c) => c.id),
      notes: prescription.notes,
    };

    results.push({
      assignment,
      recommended_chapters: matchedChapters,
      recommended_scenes: matchedScenes,
      difficulty_adjustment: difficultyAdj,
      estimated_session_minutes: estimatedMinutes,
      total_missions: totalMissions,
    });
  }

  return results.sort((a, b) => {
    const scoreA = a.recommended_scenes.length * 2 + a.recommended_chapters.length;
    const scoreB = b.recommended_scenes.length * 2 + b.recommended_chapters.length;
    return scoreB - scoreA;
  });
}

// ─── Matching Logic ──────────────────────────────────────────────────────────

function calculateWorldMatch(world: StoryWorld, prescription: TherapistPrescription): number {
  let score = 0;

  for (const phoneme of prescription.target_phonemes) {
    if (world.phoneme_focus.includes(phoneme)) score += 3;
  }

  for (const tone of prescription.target_tones) {
    if (world.tone_focus.includes(tone)) score += 2;
  }

  if (prescription.age && prescription.age >= world.age_range.min && prescription.age <= world.age_range.max) {
    score += 1;
  }

  return score;
}

function findMatchingChapters(world: StoryWorld, prescription: TherapistPrescription): StoryChapter[] {
  return world.chapters.filter((chapter) => {
    const hasPhoneme = chapter.target_phonemes.some((p) => prescription.target_phonemes.includes(p));
    const hasTone = chapter.target_tones.some((t) => prescription.target_tones.includes(t));
    return hasPhoneme || hasTone;
  });
}

function matchesMission(target: SpeechMissionTarget, prescription: TherapistPrescription): boolean {
  const hasPhoneme = target.target_phonemes.some((p) => prescription.target_phonemes.includes(p));
  const hasTone = target.target_tone ? prescription.target_tones.includes(target.target_tone) : false;
  const hasWord = prescription.target_words ? prescription.target_words.includes(target.word) : false;

  return hasPhoneme || hasTone || hasWord;
}

function computeDifficultyAdjustment(
  world: StoryWorld,
  prescription: TherapistPrescription
): { from: StoryDifficulty; to: StoryDifficulty; reason: string } | undefined {
  const baseDifficulty = world.chapters[0]?.difficulty || "easy";
  let adjustedDifficulty = prescription.preferred_difficulty || baseDifficulty;
  const reasons: string[] = [];

  if (prescription.diagnosis) {
    switch (prescription.diagnosis) {
      case "cas":
      case "phonological_disorder":
        if (adjustedDifficulty === "hard") {
          adjustedDifficulty = "medium";
          reasons.push(`Downgraded for ${prescription.diagnosis}`);
        }
        break;
      case "articulation_disorder":
        if (adjustedDifficulty === "hard") {
          adjustedDifficulty = "medium";
          reasons.push(`Downgraded for ${prescription.diagnosis}`);
        }
        break;
    }
  }

  if (prescription.age) {
    if (prescription.age < 5 && adjustedDifficulty === "hard") {
      adjustedDifficulty = "medium";
      reasons.push("Downgraded for age < 5");
    }
    if (prescription.age > 8 && adjustedDifficulty === "easy") {
      adjustedDifficulty = "medium";
      reasons.push("Upgraded for age > 8");
    }
  }

  if (adjustedDifficulty !== baseDifficulty) {
    return { from: baseDifficulty, to: adjustedDifficulty, reason: reasons.join("; ") || "Clinical adjustment" };
  }

  return undefined;
}

// ─── Success Criteria Customization ──────────────────────────────────────────

export function customizeSuccessCriteria(
  base: MissionSuccessCriteria,
  prescription: TherapistPrescription
): MissionSuccessCriteria {
  const criteria = { ...base };

  if (prescription.diagnosis === "cas") {
    criteria.min_overall_accuracy = Math.max(0.4, criteria.min_overall_accuracy - 0.15);
    criteria.min_tone_accuracy = Math.max(0.3, criteria.min_tone_accuracy - 0.15);
    criteria.max_timing_deviation_ms = criteria.max_timing_deviation_ms * 2;
  }

  if (prescription.diagnosis === "speech_delay") {
    criteria.min_overall_accuracy = Math.max(0.5, criteria.min_overall_accuracy - 0.1);
    criteria.min_tone_accuracy = Math.max(0.4, criteria.min_tone_accuracy - 0.1);
  }

  if (prescription.age && prescription.age < 5) {
    criteria.min_overall_accuracy = Math.max(0.5, criteria.min_overall_accuracy - 0.1);
    criteria.max_timing_deviation_ms = criteria.max_timing_deviation_ms * 1.5;
  }

  return criteria;
}

// ─── Session Plan Generator ──────────────────────────────────────────────────

export interface SessionPlan {
  child_id: string;
  therapist_id: string;
  date: string;
  estimated_minutes: number;

  warm_up: {
    description: string;
    descriptionZh: string;
    duration_minutes: number;
  };

  story_prescription: StoryPrescription;

  cooldown: {
    description: string;
    descriptionZh: string;
    duration_minutes: number;
  };

  therapist_notes: string[];
  success_metrics: {
    target_accuracy: number;
    target_tone_accuracy: number;
    min_missions_completed: number;
  };
}

export function generateSessionPlan(prescription: TherapistPrescription): SessionPlan | undefined {
  const prescriptions = mapTherapistToStory(prescription);
  if (prescriptions.length === 0) return undefined;

  const best = prescriptions[0];

  return {
    child_id: prescription.child_id,
    therapist_id: prescription.therapist_id,
    date: new Date().toISOString().split("T")[0],
    estimated_minutes: best.estimated_session_minutes + 5,

    warm_up: {
      description: "Review previous session's sounds with PiPi",
      descriptionZh: "同皮皮複習上次學過嘅音",
      duration_minutes: 2,
    },

    story_prescription: best,

    cooldown: {
      description: "Free play with earned stickers",
      descriptionZh: "自由玩已獲得嘅貼紙",
      duration_minutes: 3,
    },

    therapist_notes: [
      `Target phonemes: ${prescription.target_phonemes.join(", ")}`,
      `Target tones: ${prescription.target_tones.join(", ")}`,
      prescription.notes || "",
    ].filter(Boolean),

    success_metrics: {
      target_accuracy: 0.7,
      target_tone_accuracy: 0.65,
      min_missions_completed: Math.max(1, Math.floor(best.total_missions * 0.6)),
    },
  };
}

// ─── Progress → Recommendation Bridge ────────────────────────────────────────

export interface ChildProgressSummary {
  child_id: string;
  age?: number;
  completed_worlds: string[];
  current_world_id?: string;
  phoneme_accuracy: Record<string, number>;
  tone_accuracy: Record<ToneLabel, number>;
  consecutive_failures: number;
  consecutive_successes: number;
}

export function generateRecommendationsFromProgress(summary: ChildProgressSummary): StoryRecommendation[] {
  const weakPhonemes = Object.entries(summary.phoneme_accuracy)
    .filter(([_, acc]) => acc < 0.7)
    .map(([p]) => p);

  const weakTones = (Object.entries(summary.tone_accuracy) as [ToneLabel, number][])
    .filter(([_, acc]) => acc < 0.65)
    .map(([t]) => t);

  const masteredPhonemes = Object.entries(summary.phoneme_accuracy)
    .filter(([_, acc]) => acc >= 0.85)
    .map(([p]) => p);

  const masteredTones = (Object.entries(summary.tone_accuracy) as [ToneLabel, number][])
    .filter(([_, acc]) => acc >= 0.8)
    .map(([t]) => t);

  const input: RecommendationInput = {
    child_id: summary.child_id,
    age: summary.age,
    weak_phonemes: weakPhonemes,
    weak_tones: weakTones,
    mastered_phonemes: masteredPhonemes,
    mastered_tones: masteredTones,
    current_world_id: summary.current_world_id,
    completed_worlds: summary.completed_worlds as any[],
  };

  return recommendStories(input);
}
