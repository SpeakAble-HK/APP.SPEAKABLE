import { useCallback, useRef, useState } from "react";
import type { BilabialPhonemeKey } from "./bilabialTypes";
import { PHONEME_OPTIONS } from "./bilabialTypes";
import { cn } from "@/shared/lib/utils";

interface DragDropGameProps {
  floatingImage: string;
  floatingLabel: string;
  onDropOnShell: (key: BilabialPhonemeKey) => void;
  disabled?: boolean;
  highlightShell?: BilabialPhonemeKey | null;
  goldShells?: Record<BilabialPhonemeKey, boolean>;
}

export function DragDropGame({
  floatingImage,
  floatingLabel,
  onDropOnShell,
  disabled,
  highlightShell,
  goldShells,
}: DragDropGameProps) {
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const startRef = useRef({ x: 0, y: 0, bx: 0, by: 0 });
  const shellRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, bx: pos.x, by: pos.y };
  };

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      setPos({ x: startRef.current.bx + dx, y: startRef.current.by + dy });
    },
    [dragging]
  );

  function hitTest(clientX: number, clientY: number): BilabialPhonemeKey | null {
    for (const opt of PHONEME_OPTIONS) {
      const el = shellRefs.current[opt.key];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        return opt.key;
      }
    }
    return null;
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    const hit = hitTest(e.clientX, e.clientY);
    if (hit) onDropOnShell(hit);
    setPos({ x: 0, y: 0 });
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative flex min-h-[320px] flex-col items-center pb-36">
      <p className="mb-4 text-center text-sm font-bold text-on-surface">拖曳圖片到正確的貝殼（或點選貝殼分類）</p>

      <div
        className={cn(
          "relative z-20 flex touch-none select-none flex-col items-center rounded-3xl border-2 border-secondary/40 bg-card p-6 shadow-xl",
          dragging && "scale-105 shadow-2xl"
        )}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="text-7xl" aria-hidden>
          {floatingImage}
        </span>
        <span className="mt-2 font-headline text-lg font-extrabold text-on-surface">{floatingLabel}</span>
        <span className="mt-1 text-xs text-on-surface-variant">按住拖曳</span>
      </div>

      <div className="fixed bottom-24 left-0 right-0 z-30 flex justify-center gap-2 px-2 sm:static sm:mt-auto sm:pt-8">
        <div className="flex w-full max-w-lg justify-around gap-2">
          {PHONEME_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              ref={(el) => {
                shellRefs.current[opt.key] = el;
              }}
              disabled={disabled}
              onClick={() => !disabled && onDropOnShell(opt.key)}
              className={cn(
                "flex min-h-[72px] flex-1 flex-col items-center justify-center rounded-2xl border-2 px-2 py-3 font-headline text-xs font-extrabold transition-all active:scale-95 sm:text-sm",
                goldShells?.[opt.key] && "border-amber-400 bg-amber-100 text-amber-900 shadow-lg",
                !goldShells?.[opt.key] && highlightShell === opt.key && "border-primary bg-primary-container/30",
                !goldShells?.[opt.key] &&
                  highlightShell !== opt.key &&
                  "border-outline-variant/60 bg-surface-container-low"
              )}
            >
              <span className="text-2xl" aria-hidden>
                🐚
              </span>
              {opt.symbol}
              <span className="text-[10px] font-bold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
