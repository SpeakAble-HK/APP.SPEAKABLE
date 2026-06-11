import pipi from "@/assets/pipi-parrot-only.png";

interface BilabialGameHUDProps {
  score: number;
  target: number;
  sessionCoins: number;
  pipCelebrate?: boolean;
}

export function BilabialGameHUD({ score, target, sessionCoins, pipCelebrate }: BilabialGameHUDProps) {
  return (
    <div className="mb-3 space-y-2 rounded-2xl border-2 border-primary/25 bg-card/95 px-3 py-2 shadow-sm backdrop-blur-sm">
      <p className="text-center text-[11px] font-bold leading-tight text-foreground">
        今日任務：完成 {target} 次正確發音
      </p>
      <div className="flex items-center justify-center gap-2 font-headline text-sm font-extrabold text-primary">
        <span>
          {score} / {target}
        </span>
        <span aria-hidden>⭐</span>
        <span className="text-xs font-bold text-amber-700">🪙 {sessionCoins}</span>
      </div>
      {pipCelebrate && (
        <div className="flex justify-center pt-1">
          <img src={pipi} alt="" className="h-11 w-11 animate-bounce object-contain" width={128} height={128} />
        </div>
      )}
    </div>
  );
}
