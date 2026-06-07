import { type ReactNode, useRef, useEffect, useState, Children, isValidElement, cloneElement } from "react";
import { cn } from "@/lib/utils";

function useOnScreen(rootMargin = "0px") {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);
  return [ref, visible] as const;
}

function FadeIn({
  children,
  className,
  delay = 0,
  duration = 400,
  y = 12,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!once);
  useEffect(() => {
    if (once) {
      const el = ref.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
        { rootMargin: "0px" },
      );
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, [once]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Stagger({
  children,
  className,
  staggerDelay = 60,
  initialDelay = 0,
  y = 12,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
  y?: number;
}) {
  const [ref, visible] = useOnScreen();

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child;
        return (
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : `translateY(${y}px)`,
              transition: `opacity 400ms cubic-bezier(0.16, 1, 0.3, 1), transform 400ms cubic-bezier(0.16, 1, 0.3, 1)`,
              transitionDelay: `${initialDelay + i * staggerDelay}ms`,
            }}
          >
            {cloneElement(child, child.props as Record<string, unknown>)}
          </div>
        );
      })}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card glow-rim rounded-xl p-5 shadow-card", className)}>
      <div className="shimmer-skeleton h-4 w-24 rounded mb-3" />
      <div className="shimmer-skeleton h-8 w-16 rounded mb-2" />
      <div className="shimmer-skeleton h-3 w-32 rounded" />
    </div>
  );
}

function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <div className="shimmer-skeleton w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="shimmer-skeleton h-4 w-32 rounded" />
            <div className="shimmer-skeleton h-3 w-24 rounded" />
          </div>
          <div className="shimmer-skeleton h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export { FadeIn, Stagger, SkeletonCard, SkeletonList, useOnScreen };
