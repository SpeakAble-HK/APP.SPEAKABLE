import { useEffect, useRef, useState } from "react";

interface WaveformVisualizerProps {
  isRecording: boolean;
  audioStream?: MediaStream | null;
  referenceWaveform?: number[];
  accuracy?: number | null;
  className?: string;
}

export function WaveformVisualizer({ isRecording, audioStream, referenceWaveform, accuracy, className = "" }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [userWaveform, setUserWaveform] = useState<number[]>(new Array(64).fill(0));

  useEffect(() => {
    if (!audioStream || !isRecording) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      const normalized = Array.from(dataArray).map(v => v / 255);
      setUserWaveform(normalized);
      animationRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [audioStream, isRecording]);

  // Generate reference waveform data if not provided
  const refData = referenceWaveform || new Array(64).fill(0).map((_, i) => 
    0.3 + 0.2 * Math.sin(i * 0.3) + 0.1 * Math.sin(i * 0.7)
  );

  const width = 400;
  const height = 120;
  const points = userWaveform.length;

  const toPath = (data: number[], maxHeight: number) => {
    return data.map((v, i) => {
      const x = (i / (points - 1)) * width;
      const y = height / 2 - v * maxHeight;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const userPath = toPath(userWaveform, height * 0.4);
  const refPath = toPath(refData, height * 0.35);

  return (
    <div className={`relative ${className}`} role="img" aria-label="Voice waveform visualization">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(r => (
          <line key={r} x1={0} y1={height * r} x2={width} y2={height * r} stroke="hsl(0 0% 15%)" strokeWidth={0.5} />
        ))}

        {/* Reference waveform */}
        <path d={refPath} className="waveform-line-reference" />

        {/* User waveform — neon cyan */}
        <path d={userPath} className="waveform-line-user" />
      </svg>

      {/* Accuracy indicator */}
      {accuracy !== null && accuracy !== undefined && (
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${accuracy >= 70 ? 'bg-green-500 shadow-[0_0_8px_hsl(142_70%_45%/0.6)]' : 'bg-red-500 shadow-[0_0_8px_hsl(0_72%_51%/0.6)]'}`} />
          <span className={`text-sm font-bold font-mono ${accuracy >= 70 ? 'accuracy-good' : 'accuracy-bad'}`}>
            {Math.round(accuracy)}%
          </span>
        </div>
      )}

      {/* Labels */}
      <div className="flex items-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-[hsl(185_100%_50%)] rounded shadow-[0_0_4px_hsl(185_100%_50%/0.6)]" />
          <span className="text-muted-foreground">Your voice</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 border-t border-dashed border-[hsl(0_0%_40%)]" />
          <span className="text-muted-foreground">Reference</span>
        </div>
      </div>
    </div>
  );
}
