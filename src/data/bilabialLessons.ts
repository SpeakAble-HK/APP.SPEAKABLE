// 雙唇海灘 - Bilabial Beach lesson data
// Station 1: 噴氣實驗室 (Visual Teaching + Single Sound)
// Station 2: 單字配對大進擊 (Matching exercises across 3 levels per phoneme)

export interface PhonemeTeaching {
  phoneme: string;
  label: string;
  familyWord: string;
  description: string;
  memoryTrick: string;
  memoryEmoji: string;
  commonMistake: string;
  mistakeFix: string;
}

export interface MatchingItem {
  word: string;
  image?: string; // emoji as placeholder
}

export interface LessonLevel {
  level: number;
  levelLabel: string;
  prompt: string;
  items: MatchingItem[];
}

export interface Station2Phoneme {
  phoneme: string;
  label: string;
  levels: LessonLevel[];
}

// ── Station 1: 噴氣實驗室 ──
export const station1Teachings: PhonemeTeaching[] = [
  {
    phoneme: '/b/',
    label: '爸爸音',
    familyWord: '爸爸',
    description: '雙唇閉緊 → 輕輕彈開',
    memoryTrick: 'bangbang槍',
    memoryEmoji: '🔫',
    commonMistake: '/b/ 發成 /m/',
    mistakeFix: '皮皮提醒小朋友收起牙齒，合上嘴唇',
  },
  {
    phoneme: '/p/',
    label: '婆婆音',
    familyWord: '婆婆',
    description: '雙唇閉緊 → 強力噴氣',
    memoryTrick: '吹泡泡',
    memoryEmoji: '🫧',
    commonMistake: '/p/ 發成 /b/',
    mistakeFix: '皮皮提醒：把手指放在嘴前，感受氣流噴出',
  },
  {
    phoneme: '/m/',
    label: '媽媽音',
    familyWord: '媽媽',
    description: '雙唇閉合 → 鼻震動',
    memoryTrick: 'mmm 鼻震',
    memoryEmoji: '🤢',
    commonMistake: '/m/ 氣流從嘴巴出',
    mistakeFix: '皮皮提醒：閉上嘴巴，用鼻子發聲',
  },
];

// ── Station 2: 單字配對大進擊 ──
export const station2Phonemes: Station2Phoneme[] = [
  {
    phoneme: '/b/',
    label: '爸爸音',
    levels: [
      {
        level: 1,
        levelLabel: '單字',
        prompt: '這是什麼？',
        items: [
          { word: '波', image: '⚽' },
          { word: '包', image: '🍞' },
          { word: '餅', image: '🍪' },
          { word: '筆', image: '✏️' },
          { word: '鼻', image: '👃' },
        ],
      },
      {
        level: 2,
        levelLabel: '詞組',
        prompt: '請聽這個詞語',
        items: [
          { word: '巴士', image: '🚌' },
          { word: '打波', image: '⚽' },
          { word: '寶石', image: '💎' },
          { word: '書包', image: '🎒' },
          { word: '八達通', image: '💳' },
        ],
      },
      {
        level: 3,
        levelLabel: '情景',
        prompt: '他們在做什麼？',
        items: [
          { word: '爸爸吃漢堡', image: '🍔' },
          { word: '搭巴士刷八達通', image: '🚌' },
          { word: '爸爸和伯伯道別', image: '👋' },
        ],
      },
    ],
  },
  {
    phoneme: '/p/',
    label: '婆婆音',
    levels: [
      {
        level: 1,
        levelLabel: '單字',
        prompt: '這是什麼？',
        items: [
          { word: '爬', image: '🧗' },
          { word: '怕', image: '😨' },
          { word: '泡', image: '🫧' },
          { word: '跑', image: '🏃' },
        ],
      },
      {
        level: 2,
        levelLabel: '詞組',
        prompt: '請聽這個詞語',
        items: [
          { word: '排隊', image: '🧍' },
          { word: '跑步', image: '🏃' },
          { word: '拍手', image: '👏' },
        ],
      },
      {
        level: 3,
        levelLabel: '情景',
        prompt: '他們在做什麼？',
        items: [{ word: '陪婆婆跑步', image: '🏃' }],
      },
    ],
  },
  {
    phoneme: '/m/',
    label: '媽媽音',
    levels: [
      {
        level: 1,
        levelLabel: '單字',
        prompt: '這是什麼？',
        items: [
          { word: '貓', image: '🐱' },
          { word: '馬', image: '🐴' },
          { word: '摸', image: '🤚' },
          { word: '門', image: '🚪' },
          { word: '面', image: '😊' },
        ],
      },
      {
        level: 2,
        levelLabel: '詞組',
        prompt: '請聽這個詞語',
        items: [
          { word: '妹妹', image: '👧' },
          { word: '馬騮', image: '🐒' },
          { word: '眉毛', image: '🤨' },
          { word: '麵包', image: '🍞' },
          { word: '門口', image: '🚪' },
        ],
      },
      {
        level: 3,
        levelLabel: '情景',
        prompt: '他們在做什麼？',
        items: [{ word: '媽媽開門', image: '🚪' }],
      },
    ],
  },
];

// ── Station 3: 貝殼分類大賽 ──
export type Station3ShellKey = "b" | "p" | "m";

export interface Station3Item {
  word: string;
  /** 系統讀出提示，例如：婆 po4 */
  displayPrompt: string;
  image: string;
  shell: Station3ShellKey;
}

export const station3Items: Station3Item[] = [
  { word: "波", displayPrompt: "波，爸爸音", image: "⚽", shell: "b" },
  { word: "婆", displayPrompt: "婆，婆婆音", image: "👵", shell: "p" },
  { word: "媽", displayPrompt: "媽，媽媽音", image: "👩", shell: "m" },
  { word: "怕", displayPrompt: "怕，婆婆音", image: "😨", shell: "p" },
  { word: "貓", displayPrompt: "貓，媽媽音", image: "🐱", shell: "m" },
  { word: "包", displayPrompt: "包，爸爸音", image: "🍞", shell: "b" },
  { word: "跑", displayPrompt: "跑，婆婆音", image: "🏃", shell: "p" },
  { word: "門", displayPrompt: "門，媽媽音", image: "🚪", shell: "m" },
  { word: "餅", displayPrompt: "餅，爸爸音", image: "🍪", shell: "b" },
];

// Get total exercise count for progress tracking
export function getTotalBilabialExercises(): number {
  return station2Phonemes.reduce(
    (total, p) => total + p.levels.reduce((lt, l) => lt + l.items.length, 0),
    0
  );
}
