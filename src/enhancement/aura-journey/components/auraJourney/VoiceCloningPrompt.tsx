import React from "react";
import { Mic, MicOff, Play, Pause, SkipForward, RotateCcw, Loader2 } from "lucide-react";
import type { VoiceCloneResult } from "./useVoiceCloning";

interface VoiceCloningPromptProps {
  prompt: string;
  targetText: string;
  onRecord: () => void;
  onStop: () => void;
  onSkip: () => void;
  onReset: () => void;
  onPlay: () => void;
  recording: boolean;
  processing: boolean;
  duration: number;
  cloneResult: VoiceCloneResult | null;
  audioUrl: string | null;
  error: string | null;
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
  onStop,
  onSkip,
  onReset,
  onPlay,
  recording,
  processing,
  duration,
  cloneResult,
  audioUrl,
  error,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handlePlay = () => {
    if (audioUrl) {
      setIsPlaying(true);
      onPlay();
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-xl rounded-2xl border border-emerald-200/25 bg-slate-950/95 p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">互動粵語提示</div>
        <h2 className="mb-4 text-2xl font-bold leading-snug text-amber-100">{prompt}</h2>
        <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.08] p-4 text-lg leading-8 text-white/85">
          {targetText}
        </div>

        {/* Recording Status */}
        {recording && (
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-red-500/20 border border-red-400/30 p-4">
            <div className="relative">
              <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse" />
              <div className="absolute inset-0 h-4 w-4 rounded-full bg-red-500 animate-ping opacity-75" />
            </div>
            <span className="text-lg font-bold text-red-200">錄音中... {duration}秒</span>
          </div>
        )}

        {/* Processing Status */}
        {processing && (
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-blue-500/20 border border-blue-400/30 p-4">
            <Loader2 className="h-5 w-5 text-blue-300 animate-spin" />
            <span className="text-lg font-bold text-blue-200">處理中...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/20 border border-red-400/30 p-4 text-red-200">
            {error}
          </div>
        )}

        {/* ASR Feedback */}
        {cloneResult && cloneResult.phonemes.length > 0 && (
          <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
            <div className="mb-2 text-sm font-bold text-emerald-200">語音分析結果</div>
            <div className="flex flex-wrap gap-1">
              {cloneResult.phonemes.map((p, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center rounded px-2 py-1 text-sm font-mono ${
                    p.isLowConfidence
                      ? "bg-red-500/30 text-red-200"
                      : "bg-emerald-500/30 text-emerald-200"
                  }`}
                >
                  {p.character || p.phoneme || '?'}
                  <span className="ml-1 text-xs opacity-70">
                    {Math.round(p.confidence * 100)}%
                  </span>
                </span>
              ))}
            </div>
            <div className="mt-2 text-sm text-emerald-300/80">
              整體準確度: {Math.round(cloneResult.confidence * 100)}%
            </div>
          </div>
        )}

        {/* Generated Audio Player */}
        {audioUrl && !recording && !processing && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-purple-400/30 bg-purple-500/10 p-4">
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className="inline-flex items-center gap-2 rounded-full bg-purple-400 px-4 py-2 font-bold text-purple-950 transition hover:bg-purple-300 disabled:opacity-50"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "播放中..." : "播放複製語音"}
            </button>
            <span className="text-sm text-purple-200">你嘅複製語音已準備好</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {!recording && !processing && !audioUrl && (
            <button
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 font-bold text-emerald-950 transition hover:bg-emerald-300 active:scale-95"
              onClick={onRecord}
            >
              <Mic className="h-4 w-4" />
              開始錄音
            </button>
          )}

          {recording && (
            <button
              className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-3 font-bold text-white transition hover:bg-red-400 active:scale-95 animate-pulse"
              onClick={onStop}
            >
              <MicOff className="h-4 w-4" />
              停止錄音
            </button>
          )}

          {audioUrl && !recording && !processing && (
            <>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
                onClick={onReset}
              >
                <RotateCcw className="h-4 w-4" />
                重新錄音
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
                onClick={onSkip}
              >
                <SkipForward className="h-4 w-4" />
                下一章
              </button>
            </>
          )}

          {!recording && !processing && !audioUrl && (
            <>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
                onClick={() => speakCantonese(targetText)}
              >
                <Play className="h-4 w-4" />
                聽示範
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
                onClick={onSkip}
              >
                <SkipForward className="h-4 w-4" />
                跳過
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
