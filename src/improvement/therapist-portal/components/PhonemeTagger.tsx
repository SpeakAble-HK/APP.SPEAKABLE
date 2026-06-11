import { useState } from "react";
import type { PhonemeTarget } from "@/lib/minigame-sdk/types";

const CANTONESE_PHONEMES: PhonemeTarget[] = [
  { symbol: "/b/", ipa: "b", position: "initial" },
  { symbol: "/p/", ipa: "p", position: "initial" },
  { symbol: "/m/", ipa: "m", position: "initial" },
  { symbol: "/n/", ipa: "n", position: "initial" },
  { symbol: "/l/", ipa: "l", position: "initial" },
  { symbol: "/g/", ipa: "g", position: "initial" },
  { symbol: "/k/", ipa: "k", position: "initial" },
  { symbol: "/z/", ipa: "z", position: "initial" },
  { symbol: "/c/", ipa: "c", position: "initial" },
  { symbol: "/s/", ipa: "s", position: "initial" },
];

interface PhonemeTaggerProps {
  onSave: (phonemes: PhonemeTarget[]) => void;
  saving?: boolean;
}

export function PhonemeTagger({ onSave, saving }: PhonemeTaggerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (symbol: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Target Phonemes</h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {CANTONESE_PHONEMES.map((phoneme) => {
          const active = selected.has(phoneme.symbol);
          return (
            <button
              key={phoneme.symbol}
              onClick={() => toggle(phoneme.symbol)}
              className={`rounded-xl border py-4 text-lg font-bold transition-all active:scale-95 ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-outline-variant/30 bg-surface-container-high/40"
              }`}
              aria-pressed={active}
            >
              {phoneme.symbol}
            </button>
          );
        })}
      </div>
      <button
        onClick={() =>
          onSave(CANTONESE_PHONEMES.filter((p) => selected.has(p.symbol)))
        }
        disabled={saving || selected.size === 0}
        className="rounded-full bg-primary text-on-primary px-6 py-2.5 font-semibold disabled:opacity-50 active:scale-95 transition-transform"
      >
        {saving ? "Saving…" : "Save Targets"}
      </button>
    </div>
  );
}
