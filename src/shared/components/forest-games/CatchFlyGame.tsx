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

const INSECT_EMOJIS = ["🦋", "🐝", "🪰", "🐞", "🦗", "🦟"];
const TONE_BGS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

export default function CatchFlyGame({ settings, onComplete, onClose }: Props) {
  const difficulty = typeof settings.flySpeed === "number" ? settings.flySpeed : 0.7;
  const game = useSpeechTherapyGame("catch-fly", difficulty);
  const completedRef = useRef(false);

  useEffect(() => {
    if (game.phase === "result" && !completedRef.current) {
      completedRef.current = true;
      onComplete({ score: game.score, total: game.totalChallenges, elapsedMs: game.elapsedMs, won: game.earnedBadge });
    }
  }, [game.phase, game.score, game.totalChallenges, game.elapsedMs, game.earnedBadge, onComplete]);

  if (game.phase === "start") {
    return (
      <ForestSceneBackdrop gameId="catch-fly">
        <div className="h-full flex flex-col items-center justify-center gap-3 p-5 text-center">
          <div className="text-5xl mb-1">🪄</div>
          <p className="text-white text-xl font-bold m-0">{game.task.title}</p>
          <p className="text-[#a3e635] text-xs m-0 max-w-[360px] leading-relaxed">{game.task.story}</p>
          <p className="text-[#84cc16] text-xs m-0">🎯 {game.task.targetPhoneme}</p>
          <button onClick={game.startGame} className="mt-2 px-10 py-2.5 rounded-xl border-none bg-[#65a30d] text-white text-base font-semibold cursor-pointer shadow-[0_4px_16px_rgba(101,163,13,0.4)]">開始遊戲</button>
        </div>
      </ForestSceneBackdrop>
    );
  }

  if (game.phase === "result") {
    const pct = game.score / Math.max(game.totalChallenges, 1);
    return (
      <ForestSceneBackdrop gameId="catch-fly">
        <div className="h-full flex flex-col items-center justify-center gap-2 p-5 text-center">
          <div className="text-5xl">{pct >= 0.8 ? "🎉" : pct >= 0.5 ? "👍" : "💪"}</div>
          <p className="text-white text-xl font-bold m-0">{pct >= 0.8 ? "魔法成功！" : pct >= 0.5 ? "唔錯！" : "繼續努力！"}</p>
          <p className="text-[#a3e635] text-sm m-0">⭐ {game.score}/{game.totalChallenges}</p>
          {game.earnedBadge && (
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 rounded-full text-xs font-bold text-slate-800 mt-1">
              🏅 獲得「{game.task.badge}」徽章！
            </div>
          )}
          <div className="flex gap-2.5 mt-2">
            <button onClick={() => { completedRef.current = false; game.startGame(); }} className="px-6 py-2 rounded-lg border-none bg-[#65a30d] text-white text-sm font-semibold cursor-pointer">再玩一次</button>
            <button onClick={onClose} className="px-6 py-2 rounded-lg border border-white/30 bg-transparent text-white text-sm cursor-pointer">返回</button>
          </div>
        </div>
      </ForestSceneBackdrop>
    );
  }

  const optCount = game.currentChallenge.options.length;

  return (
    <ForestSceneBackdrop gameId="catch-fly">
      <div className="relative h-full select-none">
        <div className="absolute top-2 left-3 right-3 flex justify-between z-10 text-xs text-white font-semibold drop-shadow-md">
          <span>⭐ {game.score}</span>
          <span>{game.currentIndex + 1}/{game.totalChallenges}</span>
          <span>💪 {game.streak > 0 ? `x${game.streak}` : ""}</span>
        </div>

        <div className="flex flex-col items-center justify-center h-full gap-4 px-4 pt-9 pb-5 relative z-5">
          <div onClick={game.replayAudio} className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full cursor-pointer text-[#a3e635] text-xs font-medium">
            <Volume2 size={16} /> 聽吓呢個聲調
          </div>

          <div className="grid gap-2.5 w-full max-w-[300px]" style={{ gridTemplateColumns: `repeat(${Math.min(optCount, 2)}, 1fr)` }}>
            {game.currentChallenge.options.map((opt, i) => {
              const isSelected = game.selectedAnswer === i;
              const isCorrectOpt = i === game.currentChallenge.correctIndex;
              let bg = TONE_BGS[i % TONE_BGS.length];
              let transform = "scale(1) rotate(0deg)";
              if (isSelected) {
                if (isCorrectOpt) { bg = "#059669"; transform = "scale(1.1) rotate(-5deg)"; }
                else { bg = "#991b1b"; transform = "scale(0.9) rotate(5deg)"; }
              } else if (game.selectedAnswer !== null && isCorrectOpt) {
                bg = "#059669"; transform = "scale(1.1) rotate(-5deg)";
              }
              return (
                <div key={i} onClick={() => game.handleAnswer(i)} style={{
                  padding: "14px 10px",
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                  fontSize: optCount <= 2 ? 18 : 15,
                  fontWeight: 700, color: "#fff",
                  cursor: game.selectedAnswer !== null ? "default" : "pointer",
                  transition: "all 0.25s ease",
                  transform,
                  minHeight: 80,
                  textAlign: "center",
                  position: "relative",
                }}>
                  <span className="text-2xl">{INSECT_EMOJIS[i % INSECT_EMOJIS.length]}</span>
                  {opt}
                  {isSelected && isCorrectOpt && <span style={{ position: "absolute", fontSize: 18, right: 6, top: 4 }}>✨</span>}
                </div>
              );
            })}
          </div>

          <p className="text-[#84cc16] text-xs m-0 text-center">{game.currentChallenge.hint}</p>
        </div>
      </div>
    </ForestSceneBackdrop>
  );
}
