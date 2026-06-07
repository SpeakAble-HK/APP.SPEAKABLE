import { useState, useCallback, useEffect, useRef } from "react";
import type { MiniGameBlueprint, ChallengeItem } from "../types";
import { MaterialIcon } from "@/components/MaterialIcon";

const TONE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#8b5cf6"];
const TONE_LABELS = ["第一聲 高平", "第二聲 高升", "第三聲 中平", "第四聲 低降", "第五聲 低升", "第六聲 低平"];
const TONE_NUMBERS = ["1", "2", "3", "4", "5", "6"];

interface Props {
  blueprint: MiniGameBlueprint;
  onScore: (correct: number, total: number, timing: number[]) => void;
  onExit: () => void;
}

export function ToneWheelGame({ blueprint, onScore, onExit }: Props) {
  const challenges = blueprint.challenges.slice(0, blueprint.mechanic.itemsPerRound);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timings, setTimings] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "spinning" | "choose" | "result" | "done">("idle");
  const [spinAngle, setSpinAngle] = useState(0);
  const [landedTone, setLandedTone] = useState(0);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [roundStart, setRoundStart] = useState(Date.now());
  const startTime = useRef(Date.now());
  const spinTimeout = useRef<ReturnType<typeof setTimeout>>();

  const item: ChallengeItem | undefined = challenges[round];
  const currentRound = round + 1;

  const handleSpin = () => {
    if (phase !== "idle") return;
    setPhase("spinning");
    setRoundStart(Date.now());

    const targetTone = parseInt(item?.correctAnswer ?? "1") - 1;
    const extraSpins = 3 + Math.floor(Math.random() * 3);
    const deg = extraSpins * 360 + (targetTone * 60) + 30 + (Math.random() * 20 - 10);
    setSpinAngle((prev) => prev + deg);

    spinTimeout.current = setTimeout(() => {
      setLandedTone(targetTone);
      setPhase("choose");
    }, 2000);
  };

  useEffect(() => {
    return () => { if (spinTimeout.current) clearTimeout(spinTimeout.current); };
  }, []);

  const handleSelect = (tone: string) => {
    if (phase !== "choose") return;
    setSelectedTone(tone);
    setTimings((prev) => [...prev, Date.now() - roundStart]);
    const isCorrect = tone === item?.correctAnswer;
    if (isCorrect) setCorrect((c) => c + 1);
    setPhase("result");

    setTimeout(() => {
      if (currentRound >= challenges.length) {
        setPhase("done");
      } else {
        setRound((r) => r + 1);
        setSelectedTone(null);
        setPhase("idle");
      }
    }, 1200);
  };

  useEffect(() => {
    if (phase === "done") {
      onScore(correct, challenges.length, timings);
    }
  }, [phase]);

  if (phase === "done") {
    const pct = challenges.length > 0 ? Math.round((correct / challenges.length) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <MaterialIcon icon="emoji_events" filled className="text-5xl text-amber-500" />
        <p className="font-headline text-2xl font-extrabold text-on-surface">
          {pct >= blueprint.mechanic.passThreshold ? "聲調大師！" : "再試一次！"}
        </p>
        <p className="text-on-surface-variant">{correct} / {challenges.length} 正確 ({pct}%)</p>
        <button onClick={onExit} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-xl font-bold">完成</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full p-4">
      <div className="flex items-center justify-between w-full mb-4">
        <button onClick={onExit} className="p-2 rounded-lg hover:bg-surface-container-low">
          <MaterialIcon icon="close" className="text-xl" />
        </button>
        <span className="text-sm font-bold text-on-surface-variant">{currentRound} / {challenges.length}</span>
        <span className="font-mono font-bold text-sm">{blueprint.mechanic.timeLimitSec}s</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {phase === "idle" && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-56 h-56">
              <div
                className="w-full h-full rounded-full overflow-hidden shadow-xl transition-transform duration-[2000ms] ease-out"
                style={{ transform: `rotate(${spinAngle}deg)` }}
              >
                {TONE_COLORS.map((color, i) => (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 w-[50%] h-[50%] origin-bottom-left"
                    style={{
                      backgroundColor: color,
                      transform: `rotate(${i * 60}deg) skewY(-30deg)`,
                      clipPath: "polygon(0 0, 100% 0, 0 100%)",
                    }}
                  >
                    <span
                      className="absolute text-white font-bold text-lg"
                      style={{
                        left: "60%",
                        top: "30%",
                        transform: `rotate(${60 - i * 60}deg)`,
                      }}
                    >
                      {TONE_NUMBERS[i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center z-10">
                <span className="font-headline font-extrabold text-primary">♪</span>
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-primary z-10" />
            </div>
            <button
              onClick={handleSpin}
              className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold text-lg shadow-lg"
            >
              <MaterialIcon icon="casino" className="text-2xl" />
              轉動輪盤
            </button>
            <p className="text-sm text-on-surface-variant">轉動輪盤，選出正確的聲調</p>
          </div>
        )}

        {phase === "spinning" && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-56 h-56">
              <div
                className="w-full h-full rounded-full overflow-hidden shadow-xl"
                style={{ transform: `rotate(${spinAngle}deg)`, transition: "transform 2s cubic-bezier(0.17, 0.67, 0.12, 0.99)" }}
              >
                {TONE_COLORS.map((color, i) => (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 w-[50%] h-[50%] origin-bottom-left"
                    style={{
                      backgroundColor: color,
                      transform: `rotate(${i * 60}deg) skewY(-30deg)`,
                      clipPath: "polygon(0 0, 100% 0, 0 100%)",
                    }}
                  />
                ))}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center z-10">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-primary z-10" />
            </div>
            <p className="text-primary font-bold animate-pulse">轉動中...</p>
          </div>
        )}

        {phase === "choose" && item && (
          <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            <div className="text-center">
              <p className="text-xs text-on-surface-variant mb-1">輪盤停在</p>
              <span
                className="inline-block px-4 py-2 rounded-full text-white font-bold"
                style={{ backgroundColor: TONE_COLORS[landedTone] }}
              >
                第 {TONE_NUMBERS[landedTone]} 聲
              </span>
            </div>

            <div className="text-center">
              <p className="font-headline text-3xl font-extrabold text-on-surface">{item.text}</p>
              <p className="text-sm text-on-surface-variant font-mono">{item.jyutping}</p>
            </div>

            <p className="text-sm font-bold text-on-surface-variant">這個字是第幾聲？</p>
            <div className="grid grid-cols-3 gap-3 w-full">
              {item.options.map((opt) => {
                const idx = parseInt(opt) - 1;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className="py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-card"
                    style={{ backgroundColor: TONE_COLORS[idx] || "#ccc", color: "#fff" }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {phase === "result" && item && selectedTone && (
          <div className="flex flex-col items-center gap-4">
            <MaterialIcon
              icon={selectedTone === item.correctAnswer ? "check_circle" : "cancel"}
              filled
              className={`text-6xl ${selectedTone === item.correctAnswer ? "text-green-500" : "text-red-500"}`}
            />
            <p className="text-lg font-bold">
              {selectedTone === item.correctAnswer ? "正確！" : `正確答案是 ${item.correctAnswer} 聲`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
