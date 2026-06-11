import { useEffect, useRef, useState } from "react";

interface ToneContourVisualizerProps {
  isRecording: boolean;
  audioStream?: MediaStream | null;
  referenceContour?: number[];
  className?: string;
}

export function ToneContourVisualizer({ isRecording, audioStream, referenceContour, className = "" }: ToneContourVisualizerProps) {
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [pitchData, setPitchData] = useState<number[]>(new Array(80).fill(0.5));

  useEffect(() => {
    if (!audioStream || !isRecording) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Float32Array(analyser.fftSize);

    const detectPitch = (): number => {
      analyser.getFloatTimeDomainData(dataArray);
      // Simple autocorrelation-based pitch detection
      let maxCorr = 0;
      let bestLag = 0;
      const sampleRate = audioContext.sampleRate;
      const minLag = Math.floor(sampleRate / 500); // 500Hz max
      const maxLag = Math.floor(sampleRate / 80);  // 80Hz min

      for (let lag = minLag; lag < maxLag && lag < dataArray.length / 2; lag++) {
        let corr = 0;
        for (let i = 0; i < dataArray.length / 2; i++) {
          corr += dataArray[i] * dataArray[i + lag];
        }
        if (corr > maxCorr) {
          maxCorr = corr;
          bestLag = lag;
        }
      }
      if (bestLag === 0 || maxCorr < 0.01) return 0;
      return sampleRate / bestLag;
    };

    const draw = () => {
      const hz = detectPitch();
      // Normalize to 0-1 range (80-500Hz mapped)
      const normalized = hz > 0 ? Math.min(1, Math.max(0, (hz - 80) / 420)) : 0.5;
      setPitchData(prev => [...prev.slice(1), normalized]);
      animationRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [audioStream, isRecording]);

  const refData = referenceContour || new Array(80).fill(0).map((_, i) =>
    0.5 + 0.15 * Math.sin(i * 0.08) + 0.05 * Math.cos(i * 0.15)
  );

  const width = 500;
  const height = 160;
  const padding = 20;

  const toSmoothPath = (data: number[]) => {
    const points = data.map((v, i) => ({
      x: padding + (i / (data.length - 1)) * (width - padding * 2),
      y: height - padding - v * (height - padding * 2),
    }));

    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const userPath = toSmoothPath(pitchData);
  const refPath = toSmoothPath(refData);

  // Hz labels
  const hzLabels = [500, 350, 200, 80];

  return (
    <div className={`relative ${className}`} role="img" aria-label="Tone contour pitch visualization">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Tone Contour (Hz)
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Hz grid lines */}
        {hzLabels.map((hz, i) => {
          const y = padding + (i / (hzLabels.length - 1)) * (height - padding * 2);
          return (
            <g key={hz}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} />
              <text x={padding - 4} y={y + 3} textAnchor="end" className="fill-muted-foreground" fontSize={9}>{hz}</text>
            </g>
          );
        })}

        {/* Reference contour */}
        <path d={refPath} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.5} />

        {/* User pitch contour */}
        <path
          d={userPath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          className="transition-all"
          style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.4))" }}
        />
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-primary rounded" />
          <span className="text-muted-foreground">Your pitch</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 border-t border-dashed border-muted-foreground" />
          <span className="text-muted-foreground">Reference</span>
        </div>
      </div>
    </div>
  );
}
