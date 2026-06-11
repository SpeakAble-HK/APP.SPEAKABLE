import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { useLanguage } from "@/shared/contexts/LanguageContext";

interface ErrorMarker {
  position: number; // 0-1 normalized position on waveform
  label: string;
}

interface PrecisionPracticeProps {
  audioUrl?: string | null;
  waveformData?: number[];
  errorMarkers?: ErrorMarker[];
  className?: string;
}

export function PrecisionPractice({ audioUrl, waveformData, errorMarkers = [], className = "" }: PrecisionPracticeProps) {
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";
  const [slowMode, setSlowMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPos, setPlaybackPos] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const data = waveformData || new Array(100).fill(0).map((_, i) =>
    0.3 + 0.4 * Math.abs(Math.sin(i * 0.12)) + 0.1 * Math.random()
  );

  // Default error markers for demo
  const markers: ErrorMarker[] = errorMarkers.length > 0 ? errorMarkers : [
    { position: 0.35, label: "Tone 2→4" },
    { position: 0.72, label: "Final -k" },
  ];

  const width = 600;
  const height = 100;

  const handlePlaySegment = useCallback((position: number) => {
    if (!audioUrl) return;
    const audio = audioRef.current || new Audio(audioUrl);
    audioRef.current = audio;
    audio.playbackRate = slowMode ? 0.5 : 1.0;
    const segStart = Math.max(0, position - 0.05);
    const segEnd = Math.min(1, position + 0.05);
    audio.currentTime = segStart * (audio.duration || 1);

    const checkEnd = () => {
      if (audio.currentTime >= segEnd * (audio.duration || 1)) {
        audio.pause();
        setIsPlaying(false);
        audio.removeEventListener("timeupdate", checkEnd);
      }
    };
    audio.addEventListener("timeupdate", checkEnd);
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.play();
    setIsPlaying(true);
  }, [audioUrl, slowMode]);

  const handlePlayAll = () => {
    if (!audioUrl) return;
    const audio = audioRef.current || new Audio(audioUrl);
    audioRef.current = audio;
    audio.playbackRate = slowMode ? 0.5 : 1.0;
    audio.currentTime = 0;

    audio.addEventListener("timeupdate", () => {
      if (audio.duration > 0) setPlaybackPos(audio.currentTime / audio.duration);
    });
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setPlaybackPos(0);
    });

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">
          {isEn ? "Precision Practice" : isTW ? "精確練習" : "精确练习"}
        </h3>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Switch checked={slowMode} onCheckedChange={setSlowMode} />
            <span className="text-muted-foreground font-medium">0.5x {isEn ? "Speed" : "速度"}</span>
          </label>
        </div>
      </div>

      {/* Expanded Waveform */}
      <div className="relative bg-card rounded-2xl border border-border p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          {/* Waveform bars */}
          {data.map((v, i) => {
            const x = (i / data.length) * width;
            const barW = width / data.length * 0.7;
            const barH = v * height * 0.8;
            const isPast = i / data.length <= playbackPos;
            return (
              <rect
                key={i}
                x={x}
                y={(height - barH) / 2}
                width={barW}
                height={barH}
                rx={1}
                fill={isPast ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"}
                className="transition-colors duration-75"
              />
            );
          })}

          {/* Error markers */}
          {markers.map((marker, idx) => {
            const mx = marker.position * width;
            return (
              <g key={idx} className="cursor-pointer" onClick={() => handlePlaySegment(marker.position)}>
                <line x1={mx} y1={0} x2={mx} y2={height} stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="4 2" />
                <circle cx={mx} cy={8} r={6} fill="hsl(var(--destructive))" />
                <text x={mx} y={12} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">!</text>
              </g>
            );
          })}

          {/* Playback position */}
          {isPlaying && (
            <line x1={playbackPos * width} y1={0} x2={playbackPos * width} y2={height} stroke="hsl(var(--primary))" strokeWidth={2} />
          )}
        </svg>

        {/* Marker labels */}
        <div className="flex flex-wrap gap-2 mt-3">
          {markers.map((marker, idx) => (
            <button
              key={idx}
              onClick={() => handlePlaySegment(marker.position)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 border border-destructive/30 rounded-full text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
              aria-label={`Replay error: ${marker.label}${slowMode ? " at 0.5x speed" : ""}`}
            >
              <AlertTriangle className="h-3 w-3" />
              {marker.label}
              {slowMode && <span className="text-[10px] opacity-90">0.5x</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button onClick={handlePlayAll} variant="default" className="gap-2">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? (isEn ? "Pause" : "暫停") : (isEn ? "Play All" : "全部播放")}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => { setPlaybackPos(0); setIsPlaying(false); audioRef.current?.pause(); }}
          aria-label={isEn ? "Reset" : "重置"}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        {slowMode && (
          <span className="text-xs text-muted-foreground">
            {isEn ? "Playing at half speed" : "以半速播放"}
          </span>
        )}
      </div>
    </div>
  );
}
