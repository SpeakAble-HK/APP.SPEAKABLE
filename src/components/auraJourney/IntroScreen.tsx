import React from "react";

interface IntroScreenProps {
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_10%,rgba(250,204,21,0.28),transparent_34%),linear-gradient(180deg,#10251f_0%,#07111e_55%,#020617_100%)] px-6 text-center text-white">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_4px] opacity-20" />
    <div className="relative mb-10 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100">
      SpeakableHK Cinematic Therapy
    </div>
    <h1 className="relative mb-4 font-display text-5xl font-bold leading-tight text-amber-100 md:text-7xl">
      靈光旅程
    </h1>
    <p className="relative mb-8 max-w-xl text-lg leading-8 text-emerald-50/85 md:text-2xl">
      皮皮歷險記：十二章粵語言語治療電影任務
    </p>
    <button
      className="relative rounded-full bg-emerald-400 px-7 py-3 text-base font-bold text-emerald-950 shadow-[0_0_40px_rgba(52,211,153,0.35)] transition hover:bg-amber-200"
      onClick={onStart}
    >
      開始旅程
    </button>
  </div>
);
