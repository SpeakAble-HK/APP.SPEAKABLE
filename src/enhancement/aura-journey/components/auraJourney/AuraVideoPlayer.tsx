import React, { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Mic, Pause, Play } from "lucide-react";

interface AuraVideoPlayerProps {
  src?: string;
  chapter: string;
  title: string;
  cinematicPrompt: string;
  therapistGoal: string;
  playing: boolean;
  onPlayPause: () => void;
  onEnded: () => void;
  onNext: () => void;
  onPrev: () => void;
  onProgress: (current: number, duration: number) => void;
}

export const AuraVideoPlayer: React.FC<AuraVideoPlayerProps> = ({
  src,
  chapter,
  title,
  cinematicPrompt,
  therapistGoal,
  playing,
  onPlayPause,
  onEnded,
  onNext,
  onPrev,
  onProgress,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (playing) {
      video.play().catch(() => {
        // Autoplay with sound can be blocked. The visible play button remains available.
      });
    } else {
      video.pause();
    }
  }, [playing, src]);

  return (
    <div className="fixed inset-0 z-20 overflow-hidden bg-slate-950">
      {src ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={src}
          onEnded={onEnded}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            onProgress(video.currentTime, video.duration);
          }}
          playsInline
        />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.28),transparent_32%),linear-gradient(180deg,#134e4a_0%,#020617_100%)]" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.58)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/85 to-transparent" />

      <div className="absolute bottom-24 left-4 right-4 max-w-3xl text-white md:bottom-28 md:left-10">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">{chapter}</div>
        <h1 className="mb-3 font-display text-3xl font-bold leading-tight text-amber-100 md:text-5xl">{title}</h1>
        <p className="mb-4 text-base leading-7 text-white/85 md:text-xl md:leading-9">{cinematicPrompt}</p>
        <div className="inline-flex max-w-full rounded-full border border-emerald-200/25 bg-emerald-950/55 px-4 py-2 text-sm font-semibold text-emerald-50 backdrop-blur">
          治療目標：{therapistGoal}
        </div>
      </div>

      <div className="absolute bottom-5 left-0 right-0 z-30 flex flex-wrap items-center justify-center gap-3 px-4">
        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur transition hover:bg-white/20"
          onClick={onPrev}
          title="上一章"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          className="inline-flex h-12 min-w-12 items-center justify-center rounded-full bg-amber-300 px-5 font-bold text-slate-950 shadow-xl transition hover:bg-emerald-300"
          onClick={onPlayPause}
          title="播放或暫停"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/20"
          onClick={onEnded}
        >
          <Mic className="h-4 w-4" />
          互動提示
        </button>
        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur transition hover:bg-white/20"
          onClick={onNext}
          title="下一章"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
