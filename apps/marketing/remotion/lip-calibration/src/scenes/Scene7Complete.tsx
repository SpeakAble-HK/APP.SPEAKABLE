import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Chip } from "../components/Chip";

export default function Scene7Complete({ i18n }: any) {
  const f = useCurrentFrame();
  const xp = Math.round(interpolate(f, [0, 120], [0, 10], { extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", color: "#E2E8F0" }}>
      <div style={{ fontSize: 72, fontWeight: 900, color: "#22C55E" }}>校準完成 ✓</div>
      <div style={{ marginTop: 24, fontSize: 40 }}>今日任務：1 / 5 ⭐ · +{xp} XP</div>
      <div style={{ marginTop: 32 }}>
        <Chip tone="pass" label="Calibration saved · profile: user_8421" />
      </div>
    </AbsoluteFill>
  );
}
