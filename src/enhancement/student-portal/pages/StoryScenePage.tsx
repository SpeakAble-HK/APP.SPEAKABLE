import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PortalShell from "@/shared/components/PortalShell";
import { ScenePlayer } from "../components/ScenePlayer";
import { StoryProgress } from "../components/StoryProgress";
import { CHAPTER_CONFIGS } from "@/lib/story-engine/narrative-grammar";
import type { SceneMetadata, StoryState } from "@/lib/story-engine/types";
import { useAuth } from "@/shared/hooks/useAuth";
import { saveStoryState } from "@/lib/api/sessions";
import { insertStoryTelemetry } from "@/lib/api/telemetry";

const STORY_ID = "aura-journey";

// Builds a guided scene for a chapter from CHAPTER_CONFIGS. When authored
// scenes land in the story_scenes table the runtime can swap this for loadScene.
function buildScene(chapterId: string): SceneMetadata {
  const chapter =
    CHAPTER_CONFIGS.find((c) => c.chapterId === chapterId) ?? CHAPTER_CONFIGS[0];
  const phoneme = chapter.targetPhonemeFamily[0] ?? "/b/";
  return {
    sceneId: `${chapterId}-scene-1`,
    storyId: STORY_ID,
    chapterId: chapter.chapterId,
    order: 1,
    narrativeState: "opening",
    targetPhoneme: { symbol: phoneme, ipa: phoneme.replace(/\//g, ""), position: "initial" },
    characterLine: "波波，你好！一齊練習呢個音啦。",
    learnerTask: "repeat",
    successCondition: { minConfidence: 0.55, maxAttempts: 3 },
    branchingOutcome: { onSuccess: "scene-2", onFailure: "scene-support-1" },
    rewardOnComplete: chapter.estimatedMinutes,
  };
}

export default function StoryScenePage() {
  const { chapterId = "ch1" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const startedAt = useMemo(() => Date.now(), []);
  const scene = useMemo(() => buildScene(chapterId), [chapterId]);
  const [completed, setCompleted] = useState(false);

  const storyState: StoryState = {
    storyId: STORY_ID,
    learnerId: user?.id ?? "",
    currentSceneId: scene.sceneId,
    completedScenes: completed ? [scene.sceneId] : [],
    phonemeProgress: {},
    emotionalState: "engaged",
    lastUpdated: new Date().toISOString(),
  };

  const handleComplete = async (branch: "success" | "failure" | "partial") => {
    const learnerId = user?.id ?? "";
    const confidence = branch === "success" ? 0.85 : branch === "partial" ? 0.6 : 0.3;
    await saveStoryState({
      learnerId,
      storyId: STORY_ID,
      currentSceneId: scene.branchingOutcome.onSuccess,
      completedScenes: [scene.sceneId],
      phonemeProgress: { [scene.targetPhoneme.symbol]: confidence },
      emotionalState: "engaged",
    });
    await insertStoryTelemetry({
      learnerId,
      storyId: STORY_ID,
      chapterId: scene.chapterId,
      sceneId: scene.sceneId,
      completed: branch !== "failure",
      attempts: 1,
      phonemeSymbol: scene.targetPhoneme.symbol,
      confidenceScore: confidence,
      branchTaken: branch,
      timeOnSceneMs: Date.now() - startedAt,
    });
    setCompleted(true);
  };

  return (
    <PortalShell width="default" hasBottomNav>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Aura Journey · {scene.chapterId}</h1>
        <button
          onClick={() => navigate("/stories")}
          className="text-sm text-on-surface-variant hover:text-primary"
        >
          ← Stories
        </button>
      </div>

      {completed ? (
        <StoryProgress
          storyState={storyState}
          totalScenes={1}
          onContinue={() => navigate("/stories")}
        />
      ) : (
        <ScenePlayer
          scene={scene}
          onComplete={handleComplete}
          onSkip={() => navigate("/stories")}
        />
      )}
    </PortalShell>
  );
}
