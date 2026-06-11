import { useState, useCallback, useRef } from 'react';
import type { GameEvent, FatigueMarker, SessionResult, PhonemeTarget } from './types';

export function useGameTelemetry(
  gameId: string,
  sessionId: string,
  learnerId: string
) {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [sessionStart] = useState(Date.now());
  const [pauseCount, setPauseCount] = useState(0);
  const lastPauseRef = useRef<number>(Date.now());

  const trackAttempt = useCallback(
    (
      target: PhonemeTarget,
      latencyMs: number,
      success: boolean,
      confidence: number
    ) => {
      const event: GameEvent = {
        gameId,
        sessionId,
        learnerId,
        phonemeTarget: target,
        attemptNumber: events.length + 1,
        responseLatencyMs: latencyMs,
        isSuccess: success,
        confidenceScore: confidence,
        timestamp: Date.now(),
      };
      setEvents((prev) => [...prev, event]);
    },
    [gameId, sessionId, learnerId, events.length]
  );

  const getFatigueMarker = useCallback((): FatigueMarker => {
    const sessionDurationMs = Date.now() - sessionStart;
    const recentEvents = events.filter(
      (e) => Date.now() - e.timestamp < 5 * 60 * 1000
    );
    const errorRate5min =
      recentEvents.length > 0
        ? recentEvents.filter((e) => !e.isSuccess).length / recentEvents.length
        : 0;

    return {
      sessionDurationMs,
      errorRate5min,
      pauseCount,
      isFatigued: errorRate5min > 0.6 || pauseCount > 3,
    };
  }, [events, sessionStart, pauseCount]);

  const finalizeSession = useCallback((): SessionResult => {
    const fatigueMarker = getFatigueMarker();
    const totalAttempts = events.length;
    const successRate =
      totalAttempts > 0
        ? events.filter((e) => e.isSuccess).length / totalAttempts
        : 0;
    const avgLatencyMs =
      totalAttempts > 0
        ? events.reduce((sum, e) => sum + e.responseLatencyMs, 0) / totalAttempts
        : 0;

    const carryoverRecommendation =
      successRate < 0.5
        ? 'Focus on isolated phoneme practice with extended modeling'
        : successRate < 0.7
        ? 'Continue current level with additional support'
        : 'Ready for increased difficulty or context complexity';

    return {
      sessionId,
      learnerId,
      gameId,
      totalAttempts,
      successRate,
      avgLatencyMs,
      fatigueMarker,
      rewardPayout: Math.floor(successRate * 10),
      carryoverRecommendation,
      completedAt: new Date().toISOString(),
    };
  }, [events, getFatigueMarker, sessionId, learnerId, gameId]);

  const flush = useCallback(async (): Promise<void> => {
    const result = finalizeSession();
    try {
      await fetch('/api/telemetry/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
    } catch (error) {
      console.error('Failed to flush telemetry:', error);
    }
  }, [finalizeSession]);

  return {
    trackAttempt,
    getFatigueMarker,
    finalizeSession,
    flush,
    events,
  };
}
