import type { PhonemeTarget } from '../minigame-sdk/types';

export interface SceneMetadata {
  sceneId: string;
  storyId: string;
  chapterId: string;
  order: number;
  narrativeState: string;
  targetPhoneme: PhonemeTarget;
  characterLine: string;
  learnerTask: 'listen' | 'repeat' | 'fill-gap' | 'choose';
  successCondition: {
    minConfidence: number;
    maxAttempts: number;
  };
  branchingOutcome: {
    onSuccess: string;
    onFailure: string;
    onPartial?: string;
  };
  unlockCondition?: string;
  rewardOnComplete: number;
}

export interface StoryState {
  storyId: string;
  learnerId: string;
  currentSceneId: string;
  completedScenes: string[];
  phonemeProgress: Record<string, number>;
  emotionalState: 'engaged' | 'frustrated' | 'proud' | 'neutral';
  lastUpdated: string;
}

export interface SceneResult {
  sceneId: string;
  learnerId: string;
  attempts: number;
  confidenceScore: number;
  branchTaken: 'success' | 'failure' | 'partial';
  timeOnSceneMs: number;
}

export interface NextSceneDecision {
  nextSceneId: string | null;
  unlocked: boolean;
  branchTaken: 'success' | 'failure' | 'partial';
}
