import type { BilabialPhonemeKey } from "./bilabialTypes";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

export type FeedbackAnimation = "gun" | "bubble" | "stink" | "clap" | "none";

interface AIFeedbackModuleProps {
  variant: "success" | "retry" | "neutral";
  title: string;
  message: string;
  accuracy?: number;
  phonemeHint?: string;
  animation?: FeedbackAnimation;
  phonemeKey?: BilabialPhonemeKey;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Short reward line e.g. +10 金幣、+1 ⭐ */
  rewardLine?: string;
  /** Optional voice compare (failure) */
  compareCloneUrl?: string | null;
  compareUserUrl?: string | null;
}

function SuccessAnimation({ kind }: { kind: FeedbackAnimation }) {
  if (kind === "none") return null;
  if (kind === "gun") {
    return (
      <div className="flex justify-center text-7xl animate-bounce" aria-hidden>
        🔫✨
      </div>
    );
  }
  if (kind === "bubble") {
    return (
      <div className="flex justify-center gap-2 text-6xl" aria-hidden>
        <span className="animate-float">🫧</span>
        <span className="animate-float" style={{ animationDelay: "0.2s" }}>
          🫧
        </span>
        <span className="animate-float" style={{ animationDelay: "0.4s" }}>
          🫧
        </span>
      </div>
    );
  }
  if (kind === "stink") {
    return (
      <div className="flex justify-center text-7xl" aria-hidden>
        <span className="inline-block animate-pulse">🤢💨</span>
      </div>
    );
  }
  if (kind === "clap") {
    return (
      <div className="flex justify-center text-7xl" aria-hidden>
        👏🦜
      </div>
    );
  }
  return null;
}

export function AIFeedbackModule({
  variant,
  title,
  message,
  accuracy,
  phonemeHint,
  animation = "none",
  phonemeKey,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  rewardLine,
  compareCloneUrl,
  compareUserUrl,
}: AIFeedbackModuleProps) {
  const success = variant === "success";

  return (
    <div
      className={cn(
        "rounded-3xl border-2 p-6 text-center shadow-lg",
        success ? "border-green-500/40 bg-green-500/10" : "border-amber-500/40 bg-amber-500/10"
      )}
    >
      {success && animation !== "none" && (
        <div className="mb-4">
          <SuccessAnimation kind={animation} />
        </div>
      )}

      <div className="mb-2 flex items-center justify-center gap-2">
        {success ? (
          <MaterialIcon icon="check_circle" filled className="text-3xl text-green-600" />
        ) : (
          <MaterialIcon icon="tips_and_updates" className="text-3xl text-amber-600" />
        )}
        <h3 className="font-headline text-lg font-extrabold text-on-surface">{title}</h3>
      </div>

      {accuracy != null && (
        <p className="mb-2 text-2xl font-extrabold text-primary">{accuracy} 分</p>
      )}
      {phonemeHint && (
        <p className="mb-2 text-xs font-bold text-on-surface-variant">辨識：{phonemeHint}</p>
      )}
      {phonemeKey && (
        <p className="mb-2 text-xs text-on-surface-variant">
          目標：{phonemeKey === "b" ? "/b/ 爸爸音" : phonemeKey === "p" ? "/p/ 婆婆音" : "/m/ 媽媽音"}
        </p>
      )}

      <p className="mb-3 text-left text-sm font-medium leading-relaxed text-on-surface">{message}</p>

      {rewardLine && (
        <p className="mb-3 text-center text-base font-extrabold text-amber-700">{rewardLine}</p>
      )}

      {(compareCloneUrl || compareUserUrl) && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-2">
            <p className="mb-1 text-center text-[10px] font-bold text-muted-foreground">參考</p>
            {compareCloneUrl ? <audio src={compareCloneUrl} controls className="w-full" /> : null}
          </div>
          <div className="rounded-xl border border-border p-2">
            <p className="mb-1 text-center text-[10px] font-bold text-muted-foreground">你</p>
            {compareUserUrl ? <audio src={compareUserUrl} controls className="w-full" /> : null}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onPrimary}
          className="min-h-[52px] w-full rounded-2xl bg-primary py-3 font-headline text-base font-extrabold text-on-primary shadow-lg active:scale-[0.98]"
        >
          {primaryLabel}
        </button>
        {secondaryLabel && onSecondary && (
          <button
            type="button"
            onClick={onSecondary}
            className="min-h-[48px] w-full rounded-2xl border-2 border-outline-variant py-3 font-headline text-sm font-bold text-on-surface"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
