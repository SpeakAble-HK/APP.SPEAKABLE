import { useState, useEffect, useRef } from "react";
import type { MiniGameBlueprint } from "../types";
import { MaterialIcon } from "@/shared/components/MaterialIcon";

interface DashItem {
  id: number;
  text: string;
  isTarget: boolean;
  x: number;
}

interface Props {
  blueprint: MiniGameBlueprint;
  onScore: (correct: number, total: number, timing: number[]) => void;
  onExit: () => void;
}

export function MinimalPairDashGame({ blueprint, onScore, onExit }: Props) {
  const challenges = blueprint.challenges.slice(0, Math.min(blueprint.mechanic.itemsPerRound, 10));
  const [dashItems, setDashItems] = useState<DashItem[]>([]);
  const [score, setScore] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [timeLeft, setTimeLeft] = useState(blueprint.mechanic.timeLimitSec);
  const [phase, setPhase] = useState<"play" | "done">("play");
  const [feedback, setFeedback] = useState<{ type: "hit" | "miss" | "wrong"; text: string } | null>(null);
  const [combo, setCombo] = useState(0);
  const startTime = useRef(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const spawnRef = useRef<ReturnType<typeof setInterval>>();
  const idCounter = useRef(0);
  const totalTargets = useRef(0);

  useEffect(() => {
    if (phase !== "play") return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  useEffect(() => {
    if (phase !== "play") return;
    spawnRef.current = setInterval(() => {
      setDashItems((prev) => {
        const existing = prev.filter((d) => d.x > -20);
        if (existing.length >= 6) return existing;

        const item = challenges[Math.floor(Math.random() * challenges.length)];
        const isTarget = Math.random() > 0.4;
        if (isTarget) totalTargets.current += 1;

        return [
          ...existing,
          { id: idCounter.current++, text: item.text, isTarget, x: 110 },
        ];
      });
    }, 1500);
    return () => { if (spawnRef.current) clearInterval(spawnRef.current); };
  }, [phase, challenges]);

  useEffect(() => {
    if (phase !== "play") return;
    const anim = setInterval(() => {
      setDashItems((prev) => {
        const next = prev
          .map((d) => ({ ...d, x: d.x - 2.5 }))
          .filter((d) => d.x > -20);
        return next;
      });
    }, 100);
    return () => clearInterval(anim);
  }, [phase]);

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 600);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const handleTap = (item: DashItem) => {
    setDashItems((prev) => prev.filter((d) => d.id !== item.id));
    if (item.isTarget) {
      const bonus = combo >= 3 ? 2 : 1;
      setScore((s) => s + bonus);
      setCombo((c) => c + 1);
      setFeedback({ type: "hit", text: `+${bonus}` });
    } else {
      setPenalty((p) => p + 1);
      setCombo(0);
      setFeedback({ type: "wrong", text: "-1" });
    }
  };

  useEffect(() => {
    if (phase === "done") {
      const correctTargets = score;
      const total = totalTargets.current + penalty;
      onScore(correctTargets, total || 1, [Date.now() - startTime.current]);
    }
  }, [phase]);

  if (phase === "done") {
    const total = score + penalty;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <MaterialIcon icon="directions_run" filled className={`text-5xl ${pct >= blueprint.mechanic.passThreshold ? "text-amber-500" : "text-on-surface-variant"}`} />
        <p className="font-headline text-2xl font-extrabold text-on-surface">
          {pct >= blueprint.mechanic.passThreshold ? "反應敏捷！" : "再試一次！"}
        </p>
        <p className="text-on-surface-variant">
          得分 {score} | 失誤 {penalty} | 準確率 {pct}%
        </p>
        <button onClick={onExit} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-xl font-bold">完成</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-2">
        <button onClick={onExit} className="p-2 rounded-lg hover:bg-surface-container-low">
          <MaterialIcon icon="close" className="text-xl" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-on-surface-variant">
            得分 <span className="text-amber-600">{score}</span>
          </span>
          {combo >= 3 && (
            <span className="text-xs font-bold text-orange-500 animate-bounce">
              {combo}連擊!
            </span>
          )}
          <span className={`font-mono font-bold text-sm ${timeLeft <= 10 ? "text-red-500" : "text-on-surface-variant"}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <MaterialIcon icon="my_location" className="text-primary text-sm" />
        <span className="text-xs font-bold text-primary">
          點擊含有目標聲韻的字
        </span>
      </div>

      <div className="flex-1 relative overflow-hidden rounded-xl bg-gradient-to-b from-primary/5 to-surface-container-low">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[80px] text-primary/5 font-extrabold select-none pointer-events-none">
          {blueprint.challenges[0]?.correctAnswer || ""}
        </div>

        {dashItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTap(item)}
            className="absolute top-1/2 -translate-y-1/2 px-4 py-3 rounded-xl bg-white shadow-card font-bold text-lg transition-all hover:scale-110 active:scale-95 border border-surface-container-high"
            style={{
              left: `${item.x}%`,
              transform: `translateY(-50%)`,
              transition: "left 0.1s linear",
            }}
          >
            {item.text}
          </button>
        ))}

        {dashItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-on-surface-variant">準備中...</p>
          </div>
        )}

        {feedback && (
          <div
            className={`absolute top-1/4 left-1/2 -translate-x-1/2 font-extrabold text-3xl pointer-events-none animate-bounce ${
              feedback.type === "hit" ? "text-green-500" : feedback.type === "wrong" ? "text-red-500" : "text-amber-500"
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-3">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < combo ? "bg-amber-400" : "bg-surface-container-high"}`}
            />
          ))}
        </div>
        {combo >= 3 && (
          <span className="text-xs text-orange-500 font-bold">{combo}連擊!</span>
        )}
      </div>
    </div>
  );
}
