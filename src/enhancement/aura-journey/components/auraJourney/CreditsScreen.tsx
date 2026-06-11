import React from "react";

interface CreditsScreenProps {
  visible: boolean;
  onReplay: () => void;
  /** Open the stitched "My Voice Story" replay. Shown only when at least one clone exists. */
  onViewVoiceStory?: () => void;
  hasVoiceStory?: boolean;
}

export const CreditsScreen: React.FC<CreditsScreenProps> = ({
  visible,
  onReplay,
  onViewVoiceStory,
  hasVoiceStory = false,
}) => (
  <div
    className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[linear-gradient(180deg,#082f2b_0%,#020617_100%)] px-6 text-center text-white transition-opacity duration-700 ${
      visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}
  >
    <div className="max-w-2xl">
      <div className="mb-5 text-sm font-bold uppercase tracking-[0.22em] text-emerald-200">旅程完成</div>
      <h1 className="mb-5 font-display text-5xl font-bold text-amber-100 md:text-7xl">靈光旅程</h1>
      <p className="mb-8 text-lg leading-8 text-white/80">
        皮皮遇到不少朋友，包括奧拉同字寶。大家一齊完成言語治療歷險，準備每日練少少。
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {hasVoiceStory && onViewVoiceStory && (
          <button
            className="rounded-full bg-purple-500 px-7 py-3 font-bold text-white shadow-xl transition hover:bg-purple-400"
            onClick={onViewVoiceStory}
          >
            🎤 我嘅聲音故事
          </button>
        )}
        <button
          className="rounded-full bg-amber-300 px-7 py-3 font-bold text-slate-950 shadow-xl transition hover:bg-emerald-300"
          onClick={onReplay}
        >
          重新播放
        </button>
      </div>
    </div>
  </div>
);
