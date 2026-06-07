import { useState, useEffect, useMemo, useRef } from "react";
import type { MiniGameBlueprint } from "../types";
import { MaterialIcon } from "@/components/MaterialIcon";

interface CardData {
  id: string;
  text: string;
  jyutping: string;
  pairId: number;
}

interface Props {
  blueprint: MiniGameBlueprint;
  onScore: (correct: number, total: number, timing: number[]) => void;
  onExit: () => void;
}

export function MatchPairGame({ blueprint, onScore, onExit }: Props) {
  const challenges = blueprint.challenges.slice(0, blueprint.mechanic.itemsPerRound);
  const startTime = useRef(Date.now());

  const cards = useMemo(() => {
    const pairs: CardData[] = [];
    challenges.forEach((c, i) => {
      pairs.push({
        id: `a-${i}`,
        text: c.text,
        jyutping: c.jyutping,
        pairId: i,
      });
      pairs.push({
        id: `b-${i}`,
        text: c.options.find((o) => o !== c.correctAnswer) || c.correctAnswer,
        jyutping: "",
        pairId: i,
      });
    });
    return pairs.sort(() => Math.random() - 0.5);
  }, [challenges]);

  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<"play" | "done">("play");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (matched.size === cards.length && cards.length > 0) {
      setTimeout(() => {
        setPhase("done");
        onScore(matched.size / 2, challenges.length, [Date.now() - startTime.current]);
      }, 800);
    }
  }, [matched.size, cards.length]);

  const handleCardClick = (cardId: string) => {
    if (phase === "done") return;
    if (matched.has(cardId) || flipped.has(cardId)) return;

    if (selected === null) {
      setSelected(cardId);
      setFlipped((prev) => new Set(prev).add(cardId));
    } else {
      const first = cards.find((c) => c.id === selected)!;
      const second = cards.find((c) => c.id === cardId)!;
      setFlipped((prev) => new Set(prev).add(cardId));
      setAttempts((a) => a + 1);

      if (first.pairId === second.pairId && first.id !== second.id) {
        setTimeout(() => {
          setMatched((prev) => {
            const next = new Set(prev);
            next.add(first.id);
            next.add(second.id);
            return next;
          });
          setSelected(null);
        }, 400);
      } else {
        setTimeout(() => {
          setFlipped((prev) => {
            const next = new Set(prev);
            next.delete(first.id);
            next.delete(second.id);
            return next;
          });
          setSelected(null);
        }, 900);
      }
    }
  };

  if (phase === "done") {
    const pct = challenges.length > 0 ? Math.round(((matched.size / 2) / challenges.length) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <MaterialIcon icon="palette" filled className={`text-5xl ${pct >= blueprint.mechanic.passThreshold ? "text-amber-500" : "text-on-surface-variant"}`} />
        <p className="font-headline text-2xl font-extrabold text-on-surface">
          {pct >= blueprint.mechanic.passThreshold ? "全部配對完成！" : "再試一次！"}
        </p>
        <p className="text-on-surface-variant">{matched.size / 2} / {challenges.length} 對</p>
        <button onClick={onExit} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-xl font-bold">完成</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onExit} className="p-2 rounded-lg hover:bg-surface-container-low">
          <MaterialIcon icon="close" className="text-xl" />
        </button>
        <span className="text-sm font-bold text-on-surface-variant">
          配對 {matched.size / 2} / {challenges.length}
        </span>
        <span className="font-mono font-bold text-sm">{attempts} 次</span>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-2 md:gap-3 content-start">
        {cards.map((card) => {
          const isFlipped = flipped.has(card.id);
          const isMatched = matched.has(card.id);
          const isSelected = selected === card.id;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={isMatched}
              className={`aspect-[3/4] rounded-xl font-bold transition-all duration-300 flex flex-col items-center justify-center p-2 ${
                isMatched
                  ? "bg-green-100 opacity-60 scale-95"
                  : isFlipped
                    ? "bg-white shadow-card ring-2 ring-primary scale-105"
                    : "bg-primary/10 hover:bg-primary/20 hover:scale-105 shadow-sm"
              } ${isSelected ? "ring-2 ring-amber-400" : ""}`}
            >
              {isFlipped || isMatched ? (
                <div className="text-center">
                  <span className="text-lg md:text-xl font-extrabold text-on-surface">{card.text}</span>
                  {card.jyutping && (
                    <span className="block text-[10px] text-on-surface-variant font-mono mt-1">{card.jyutping}</span>
                  )}
                </div>
              ) : (
                <MaterialIcon icon="help_outline" className="text-2xl text-primary/40" />
              )}
            </button>
          );
        })}
      </div>

      {cards.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-on-surface-variant">需至少 2 題才能進行配對</p>
        </div>
      )}
    </div>
  );
}
