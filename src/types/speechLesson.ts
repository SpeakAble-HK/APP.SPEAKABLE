import type { WorldDifficulty } from "@/data/questLessons";

/** Lesson kinds for routing UI / analytics (design doc §1.2). */
export type SpeechLessonType = "listen_repeat" | "phrase_practice" | "minimal_pair_tone";

/** Canonical lesson record (JSON-serializable; can live in CMS later). */
export interface SpeechLessonRecord {
  lesson_id: number;
  world_id: string;
  difficulty: WorldDifficulty;
  lesson_type: SpeechLessonType;
  /** Target phrases (single sentence = one element). */
  phrase_list: string[];
  /** Optional expected jyutping strings (one per phrase or space-joined syllables). */
  expected_jyutping?: string[];
  /** Bundled or remote reference clip (optional). */
  audio_reference_url?: string | null;
  xp_reward: number;
}

export interface SpeechLessonCatalog {
  version: number;
  lessons: SpeechLessonRecord[];
}
