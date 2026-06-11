import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { auraJourneyScenes } from "./auraJourneyScenes";

interface MyVoiceStoryProps {
  /** sceneIndex -> cloned-voice audio URL captured during the journey. */
  voiceData: Record<number, string>;
  onClose: () => void;
  onReplayJourney: () => void;
}

/**
 * "My Voice Story" — a stitched replay that plays each completed scene's video
 * with its ORIGINAL narration muted and the child's cloned voice overlaid, so the
 * whole adventure is retold in the child's own voice. Scenes without a cloned
 * recording fall back to the original narration audio.
 */
export const MyVoiceStory: React.FC<MyVoiceStoryProps> = ({ voiceData, onClose, onReplayJourney }) => {
  // Only include scenes the child actually narrated, in chapter order.
  const sceneIndices = useMemo(
    () =>
      auraJourneyScenes
        .map((_, idx) => idx)
        .filter((idx) => Boolean(voiceData[idx])),
    [voiceData],
  );

  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sceneIdx = sceneIndices[pos];
  const scene = sceneIdx != null ? auraJourneyScenes[sceneIdx] : null;
  const clonedUrl = sceneIdx != null ? voiceData[sceneIdx] : null;

  // Drive the cloned-voice overlay for the current scene.
  useEffect(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (!clonedUrl) return;
    const audio = new Audio(clonedUrl);
    audioRef.current = audio;
    if (playing) audio.play().catch(() => {});
    return () => audio.pause();
  }, [clonedUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = true; // original narration off; cloned voice is the narration
      if (playing) v.play().catch(() => {});
      else v.pause();
    }
    const a = audioRef.current;
    if (a) {
      if (playing) a.play().catch(() => {});
      else a.pause();
    }
  }, [playing, sceneIdx]);

  const goNext = () => {
    if (pos < sceneIndices.length - 1) setPos((p) => p + 1);
  };
  const goPrev = () => {
    if (pos > 0) setPos((p) => p - 1);
  };

  if (sceneIndices.length === 0) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-950 px-6 text-center text-white">
        <h2 className="mb-3 text-2xl font-bold text-amber-100">仲未有你嘅聲音故事</h2>
        <p className="mb-6 max-w-md text-white/80">
          喺旅程入面錄低你嘅聲音，就可以將整個故事用你自己把聲重新講一次。
        </p>
        <button
          onClick={onReplayJourney}
          className="rounded-full bg-amber-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
        >
          開始旅程錄音
        </button>
        <button onClick={onClose} className="mt-3 text-sm text-white/60 underline">
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-slate-950">
      {scene?.video ? (
        <video
          ref={videoRef}
          key={scene.video}
          className="h-full w-full object-cover"
          src={scene.video}
          muted
          playsInline
          onEnded={goNext}
        />
      ) : (
        <div className="h-full w-full bg-[linear-gradient(180deg,#134e4a,#020617)]" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55),transparent_30%,rgba(0,0,0,0.8))]" />

      <div className="absolute right-4 top-4 z-10 rounded-full border border-purple-300/40 bg-purple-600/80 px-3 py-1 text-xs font-bold text-white backdrop-blur">
        🎤 我嘅聲音故事
      </div>

      <div className="absolute bottom-28 left-4 right-4 max-w-3xl text-white md:left-10">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">{scene?.chapter}</div>
        <h1 className="mb-2 text-3xl font-bold text-amber-100 md:text-5xl">{scene?.title}</h1>
        <p className="text-base text-white/85 md:text-lg">{scene?.voiceText}</p>
      </div>

      <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-3 px-4">
        <button
          onClick={goPrev}
          disabled={pos === 0}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex h-12 items-center justify-center rounded-full bg-amber-300 px-5 font-bold text-slate-950 shadow-xl transition hover:bg-emerald-300"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button
          onClick={goNext}
          disabled={pos === sceneIndices.length - 1}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          onClick={onReplayJourney}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-4 py-3 font-bold text-white"
          title="重新錄製"
        >
          <RotateCcw className="h-4 w-4" />
          重錄
        </button>
        <button onClick={onClose} className="rounded-full border border-white/15 bg-black/45 px-4 py-3 text-sm text-white">
          完成
        </button>
      </div>

      <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 text-xs text-white/70">
        {pos + 1} / {sceneIndices.length}
      </div>
    </div>
  );
};
