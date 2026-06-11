import type { LessonStatus, QuestWorldData } from "@/data/questLessons";

/** Whether the user may open a world (previous world fully completed). */
export function isWorldUnlocked(
  worldIndex: number,
  worlds: QuestWorldData[],
  getLessonStatus: (lessonId: number) => LessonStatus
): boolean {
  if (worldIndex <= 0) return true;
  if (worldIndex >= worlds.length) return false;
  const prev = worlds[worldIndex - 1];
  return prev.lessons.every((l) => getLessonStatus(l.lesson_id) === "completed");
}

export function worldProgressPercent(
  world: QuestWorldData,
  getLessonStatus: (lessonId: number) => LessonStatus
): number {
  if (world.lessons.length === 0) return 0;
  const done = world.lessons.filter((l) => getLessonStatus(l.lesson_id) === "completed").length;
  return (done / world.lessons.length) * 100;
}
