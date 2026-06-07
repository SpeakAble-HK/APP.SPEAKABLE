import React from "react";
import { Mic, Play, SkipForward } from "lucide-react";

interface VoiceCloningPromptProps {
  prompt: string;
  targetText: string;
  onRecord: () => void;
  onSkip: () => void;
  recording: boolean;
}

function speakCantonese(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-HK";
  utterance.rate = 0.82;
  const voice = window.speechSynthesis
    .getVoices()
    .find((item) => item.lang === "zh-HK" || item.lang === "zh-TW" || item.lang === "zh-CN");
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export const VoiceCloningPrompt: React.FC<VoiceCloningPromptProps> = ({
  prompt,
  targetText,
  onRecord,
  onSkip,
  recording,
}) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm md:items-center">
    <div className="w-full max-w-xl rounded-2xl border border-emerald-200/25 bg-slate-950/95 p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
      <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">互動粵語提示</div>
      <h2 className="mb-4 text-2xl font-bold leading-snug text-amber-100">{prompt}</h2>
      <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.08] p-4 text-lg leading-8 text-white/85">
        {targetText}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 font-bold text-emerald-950 transition hover:bg-amber-200"
          onClick={onRecord}
          disabled={recording}
        >
          <Mic className="h-4 w-4" />
          {recording ? "錄音中..." : "開始錄音"}
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
          onClick={() => speakCantonese(targetText)}
          disabled={recording}
        >
          <Play className="h-4 w-4" />
          聽示範
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
          onClick={onSkip}
          disabled={recording}
        >
          <SkipForward className="h-4 w-4" />
          下一章
        </button>
      </div>
    </div>
  </div>
);
