export type LessonStatus = "locked" | "unlocked" | "completed";
export type WorldDifficulty = "beginner" | "elementary" | "intermediate" | "advanced" | "expert";

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
  difficulty: WorldDifficulty;
  lessons: QuestLessonData[];
}

export const difficultyConfig: Record<WorldDifficulty, { labelEn: string; labelTW: string; labelCN: string; color: string; stars: number }> = {
  beginner:     { labelEn: "Beginner",     labelTW: "入門", labelCN: "入门", color: "bg-success text-success-foreground",      stars: 1 },
  elementary:   { labelEn: "Elementary",   labelTW: "初級", labelCN: "初级", color: "bg-primary text-primary-foreground",      stars: 2 },
  intermediate: { labelEn: "Intermediate", labelTW: "中級", labelCN: "中级", color: "bg-accent text-accent-foreground",        stars: 3 },
  advanced:     { labelEn: "Advanced",     labelTW: "高級", labelCN: "高级", color: "bg-destructive text-destructive-foreground", stars: 4 },
  expert:       { labelEn: "Expert",       labelTW: "專家", labelCN: "专家", color: "bg-foreground text-background",           stars: 5 },
};

export const questWorldsData: QuestWorldData[] = [
  {
    id: "w1",
    titleEn: "Basic Greetings",
    titleTW: "基本問候",
    titleCN: "基本问候",
    emoji: "👋",
    difficulty: "beginner",
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
    difficulty: "beginner",
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
    difficulty: "elementary",
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
    difficulty: "elementary",
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
    difficulty: "intermediate",
    lessons: [
      { lesson_id: 17, sentence: "你住喺邊度", english_translation: "Where do you live?", xp_reward: 150 },
      { lesson_id: 18, sentence: "今日天氣好好", english_translation: "The weather is very nice today", xp_reward: 150 },
      { lesson_id: 19, sentence: "我鍾意食點心", english_translation: "I like eating dim sum", xp_reward: 175 },
      { lesson_id: 20, sentence: "好開心見到你", english_translation: "Very happy to see you", xp_reward: 200 },
    ],
  },
  {
    id: "w6",
    titleEn: "Shopping & Bargaining",
    titleTW: "購物講價",
    titleCN: "购物讲价",
    emoji: "🛍️",
    difficulty: "intermediate",
    lessons: [
      { lesson_id: 21, sentence: "可唔可以平啲", english_translation: "Can you give a discount?", xp_reward: 175 },
      { lesson_id: 22, sentence: "我想試吓呢件", english_translation: "I want to try this on", xp_reward: 175 },
      { lesson_id: 23, sentence: "有冇細碼", english_translation: "Do you have a smaller size?", xp_reward: 200 },
      { lesson_id: 24, sentence: "太貴喇，算啦", english_translation: "Too expensive, forget it", xp_reward: 200 },
    ],
  },
  {
    id: "w7",
    titleEn: "At the Doctor",
    titleTW: "睇醫生",
    titleCN: "睇医生",
    emoji: "🏥",
    difficulty: "intermediate",
    lessons: [
      { lesson_id: 25, sentence: "我唔舒服", english_translation: "I don't feel well", xp_reward: 200 },
      { lesson_id: 26, sentence: "我頭好痛", english_translation: "I have a bad headache", xp_reward: 200 },
      { lesson_id: 27, sentence: "要唔要食藥", english_translation: "Do I need to take medicine?", xp_reward: 225 },
      { lesson_id: 28, sentence: "幾時先會好返", english_translation: "When will I get better?", xp_reward: 225 },
    ],
  },
  {
    id: "w8",
    titleEn: "Cantonese Idioms",
    titleTW: "廣東話俗語",
    titleCN: "广东话俗语",
    emoji: "📜",
    difficulty: "advanced",
    lessons: [
      { lesson_id: 29, sentence: "食得鹹魚抵得渴", english_translation: "Face the consequences of your choices", xp_reward: 250 },
      { lesson_id: 30, sentence: "船到橋頭自然直", english_translation: "Things will work out in the end", xp_reward: 250 },
      { lesson_id: 31, sentence: "有頭威冇尾陣", english_translation: "Start strong but never finish", xp_reward: 275 },
      { lesson_id: 32, sentence: "雞同鴨講", english_translation: "Talking without understanding each other", xp_reward: 275 },
      { lesson_id: 33, sentence: "跌落地揦番渣沙", english_translation: "Make the best of a bad situation", xp_reward: 300 },
    ],
  },
  {
    id: "w9",
    titleEn: "Work & School",
    titleTW: "返工返學",
    titleCN: "返工返学",
    emoji: "💼",
    difficulty: "advanced",
    lessons: [
      { lesson_id: 34, sentence: "今日要加班", english_translation: "I have to work overtime today", xp_reward: 250 },
      { lesson_id: 35, sentence: "聽日有冇得放假", english_translation: "Is there a holiday tomorrow?", xp_reward: 250 },
      { lesson_id: 36, sentence: "考試考得點啊", english_translation: "How did the exam go?", xp_reward: 275 },
      { lesson_id: 37, sentence: "我想請假一日", english_translation: "I'd like to take a day off", xp_reward: 275 },
    ],
  },
  {
    id: "w10",
    titleEn: "Situational Dialogues",
    titleTW: "情景對話",
    titleCN: "情景对话",
    emoji: "🎭",
    difficulty: "expert",
    lessons: [
      { lesson_id: 38, sentence: "唔好意思打擾你一陣", english_translation: "Sorry to bother you for a moment", xp_reward: 300 },
      { lesson_id: 39, sentence: "你可唔可以幫我影張相", english_translation: "Can you take a photo for me?", xp_reward: 300 },
      { lesson_id: 40, sentence: "我約咗朋友喺呢度等", english_translation: "I'm meeting a friend here", xp_reward: 325 },
      { lesson_id: 41, sentence: "如果唔係你幫手我真係唔知點算", english_translation: "I don't know what I'd do without your help", xp_reward: 350 },
      { lesson_id: 42, sentence: "香港真係好靚，我下次一定再嚟", english_translation: "Hong Kong is beautiful, I'll definitely come again", xp_reward: 400 },
    ],
  },
];

// Flatten all lessons in order
export function getAllQuestLessons(): QuestLessonData[] {
  return questWorldsData.flatMap(w => w.lessons);
}
