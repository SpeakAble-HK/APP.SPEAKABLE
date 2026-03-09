export type LessonStatus = "locked" | "unlocked" | "completed";

export interface QuestLessonData {
  lesson_id: number;
  sentence: string;
  english_translation: string;
  xp_reward: number;
}

export interface QuestWorldData {
  id: string;
  titleEn: string;
  titleTW: string;
  titleCN: string;
  emoji: string;
  lessons: QuestLessonData[];
}

export const questWorldsData: QuestWorldData[] = [
  {
    id: "w1",
    titleEn: "Basic Greetings",
    titleTW: "基本問候",
    titleCN: "基本问候",
    emoji: "👋",
    lessons: [
      { lesson_id: 1, sentence: "你好", english_translation: "Hello", xp_reward: 50 },
      { lesson_id: 2, sentence: "早晨", english_translation: "Good morning", xp_reward: 50 },
      { lesson_id: 3, sentence: "多謝", english_translation: "Thank you", xp_reward: 50 },
      { lesson_id: 4, sentence: "再見", english_translation: "Goodbye", xp_reward: 75 },
    ],
  },
  {
    id: "w2",
    titleEn: "Daily Phrases",
    titleTW: "日常短句",
    titleCN: "日常短句",
    emoji: "💬",
    lessons: [
      { lesson_id: 5, sentence: "你好嗎", english_translation: "How are you?", xp_reward: 75 },
      { lesson_id: 6, sentence: "我好好", english_translation: "I'm very well", xp_reward: 75 },
      { lesson_id: 7, sentence: "你叫咩名", english_translation: "What is your name?", xp_reward: 100 },
      { lesson_id: 8, sentence: "我叫小明", english_translation: "My name is Siu Ming", xp_reward: 100 },
    ],
  },
  {
    id: "w3",
    titleEn: "Eating & Drinking",
    titleTW: "飲飲食食",
    titleCN: "饮饮食食",
    emoji: "🍜",
    lessons: [
      { lesson_id: 9, sentence: "你今日食咗飯未啊", english_translation: "Have you eaten today?", xp_reward: 100 },
      { lesson_id: 10, sentence: "我想飲杯茶", english_translation: "I want to drink a cup of tea", xp_reward: 100 },
      { lesson_id: 11, sentence: "呢個幾多錢", english_translation: "How much is this?", xp_reward: 125 },
      { lesson_id: 12, sentence: "唔該埋單", english_translation: "Bill please", xp_reward: 125 },
    ],
  },
  {
    id: "w4",
    titleEn: "Getting Around",
    titleTW: "四處去",
    titleCN: "四处去",
    emoji: "🚌",
    lessons: [
      { lesson_id: 13, sentence: "我想去尖沙咀", english_translation: "I want to go to Tsim Sha Tsui", xp_reward: 125 },
      { lesson_id: 14, sentence: "呢度係邊度", english_translation: "Where is this place?", xp_reward: 125 },
      { lesson_id: 15, sentence: "巴士站喺邊", english_translation: "Where is the bus stop?", xp_reward: 150 },
      { lesson_id: 16, sentence: "我迷路咗", english_translation: "I'm lost", xp_reward: 150 },
    ],
  },
  {
    id: "w5",
    titleEn: "Conversations",
    titleTW: "對話練習",
    titleCN: "对话练习",
    emoji: "🗣️",
    lessons: [
      { lesson_id: 17, sentence: "你住喺邊度", english_translation: "Where do you live?", xp_reward: 150 },
      { lesson_id: 18, sentence: "今日天氣好好", english_translation: "The weather is very nice today", xp_reward: 150 },
      { lesson_id: 19, sentence: "我鍾意食點心", english_translation: "I like eating dim sum", xp_reward: 175 },
      { lesson_id: 20, sentence: "好開心見到你", english_translation: "Very happy to see you", xp_reward: 200 },
    ],
  },
];

// Flatten all lessons in order
export function getAllQuestLessons(): QuestLessonData[] {
  return questWorldsData.flatMap(w => w.lessons);
}
