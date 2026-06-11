import { useCallback, useState } from "react";
import { auraJourneyScenes } from "./auraJourneyScenes";

export function useAuraJourneyState() {
  const [currentScene, setCurrentScene] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [showChapter, setShowChapter] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [voiceData, setVoiceData] = useState<Record<number, string>>({});

  const nextScene = useCallback(() => {
    setCurrentScene((scene) => {
      if (scene < auraJourneyScenes.length - 1) {
        setShowChapter(true);
        return scene + 1;
      }

      setShowCredits(true);
      return scene;
    });
  }, []);

  const prevScene = useCallback(() => {
    setCurrentScene((scene) => {
      if (scene > 0) {
        setShowChapter(true);
        return scene - 1;
      }

      return scene;
    });
  }, []);

  const recordVoice = useCallback((sceneIdx: number, url: string) => {
    setVoiceData((prev) => ({ ...prev, [sceneIdx]: url }));
  }, []);

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
