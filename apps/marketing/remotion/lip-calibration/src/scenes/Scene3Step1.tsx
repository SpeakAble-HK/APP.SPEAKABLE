import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Chip } from "../components/Chip";
import { ProgressBar } from "../components/ProgressBar";

export default function Scene3Step1({ i18n }: any) {
  const f = useCurrentFrame();
  const closure = Math.round(interpolate(f, [0, 180, 420], [40, 96, 96], { extrapolateRight: "clamp" }));
  const tone = closure < 80 ? "calibrate" : "pass";
  return (
    <AbsoluteFill style={{ padding: 60, color: "#E2E8F0" }}>
      <div style={{ fontSize: 54, fontWeight: 800 }}>Step 1 / 4 · 合埋雙唇</div>
      <div style={{ fontSize: 36, opacity: 0.7, marginTop: 12 }}>輕輕合埋雙唇，好似你要「唔出聲」咁</div>
      <div style={{ marginTop: 40 }}>
        <Chip tone={tone} label={`Lip closure: ${closure}%${tone === "pass" ? " ✓" : ""}`} />
      </div>
      <ProgressBar step={1} />
    </AbsoluteFill>
  );
}
