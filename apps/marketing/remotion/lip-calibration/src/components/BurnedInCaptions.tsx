import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

// Minimal SRT parser for static captions
function parseSRT(srt: string) {
  return srt.trim().split(/\n\n+/).map(block => {
    const lines = block.split("\n");
    const idx = lines[0];
    const [start, end] = lines[1].split(" --> ").map(t => t.replace(",","."));
    const text = lines.slice(2).join("\n");
    return { idx, start, end, text };
  });
}

function timeToFrame(time: string, fps: number) {
  const [h, m, s] = time.split(":");
  const [sec, ms] = s.split(".");
  return (
    parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(sec)
  ) * fps + Math.round((parseInt(ms || "0") / 1000) * fps);
}

export const BurnedInCaptions: React.FC<{ srt: string; fps: number; style?: React.CSSProperties }> = ({ srt, fps, style }) => {
  const frame = useCurrentFrame();
  const captions = React.useMemo(() => parseSRT(srt), [srt]);
  const current = captions.find(cap => {
    const start = timeToFrame(cap.start, fps);
    const end = timeToFrame(cap.end, fps);
    return frame >= start && frame < end;
  });
  if (!current) return null;
  return (
    <div style={{
      position: "absolute", bottom: 80, left: 0, width: "100%", textAlign: "center",
      color: "#fff", fontSize: 44, fontWeight: 700, textShadow: "0 2px 8px #000, 0 0 2px #000",
      ...style,
    }}>
      {current.text.split("\n").map((line, i) => <div key={i}>{line}</div>)}
    </div>
  );
};
