import { useState, useEffect } from "react";
import mascot from "@/assets/pipi-mascot.png";

interface PiPiWidgetProps {
  tips: string[];
  intervalMs?: number;
  className?: string;
  onBubbleClick?: (tip: string) => void;
  celebrate?: boolean; // triggers celebration animation
}

export function PiPiWidget({ tips, intervalMs = 8000, className = "", onBubbleClick, celebrate = false }: PiPiWidgetProps) {
  const [tipIdx, setTipIdx] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (tips.length <= 1) return;
    const id = setInterval(() => setTipIdx((i) => (i + 1) % tips.length), intervalMs);
    return () => clearInterval(id);
  }, [tips.length, intervalMs]);

  // Celebrate animation trigger
  useEffect(() => {
    if (celebrate) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [celebrate]);

  // Animation handlers
  const handleMascotClick = () => {
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 800);
  };
  const handleBubbleClick = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 400);
    if (onBubbleClick) onBubbleClick(tips[tipIdx] ?? "");
  };

  return (
    <div className={`fixed bottom-24 right-3 z-40 max-w-[220px] sm:max-w-xs ${className}`}>
      <div className="glass-card rounded-xl p-3 shadow-xl border border-primary/15">
        <div className="flex items-start gap-2">
          <div className="relative">
            <img
              src={mascot}
              alt="PiPi mascot"
              role="presentation"
              className={`w-11 h-11 rounded-full object-cover shrink-0 shadow-md cursor-pointer transition-transform duration-300 ${isWaving ? 'animate-pipi-wave' : 'animate-pipi-bob'} ${celebrate ? 'ring-4 ring-yellow-300' : ''}`}
              onClick={handleMascotClick}
              onMouseEnter={() => setIsWaving(true)}
              onMouseLeave={() => setIsWaving(false)}
            />
            {showConfetti && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-bounce">🎉</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-headline text-xs font-bold text-primary">PiPi</p>
            <button
              className={`text-[11px] sm:text-xs text-on-surface leading-snug mt-0.5 bg-transparent border-none outline-none cursor-pointer transition-transform ${isBouncing ? 'scale-110' : ''}`}
              onClick={handleBubbleClick}
              tabIndex={0}
              aria-label="Interact with PiPi's tip"
            >
              {tips[tipIdx] ?? ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
