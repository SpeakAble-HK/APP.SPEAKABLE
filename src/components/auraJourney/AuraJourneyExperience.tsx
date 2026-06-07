import React, { useState } from "react";
import { AnimatedBubbles } from "./AnimatedBubbles";
import { IntroScreen } from "./IntroScreen";
import { ChapterCard } from "./ChapterCard";
import { SceneIndicator } from "./SceneIndicator";
import { CreditsScreen } from "./CreditsScreen";
import { AuraVideoPlayer } from "./AuraVideoPlayer";
import { VoiceCloningPrompt } from "./VoiceCloningPrompt";
import { auraJourneyScenes } from "./auraJourneyScenes";
import { useAuraJourneyState } from "./useAuraJourneyState";
import { useVoiceCloning } from "./useVoiceCloning";

export const AuraJourneyExperience: React.FC = () => {
  const state = useAuraJourneyState();
  const {
    currentScene,
    showIntro,
    setShowIntro,
    showChapter,
    setShowChapter,
    showCredits,
    setShowCredits,
    nextScene,
    prevScene,
    voiceData,
    recordVoice,
  } = state;
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);
  const [paused, setPaused] = useState(false);
  const voice = useVoiceCloning();
  const { audioUrl, reset: resetVoice } = voice;

  const scene = auraJourneyScenes[currentScene];

  React.useEffect(() => {
    if (!showChapter) return;
    const timer = window.setTimeout(() => setShowChapter(false), 1400);
    return () => window.clearTimeout(timer);
  }, [showChapter, setShowChapter]);

  const handleStart = () => {
    setShowIntro(false);
    setShowChapter(true);
    setPaused(false);
  };
  const handlePlayPause = () => setPaused((value) => !value);
  const handleEnded = () => {
    setPaused(false);
    setShowVoicePrompt(true);
  };
  const handleNext = () => {
    setShowVoicePrompt(false);
    setPaused(false);
    nextScene();
  };
  const handlePrev = () => {
    setShowVoicePrompt(false);
    setPaused(false);
    prevScene();
  };
  const handleProgress = () => {};

  const handleRecord = async () => {
    await voice.startRecording(scene.voicePrompt, scene.voiceText || scene.title);
  };

  React.useEffect(() => {
    if (audioUrl) {
      recordVoice(currentScene, audioUrl);
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        resetVoice();
        setShowVoicePrompt(false);
        nextScene();
      };
      audio.play().catch(() => {
        resetVoice();
        setShowVoicePrompt(false);
        nextScene();
      });
    }
  }, [audioUrl, currentScene, nextScene, recordVoice, resetVoice]);

  const handleSkip = () => {
    setShowVoicePrompt(false);
    setPaused(false);
    nextScene();
  };

  const handleReplay = () => {
    setShowCredits(false);
    setShowIntro(true);
    setPaused(false);
    state.setCurrentScene(0);
  };

  return (
    <div className="relative h-full min-h-screen w-full overflow-hidden bg-slate-950">
      <AnimatedBubbles />
      {showIntro && <IntroScreen onStart={handleStart} />}
      <ChapterCard
        chapter={scene.chapter}
        title={scene.title}
        subtitle={scene.subtitle}
        visible={showChapter}
      />
      <SceneIndicator title={scene.title} visible={!showIntro && !showChapter && !showCredits} />
      <AuraVideoPlayer
        src={scene.video}
        chapter={scene.chapter}
        title={scene.title}
        cinematicPrompt={scene.cinematicPrompt}
        therapistGoal={scene.therapistGoal}
        playing={!showIntro && !showChapter && !showCredits && !showVoicePrompt && !paused}
        onPlayPause={handlePlayPause}
        onEnded={handleEnded}
        onNext={handleNext}
        onPrev={handlePrev}
        onProgress={handleProgress}
      />
      {showVoicePrompt && (
        <VoiceCloningPrompt
          prompt={scene.voicePrompt}
          targetText={scene.voiceText}
          onRecord={handleRecord}
          onSkip={handleSkip}
          recording={voice.recording}
        />
      )}
      <CreditsScreen visible={showCredits} onReplay={handleReplay} />
    </div>
  );
}
