import { ReactNode } from "react";

/**
 * PortalShell — the single source of truth for portal page alignment.
 *
 * Every portal page (Enhancement: student / parent / aura-journey;
 * Improvement: therapist / nepa) wraps its scrollable content in a
 * PortalShell so that, on any device reaching app.speakable.hk, the
 * content column has an identical max-width, horizontal padding and
 * safe spacing for the fixed header + bottom navigation.
 *
 * Before this component each page hand-rolled its own `<main>` with
 * divergent `max-w-*`, `px-*`, `pt-*` and `lg:ml-*` values, so pages in
 * the same portal did not line up across breakpoints. PortalShell
 * removes that drift.
 */

export type PortalWidth = "narrow" | "default" | "wide" | "full";

const WIDTH_CLASS: Record<PortalWidth, string> = {
  // Forms, single-column flows (e.g. game builder, settings)
  narrow: "max-w-3xl",
  // Standard dashboards / list views
  default: "max-w-5xl",
  // Data-dense dashboards with multi-column grids
  wide: "max-w-6xl",
  // Edge-to-edge (maps, immersive canvases)
  full: "max-w-none",
};

interface PortalShellProps {
  children: ReactNode;
  /** Content column width. Defaults to "wide" to match the dashboards. */
  width?: PortalWidth;
  /** Reserve space at the top for a fixed app header (h-14 = 56px). */
  hasFixedHeader?: boolean;
  /** Reserve space at the bottom for a fixed bottom navigation bar. */
  hasBottomNav?: boolean;
  /**
   * Left offset (in Tailwind ml units) applied at lg+ to clear a desktop
   * sidebar. Use 80 (=20rem) to match the therapist portal aside. When 0
   * the content stays centred — the same on every device.
   */
  sidebarOffsetLg?: 0 | 72 | 80;
  className?: string;
}

export default function PortalShell({
  children,
  width = "wide",
  hasFixedHeader = true,
  hasBottomNav = false,
  sidebarOffsetLg = 0,
  className = "",
}: PortalShellProps) {
  // Top padding clears the 56px fixed header (plus a little breathing room).
  const topPad = hasFixedHeader ? "pt-20 lg:pt-8" : "pt-6 lg:pt-8";
  // Bottom padding clears the bottom nav and any iOS safe-area inset.
  const bottomPad = hasBottomNav ? "pb-28" : "pb-10";
  const offset =
    sidebarOffsetLg === 80
      ? "lg:ml-80"
      : sidebarOffsetLg === 72
        ? "lg:ml-72"
        : "";

  return (
    <main
      id="main-content"
      className={[
        "w-full mx-auto",
        WIDTH_CLASS[width],
        "px-4 sm:px-6",
        topPad,
        bottomPad,
        offset,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        paddingBottom: hasBottomNav
          ? "max(env(safe-area-inset-bottom), 7rem)"
          : undefined,
      }}
    >
      {children}
    </main>
  );
}
