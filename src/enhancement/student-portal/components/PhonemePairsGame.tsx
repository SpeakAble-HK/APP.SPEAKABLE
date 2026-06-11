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

interface PhonemePairsGameProps {
  config: GameConfig;
  session: GameSession;
  onComplete: (result: unknown) => void;
}

// Minimal-pair discrimination drill: a prompt sound is shown and the learner
// taps the matching token among distractors. Each tap is recorded through
// useGameTelemetry, which flushes to Supabase on completion.
const POOL: PhonemeTarget[] = [
  { symbol: "/b/", ipa: "b", position: "initial" },
  { symbol: "/p/", ipa: "p", position: "initial" },
  { symbol: "/m/", ipa: "m", position: "initial" },
  { symbol: "/n/", ipa: "n", position: "initial" },
  { symbol: "/l/", ipa: "l", position: "initial" },
  { symbol: "/g/", ipa: "g", position: "initial" },
];

const ROUNDS = 6;

function pickRound(distractorCount: number) {
  const shuffled = [...POOL].sort(() => Math.random() - 0.5);
  const target = shuffled[0];
  const options = shuffled.slice(0, Math.min(distractorCount + 1, POOL.length));
  return { target, options: options.sort(() => Math.random() - 0.5) };
}

export function PhonemePairsGame({ config, onComplete }: PhonemePairsGameProps) {
  const { trackAttempt, finalizeSession, flush } = useGameTelemetry(
    "phoneme-pairs",
    `session-${Date.now()}`,
    "",
  );

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const shownAt = useRef(Date.now());
  const current = useMemo(
    () => pickRound(config.distractorCount),
    // re-pick each round
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, config.distractorCount],
  );

  const handlePick = useCallback(
    (picked: PhonemeTarget) => {
      const latency = Date.now() - shownAt.current;
      const success = picked.symbol === current.target.symbol;
      trackAttempt(current.target, latency, success, success ? 0.9 : 0.3);
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
        <p className="text-on-surface-variant">完成！Great listening.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <p className="text-sm text-on-surface-variant">
          Round {round + 1} / {ROUNDS} · Level {config.level}
        </p>
        <p className="text-lg">Tap the sound you hear</p>
        <div className="text-6xl font-bold text-primary" aria-live="polite">
          {current.target.symbol}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {current.options.map((opt) => (
          <button
            key={opt.symbol}
            onClick={() => handlePick(opt)}
            className="rounded-2xl border border-outline-variant/30 bg-surface-container-high/40 py-8 text-3xl font-bold hover:scale-105 active:scale-95 transition-transform"
          >
            {opt.symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
