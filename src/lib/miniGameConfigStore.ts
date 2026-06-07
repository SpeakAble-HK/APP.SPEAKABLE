const STORAGE_PREFIX = "speakable-minigame-config-";

export type Difficulty = "basic" | "intermediate" | "challenge";

export interface GamePerStudentConfig {
  enabled: boolean;
  difficulty: Difficulty;
}

export type GameId = "game-tone" | "game-mouth" | "game-rhythm" | "water-park" | "maze" | "fruit-ninja" | "catch-fly";

export interface MiniGameConfig {
  quizGames: {
    "game-tone": GamePerStudentConfig;
    "game-mouth": GamePerStudentConfig;
    "game-rhythm": GamePerStudentConfig;
  };
  adaptationGames: {
    "water-park": GamePerStudentConfig;
    "maze": GamePerStudentConfig;
    "fruit-ninja": GamePerStudentConfig;
    "catch-fly": GamePerStudentConfig;
  };
  phonemeFocus: {
    initials: boolean;
    finals: boolean;
    tones: boolean;
  };
}

const DEFAULT_CONFIG: MiniGameConfig = {
  quizGames: {
    "game-tone": { enabled: true, difficulty: "intermediate" },
    "game-mouth": { enabled: true, difficulty: "intermediate" },
    "game-rhythm": { enabled: true, difficulty: "intermediate" },
  },
  adaptationGames: {
    "water-park": { enabled: true, difficulty: "intermediate" },
    "maze": { enabled: true, difficulty: "intermediate" },
    "fruit-ninja": { enabled: true, difficulty: "intermediate" },
    "catch-fly": { enabled: true, difficulty: "intermediate" },
  },
  phonemeFocus: {
    initials: true,
    finals: true,
    tones: true,
  },
};

function storageKey(studentId: string): string {
  return `${STORAGE_PREFIX}${studentId}`;
}

export function getMiniGameConfig(studentId: string): MiniGameConfig {
  try {
    const raw = localStorage.getItem(storageKey(studentId));
    if (!raw) return cloneDefault();
    return JSON.parse(raw) as MiniGameConfig;
  } catch {
    return cloneDefault();
  }
}

export function setMiniGameConfig(studentId: string, config: MiniGameConfig): void {
  try {
    localStorage.setItem(storageKey(studentId), JSON.stringify(config));
  } catch {
    // ignore storage errors
  }
}

function cloneDefault(): MiniGameConfig {
  return {
    quizGames: { ...DEFAULT_CONFIG.quizGames },
    adaptationGames: { ...DEFAULT_CONFIG.adaptationGames },
    phonemeFocus: { ...DEFAULT_CONFIG.phonemeFocus },
  };
}

export const GAME_LABELS: Record<string, string> = {
  "game-tone": "聲調快拍",
  "game-mouth": "口型對對碰",
  "game-rhythm": "節奏跟讀賽",
  "water-park": "聲母精靈歸位戰",
  "maze": "韻尾寶寶回家路",
  "fruit-ninja": "圓唇音的秘密",
  "catch-fly": "聲調魔法師的考驗",
};

export const GAME_EMOJIS: Record<string, string> = {
  "game-tone": "🎯",
  "game-mouth": "👄",
  "game-rhythm": "🥁",
  "water-park": "🫧",
  "maze": "🏛️",
  "fruit-ninja": "🔮",
  "catch-fly": "🪄",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  basic: "初級",
  intermediate: "中級",
  challenge: "高級",
};

export function isQuizGameEnabled(config: MiniGameConfig | null, gameId: string): boolean {
  if (!config) return true;
  const key = gameId as keyof typeof config.quizGames;
  return config.quizGames[key]?.enabled ?? true;
}

export function isAdaptGameEnabled(config: MiniGameConfig | null, gameId: string): boolean {
  if (!config) return true;
  const key = gameId as keyof typeof config.adaptationGames;
  return config.adaptationGames[key]?.enabled ?? true;
}
