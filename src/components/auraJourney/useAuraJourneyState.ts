import { useState } from 'react';
import { auraJourneyScenes } from './auraJourneyScenes';

export function useAuraJourneyState() {
  const [currentScene, setCurrentScene] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [showChapter, setShowChapter] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [voiceData, setVoiceData] = useState<Record<number, string>>({});

  function nextScene() {
    if (currentScene < auraJourneyScenes.length - 1) {
      setCurrentScene(currentScene + 1);
      setShowChapter(true);
    } else {
      setShowCredits(true);
    }
  }

  function prevScene() {
    if (currentScene > 0) {
      setCurrentScene(currentScene - 1);
      setShowChapter(true);
    }
  }

  function recordVoice(sceneIdx: number, url: string) {
    setVoiceData((prev) => ({ ...prev, [sceneIdx]: url }));
  }

  return {
    currentScene,
    setCurrentScene,
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
  };
}
