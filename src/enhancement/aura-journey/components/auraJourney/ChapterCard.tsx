import React from "react";

interface ChapterCardProps {
  chapter: string;
  title: string;
  subtitle: string;
  visible: boolean;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, title, subtitle, visible }) => (
  <div
    className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/70 px-6 text-center transition-opacity duration-700 ${
      visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}
  >
    <div className="mb-4 text-sm font-bold tracking-[0.22em] text-emerald-200">{chapter}</div>
    <h2 className="mb-3 max-w-3xl font-display text-4xl font-bold leading-tight text-amber-100 md:text-6xl">
      {title}
    </h2>
    <p className="max-w-2xl text-lg leading-8 text-white/80">{subtitle}</p>
  </div>
);
