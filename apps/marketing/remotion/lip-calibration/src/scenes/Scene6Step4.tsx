import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { Chip } from "../components/Chip";
import { ProgressBar } from "../components/ProgressBar";

export default function Scene6Step4({ i18n }: any) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const burst = spring({ frame: f - 180, fps, config: { damping: 12 } });
  const energy = interpolate(f, [0, 200, 600], [0.1, 0.82, 0.82], { extrapolateRight: "clamp" });
  const match  = interpolate(f, [0, 240, 600], [0.4, 0.91, 0.91], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ padding: 60, color: "#E2E8F0" }}>
      <div style={{ fontSize: 54, fontWeight: 800 }}>Step 4 / 4 · 噴氣！</div>
      <div style={{ fontSize: 36, opacity: 0.7, marginTop: 12 }}>雙唇彈開，講出「噴」(pan3)</div>

      {/* particle burst */}
      <div style={{
        position: "absolute", top: 900, left: 540,
        width: 12, height: 12, borderRadius: 6,
        background: "#38BDF8",
        transform: `scale(${1 + burst * 14})`,
        opacity: 1 - burst,
        boxShadow: "0 0 80px 20px rgba(56,189,248,0.6)",
      }}/>

      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
        <Chip tone="pass" label="Lip release: detected ✓" />
        <Chip tone={energy > 0.7 ? "pass" : "calibrate"} label={`Burst energy: ${energy.toFixed(2)}`} />
        <Chip tone="pass" label="Onset latency: 38 ms" />
        <Chip tone={match > 0.85 ? "pass" : "calibrate"} label={`Tone pan3 match: ${match.toFixed(2)}${match > 0.85 ? " ✓" : ""}`} />
      </div>
      <ProgressBar step={4} />
    </AbsoluteFill>
  );
}
