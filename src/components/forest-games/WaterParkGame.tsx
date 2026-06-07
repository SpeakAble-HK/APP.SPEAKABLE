import { useEffect, useRef } from "react";
import { Volume2 } from "lucide-react";
import { useSpeechTherapyGame } from "./useSpeechTherapyGame";
import type { GameResult } from "./ForestGameTypes";
import { ForestSceneBackdrop } from "./ForestSceneBackdrop";

interface Props {
  settings: any;
  onComplete: (r: GameResult) => void;
  onClose: () => void;
}

const BUBBLE_COLORS = [
  ["#38bdf8", "#0ea5e9"],
  ["#818cf8", "#6366f1"],
  ["#34d399", "#10b981"],
  ["#f472b6", "#ec4899"],
  ["#fbbf24", "#f59e0b"],
  ["#fb923c", "#f97316"],
  ["#a78bfa", "#8b5cf6"],
  ["#22d3ee", "#06b6d4"],
];

export default function WaterParkGame({ settings, onComplete, onClose }: Props) {
  const difficulty = typeof settings.flowSpeed === "number" ? settings.flowSpeed : 0.7;
  const game = useSpeechTherapyGame("water-park", difficulty);
  const completedRef = useRef(false);

  useEffect(() => {
    if (game.phase === "result" && !completedRef.current) {
      completedRef.current = true;
      onComplete({ score: game.score, total: game.totalChallenges, elapsedMs: game.elapsedMs, won: game.earnedBadge });
    }
  }, [game.phase, game.score, game.totalChallenges, game.elapsedMs, game.earnedBadge, onComplete]);

  if (game.phase === "start") {
    return (
      <ForestSceneBackdrop gameId="water-park">
        <div className="h-full flex flex-col items-center justify-center gap-3 p-5 text-center">
          <div className="text-5xl mb-1">🫧</div>
          <p className="text-white text-xl font-bold m-0">{game.task.title}</p>
          <p className="text-[#bae6fd] text-xs m-0 max-w-[360px] leading-relaxed">{game.task.story}</p>
          <p className="text-[#7dd3fc] text-xs m-0">🎯 {game.task.targetPhoneme}</p>
          <button onClick={game.startGame} className="mt-2 px-10 py-2.5 rounded-xl border-none bg-[#38bdf8] text-white text-base font-semibold cursor-pointer shadow-[0_4px_16px_rgba(56,189,248,0.4)]">開始遊戲</button>
        </div>
      </ForestSceneBackdrop>
    );
  }

  if (game.phase === "result") {
    const pct = game.score / Math.max(game.totalChallenges, 1);
    return (
      <ForestSceneBackdrop gameId="water-park">
        <div className="h-full flex flex-col items-center justify-center gap-2 p-5 text-center">
          <div className="text-5xl">{pct >= 0.8 ? "🎉" : pct >= 0.5 ? "👍" : "💪"}</div>
          <p className="text-white text-xl font-bold m-0">{pct >= 0.8 ? "做得好！" : pct >= 0.5 ? "唔錯！" : "繼續努力！"}</p>
          <p className="text-[#bae6fd] text-sm m-0">⭐ {game.score}/{game.totalChallenges}</p>
          {game.earnedBadge && (
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 rounded-full text-xs font-bold text-slate-800 mt-1">
              🏅 獲得「{game.task.badge}」徽章！
            </div>
          )}
          <div className="flex gap-2.5 mt-2">
            <button onClick={() => { completedRef.current = false; game.startGame(); }} className="px-6 py-2 rounded-lg border-none bg-[#38bdf8] text-white text-sm font-semibold cursor-pointer">再玩一次</button>
            <button onClick={onClose} className="px-6 py-2 rounded-lg border border-white/30 bg-transparent text-white text-sm cursor-pointer">返回</button>
          </div>
        </div>
      </ForestSceneBackdrop>
    );
  }

  const optCount = game.currentChallenge.options.length;

  return (
    <ForestSceneBackdrop gameId="water-park">
      <div className="relative h-full select-none">
        <div className="absolute top-2 left-3 right-3 flex justify-between z-10 text-xs text-white font-semibold drop-shadow-md">
          <span>⭐ {game.score}</span>
          <span>{game.currentIndex + 1}/{game.totalChallenges}</span>
          <span>💪 {game.streak > 0 ? `x${game.streak}` : ""}</span>
        </div>

        <div className="flex flex-col items-center justify-center h-full gap-4 px-4 pt-10 pb-5 relative z-5">
          <div onClick={game.replayAudio} className="flex items-center gap-1.5 bg-white/20 px-4 py-1.5 rounded-full cursor-pointer text-white text-sm font-medium">
            <Volume2 size={16} /> 聽吓呢個詞
          </div>

          <div className="flex flex-wrap gap-3 justify-center max-w-[320px]">
            {game.currentChallenge.options.map((opt, i) => {
              const isSelected = game.selectedAnswer === i;
              const isCorrectOpt = i === game.currentChallenge.correctIndex;
              let bg = `radial-gradient(circle at 30% 30%, ${BUBBLE_COLORS[i % BUBBLE_COLORS.length][0]}, ${BUBBLE_COLORS[i % BUBBLE_COLORS.length][1]})`;
              let transform = "scale(1)";
              let opacity = 1;
              if (isSelected) {
                if (isCorrectOpt) { bg = "radial-gradient(circle at 30% 30%, #34d399, #059669)"; transform = "scale(1.15)"; }
                else { bg = "radial-gradient(circle at 30% 30%, #f87171, #dc2626)"; opacity = 0.6; }
              } else if (game.selectedAnswer !== null && isCorrectOpt) {
                bg = "radial-gradient(circle at 30% 30%, #34d399, #059669)";
              }
              return (
                <div key={i} onClick={() => game.handleAnswer(i)} style={{
                  width: optCount <= 2 ? 130 : 100,
                  height: optCount <= 2 ? 130 : 100,
                  borderRadius: "50%",
                  background: bg,
                  boxShadow: isSelected && isCorrectOpt
                    ? "0 0 24px rgba(52,211,153,0.6)"
                    : "0 0 12px rgba(255,255,255,0.2), inset 0 -4px 6px rgba(0,0,0,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: optCount <= 2 ? 24 : 20,
                  fontWeight: 700, color: "#fff",
                  cursor: game.selectedAnswer !== null ? "default" : "pointer",
                  transition: "all 0.25s ease",
                  transform, opacity,
                  textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  position: "relative",
                }}>
                  {opt}
                  {isSelected && isCorrectOpt && <span className="absolute text-2xl">✨</span>}
                </div>
              );
            })}
          </div>

          <p className="text-[#7dd3fc] text-xs m-0 text-center">{game.currentChallenge.hint}</p>
        </div>
      </div>
    </ForestSceneBackdrop>
  );
}
