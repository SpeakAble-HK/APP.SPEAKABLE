/**
 * StoryVerse — Story World Registry
 *
 * Central registry of all available story worlds.
 * Provides lookup, filtering, and therapist recommendation logic.
 */

import type { StoryWorld, StoryWorldId, StoryRecommendation, ToneLabel } from "@/types/storyverse";
import { bearAdventureWorld } from "./stories/bearAdventure";

// ─── World Registry ──────────────────────────────────────────────────────────

const STORY_WORLDS: Record<StoryWorldId, StoryWorld> = {
  "bear-adventure": bearAdventureWorld,
  // Future worlds:
  // "bus-travel": busTravelWorld,
  // "underwater-friends": underwaterFriendsWorld,
  // "magic-forest": magicForestWorld,
  // "dragon-quest": dragonQuestWorld,
};

export function getAllStoryWorlds(): StoryWorld[] {
  return Object.values(STORY_WORLDS);
}

export function getStoryWorld(id: StoryWorldId): StoryWorld | undefined {
  return STORY_WORLDS[id];
}

export function getStoryWorldsByAge(age: number): StoryWorld[] {
  return getAllStoryWorlds().filter(
    (w) => age >= w.age_range.min && age <= w.age_range.max
  );
}

export function getStoryWorldsByPhoneme(phonemes: string[]): StoryWorld[] {
  return getAllStoryWorlds().filter((w) =>
    phonemes.some((p) => w.phoneme_focus.includes(p))
  );
}

export function getStoryWorldsByTone(tones: ToneLabel[]): StoryWorld[] {
  return getAllStoryWorlds().filter((w) =>
    tones.some((t) => w.tone_focus.includes(t))
  );
}

// ─── Therapist Recommendation Engine ─────────────────────────────────────────

export interface RecommendationInput {
  child_id: string;
  age?: number;
  weak_phonemes?: string[];
  weak_tones?: ToneLabel[];
  mastered_phonemes?: string[];
  mastered_tones?: ToneLabel[];
  current_world_id?: StoryWorldId;
  completed_worlds?: StoryWorldId[];
}

/**
 * Generates story recommendations based on child's current needs.
 *
 * Scoring logic:
 *   - +3 points per weak phoneme covered
 *   - +2 points per weak tone covered
 *   - +1 point if age-appropriate
 *   - -5 points if already completed
 *   - -2 points if currently playing
 */
export function recommendStories(input: RecommendationInput): StoryRecommendation[] {
  const worlds = getAllStoryWorlds();
  const recommendations: StoryRecommendation[] = [];

  for (const world of worlds) {
    // Skip completed worlds
    if (input.completed_worlds?.includes(world.id)) continue;

    let matchScore = 0;
    const matchedPhonemes: string[] = [];
    const matchedTones: ToneLabel[] = [];

    // Score phoneme coverage
    for (const phoneme of world.phoneme_focus) {
      if (input.weak_phonemes?.includes(phoneme)) {
        matchScore += 3;
        matchedPhonemes.push(phoneme);
      }
    }

    // Score tone coverage
    for (const tone of world.tone_focus) {
      if (input.weak_tones?.includes(tone)) {
        matchScore += 2;
        matchedTones.push(tone);
      }
    }

    // Age appropriateness
    if (input.age && input.age >= world.age_range.min && input.age <= world.age_range.max) {
      matchScore += 1;
    }

    // Penalty for current world
    if (input.current_world_id === world.id) {
      matchScore -= 2;
    }

    // Skip if score is too low
    if (matchScore <= 0) continue;

    // Find the best chapter for this child
    const bestChapter = findBestChapter(world, input);

    recommendations.push({
      world_id: world.id,
      chapter_id: bestChapter?.id || world.chapters[0]?.id || "",
      reason: buildRecommendationReason(matchedPhonemes, matchedTones),
      reasonZh: buildRecommendationReasonZh(matchedPhonemes, matchedTones),
      match_score: matchScore,
      target_phonemes: matchedPhonemes,
      target_tones: matchedTones,
      difficulty: bestChapter?.difficulty || "easy",
    });
  }

  // Sort by match score descending
  return recommendations.sort((a, b) => b.match_score - a.match_score);
}

function findBestChapter(world: StoryWorld, input: RecommendationInput) {
  // Find first unlocked chapter that matches weak areas
  for (const chapter of world.chapters) {
    const hasWeakPhoneme = chapter.target_phonemes.some((p) =>
      input.weak_phonemes?.includes(p)
    );
    const hasWeakTone = chapter.target_tones.some((t) =>
      input.weak_tones?.includes(t)
    );

    if (hasWeakPhoneme || hasWeakTone) {
      return chapter;
    }
  }
  return world.chapters[0];
}

function buildRecommendationReason(phonemes: string[], tones: ToneLabel[]): string {
  const parts: string[] = [];
  if (phonemes.length > 0) {
    parts.push(`practise ${phonemes.join(", ")}`);
  }
  if (tones.length > 0) {
    parts.push(`work on ${tones.map((t) => t.replace("tone_", "tone ")).join(", ")}`);
  }
  return parts.length > 0 ? `Great story to ${parts.join(" and ")}` : "Good general practice";
}

function buildRecommendationReasonZh(phonemes: string[], tones: ToneLabel[]): string {
  const parts: string[] = [];
  if (phonemes.length > 0) {
    parts.push(`練習 ${phonemes.join("、")}`);
  }
  if (tones.length > 0) {
    parts.push(`改善 ${tones.map((t) => `第${t.slice(-1)}聲`).join("、")}`);
  }
  return parts.length > 0 ? `呢個故事好適合${parts.join("同")}` : "適合一般練習";
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export { STORY_WORLDS };
