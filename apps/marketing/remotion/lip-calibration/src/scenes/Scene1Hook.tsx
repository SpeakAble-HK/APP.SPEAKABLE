import { AbsoluteFill, Img, staticFile, spring, useCurrentFrame, useVideoConfig } from "remotion";

export default function Scene1Hook({ i18n }: any) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("screens/home_speakable_hk.png")}
           style={{ width: 900, transform: `scale(${0.95 + scale * 0.05})`, borderRadius: 36 }}/>
      <div style={{ position: "absolute", bottom: 220, color: "#E2E8F0", fontSize: 40, fontWeight: 700 }}>
        Step 0 / 4 · 準備校準你嘅嘴唇
      </div>
    </AbsoluteFill>
  );
}
