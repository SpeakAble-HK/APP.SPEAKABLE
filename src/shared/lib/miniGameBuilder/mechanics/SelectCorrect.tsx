import { useState, useCallback, useEffect } from "react";
import type { MiniGameBlueprint, ChallengeItem } from "../types";
import { MaterialIcon } from "@/shared/components/MaterialIcon";

interface Props {
  blueprint: MiniGameBlueprint;
  onScore: (correct: number, total: number, timing: number[]) => void;
  onExit: () => void;
}

export function SelectCorrectGame({ blueprint, onScore, onExit }: Props) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timings, setTimings] = useState<number[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<"choose" | "result" | "done">("choose");
  const [startTime] = useState(Date.now());
  const [roundStart, setRoundStart] = useState(Date.now());

  const challenges = blueprint.challenges.slice(0, blueprint.mechanic.itemsPerRound * blueprint.mechanic.roundsPerGame);
  const item: ChallengeItem | undefined = challenges[round];

  const handleSelect = useCallback((answer: string) => {
    if (phase !== "choose") return;
    setSelected(answer);
    setTimings((prev) => [...prev, Date.now() - roundStart]);
    const isCorrect = answer === item?.correctAnswer;
    if (isCorrect) setCorrect((c) => c + 1);
    setPhase("result");
    setTimeout(() => {
      if (round + 1 >= challenges.length) {
        setPhase("done");
      } else {
        setRound((r) => r + 1);
        setSelected(null);
        setPhase("choose");
        setRoundStart(Date.now());
      }
    }, blueprint.rewards.onCorrect === "sparkle" ? 1200 : 800);
  }, [phase, item, round, challenges.length, roundStart, blueprint.rewards.onCorrect]);

  useEffect(() => {
    if (phase === "done") {
      const totalMs = Date.now() - startTime;
      onScore(correct, challenges.length, timings);
    }
  }, [phase]);

  if (phase === "done") {
    const pct = challenges.length > 0 ? Math.round((correct / challenges.length) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <MaterialIcon icon="emoji_events" filled className="text-5xl text-amber-500" />
        <p className="font-headline text-2xl font-extrabold text-on-surface">
          {pct >= blueprint.mechanic.passThreshold ? "過關！" : "再試一次！"}
        </p>
        <p className="text-on-surface-variant">
          {correct} / {challenges.length} 正確 ({pct}%)
        </p>
        <button onClick={onExit} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-xl font-bold">
          完成
        </button>
      </div>
    );
  }

  if (!item) return null;

  const defaultBg = "#ffffff";
  const defaultRing = blueprint.ui.primaryColor;

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onExit} className="p-2 rounded-lg hover:bg-surface-container-low">
          <MaterialIcon icon="close" className="text-xl" />
        </button>
        <span className="text-sm font-bold text-on-surface-variant">
          {round + 1} / {challenges.length}
        </span>
        {blueprint.mechanic.showTimer && (
          <span className="font-mono font-bold text-sm">{blueprint.mechanic.timeLimitSec}s</span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <p className="font-headline text-3xl font-extrabold text-on-surface">{item.text}</p>
        {blueprint.ui.showJyutping && (
          <p className="text-sm text-on-surface-variant font-mono">{item.jyutping}</p>
        )}

        <div className={`grid ${item.options.length <= 3 ? "grid-cols-3" : "grid-cols-2"} gap-3 w-full max-w-md`}>
          {item.options.map((opt) => {
            const isSelected = selected === opt;
            const isCorrect = opt === item.correctAnswer;
            let bg = defaultBg;
            let ringColor = "transparent";
            if (isSelected) {
              if (phase === "result") {
                bg = isCorrect ? "#f0fdf4" : "#fef2f2";
                ringColor = isCorrect ? "#4ade80" : "#f87171";
              } else {
                ringColor = defaultRing;
              }
            }
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                disabled={phase === "result"}
                className="rounded-xl p-4 shadow-card text-center font-bold transition-all hover:scale-[1.03] active:scale-95 disabled:cursor-default"
                style={{ backgroundColor: bg, boxShadow: ringColor !== "transparent" ? `inset 0 0 0 2px ${ringColor}` : undefined }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
