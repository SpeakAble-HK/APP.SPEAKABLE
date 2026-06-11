import { supabase } from '@/integrations/supabase/client';
import type {
  SceneMetadata,
  SceneResult,
  NextSceneDecision,
} from './types';
import { saveStoryState } from '../api/sessions';
import { insertStoryTelemetry } from '../api/telemetry';

export async function loadScene(
  storyId: string,
  sceneId: string
): Promise<SceneMetadata | null> {
  const { data, error } = await supabase
    .from('story_scenes' as never)
    .select('*')
    .eq('scene_id', sceneId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('loadScene failed:', error.message);
    return null;
  }

  const row = data as Record<string, unknown>;
  return {
    sceneId: String(row.scene_id),
    storyId: String(row.story_id ?? storyId),
    chapterId: String(row.chapter_id),
    order: Number(row.scene_order ?? 0),
    narrativeState: String(row.narrative_state ?? ''),
    targetPhoneme: row.target_phoneme as SceneMetadata['targetPhoneme'],
    characterLine: String(row.character_line ?? ''),
    learnerTask: row.learner_task as SceneMetadata['learnerTask'],
    successCondition: row.success_condition as SceneMetadata['successCondition'],
    branchingOutcome: row.branching_outcome as SceneMetadata['branchingOutcome'],
    unlockCondition: row.unlock_condition ? String(row.unlock_condition) : undefined,
    rewardOnComplete: Number(row.reward_on_complete ?? 0),
  };
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

  await saveStoryState({
    learnerId,
    storyId: scene.storyId,
    currentSceneId: nextSceneId,
    completedScenes: [sceneId],
    phonemeProgress: { [scene.targetPhoneme.symbol]: confidenceScore },
    emotionalState: 'engaged',
  });

  await insertStoryTelemetry({
    learnerId,
    storyId: scene.storyId,
    chapterId: scene.chapterId,
    sceneId,
    completed: branchTaken !== 'failure',
    attempts,
    phonemeSymbol: scene.targetPhoneme.symbol,
    confidenceScore,
    branchTaken,
    timeOnSceneMs: result.timeOnSceneMs,
  });

  return {
    nextSceneId,
    unlocked: true,
    branchTaken,
  };
}
