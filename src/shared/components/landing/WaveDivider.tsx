interface WaveDividerProps {
  /** Color of the top section the wave sits on top of (the bg behind the wave) */
  from?: string;
  /** Color the wave fills into (the next section) */
  to?: string;
  flip?: boolean;
  className?: string;
}

/**
 * Soft cloud/wave SVG divider. Sits between sections.
 * `from` = visual bg behind the SVG, `to` = wave fill (= next section bg).
 */
export function WaveDivider({
  from = "bg-cream",
  to = "fill-sky-soft",
  flip = false,
  className = "",
}: WaveDividerProps) {
  return (
    <div
      className={`${from} ${className} leading-none -mt-px`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
        className={`block w-full h-16 sm:h-20 ${flip ? "rotate-180" : ""}`}
      >
        <path
          className={to}
          d="M0,40 C240,110 480,0 720,40 C960,80 1200,10 1440,55 L1440,110 L0,110 Z"
        />
      </svg>
    </div>
  );
}
