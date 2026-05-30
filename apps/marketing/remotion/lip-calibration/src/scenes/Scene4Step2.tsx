import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Chip } from "../components/Chip";
import { ProgressBar } from "../components/ProgressBar";

export default function Scene4Step2({ i18n }: any) {
  const f = useCurrentFrame();
  const inf = interpolate(f, [0, 240, 600], [0.41, 0.78, 0.78], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ padding: 60, color: "#E2E8F0" }}>
      <div style={{ fontSize: 54, fontWeight: 800 }}>Step 2 / 4 · 鼓起兩腮</div>
      <div style={{ fontSize: 36, opacity: 0.7, marginTop: 12 }}>儲住啖氣，好似含住空氣</div>
      <div style={{ marginTop: 40 }}>
        <Chip tone={inf < 0.7 ? "calibrate" : "pass"} label={`Cheek inflation: ${inf.toFixed(2)}${inf >= 0.7 ? " ✓" : ""}`} />
      </div>
      <ProgressBar step={2} />
    </AbsoluteFill>
  );
}
