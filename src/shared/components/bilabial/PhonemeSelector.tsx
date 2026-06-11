import type { BilabialPhonemeKey } from "./bilabialTypes";
import { PHONEME_OPTIONS } from "./bilabialTypes";
import { cn } from "@/shared/lib/utils";

interface PhonemeSelectorProps {
  selected: BilabialPhonemeKey | null;
  onSelect: (key: BilabialPhonemeKey) => void;
  disabled?: boolean;
  className?: string;
}

export function PhonemeSelector({ selected, onSelect, disabled, className }: PhonemeSelectorProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}>
      {PHONEME_OPTIONS.map((opt) => {
        const isSel = selected === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onSelect(opt.key)}
            className={cn(
              "min-h-[56px] rounded-2xl border-2 px-4 py-4 text-center font-headline text-base font-extrabold transition-all active:scale-[0.98]",
              disabled && "opacity-50 cursor-not-allowed",
              isSel
                ? "border-primary bg-primary-container/40 text-primary shadow-md"
                : "border-outline-variant/60 bg-card text-on-surface hover:border-primary/50"
            )}
          >
            <span className="block text-lg text-primary">{opt.symbol}</span>
            <span className="block text-sm">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
