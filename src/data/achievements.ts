import { questWorldsData } from "./questLessons";

export interface AchievementDef {
  id: string;
  emoji: string;
  titleEn: string;
  titleTW: string;
  titleCN: string;
  descEn: string;
  descTW: string;
  descCN: string;
  check: (ctx: { completedLessons: Set<number>; totalXp: number; streakDays: number }) => boolean;
}

// World completion achievements
const worldAchievements: AchievementDef[] = questWorldsData.map((w, i) => ({
  id: `world-${w.id}`,
  emoji: w.emoji,
  titleEn: `${w.titleEn} Master`,
  titleTW: `${w.titleTW}大師`,
  titleCN: `${w.titleCN}大师`,
  descEn: `Complete all lessons in World ${i + 1}`,
  descTW: `完成世界 ${i + 1} 所有課程`,
  descCN: `完成世界 ${i + 1} 所有课程`,
  check: ({ completedLessons }) => w.lessons.every(l => completedLessons.has(l.lesson_id)),
}));

// XP milestone achievements
const xpAchievements: AchievementDef[] = [
  { id: "xp-100", emoji: "💯", titleEn: "First Steps", titleTW: "初試啼聲", titleCN: "初试啼声", descEn: "Earn 100 XP", descTW: "獲得 100 XP", descCN: "获得 100 XP", check: ({ totalXp }) => totalXp >= 100 },
  { id: "xp-500", emoji: "🔥", titleEn: "On Fire", titleTW: "火力全開", titleCN: "火力全开", descEn: "Earn 500 XP", descTW: "獲得 500 XP", descCN: "获得 500 XP", check: ({ totalXp }) => totalXp >= 500 },
  { id: "xp-1000", emoji: "⚡", titleEn: "Powerhouse", titleTW: "實力超群", titleCN: "实力超群", descEn: "Earn 1,000 XP", descTW: "獲得 1,000 XP", descCN: "获得 1,000 XP", check: ({ totalXp }) => totalXp >= 1000 },
  { id: "xp-2500", emoji: "👑", titleEn: "XP Royalty", titleTW: "XP 皇者", titleCN: "XP 皇者", descEn: "Earn 2,500 XP", descTW: "獲得 2,500 XP", descCN: "获得 2,500 XP", check: ({ totalXp }) => totalXp >= 2500 },
  { id: "xp-5000", emoji: "🏆", titleEn: "Legend", titleTW: "傳奇", titleCN: "传奇", descEn: "Earn 5,000 XP", descTW: "獲得 5,000 XP", descCN: "获得 5,000 XP", check: ({ totalXp }) => totalXp >= 5000 },
];

// Streak achievements
const streakAchievements: AchievementDef[] = [
  { id: "streak-3", emoji: "🔥", titleEn: "3-Day Streak", titleTW: "三日連續", titleCN: "三日连续", descEn: "Practice 3 days in a row", descTW: "連續練習 3 天", descCN: "连续练习 3 天", check: ({ streakDays }) => streakDays >= 3 },
  { id: "streak-7", emoji: "🌟", titleEn: "Weekly Warrior", titleTW: "一週戰士", titleCN: "一周战士", descEn: "Practice 7 days in a row", descTW: "連續練習 7 天", descCN: "连续练习 7 天", check: ({ streakDays }) => streakDays >= 7 },
  { id: "streak-14", emoji: "💎", titleEn: "Fortnight Hero", titleTW: "兩週英雄", titleCN: "两周英雄", descEn: "Practice 14 days in a row", descTW: "連續練習 14 天", descCN: "连续练习 14 天", check: ({ streakDays }) => streakDays >= 14 },
  { id: "streak-30", emoji: "🏅", titleEn: "Monthly Master", titleTW: "月度大師", titleCN: "月度大师", descEn: "Practice 30 days in a row", descTW: "連續練習 30 天", descCN: "连续练习 30 天", check: ({ streakDays }) => streakDays >= 30 },
];

// Lesson count achievements
const lessonCountAchievements: AchievementDef[] = [
  { id: "lessons-5", emoji: "📖", titleEn: "Getting Started", titleTW: "起步", titleCN: "起步", descEn: "Complete 5 lessons", descTW: "完成 5 個課程", descCN: "完成 5 个课程", check: ({ completedLessons }) => completedLessons.size >= 5 },
  { id: "lessons-15", emoji: "📚", titleEn: "Bookworm", titleTW: "書蟲", titleCN: "书虫", descEn: "Complete 15 lessons", descTW: "完成 15 個課程", descCN: "完成 15 个课程", check: ({ completedLessons }) => completedLessons.size >= 15 },
  { id: "lessons-30", emoji: "🎓", titleEn: "Scholar", titleTW: "學者", titleCN: "学者", descEn: "Complete 30 lessons", descTW: "完成 30 個課程", descCN: "完成 30 个课程", check: ({ completedLessons }) => completedLessons.size >= 30 },
  { id: "all-lessons", emoji: "🌈", titleEn: "Perfect Quest", titleTW: "完美冒險", titleCN: "完美冒险", descEn: "Complete every lesson", descTW: "完成所有課程", descCN: "完成所有课程", check: ({ completedLessons }) => {
    const total = questWorldsData.reduce((acc, w) => acc + w.lessons.length, 0);
    return completedLessons.size >= total;
  }},
];

export const allAchievements: AchievementDef[] = [
  ...worldAchievements,
  ...xpAchievements,
  ...streakAchievements,
  ...lessonCountAchievements,
];
