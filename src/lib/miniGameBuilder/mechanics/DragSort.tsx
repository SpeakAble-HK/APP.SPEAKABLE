import { useState, useCallback } from "react";
import type { MiniGameBlueprint, ChallengeItem } from "../types";
import { MaterialIcon } from "@/components/MaterialIcon";

interface Props {
  blueprint: MiniGameBlueprint;
  onScore: (correct: number, total: number, timing: number[]) => void;
  onExit: () => void;
}

interface DraggableItem extends ChallengeItem {
  category: string;
}

export function DragSortGame({ blueprint, onScore, onExit }: Props) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState<"play" | "done">("play");
  const [startTime] = useState(Date.now());

  const items = blueprint.challenges.slice(0, blueprint.mechanic.itemsPerRound);
  const categories = Array.from(new Set(items.map((i) => i.correctAnswer)));

  const [dropped, setDropped] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const handleDrop = useCallback((itemId: string, category: string) => {
    setDropped((prev) => ({ ...prev, [itemId]: category }));
  }, []);

  const handleCheck = useCallback(() => {
    let c = 0;
    items.forEach((item) => {
      if (dropped[item.id] === item.correctAnswer) c++;
    });
    setCorrect(c);
    setShowResult(true);
    setTimeout(() => {
      setPhase("done");
      const totalMs = Date.now() - startTime;
      onScore(c, items.length, [totalMs]);
    }, 2000);
  }, [dropped, items, startTime, onScore]);

  if (phase === "done") {
    const pct = Math.round((correct / items.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <MaterialIcon icon="emoji_events" filled className={`text-5xl ${pct >= blueprint.mechanic.passThreshold ? "text-amber-500" : "text-on-surface-variant"}`} />
        <p className="font-headline text-2xl font-extrabold text-on-surface">
          {pct >= blueprint.mechanic.passThreshold ? "排序完成！" : "再試一次"}
        </p>
        <p className="text-on-surface-variant">{correct} / {items.length} 正確 ({pct}%)</p>
        <button onClick={onExit} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-xl font-bold">完成</button>
      </div>
    );
  }

  const undropped = items.filter((item) => !dropped[item.id]);

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onExit} className="p-2"><MaterialIcon icon="close" className="text-xl" /></button>
        <span className="font-headline font-bold text-sm">分類 {items.length} 項</span>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {undropped.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {undropped.map((item) => (
              <div key={item.id} className="px-3 py-2 rounded-xl bg-white shadow-card font-bold border border-surface-container-high">
                {item.text}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-auto">
          {categories.map((cat) => (
            <div
              key={cat}
              onDrop={(e) => { e.preventDefault(); handleDrop("", cat); }}
              onDragOver={(e) => e.preventDefault()}
              className="rounded-xl p-4 border-2 border-dashed border-secondary-container min-h-[100px] flex flex-col items-center gap-1"
            >
              <p className="font-bold text-sm text-secondary mb-2">{cat}</p>
              {items.filter((it) => dropped[it.id] === cat).map((it) => (
                <span key={it.id} className="px-3 py-1 rounded-lg bg-secondary/10 text-sm font-bold">
                  {it.text}
                </span>
              ))}
            </div>
          ))}
        </div>

        <button
          onClick={handleCheck}
          disabled={undropped.length > 0}
          className="mt-4 w-full py-3 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-40"
        >
          確認排序
        </button>
      </div>
    </div>
  );
}
