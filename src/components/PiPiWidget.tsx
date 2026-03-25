import { useState, useEffect } from "react";
import mascot from "@/assets/pipi-mascot.png";

interface PiPiWidgetProps {
  tips: string[];
  intervalMs?: number;
  className?: string;
}

export function PiPiWidget({ tips, intervalMs = 8000, className = "" }: PiPiWidgetProps) {
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    if (tips.length <= 1) return;
    const id = setInterval(() => setTipIdx((i) => (i + 1) % tips.length), intervalMs);
    return () => clearInterval(id);
  }, [tips.length, intervalMs]);

  return (
    <div className={`fixed bottom-24 right-3 z-40 max-w-[220px] sm:max-w-xs ${className}`}>
      <div className="glass-card rounded-xl p-3 shadow-xl border border-primary/15">
        <div className="flex items-start gap-2">
          <img
            src={mascot}
            alt=""
            role="presentation"
            className="w-11 h-11 rounded-full object-cover shrink-0 shadow-md animate-pipi-bob"
          />
          <div className="min-w-0">
            <p className="font-headline text-xs font-bold text-primary">PiPi</p>
            <p className="text-[11px] sm:text-xs text-on-surface leading-snug mt-0.5">
              {tips[tipIdx] ?? ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
