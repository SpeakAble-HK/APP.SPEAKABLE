import React, { useState } from "react";
import { AnimatedBubbles } from "./AnimatedBubbles";
import { IntroScreen } from "./IntroScreen";
import { ChapterCard } from "./ChapterCard";
import { SceneIndicator } from "./SceneIndicator";
import { CreditsScreen } from "./CreditsScreen";
import { AuraVideoPlayer } from "./AuraVideoPlayer";
import { VoiceCloningPrompt } from "./VoiceCloningPrompt";
import { MyVoiceStory } from "./MyVoiceStory";
import { auraJourneyScenes } from "./auraJourneyScenes";
import { useAuraJourneyState } from "./useAuraJourneyState";
import { useVoiceCloning } from "./useVoiceCloning";
import { recordJourneyEvidence } from "../../lib/journeyEvidence";

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
  // When set, the current scene is being replayed MUTED with the child's cloned
  // voice overlaid (the story re-told in the child's own voice). It holds the
  // cloned-audio URL to overlay; null means normal playback.
  const [replayOverlayUrl, setReplayOverlayUrl] = useState<string | null>(null);
  // The stitched end-of-journey "My Voice Story" replay.
  const [showVoiceStory, setShowVoiceStory] = useState(false);
  const voice = useVoiceCloning();
  const { audioUrl, reset: resetVoice, recording, processing, duration, cloneResult, error } = voice;

  const scene = auraJourneyScenes[currentScene];
  const voiceReplaced = replayOverlayUrl != null;

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

  // Video reached its end.
  const handleEnded = () => {
    setPaused(false);
    // If we were replaying the scene in the cloned voice, the retelling is done —
    // advance to the next chapter.
    if (voiceReplaced) {
      setReplayOverlayUrl(null);
      nextScene();
      return;
    }
    // Otherwise prompt the child to lend their voice to this chapter.
    setShowVoicePrompt(true);
  };

  const handleNext = () => {
    setShowVoicePrompt(false);
    setReplayOverlayUrl(null);
    setPaused(false);
    nextScene();
  };
  const handlePrev = () => {
    setShowVoicePrompt(false);
    setReplayOverlayUrl(null);
    setPaused(false);
    prevScene();
  };
  const handleProgress = () => {};

  const handleRecord = async () => {
    await voice.startRecording();
  };

  const handleStop = () => {
    voice.stopRecording();
  };

  const handlePlay = () => {
    voice.playGeneratedAudio();
  };

  // A clone was produced for the current scene. Store it, dismiss the prompt, and
  // replay THIS scene's video muted with the cloned voice overlaid so the child
  // immediately hears the story retold in their own voice. handleEnded then
  // advances once the replay finishes (graceful fallback: if the overlay audio
  // cannot play we still rely on the video's onEnded to move on).
  React.useEffect(() => {
    if (!audioUrl) return;
    recordVoice(currentScene, audioUrl);
    // Adaptation engine: a produced clone = strong engagement with this chapter's
    // therapy target. Feed it to the narrative rubric (keyed by adaptationKey).
    void recordJourneyEvidence({
      adaptationKey: auraJourneyScenes[currentScene].adaptationKey,
      signal: 0.9,
      sceneIndex: currentScene,
    });
    setShowVoicePrompt(false);
    setReplayOverlayUrl(audioUrl);
    setPaused(false);
    resetVoice();
  }, [audioUrl, currentScene, recordVoice, resetVoice]);

  const handleSkip = () => {
    // Skipping the voice task = weak engagement signal for this chapter's target.
    void recordJourneyEvidence({
      adaptationKey: auraJourneyScenes[currentScene].adaptationKey,
      signal: 0.3,
      sceneIndex: currentScene,
    });
    setShowVoicePrompt(false);
    setReplayOverlayUrl(null);
    setPaused(false);
    nextScene();
  };

  const handleReplay = () => {
    setShowCredits(false);
    setShowVoiceStory(false);
    setShowIntro(true);
    setPaused(false);
    setReplayOverlayUrl(null);
    state.setCurrentScene(0);
  };

  const hasVoiceStory = Object.keys(voiceData).length > 0;

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
        key={`${currentScene}-${voiceReplaced ? "voice" : "orig"}`}
        src={scene.video}
        chapter={scene.chapter}
        title={scene.title}
        cinematicPrompt={scene.cinematicPrompt}
        therapistGoal={scene.therapistGoal}
        playing={!showIntro && !showChapter && !showCredits && !showVoicePrompt && !showVoiceStory && !paused}
        muted={voiceReplaced}
        audioOverlayUrl={replayOverlayUrl}
        voiceReplaced={voiceReplaced}
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
          onStop={handleStop}
          onSkip={handleSkip}
          onReset={voice.reset}
          onPlay={handlePlay}
          recording={recording}
          processing={processing}
          duration={duration}
          cloneResult={cloneResult}
          audioUrl={audioUrl}
          error={error}
        />
      )}
      <CreditsScreen
        visible={showCredits}
        onReplay={handleReplay}
        hasVoiceStory={hasVoiceStory}
        onViewVoiceStory={() => setShowVoiceStory(true)}
      />
      {showVoiceStory && (
        <MyVoiceStory
          voiceData={voiceData}
          onClose={() => setShowVoiceStory(false)}
          onReplayJourney={handleReplay}
        />
      )}
    </div>
  );
};
