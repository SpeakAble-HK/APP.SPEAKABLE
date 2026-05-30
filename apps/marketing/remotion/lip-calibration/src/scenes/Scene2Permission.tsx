import { AbsoluteFill } from "remotion";
import { Chip } from "../components/Chip";
import { Lottie } from "@remotion/lottie";
import { staticFile } from "remotion";
import faceMesh from "../../public/lottie/face_mesh_calibrate.json";

export default function Scene2Permission({ i18n }: any) {
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Lottie animationData={faceMesh} style={{ width: 900, height: 1200 }} />
      <div style={{ position: "absolute", top: 80, left: 60 }}>
        <Chip tone="detect" label="AI: cantonese-hk · lip-detect v2.3" />
      </div>
      <div style={{ position: "absolute", bottom: 160, color: "#E2E8F0", fontSize: 44, fontWeight: 700 }}>
        請望住鏡頭，等我哋睇下你嘅嘴形
      </div>
    </AbsoluteFill>
  );
}
