import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";

export default function Scene8CTA({ i18n }: any) {
  const f = useCurrentFrame();
  const pulse = 1 + Math.sin(f / 8) * 0.03;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("screens/home_speakable_hk.png")}
           style={{ width: 900, borderRadius: 36, transform: `scale(${pulse})` }}/>
      <div style={{ position: "absolute", bottom: 200, color: "#E2E8F0", fontSize: 44, fontWeight: 800 }}>
        SpeakAble HK · 用 AI 練好你把口
      </div>
    </AbsoluteFill>
  );
}
