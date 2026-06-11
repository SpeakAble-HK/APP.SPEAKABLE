import React from "react";

interface SceneIndicatorProps {
  title: string;
  visible: boolean;
}

export const SceneIndicator: React.FC<SceneIndicatorProps> = ({ title, visible }) => (
  <div
    className={`fixed left-4 top-4 z-30 max-w-[calc(100vw-2rem)] rounded-full border border-white/15 bg-black/45 px-4 py-2 text-white shadow-2xl backdrop-blur transition-opacity duration-500 md:left-8 md:top-8 ${
      visible ? "opacity-100" : "opacity-0"
    }`}
  >
    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">正在播放</div>
    <div className="truncate text-sm font-bold text-amber-100 md:text-base">{title}</div>
  </div>
);
