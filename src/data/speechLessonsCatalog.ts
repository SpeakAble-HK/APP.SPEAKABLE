import type { SpeechLessonCatalog } from "@/shared/types/speechLesson";

/** Static catalog — extend or replace with CMS fetch later. */
export const speechLessonsCatalog: SpeechLessonCatalog = {
  version: 1,
  lessons: [
    {
      lesson_id: 1,
      world_id: "w1",
      difficulty: "beginner",
      lesson_type: "phrase_practice",
      phrase_list: ["你好"],
      expected_jyutping: ["nei5 hou2"],
      xp_reward: 50,
    },
    {
      lesson_id: 2,
      world_id: "w1",
      difficulty: "beginner",
      lesson_type: "phrase_practice",
      phrase_list: ["早晨"],
      expected_jyutping: ["zou2 san4"],
      xp_reward: 50,
    },
    {
      lesson_id: 3,
      world_id: "w1",
      difficulty: "beginner",
      lesson_type: "listen_repeat",
      phrase_list: ["多謝"],
      expected_jyutping: ["do1 ze6"],
      xp_reward: 50,
    },
  ],
};

export function getSpeechLessonRecord(lessonId: number) {
  return speechLessonsCatalog.lessons.find((l) => l.lesson_id === lessonId);
}
