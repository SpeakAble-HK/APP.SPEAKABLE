import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import Scene1Hook from "./scenes/Scene1Hook";
import Scene2Permission from "./scenes/Scene2Permission";
import Scene3Step1 from "./scenes/Scene3Step1";
import Scene4Step2 from "./scenes/Scene4Step2";
import Scene5Step3 from "./scenes/Scene5Step3";
import Scene6Step4 from "./scenes/Scene6Step4";
import Scene7Complete from "./scenes/Scene7Complete";
import Scene8CTA from "./scenes/Scene8CTA";

const FPS = 60;
const s = (sec: number) => Math.round(sec * FPS);

export const LipCalibration: React.FC<{ duration: number; i18n: any }> = ({ i18n }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1220", fontFamily: "Noto Sans HK" }}>
      <Audio src={staticFile("audio/vo_zh-HK_calibration.mp3")} />
      <Sequence from={s(0)}  durationInFrames={s(5)}>  <Scene1Hook i18n={i18n} /></Sequence>
      <Sequence from={s(5)}  durationInFrames={s(5)}>  <Scene2Permission i18n={i18n} /></Sequence>
      <Sequence from={s(10)} durationInFrames={s(10)}> <Scene3Step1 i18n={i18n} /></Sequence>
      <Sequence from={s(20)} durationInFrames={s(10)}> <Scene4Step2 i18n={i18n} /></Sequence>
      <Sequence from={s(30)} durationInFrames={s(10)}> <Scene5Step3 i18n={i18n} /></Sequence>
      <Sequence from={s(40)} durationInFrames={s(10)}> <Scene6Step4 i18n={i18n} /></Sequence>
      <Sequence from={s(50)} durationInFrames={s(7)}>  <Scene7Complete i18n={i18n} /></Sequence>
      <Sequence from={s(57)} durationInFrames={s(3)}>  <Scene8CTA i18n={i18n} /></Sequence>
    </AbsoluteFill>
  );
};
