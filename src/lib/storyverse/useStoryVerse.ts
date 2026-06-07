/**
 * StoryVerse — React Hook
 *
 * Wraps StoryEngine for use in React components.
 * Manages state, scene transitions, mission evaluation, and progress persistence.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  StoryWorld,
  StoryScene,
  StoryChapter,
  StoryProgress,
  MissionAttempt,
  MissionResult,
  StoryDifficulty,
  StoryEvent,
  SceneId,
  AdaptiveStoryConfig,
} from "@/types/storyverse";
import type { UtteranceAnalysis } from "@/types/utteranceAnalysis";
import { StoryEngine } from "./StoryEngine";

// ─── Hook State ──────────────────────────────────────────────────────────────

export interface UseStoryVerseState {
  world: StoryWorld | null;
  currentScene: StoryScene | null;
  currentChapter: StoryChapter | null;
  progress: StoryProgress | null;
  difficulty: StoryDifficulty;
  isLoading: boolean;
  error: string | null;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  events: StoryEvent[];
}

export interface UseStoryVerseActions {
  loadWorld: (world: StoryWorld, initialProgress?: StoryProgress) => void;
  enterScene: (sceneId: SceneId) => StoryScene | undefined;
  navigateToScene: (sceneId: SceneId) => StoryScene | undefined;
  getNextScene: () => StoryScene | undefined;
  evaluateAndSubmit: (analysis: UtteranceAnalysis) => {
    result: MissionResult;
    nextSceneId?: SceneId;
    rewardsEarned?: StoryScene["reward"];
  } | null;
  checkChapterComplete: () => boolean;
  checkWorldComplete: () => boolean;
  resetProgress: () => void;
}

export interface UseStoryVerseReturn extends UseStoryVerseState, UseStoryVerseActions {}

// ─── Hook Implementation ─────────────────────────────────────────────────────

export function useStoryVerse(): UseStoryVerseReturn {
  const engineRef = useRef<StoryEngine | null>(null);

  const [world, setWorld] = useState<StoryWorld | null>(null);
  const [currentScene, setCurrentScene] = useState<StoryScene | null>(null);
  const [currentChapter, setCurrentChapter] = useState<StoryChapter | null>(null);
  const [progress, setProgress] = useState<StoryProgress | null>(null);
  const [difficulty, setDifficulty] = useState<StoryDifficulty>("easy");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consecutiveSuccesses, setConsecutiveSuccesses] = useState(0);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [events, setEvents] = useState<StoryEvent[]>([]);

  const syncState = useCallback(() => {
    if (!engineRef.current) return;
    const state = engineRef.current.getState();
    setProgress(engineRef.current.getProgress());
    setDifficulty(state.currentDifficulty);
    setConsecutiveSuccesses(state.consecutiveSuccesses);
    setConsecutiveFailures(state.consecutiveFailures);
    setEvents(engineRef.current.getEvents());

    const scene = engineRef.current.getCurrentScene();
    const chapter = engineRef.current.getCurrentChapter();
    setCurrentScene(scene || null);
    setCurrentChapter(chapter || null);
  }, []);

  const loadWorld = useCallback((worldData: StoryWorld, initialProgress?: StoryProgress) => {
    setIsLoading(true);
    setError(null);
    try {
      engineRef.current = new StoryEngine(worldData, initialProgress);
      setWorld(worldData);
      syncState();

      const scene = engineRef.current.getCurrentScene();
      if (scene) {
        engineRef.current.enterScene(scene.id);
        syncState();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load story world");
    } finally {
      setIsLoading(false);
    }
  }, [syncState]);

  const enterScene = useCallback((sceneId: SceneId): StoryScene | undefined => {
    if (!engineRef.current) return undefined;
    const scene = engineRef.current.enterScene(sceneId);
    syncState();
    return scene;
  }, [syncState]);

  const navigateToScene = useCallback((sceneId: SceneId): StoryScene | undefined => {
    if (!engineRef.current) return undefined;
    const scene = engineRef.current.navigateToScene(sceneId);
    syncState();
    return scene;
  }, [syncState]);

  const getNextScene = useCallback((): StoryScene | undefined => {
    if (!engineRef.current) return undefined;
    return engineRef.current.getNextScene();
  }, []);

  const evaluateAndSubmit = useCallback((analysis: UtteranceAnalysis) => {
    if (!engineRef.current) return null;

    const scene = engineRef.current.getCurrentScene();
    if (!scene?.mission) return null;

    const criteria = scene.mission.success_criteria;
    const result = engineRef.current.evaluateMission(analysis, criteria);

    const attempt: MissionAttempt = {
      attempt_id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mission_id: scene.mission.id,
      timestamp: new Date().toISOString(),
      analysis,
      result,
      scores: {
        overall: analysis.scores.overall,
        tone_accuracy: analysis.scores.tone_accuracy,
        articulation: analysis.scores.articulation,
        smoothness: analysis.scores.smoothness,
      },
      errors: analysis.errors.map((e) => ({
        category: e.category,
        phoneme: e.phoneme?.symbol,
        suggestion: e.suggestion,
      })),
      duration_ms: analysis.input.audio_duration_ms,
    };

    const submission = engineRef.current.submitMissionAttempt(attempt);
    syncState();

    return {
      result: submission.result,
      nextSceneId: submission.nextSceneId,
      rewardsEarned: submission.rewardsEarned,
    };
  }, [syncState]);

  const checkChapterComplete = useCallback((): boolean => {
    if (!engineRef.current || !currentChapter) return false;
    const complete = engineRef.current.checkChapterCompletion(currentChapter.id);
    syncState();
    return complete;
  }, [currentChapter, syncState]);

  const checkWorldComplete = useCallback((): boolean => {
    if (!engineRef.current) return false;
    const complete = engineRef.current.checkWorldCompletion();
    syncState();
    return complete;
  }, [syncState]);

  const resetProgress = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.resetProgress();
    syncState();
  }, [syncState]);

  return {
    world,
    currentScene,
    currentChapter,
    progress,
    difficulty,
    isLoading,
    error,
    consecutiveSuccesses,
    consecutiveFailures,
    events,
    loadWorld,
    enterScene,
    navigateToScene,
    getNextScene,
    evaluateAndSubmit,
    checkChapterComplete,
    checkWorldComplete,
    resetProgress,
  };
}
