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

const ROOM_COLORS = ["#818cf8", "#34d399", "#f472b6", "#fbbf24", "#38bdf8", "#fb923c", "#a78bfa", "#22d3ee"];

export default function MazeGame({ settings, onComplete, onClose }: Props) {
  const difficulty = typeof settings.complexity === "number" ? settings.complexity : 0.7;
  const game = useSpeechTherapyGame("maze", difficulty);
  const completedRef = useRef(false);

  useEffect(() => {
    if (game.phase === "result" && !completedRef.current) {
      completedRef.current = true;
      onComplete({ score: game.score, total: game.totalChallenges, elapsedMs: game.elapsedMs, won: game.earnedBadge, answerLog: game.answerLog });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.phase, game.score, game.totalChallenges, game.elapsedMs, game.earnedBadge, onComplete]);

  if (game.phase === "start") {
    return (
      <ForestSceneBackdrop gameId="maze">
        <div className="h-full flex flex-col items-center justify-center gap-3 p-5 text-center">
          <div className="text-5xl mb-1">🏛️</div>
          <p className="text-white text-xl font-bold m-0">{game.task.title}</p>
          <p className="text-[#c4b5fd] text-xs m-0 max-w-[360px] leading-relaxed">{game.task.story}</p>
          <p className="text-[#a78bfa] text-xs m-0">🎯 {game.task.targetPhoneme}</p>
          <button onClick={game.startGame} className="mt-2 px-10 py-2.5 rounded-xl border-none bg-[#818cf8] text-white text-base font-semibold cursor-pointer shadow-[0_4px_16px_rgba(129,140,248,0.4)]">開始遊戲</button>
        </div>
      </ForestSceneBackdrop>
    );
  }

  if (game.phase === "result") {
    const pct = game.score / Math.max(game.totalChallenges, 1);
    return (
      <ForestSceneBackdrop gameId="maze">
        <div className="h-full flex flex-col items-center justify-center gap-2 p-5 text-center">
          <div className="text-5xl">{pct >= 0.8 ? "🎉" : pct >= 0.5 ? "👍" : "💪"}</div>
          <p className="text-white text-xl font-bold m-0">{pct >= 0.8 ? "全部回家啦！" : pct >= 0.5 ? "繼續努力！" : "再試一次！"}</p>
          <p className="text-[#c4b5fd] text-sm m-0">⭐ {game.score}/{game.totalChallenges}</p>
          {game.earnedBadge && (
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 rounded-full text-xs font-bold text-slate-800 mt-1">
              🏅 獲得「{game.task.badge}」徽章！
            </div>
          )}
          <div className="flex gap-2.5 mt-2">
            <button onClick={() => { completedRef.current = false; game.startGame(); }} className="px-6 py-2 rounded-lg border-none bg-[#818cf8] text-white text-sm font-semibold cursor-pointer">再玩一次</button>
            <button onClick={onClose} className="px-6 py-2 rounded-lg border border-white/30 bg-transparent text-white text-sm cursor-pointer">返回</button>
          </div>
        </div>
      </ForestSceneBackdrop>
    );
  }

  const optCount = game.currentChallenge.options.length;

  return (
    <ForestSceneBackdrop gameId="maze">
      <div className="relative h-full select-none">
        <div className="absolute top-2 left-3 right-3 flex justify-between z-10 text-xs text-white font-semibold drop-shadow-md">
          <span>⭐ {game.score}</span>
          <span>{game.currentIndex + 1}/{game.totalChallenges}</span>
          <span>💪 {game.streak > 0 ? `x${game.streak}` : ""}</span>
        </div>
        {game.audioUnavailable && (
          <div className="absolute top-8 left-3 right-3 z-10 rounded-md bg-amber-500/90 px-2 py-1 text-center text-[10px] font-semibold text-white">
            ⚠️ 此裝置未安裝粵語語音，請睇字或叫大人示範讀音
          </div>
        )}

        <div className="flex flex-col items-center justify-center h-full gap-3.5 px-4 pt-9 pb-5 relative z-5">
          <div onClick={game.replayAudio} className="flex items-center gap-1.5 bg-white/20 px-3.5 py-1.5 rounded-full cursor-pointer text-[#e0e7ff] text-xs font-medium">
            <Volume2 size={16} /> 聽聽佢嘅聲音
          </div>

          <div className="grid gap-2.5 w-full max-w-[300px]" style={{ gridTemplateColumns: `repeat(${Math.min(optCount, 2)}, 1fr)` }}>
            {game.currentChallenge.options.map((opt, i) => {
              const isSelected = game.selectedAnswer === i;
              const isCorrectOpt = i === game.currentChallenge.correctIndex;
              let bg = ROOM_COLORS[i % ROOM_COLORS.length];
              let borderColor = "rgba(255,255,255,0.15)";
              let boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
              if (isSelected) {
                if (isCorrectOpt) { bg = "#059669"; borderColor = "#34d399"; boxShadow = "0 0 20px rgba(52,211,153,0.5)"; }
                else { bg = "#991b1b"; borderColor = "#f87171"; boxShadow = "0 0 12px rgba(248,113,113,0.3)"; }
              } else if (game.selectedAnswer !== null && isCorrectOpt) {
                bg = "#059669"; borderColor = "#34d399"; boxShadow = "0 0 20px rgba(52,211,153,0.5)";
              }
              return (
                <div key={i} onClick={() => game.handleAnswer(i)} style={{
                  padding: "20px 12px",
                  borderRadius: 12,
                  background: bg,
                  border: `2px solid ${borderColor}`,
                  boxShadow,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: optCount <= 2 ? 22 : 18,
                  fontWeight: 700, color: "#fff",
                  cursor: game.selectedAnswer !== null ? "default" : "pointer",
                  transition: "all 0.25s ease",
                  minHeight: 80,
                  textAlign: "center",
                  position: "relative",
                }}>
                  <div style={{ position: "absolute", top: 6, left: 8, fontSize: 10, opacity: 0.5 }}>🚪 {i + 1}</div>
                  {opt}
                  {isSelected && isCorrectOpt && <span style={{ position: "absolute", fontSize: 20, right: 8, top: 6 }}>✨</span>}
                </div>
              );
            })}
          </div>

          <p className="text-[#a78bfa] text-xs m-0 text-center">{game.currentChallenge.hint}</p>
        </div>
      </div>
    </ForestSceneBackdrop>
  );
}
