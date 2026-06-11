import { useCallback, useMemo, useRef, useState } from "react";
import { useGameTelemetry } from "@/lib/minigame-sdk/telemetry";
import type { PhonemeTarget } from "@/lib/minigame-sdk/types";

interface GameConfig {
  level: number;
  targetPhonemeCount: number;
  distractorCount: number;
  contextComplexity: string;
}

interface GameSession {
  sessionId: string;
  learnerId: string;
  gameId: string;
}

interface ToneMatchGameProps {
  config: GameConfig;
  session: GameSession;
  onComplete: (result: unknown) => void;
}

// Cantonese tone-matching drill: a target tone is shown and the learner taps
// the matching tone contour. Attempts are recorded via useGameTelemetry.
const TONES = [
  { symbol: "1 ˥", name: "high level" },
  { symbol: "2 ˧˥", name: "high rising" },
  { symbol: "3 ˧", name: "mid level" },
  { symbol: "4 ˨˩", name: "low falling" },
  { symbol: "5 ˩˧", name: "low rising" },
  { symbol: "6 ˨", name: "low level" },
];

const ROUNDS = 6;

function pickRound(distractorCount: number) {
  const shuffled = [...TONES].sort(() => Math.random() - 0.5);
  const target = shuffled[0];
  const options = shuffled
    .slice(0, Math.min(distractorCount + 1, TONES.length))
    .sort(() => Math.random() - 0.5);
  return { target, options };
}

export function ToneMatchGame({ config, onComplete }: ToneMatchGameProps) {
  const { trackAttempt, finalizeSession, flush } = useGameTelemetry(
    "tone-match",
    `session-${Date.now()}`,
    "",
  );

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const shownAt = useRef(Date.now());
  const current = useMemo(
    () => pickRound(config.distractorCount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, config.distractorCount],
  );

  const handlePick = useCallback(
    (pickedSymbol: string) => {
      const latency = Date.now() - shownAt.current;
      const success = pickedSymbol === current.target.symbol;
      const target: PhonemeTarget = {
        symbol: current.target.symbol,
        ipa: current.target.name,
        position: "initial",
      };
      trackAttempt(target, latency, success, success ? 0.9 : 0.3);
      if (success) setScore((s) => s + 1);

      if (round + 1 >= ROUNDS) {
        setDone(true);
        const result = finalizeSession();
        void flush();
        onComplete(result);
      } else {
        setRound((r) => r + 1);
        shownAt.current = Date.now();
      }
    },
    [current.target, round, trackAttempt, finalizeSession, flush, onComplete],
  );

  if (done) {
    return (
      <div className="text-center space-y-3 py-12">
        <div className="text-5xl font-bold text-primary">
          {score} / {ROUNDS}
        </div>
        <p className="text-on-surface-variant">完成！Great ear for tones.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <p className="text-sm text-on-surface-variant">
          Round {round + 1} / {ROUNDS} · Level {config.level}
        </p>
        <p className="text-lg">Match the tone</p>
        <div className="text-5xl font-bold text-primary" aria-live="polite">
          {current.target.symbol}
        </div>
        <p className="text-on-surface-variant">{current.target.name}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {current.options.map((opt) => (
          <button
            key={opt.symbol}
            onClick={() => handlePick(opt.symbol)}
            className="rounded-2xl border border-outline-variant/30 bg-surface-container-high/40 py-8 text-2xl font-bold hover:scale-105 active:scale-95 transition-transform"
          >
            {opt.symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
