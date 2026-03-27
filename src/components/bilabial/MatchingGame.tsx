import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

export interface MatchingOption {
  id: string;
  image: string;
  word: string;
}

interface MatchingGameProps {
  options: MatchingOption[];
  targetWord: string;
  onPlaySound: () => void;
  onSelectImage: (id: string) => void;
  canSelect: boolean;
  listenDone: boolean;
  disabled?: boolean;
  wrongId?: string | null;
  isPlaying?: boolean;
}

export function MatchingGame({
  options,
  targetWord,
  onPlaySound,
  onSelectImage,
  canSelect,
  listenDone,
  disabled,
  wrongId,
}: MatchingGameProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
      <div>
        <p className="mb-3 text-center text-xs font-bold text-on-surface-variant">選一張圖</p>
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={disabled || !canSelect || !listenDone}
              onClick={() => onSelectImage(opt.id)}
              className={cn(
                "flex min-h-[100px] flex-col items-center justify-center rounded-2xl border-2 p-3 text-5xl transition-all active:scale-95",
                wrongId === opt.id && "border-error bg-error/10 animate-pulse",
                wrongId !== opt.id && "border-outline-variant/50 bg-card hover:border-primary/40",
                (!listenDone || !canSelect) && "opacity-40"
              )}
            >
              <span aria-hidden>{opt.image}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-primary/30 bg-primary-container/20 p-6">
        <p className="text-center text-xs font-bold text-primary">聽聲音</p>
        <p className="font-headline text-2xl font-extrabold text-on-surface">{targetWord}</p>
        <button
          type="button"
          disabled={disabled}
          onClick={onPlaySound}
          className="flex min-h-[64px] w-full max-w-[200px] items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-headline text-base font-extrabold text-on-primary shadow-lg active:scale-[0.98] disabled:opacity-40"
        >
          <MaterialIcon icon="volume_up" filled className="text-2xl" />
          播放
        </button>
        {!listenDone && (
          <p className="text-center text-xs font-bold text-amber-700">請先按「播放」聽清楚</p>
        )}
      </div>
    </div>
  );
}
