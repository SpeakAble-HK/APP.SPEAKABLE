import React, { useState } from 'react';
import { AnimatedBubbles } from './AnimatedBubbles';
import { IntroScreen } from './IntroScreen';
import { ChapterCard } from './ChapterCard';
import { SceneIndicator } from './SceneIndicator';
import { CreditsScreen } from './CreditsScreen';
import { AuraVideoPlayer } from './AuraVideoPlayer';
import { VoiceCloningPrompt } from './VoiceCloningPrompt';
import { auraJourneyScenes } from './auraJourneyScenes';
import { useAuraJourneyState } from './useAuraJourneyState';
import { useVoiceCloning } from './useVoiceCloning';

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
  const voice = useVoiceCloning();

  const scene = auraJourneyScenes[currentScene];

  // Handlers
  const handleStart = () => setShowIntro(false);
  const handlePlayPause = () => {};
  const handleEnded = () => setShowVoicePrompt(true);
  const handleNext = () => {
    setShowVoicePrompt(false);
    nextScene();
  };
  const handlePrev = () => prevScene();
  const handleProgress = () => {};

  const handleRecord = async () => {
    await voice.startRecording(scene.voicePrompt, scene.voiceText || scene.title);
    // Wait for audioUrl to be set, then play and continue
    // This is handled by useEffect below
  };

  // When voice.audioUrl is set after recording, play it and continue
  React.useEffect(() => {
    if (voice.audioUrl) {
      recordVoice(currentScene, voice.audioUrl);
      setShowVoicePrompt(false);
      nextScene();
    }
  }, [voice.audioUrl]);

  const handleSkip = () => {
    setShowVoicePrompt(false);
    nextScene();
  };

  const handleReplay = () => {
    setShowCredits(false);
    setShowIntro(true);
    state.setCurrentScene(0);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 overflow-hidden">
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
        playing={!showIntro && !showChapter && !showCredits && !showVoicePrompt}
        onPlayPause={handlePlayPause}
        onEnded={handleEnded}
        onNext={handleNext}
        onPrev={handlePrev}
        onProgress={handleProgress}
      />
      {showVoicePrompt && (
        <VoiceCloningPrompt
          prompt={scene.voicePrompt}
          onRecord={handleRecord}
          onSkip={handleSkip}
          recording={voice.recording}
        />
      )}
      <CreditsScreen visible={showCredits} onReplay={handleReplay} />
    </div>
  );
}
