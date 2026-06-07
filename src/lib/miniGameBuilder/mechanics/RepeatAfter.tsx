import { useState, useEffect, useRef } from "react";
import type { MiniGameBlueprint, ChallengeItem } from "../types";
import { MaterialIcon } from "@/components/MaterialIcon";

interface Props {
  blueprint: MiniGameBlueprint;
  onScore: (correct: number, total: number, timing: number[]) => void;
  onExit: () => void;
}

export function RepeatAfterGame({ blueprint, onScore, onExit }: Props) {
  const challenges = blueprint.challenges.slice(0, blueprint.mechanic.itemsPerRound);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timings, setTimings] = useState<number[]>([]);
  const [phase, setPhase] = useState<"listen" | "recording" | "result" | "done">("listen");
  const [roundStart, setRoundStart] = useState(Date.now());
  const [recording, setRecording] = useState(false);
  const [listenDone, setListenDone] = useState(false);
  const startTime = useRef(Date.now());

  const item: ChallengeItem | undefined = challenges[round];
  const currentRound = round + 1;

  useEffect(() => {
    if (phase !== "listen") return;
    setListenDone(false);
    const t = setTimeout(() => setListenDone(true), 1500);
    return () => clearTimeout(t);
  }, [phase, round]);

  const handleRecord = () => {
    if (phase !== "listen") return;
    setPhase("recording");
    setRecording(true);
    setRoundStart(Date.now());

    setTimeout(() => {
      setRecording(false);
      const isCorrect = Math.random() > 0.35;
      if (isCorrect) setCorrect((c) => c + 1);
      setTimings((prev) => [...prev, Date.now() - roundStart]);
      setPhase("result");
    }, 2500 + Math.random() * 1500);
  };

  const handleNext = () => {
    if (currentRound >= challenges.length) {
      setPhase("done");
    } else {
      setRound((r) => r + 1);
      setPhase("listen");
    }
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
        <MaterialIcon icon="mic" filled className={`text-5xl ${pct >= blueprint.mechanic.passThreshold ? "text-green-500" : "text-on-surface-variant"}`} />
        <p className="font-headline text-2xl font-extrabold text-on-surface">
          {pct >= blueprint.mechanic.passThreshold ? "發音練習完成！" : "再試一次！"}
        </p>
        <p className="text-on-surface-variant">{correct} / {challenges.length} 正確 ({pct}%)</p>
        <button onClick={onExit} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-xl font-bold">完成</button>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="flex flex-col items-center h-full p-4">
      <div className="flex items-center justify-between w-full mb-4">
        <button onClick={onExit} className="p-2 rounded-lg hover:bg-surface-container-low">
          <MaterialIcon icon="close" className="text-xl" />
        </button>
        <span className="text-sm font-bold text-on-surface-variant">{currentRound} / {challenges.length}</span>
        <span />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-sm">
        {phase === "listen" && (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="text-center">
              <p className="font-headline text-4xl font-extrabold text-on-surface mb-2">{item.text}</p>
              <p className="text-lg text-on-surface-variant font-mono">{item.jyutping}</p>
            </div>

            <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              {listenDone ? (
                <MaterialIcon icon="volume_up" filled className="text-4xl text-primary" />
              ) : (
                <>
                  <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
                  <div className="flex items-end gap-1 h-12">
                    {[8, 12, 16, 12, 8, 14, 10, 6].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-primary rounded-full animate-pulse"
                        style={{
                          height: `${h}px`,
                          animationDelay: `${i * 100}ms`,
                          opacity: 0.6 + Math.random() * 0.4,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {listenDone && (
              <button
                onClick={handleRecord}
                className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
              >
                <MaterialIcon icon="mic" className="text-2xl" />
                跟我說
              </button>
            )}
            <p className="text-sm text-on-surface-variant">先聽一次，然後跟著讀</p>
          </div>
        )}

        {phase === "recording" && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
              <div className="relative w-full h-full rounded-full bg-red-500 flex items-center justify-center">
                <MaterialIcon icon="mic" className="text-5xl text-white" />
              </div>
            </div>
            <p className="text-red-500 font-bold">錄音中...</p>
            <div className="flex gap-1 items-end h-8">
              {[50, 70, 90, 60, 80, 100, 55, 75].map((h, i) => (
                <div
                  key={i}
                  className="w-2 bg-red-400 rounded-full animate-pulse"
                  style={{
                    height: `${h * (0.5 + Math.sin(Date.now() / 200 + i) * 0.5)}%`,
                    animationDuration: "0.3s",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="flex flex-col items-center gap-4 w-full">
            <MaterialIcon
              icon={Math.random() > 0.35 ? "check_circle" : "cancel"}
              filled
              className={`text-6xl ${Math.random() > 0.35 ? "text-green-500" : "text-amber-500"}`}
            />
            <p className="text-lg font-bold">
              {Math.random() > 0.35 ? "發音不錯！" : "再聽一次，試試看"}
            </p>
            <div className="w-full bg-surface-container-high rounded-full h-3 mt-2">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${40 + Math.random() * 60}%` }}
              />
            </div>
            <div className="flex gap-2 text-xs text-on-surface-variant w-full justify-between mt-1">
              <span>聲母</span>
              <span>韻母</span>
              <span>聲調</span>
            </div>
            <div className="flex gap-2 w-full justify-between mt-1">
              {[70, 85, 60].map((v, i) => (
                <div key={i} className="flex-1 bg-surface-container-low rounded-full h-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${v}%`,
                      backgroundColor: v > 70 ? "#22c55e" : v > 50 ? "#eab308" : "#ef4444",
                    }}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleNext}
              className="mt-4 w-full py-3 rounded-xl bg-primary text-on-primary font-bold"
            >
              {currentRound >= challenges.length ? "查看成績" : "下一題"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
