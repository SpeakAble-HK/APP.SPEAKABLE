import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Chip } from "../components/Chip";
import { ProgressBar } from "../components/ProgressBar";

export default function Scene5Step3({ i18n }: any) {
  const f = useCurrentFrame();
  const dist = Math.round(interpolate(f, [0, 240, 600], [22, 12, 12], { extrapolateRight: "clamp" }));
  const ok = dist >= 10 && dist <= 15;
  return (
    <AbsoluteFill style={{ padding: 60, color: "#E2E8F0" }}>
      <div style={{ fontSize: 54, fontWeight: 800 }}>Step 3 / 4 · 對準麥克風</div>
      <div style={{ fontSize: 36, opacity: 0.7, marginTop: 12 }}>距離大約 10–15 cm（一隻手掌）</div>
      <div style={{ marginTop: 40, display: "flex", gap: 16 }}>
        <Chip tone={ok ? "pass" : "calibrate"} label={`Mic distance: ${dist} cm${ok ? " ✓" : ""}`} />
        <Chip tone="pass" label="Noise floor: -54 dB ✓" />
      </div>
      <ProgressBar step={3} />
    </AbsoluteFill>
  );
}
