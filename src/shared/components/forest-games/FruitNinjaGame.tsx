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

const FRUIT_EMOJIS = ["🍎", "🍊", "🍋", "🍉", "🍇", "🍓", "🍑", "🥝"];
const FRUIT_BGS = ["#dc2626", "#f59e0b", "#eab308", "#10b981", "#8b5cf6", "#ec4899", "#fb923c", "#22d3ee"];

export default function FruitNinjaGame({ settings, onComplete, onClose }: Props) {
  const difficulty = typeof settings.spawnRate === "number" ? settings.spawnRate : 0.7;
  const game = useSpeechTherapyGame("fruit-ninja", difficulty);
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
      <ForestSceneBackdrop gameId="fruit-ninja">
        <div className="h-full flex flex-col items-center justify-center gap-3 p-5 text-center">
          <div className="text-5xl mb-1">🔮</div>
          <p className="text-white text-xl font-bold m-0">{game.task.title}</p>
          <p className="text-[#93c5fd] text-xs m-0 max-w-[360px] leading-relaxed">{game.task.story}</p>
          <p className="text-[#60a5fa] text-xs m-0">🎯 {game.task.targetPhoneme}</p>
          <button onClick={game.startGame} className="mt-2 px-10 py-2.5 rounded-xl border-none bg-[#e11d48] text-white text-base font-semibold cursor-pointer shadow-[0_4px_16px_rgba(225,29,72,0.4)]">開始遊戲</button>
        </div>
      </ForestSceneBackdrop>
    );
  }

  if (game.phase === "result") {
    const pct = game.score / Math.max(game.totalChallenges, 1);
    return (
      <ForestSceneBackdrop gameId="fruit-ninja">
        <div className="h-full flex flex-col items-center justify-center gap-2 p-5 text-center">
          <div className="text-5xl">{pct >= 0.8 ? "🎉" : pct >= 0.5 ? "👍" : "💪"}</div>
          <p className="text-white text-xl font-bold m-0">{pct >= 0.8 ? "圓唇音大師！" : pct >= 0.5 ? "唔錯！" : "繼續努力！"}</p>
          <p className="text-[#93c5fd] text-sm m-0">⭐ {game.score}/{game.totalChallenges}</p>
          {game.earnedBadge && (
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 rounded-full text-xs font-bold text-slate-800 mt-1">
              🏅 獲得「{game.task.badge}」徽章！
            </div>
          )}
          <div className="flex gap-2.5 mt-2">
            <button onClick={() => { completedRef.current = false; game.startGame(); }} className="px-6 py-2 rounded-lg border-none bg-[#e11d48] text-white text-sm font-semibold cursor-pointer">再玩一次</button>
            <button onClick={onClose} className="px-6 py-2 rounded-lg border border-white/30 bg-transparent text-white text-sm cursor-pointer">返回</button>
          </div>
        </div>
      </ForestSceneBackdrop>
    );
  }

  const optCount = game.currentChallenge.options.length;

  return (
    <ForestSceneBackdrop gameId="fruit-ninja">
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

        <div className="flex flex-col items-center justify-center h-full gap-4 px-4 pt-9 pb-5 relative z-5">
          <div onClick={game.replayAudio} className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full cursor-pointer text-[#93c5fd] text-xs font-medium">
            <Volume2 size={16} /> 聽吓佢點讀
          </div>

          <div className="grid gap-3 w-full max-w-[300px]" style={{ gridTemplateColumns: `repeat(${Math.min(optCount, 2)}, 1fr)` }}>
            {game.currentChallenge.options.map((opt, i) => {
              const isSelected = game.selectedAnswer === i;
              const isCorrectOpt = i === game.currentChallenge.correctIndex;
              let bg = FRUIT_BGS[i % FRUIT_BGS.length];
              let transform = "translateY(0)";
              let boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
              if (isSelected) {
                if (isCorrectOpt) { bg = "#059669"; transform = "translateY(-6px)"; boxShadow = "0 0 24px rgba(52,211,153,0.5)"; }
                else { bg = "#991b1b"; transform = "translateY(4px)"; boxShadow = "0 0 12px rgba(248,113,113,0.3)"; }
              } else if (game.selectedAnswer !== null && isCorrectOpt) {
                bg = "#059669"; boxShadow = "0 0 24px rgba(52,211,153,0.5)";
              }
              return (
                <div key={i} onClick={() => game.handleAnswer(i)} style={{
                  padding: "16px 12px",
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${bg}, ${bg}dd)`,
                  boxShadow,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                  fontSize: optCount <= 2 ? 20 : 17,
                  fontWeight: 700, color: "#fff",
                  cursor: game.selectedAnswer !== null ? "default" : "pointer",
                  transition: "all 0.25s ease",
                  transform,
                  minHeight: 80,
                  textAlign: "center",
                  position: "relative",
                }}>
                  <span className="text-[28px]">{FRUIT_EMOJIS[i % FRUIT_EMOJIS.length]}</span>
                  {opt}
                  {isSelected && isCorrectOpt && <span style={{ position: "absolute", fontSize: 20, right: 8, top: 4 }}>✨</span>}
                </div>
              );
            })}
          </div>

          <p className="text-[#60a5fa] text-xs m-0 text-center">{game.currentChallenge.hint}</p>
        </div>
      </div>
    </ForestSceneBackdrop>
  );
}
