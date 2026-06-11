import type {
  SceneMetadata,
  StoryState,
  SceneResult,
  NextSceneDecision,
} from './types';

// Mock Supabase client - replace with actual implementation
const supabase = {
  from: (table: string) => ({
    select: () => ({ data: null, error: null }),
    upsert: (data: any) => ({ data, error: null }),
    insert: (data: any) => ({ data, error: null }),
  }),
};

export async function loadScene(
  storyId: string,
  sceneId: string
): Promise<SceneMetadata | null> {
  // Mock implementation - replace with actual Supabase query
  const mockScene: SceneMetadata = {
    sceneId,
    storyId,
    chapterId: 'ch1',
    order: 1,
    narrativeState: 'opening',
    targetPhoneme: { symbol: '/b/', ipa: 'b', position: 'initial' },
    characterLine: '波波，你好！',
    learnerTask: 'repeat',
    successCondition: { minConfidence: 0.55, maxAttempts: 3 },
    branchingOutcome: {
      onSuccess: 'scene-2',
      onFailure: 'scene-support-1',
    },
    rewardOnComplete: 10,
  };

  return mockScene;
}

export async function completeScene(
  learnerId: string,
  sceneId: string,
  result: SceneResult
): Promise<NextSceneDecision> {
  const scene = await loadScene(result.sceneId, sceneId);

  if (!scene) {
    return {
      nextSceneId: null,
      unlocked: false,
      branchTaken: 'failure',
    };
  }

  const { minConfidence, maxAttempts } = scene.successCondition;
  const { confidenceScore, attempts } = result;

  let branchTaken: 'success' | 'failure' | 'partial';
  let nextSceneId: string;

  if (confidenceScore >= minConfidence) {
    branchTaken = 'success';
    nextSceneId = scene.branchingOutcome.onSuccess;
  } else if (
    confidenceScore >= minConfidence * 0.75 &&
    attempts >= maxAttempts
  ) {
    branchTaken = 'partial';
    nextSceneId = scene.branchingOutcome.onPartial || scene.branchingOutcome.onFailure;
  } else {
    branchTaken = 'failure';
    nextSceneId = scene.branchingOutcome.onFailure;
  }

  // Update learner story state
  const storyState: StoryState = {
    storyId: scene.storyId,
    learnerId,
    currentSceneId: nextSceneId,
    completedScenes: [sceneId],
    phonemeProgress: { [scene.targetPhoneme.symbol]: confidenceScore },
    emotionalState: 'engaged',
    lastUpdated: new Date().toISOString(),
  };

  // Mock upsert to Supabase
  await supabase.from('learner_story_state').upsert(storyState);

  return {
    nextSceneId,
    unlocked: true,
    branchTaken,
  };
}
