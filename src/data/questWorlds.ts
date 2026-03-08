import { PracticeWord } from './practiceTopics';

export interface QuestLesson {
  id: string;
  titleEn: string;
  titleTW: string;
  titleCN: string;
  xp: number;
  words: PracticeWord[];
}

export interface QuestWorld {
  id: string;
  titleEn: string;
  titleTW: string;
  titleCN: string;
  emoji: string;
  lessons: QuestLesson[];
}

export const questWorlds: QuestWorld[] = [
  {
    id: "w1",
    titleEn: "Basic Sounds",
    titleTW: "基本發音",
    titleCN: "基本发音",
    emoji: "🔤",
    lessons: [
      {
        id: "w1-1", titleEn: "Hello", titleTW: "你好", titleCN: "你好", xp: 50,
        words: [
          { character: "你", jyutping: "nei5", meaning: "you" },
          { character: "好", jyutping: "hou2", meaning: "good" },
        ],
      },
      {
        id: "w1-2", titleEn: "Thank You", titleTW: "多謝", titleCN: "多谢", xp: 50,
        words: [
          { character: "多", jyutping: "do1", meaning: "many" },
          { character: "謝", jyutping: "ze6", meaning: "thank" },
        ],
      },
      {
        id: "w1-3", titleEn: "Yes & No", titleTW: "是與否", titleCN: "是与否", xp: 75,
        words: [
          { character: "係", jyutping: "hai6", meaning: "yes" },
          { character: "唔", jyutping: "m4", meaning: "not" },
        ],
      },
      {
        id: "w1-4", titleEn: "I & You", titleTW: "我與你", titleCN: "我与你", xp: 75,
        words: [
          { character: "我", jyutping: "ngo5", meaning: "I" },
          { character: "你", jyutping: "nei5", meaning: "you" },
          { character: "佢", jyutping: "keoi5", meaning: "he/she" },
        ],
      },
    ],
  },
  {
    id: "w2",
    titleEn: "Greetings",
    titleTW: "問候語",
    titleCN: "问候语",
    emoji: "👋",
    lessons: [
      {
        id: "w2-1", titleEn: "Good Morning", titleTW: "早晨", titleCN: "早晨", xp: 75,
        words: [
          { character: "早", jyutping: "zou2", meaning: "early" },
          { character: "晨", jyutping: "san4", meaning: "morning" },
        ],
      },
      {
        id: "w2-2", titleEn: "How Are You", titleTW: "你好嗎", titleCN: "你好吗", xp: 75,
        words: [
          { character: "你", jyutping: "nei5", meaning: "you" },
          { character: "好", jyutping: "hou2", meaning: "good" },
          { character: "嗎", jyutping: "maa1", meaning: "question particle" },
        ],
      },
      {
        id: "w2-3", titleEn: "Goodbye", titleTW: "再見", titleCN: "再见", xp: 100,
        words: [
          { character: "再", jyutping: "zoi3", meaning: "again" },
          { character: "見", jyutping: "gin3", meaning: "see" },
        ],
      },
      {
        id: "w2-4", titleEn: "Nice to Meet You", titleTW: "幸會", titleCN: "幸会", xp: 100,
        words: [
          { character: "幸", jyutping: "hang6", meaning: "fortune" },
          { character: "會", jyutping: "wui5", meaning: "meet" },
        ],
      },
      {
        id: "w2-5", titleEn: "See You Later", titleTW: "遲啲見", titleCN: "迟啲见", xp: 100,
        words: [
          { character: "遲", jyutping: "ci4", meaning: "late" },
          { character: "啲", jyutping: "di1", meaning: "a bit" },
          { character: "見", jyutping: "gin3", meaning: "see" },
        ],
      },
    ],
  },
  {
    id: "w3",
    titleEn: "Numbers",
    titleTW: "數字",
    titleCN: "数字",
    emoji: "🔢",
    lessons: [
      {
        id: "w3-1", titleEn: "One to Five", titleTW: "一至五", titleCN: "一至五", xp: 100,
        words: [
          { character: "一", jyutping: "jat1", meaning: "one" },
          { character: "二", jyutping: "ji6", meaning: "two" },
          { character: "三", jyutping: "saam1", meaning: "three" },
          { character: "四", jyutping: "sei3", meaning: "four" },
          { character: "五", jyutping: "ng5", meaning: "five" },
        ],
      },
      {
        id: "w3-2", titleEn: "Six to Ten", titleTW: "六至十", titleCN: "六至十", xp: 100,
        words: [
          { character: "六", jyutping: "luk6", meaning: "six" },
          { character: "七", jyutping: "cat1", meaning: "seven" },
          { character: "八", jyutping: "baat3", meaning: "eight" },
          { character: "九", jyutping: "gau2", meaning: "nine" },
          { character: "十", jyutping: "sap6", meaning: "ten" },
        ],
      },
      {
        id: "w3-3", titleEn: "Counting Things", titleTW: "數物品", titleCN: "数物品", xp: 125,
        words: [
          { character: "個", jyutping: "go3", meaning: "classifier" },
          { character: "隻", jyutping: "zek3", meaning: "classifier (animals)" },
          { character: "件", jyutping: "gin6", meaning: "classifier (clothes)" },
        ],
      },
      {
        id: "w3-4", titleEn: "Money", titleTW: "金錢", titleCN: "金钱", xp: 125,
        words: [
          { character: "蚊", jyutping: "man1", meaning: "dollar" },
          { character: "毫", jyutping: "hou4", meaning: "dime" },
          { character: "錢", jyutping: "cin2", meaning: "money" },
        ],
      },
    ],
  },
  {
    id: "w4",
    titleEn: "Food",
    titleTW: "飲食",
    titleCN: "饮食",
    emoji: "🍜",
    lessons: [
      {
        id: "w4-1", titleEn: "Rice & Noodles", titleTW: "飯與麵", titleCN: "饭与面", xp: 125,
        words: [
          { character: "飯", jyutping: "faan6", meaning: "rice" },
          { character: "麵", jyutping: "min6", meaning: "noodles" },
          { character: "粥", jyutping: "zuk1", meaning: "congee" },
        ],
      },
      {
        id: "w4-2", titleEn: "Drinks", titleTW: "飲品", titleCN: "饮品", xp: 125,
        words: [
          { character: "茶", jyutping: "caa4", meaning: "tea" },
          { character: "水", jyutping: "seoi2", meaning: "water" },
          { character: "奶", jyutping: "naai5", meaning: "milk" },
        ],
      },
      {
        id: "w4-3", titleEn: "Dim Sum", titleTW: "點心", titleCN: "点心", xp: 150,
        words: [
          { character: "蝦", jyutping: "haa1", meaning: "shrimp" },
          { character: "餃", jyutping: "gaau2", meaning: "dumpling" },
          { character: "腸", jyutping: "coeng2", meaning: "intestine/roll" },
        ],
      },
      {
        id: "w4-4", titleEn: "Ordering Food", titleTW: "點餐", titleCN: "点餐", xp: 150,
        words: [
          { character: "要", jyutping: "jiu3", meaning: "want" },
          { character: "唔", jyutping: "m4", meaning: "not" },
          { character: "該", jyutping: "goi1", meaning: "should" },
        ],
      },
    ],
  },
  {
    id: "w5",
    titleEn: "Daily Conversation",
    titleTW: "日常對話",
    titleCN: "日常对话",
    emoji: "💬",
    lessons: [
      {
        id: "w5-1", titleEn: "Weather", titleTW: "天氣", titleCN: "天气", xp: 150,
        words: [
          { character: "天", jyutping: "tin1", meaning: "sky" },
          { character: "熱", jyutping: "jit6", meaning: "hot" },
          { character: "冷", jyutping: "laang5", meaning: "cold" },
        ],
      },
      {
        id: "w5-2", titleEn: "Transport", titleTW: "交通", titleCN: "交通", xp: 150,
        words: [
          { character: "車", jyutping: "ce1", meaning: "car" },
          { character: "巴", jyutping: "baa1", meaning: "bus" },
          { character: "站", jyutping: "zaam6", meaning: "station" },
        ],
      },
      {
        id: "w5-3", titleEn: "Family", titleTW: "家人", titleCN: "家人", xp: 175,
        words: [
          { character: "爸", jyutping: "baa4", meaning: "father" },
          { character: "媽", jyutping: "maa1", meaning: "mother" },
          { character: "家", jyutping: "gaa1", meaning: "home" },
        ],
      },
      {
        id: "w5-4", titleEn: "At the Market", titleTW: "街市", titleCN: "街市", xp: 200,
        words: [
          { character: "買", jyutping: "maai5", meaning: "buy" },
          { character: "賣", jyutping: "maai6", meaning: "sell" },
          { character: "平", jyutping: "peng4", meaning: "cheap" },
          { character: "貴", jyutping: "gwai3", meaning: "expensive" },
        ],
      },
    ],
  },
];

// Flatten all lessons with world context
export function getAllLessons(): Array<QuestLesson & { worldId: string }> {
  return questWorlds.flatMap(w => w.lessons.map(l => ({ ...l, worldId: w.id })));
}
