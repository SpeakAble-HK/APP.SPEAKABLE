export type GameId = "water-park" | "maze" | "fruit-ninja" | "catch-fly";

export interface GameResult {
  score: number;
  total: number;
  elapsedMs: number;
  won: boolean;
}

export interface WaterParkSettings {
  flowSpeed: number;
  targetCount: number;
}

export interface MazeSettings {
  complexity: number;
  timeLimitSec: number;
}

export interface FruitNinjaSettings {
  spawnRate: number;
  fruitSpeed: number;
}

export interface CatchFlySettings {
  flySpeed: number;
  flyCount: number;
}

export type GameSettings = WaterParkSettings | MazeSettings | FruitNinjaSettings | CatchFlySettings;

export interface GameProps {
  settings: GameSettings;
  onComplete: (result: GameResult) => void;
  onClose: () => void;
}

export const GAME_NAMES: Record<GameId, string> = {
  "water-park": "聲母精靈歸位戰",
  "maze": "韻尾寶寶回家路",
  "fruit-ninja": "圓唇音的秘密",
  "catch-fly": "聲調魔法師的考驗",
};

export const GAME_DESCRIPTIONS: Record<GameId, string> = {
  "water-park": "聽聲辨字，幫 /n/ 和 /l/ 聲母精靈返回正確位置！",
  "maze": "聆聽韻尾，帶 /ng/ 和 /n/ 韻尾寶寶返屋企！",
  "fruit-ninja": "認清圓唇音 /gw/ 和 /kw/，嘟起嘴巴讀得準！",
  "catch-fly": "辨別粵語六聲，成為聲調魔法師！",
};
