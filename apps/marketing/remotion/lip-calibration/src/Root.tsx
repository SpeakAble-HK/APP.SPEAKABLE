import { Composition } from "remotion";
import { LipCalibration } from "./LipCalibration";
import { LipCalibrationWithCaptions } from "./LipCalibrationWithCaptions";
import zhHK from "../../../../apps/speakable-web/i18n/zh-HK.json";

export const Root: React.FC = () => {
  const FPS = 60;
  return (
    <>
      {/* 9:16 default */}
      <Composition
        id="LipCalibration"
        component={LipCalibration}
        durationInFrames={60 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ duration: 60, i18n: zhHK }}
      />
      {/* 9:16 with captions */}
      <Composition
        id="LipCalibrationWithCaptions_9x16"
        component={LipCalibrationWithCaptions}
        durationInFrames={60 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ duration: 60, i18n: zhHK, width: 1080, height: 1920 }}
      />
      {/* 1:1 square */}
      <Composition
        id="LipCalibrationWithCaptions_1x1"
        component={LipCalibrationWithCaptions}
        durationInFrames={60 * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ duration: 60, i18n: zhHK, width: 1080, height: 1080 }}
      />
      {/* 16:9 landscape */}
      <Composition
        id="LipCalibrationWithCaptions_16x9"
        component={LipCalibrationWithCaptions}
        durationInFrames={60 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ duration: 60, i18n: zhHK, width: 1920, height: 1080 }}
      />
    </>
  );
};
