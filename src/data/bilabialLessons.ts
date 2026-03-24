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
    description: '嘴唇用力閉緊，像一個小彈簧，然後輕輕彈開。',
    memoryTrick: 'bangbang槍！',
    memoryEmoji: '🔫',
    commonMistake: '/b/ 發成 /m/',
    mistakeFix: '皮皮提醒小朋友收起牙齒，合上嘴唇',
  },
  {
    phoneme: '/ph/',
    label: '婆婆音',
    familyWord: '婆婆',
    description: '嘴唇閉緊，彈開時噴出一大團火花（強調送氣）。',
    memoryTrick: '吹泡泡',
    memoryEmoji: '🫧',
    commonMistake: '/p/ 發成 /b/',
    mistakeFix: '皮皮提醒小朋友放手指係嘴巴前，感受氣流噴出',
  },
  {
    phoneme: '/m/',
    label: '媽媽音',
    familyWord: '媽媽',
    description: '嘴唇閉著不打開，重點在於鼻子，發出「嗯——」的震動。',
    memoryTrick: 'mmm，皮皮係鼻前面揮手「好臭好臭」',
    memoryEmoji: '🤢',
    commonMistake: '/m/ 氣流從嘴巴出',
    mistakeFix: '皮皮提醒小朋友閉住嘴巴，用鼻子發聲',
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
        prompt: '呢個係咩黎架？',
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
        prompt: '聽下呢個詞語',
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
        prompt: '佢哋係度做緊咩呀？',
        items: [
          { word: '爸爸食漢堡包', image: '🍔' },
          { word: '搭巴士嘟八達通', image: '🚌' },
          { word: '爸爸同伯伯講拜拜', image: '👋' },
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
        prompt: '呢個係咩黎架？',
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
        prompt: '聽下呢個詞語',
        items: [
          { word: '排隊', image: '🧍' },
          { word: '皮膚', image: '🤚' },
          { word: '跑步', image: '🏃' },
          { word: '拍手', image: '👏' },
          { word: '可怕', image: '😱' },
        ],
      },
      {
        level: 3,
        levelLabel: '情景',
        prompt: '佢哋係度做緊咩呀？',
        items: [
          { word: '我平時會陪婆婆去跑步', image: '🏃' },
          { word: '排隊買蘋果批', image: '🍎' },
        ],
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
        prompt: '呢個係咩黎架？',
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
        prompt: '聽下呢個詞語',
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
        prompt: '佢哋係度做緊咩呀？',
        items: [
          { word: '媽媽幫妹妹開門', image: '🚪' },
          { word: '馬騮搶咗妹妹個麵包', image: '🐒' },
        ],
      },
    ],
  },
];

// Get total exercise count for progress tracking
export function getTotalBilabialExercises(): number {
  return station2Phonemes.reduce(
    (total, p) => total + p.levels.reduce((lt, l) => lt + l.items.length, 0),
    0
  );
}
