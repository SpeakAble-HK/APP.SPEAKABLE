import type { UnifiedEvent } from '../minigame-sdk/types';

export interface UnifiedTelemetryProps {
  context: 'game' | 'story';
  contextId: string;
  learnerId: string;
  onEvent?: (event: UnifiedEvent) => void;
}

export function useUnifiedTelemetry({
  context,
  contextId,
  learnerId,
  onEvent,
}: UnifiedTelemetryProps) {
  const trackEvent = (event: UnifiedEvent) => {
    if (onEvent) {
      onEvent(event);
    }

    // In production, this would queue and flush to the unified telemetry endpoint
    console.log('Unified telemetry event:', event);
  };

  const trackGameAttempt = (
    gameId: string,
    sessionId: string,
    phonemeTarget: any,
    latencyMs: number,
    success: boolean,
    confidence: number
  ) => {
    trackEvent({
      type: 'game',
      gameId,
      sessionId,
      learnerId,
      phonemeTarget,
      attemptNumber: 0, // Would be tracked in state
      responseLatencyMs: latencyMs,
      isSuccess: success,
      confidenceScore: confidence,
      timestamp: Date.now(),
    } as any);
  };

  const trackStoryScene = (
    sceneId: string,
    storyId: string,
    chapterId: string,
    phonemeTarget: any,
    latencyMs: number,
    success: boolean,
    confidence: number,
    branchTaken: 'success' | 'failure' | 'partial'
  ) => {
    trackEvent({
      type: 'story',
      sceneId,
      storyId,
      chapterId,
      learnerId,
      sessionId: `${storyId}-${sceneId}`,
      phonemeTarget,
      attemptNumber: 0,
      responseLatencyMs: latencyMs,
      isSuccess: success,
      confidenceScore: confidence,
      branchTaken,
      timestamp: Date.now(),
    } as any);
  };

  return {
    trackEvent,
    trackGameAttempt,
    trackStoryScene,
  };
}
