import { questWorldsData } from "./questLessons";

export interface DailyChallengeDef {
  id: string;
  emoji: string;
  titleEn: string;
  titleTW: string;
  titleCN: string;
  descEn: string;
  descTW: string;
  descCN: string;
  bonusXp: number;
  check: (ctx: { completedLessons: Set<number>; todayCompletedIds: number[] }) => boolean;
}

// Pool of possible daily challenges — we pick 3 per day based on date seed
const challengePool: DailyChallengeDef[] = [
  // Complete any N lessons today
  {
    id: "any-1", emoji: "📝", bonusXp: 30,
    titleEn: "Quick Start", titleTW: "快速開始", titleCN: "快速开始",
    descEn: "Complete 1 lesson today", descTW: "今日完成 1 個課程", descCN: "今日完成 1 个课程",
    check: ({ todayCompletedIds }) => todayCompletedIds.length >= 1,
  },
  {
    id: "any-3", emoji: "🔥", bonusXp: 75,
    titleEn: "Triple Threat", titleTW: "三連擊", titleCN: "三连击",
    descEn: "Complete 3 lessons today", descTW: "今日完成 3 個課程", descCN: "今日完成 3 个课程",
    check: ({ todayCompletedIds }) => todayCompletedIds.length >= 3,
  },
  {
    id: "any-5", emoji: "⚡", bonusXp: 150,
    titleEn: "Power Learner", titleTW: "超級學習者", titleCN: "超级学习者",
    descEn: "Complete 5 lessons today", descTW: "今日完成 5 個課程", descCN: "今日完成 5 个课程",
    check: ({ todayCompletedIds }) => todayCompletedIds.length >= 5,
  },
  // World-specific challenges
  ...questWorldsData.slice(0, 5).map((w, i) => ({
    id: `world-${w.id}-lesson`,
    emoji: w.emoji,
    bonusXp: 50 + i * 10,
    titleEn: `${w.titleEn} Practice`,
    titleTW: `${w.titleTW}練習`,
    titleCN: `${w.titleCN}练习`,
    descEn: `Complete a lesson from "${w.titleEn}"`,
    descTW: `完成「${w.titleTW}」的一個課程`,
    descCN: `完成「${w.titleCN}」的一个课程`,
    check: ({ todayCompletedIds }: { todayCompletedIds: number[] }) => {
      const worldLessonIds = w.lessons.map(l => l.lesson_id);
      return todayCompletedIds.some(id => worldLessonIds.includes(id));
    },
  })),
  // Complete a new lesson (not previously completed)
  {
    id: "new-lesson", emoji: "🆕", bonusXp: 60,
    titleEn: "Explorer", titleTW: "探索者", titleCN: "探索者",
    descEn: "Complete a lesson you haven't done before", descTW: "完成一個未做過的課程", descCN: "完成一个未做过的课程",
    check: ({ todayCompletedIds }) => todayCompletedIds.length >= 1, // simplified — if they completed any new lesson today
  },
];

// Deterministic daily selection based on date
export function getDailyChallenges(date: string): DailyChallengeDef[] {
  // Simple hash from date string to pick 3 challenges
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash + date.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);

  const picked: DailyChallengeDef[] = [];
  const indices = new Set<number>();

  // Always include "any-1" as first challenge (easy starter)
  picked.push(challengePool[0]);
  indices.add(0);

  // Pick 2 more unique challenges
  let attempts = 0;
  while (picked.length < 3 && attempts < 20) {
    const idx = (hash + attempts * 7) % challengePool.length;
    if (!indices.has(idx)) {
      picked.push(challengePool[idx]);
      indices.add(idx);
    }
    attempts++;
  }

  return picked;
}
