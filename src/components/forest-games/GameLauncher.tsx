import { useState } from "react";
import { X } from "lucide-react";
import { useAdaptationEngine } from "@/adaptation/useAdaptationEngine";
import { getMiniGameConfig, DIFFICULTY_LABELS } from "@/lib/miniGameConfigStore";
import WaterParkGame from "./WaterParkGame";
import MazeGame from "./MazeGame";
import FruitNinjaGame from "./FruitNinjaGame";
import CatchFlyGame from "./CatchFlyGame";
import {
  GAME_NAMES, GAME_DESCRIPTIONS,
  type GameId, type GameResult, type GameSettings,
} from "./ForestGameTypes";

interface Props {
  gameId: GameId;
  studentId?: string;
  onClose: () => void;
  onComplete?: (gameId: GameId) => void;
}

const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  basic: 0.4,
  intermediate: 0.7,
  challenge: 1.0,
};

export default function GameLauncher({ gameId, studentId, onClose, onComplete }: Props) {
  const [result, setResult] = useState<GameResult | null>(null);
  const { getGameSettings, updateProfile } = useAdaptationEngine();

  const config = studentId ? getMiniGameConfig(studentId) : null;
  const allGames = config ? { ...config.quizGames, ...config.adaptationGames } : null;
  const difficultyKey = allGames?.[gameId as keyof typeof allGames]?.difficulty ?? "intermediate";
  const diffMult = DIFFICULTY_MULTIPLIER[difficultyKey];

  const adaptSettings = getGameSettings(gameId === "water-park" ? "waterPark"
    : gameId === "maze" ? "maze"
    : gameId === "fruit-ninja" ? "fruitNinja"
    : "catchFly");

  const settings: GameSettings = adaptSettings ?? getDefaultSettings(gameId, diffMult);

  const handleComplete = (r: GameResult) => {
    setResult(r);
    updateProfile({
      accuracy: r.score / Math.max(r.total, 1),
      reactionTimeMs: r.elapsedMs / Math.max(r.score, 1),
    });
    onComplete?.(gameId);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      padding: 16,
    }}>
      <div style={{
        background: "#0f172a", borderRadius: 20, maxWidth: 480, width: "100%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderBottom: "1px solid #1e293b",
        }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginRight: 8 }}>
              {GAME_NAMES[gameId]}
            </span>
            <span style={{
              fontSize: 11, color: "#64748b", background: "#1e293b",
              padding: "2px 8px", borderRadius: 6,
            }}>
              {DIFFICULTY_LABELS[difficultyKey]}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 4,
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        {!result && (
          <p style={{
            margin: 0, padding: "8px 16px", fontSize: 12, color: "#64748b",
            borderBottom: "1px solid #1e293b",
          }}>
            {GAME_DESCRIPTIONS[gameId]}
          </p>
        )}

        {/* Game */}
        {gameId === "water-park" && (
          <WaterParkGame
            settings={settings as any}
            onComplete={handleComplete}
            onClose={onClose}
          />
        )}
        {gameId === "maze" && (
          <MazeGame
            settings={settings as any}
            onComplete={handleComplete}
            onClose={onClose}
          />
        )}
        {gameId === "fruit-ninja" && (
          <FruitNinjaGame
            settings={settings as any}
            onComplete={handleComplete}
            onClose={onClose}
          />
        )}
        {gameId === "catch-fly" && (
          <CatchFlyGame
            settings={settings as any}
            onComplete={handleComplete}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

function getDefaultSettings(gameId: GameId, diff: number): GameSettings {
  switch (gameId) {
    case "water-park":
      return { flowSpeed: 0.5 + diff, targetCount: Math.round(5 + diff * 10) };
    case "maze":
      return { complexity: diff, timeLimitSec: Math.round(60 - diff * 20) };
    case "fruit-ninja":
      return { spawnRate: 0.3 + diff * 0.7, fruitSpeed: 0.5 + diff };
    case "catch-fly":
      return { flySpeed: 0.3 + diff * 0.7, flyCount: Math.round(3 + diff * 5) };
  }
}
