import type { QuestLessonData } from "@/data/questLessons";
import { questWorldsData } from "@/data/questLessons";
import type { SpeechLessonRecord } from "@/types/speechLesson";
import { getSpeechLessonRecord } from "@/data/speechLessonsCatalog";

function worldIdForLesson(lessonId: number): string {
  for (const w of questWorldsData) {
    if (w.lessons.some((l) => l.lesson_id === lessonId)) return w.id;
  }
  return "unknown";
}

/**
 * Merge quest row (authoritative copy + ids) with optional JSON catalog metadata.
 */
export function resolveSpeechLesson(quest: QuestLessonData): SpeechLessonRecord {
  const meta = getSpeechLessonRecord(quest.lesson_id);
  const phrase = quest.sentence.trim();
  const wid = worldIdForLesson(quest.lesson_id);
  if (meta) {
    return {
      ...meta,
      world_id: meta.world_id || wid,
      phrase_list: meta.phrase_list.length ? meta.phrase_list : [phrase],
      xp_reward: quest.xp_reward,
    };
  }
  return {
    lesson_id: quest.lesson_id,
    world_id: wid,
    difficulty: "beginner",
    lesson_type: "phrase_practice",
    phrase_list: [phrase],
    expected_jyutping: undefined,
    audio_reference_url: null,
    xp_reward: quest.xp_reward,
  };
}
