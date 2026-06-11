import type { SessionResult } from './types';

// Mock Supabase client
const supabase = {
  from: (table: string) => ({
    select: () => ({ data: null, error: null }),
    upsert: (data: any) => ({ data, error: null }),
    insert: (data: any) => ({ data, error: null }),
    update: () => ({ eq: (col: string, val: any) => ({ data: null, error: null }) }),
  }),
};

export async function writeSessionToLearnerModel(
  result: SessionResult
): Promise<void> {
  // Mock: read current learner model
  const currentModel = {
    learnerId: result.learnerId,
    weakestPhonemes: [] as string[],
    improvedPhonemes: [] as string[],
    avgSessionDuration: 0,
    fatigueTrend: 'stable' as 'improving' | 'stable' | 'worsening',
    lastGamePlayed: result.gameId,
    totalSessions: 0,
  };

  // Update logic
  currentModel.lastGamePlayed = result.gameId;
  currentModel.totalSessions += 1;
  currentModel.avgSessionDuration =
    (currentModel.avgSessionDuration * (currentModel.totalSessions - 1) +
      result.fatigueMarker.sessionDurationMs) /
    currentModel.totalSessions;

  if (result.fatigueMarker.isFatigued) {
    currentModel.fatigueTrend = 'worsening';
  } else if (result.successRate > 0.8) {
    currentModel.fatigueTrend = 'improving';
  }

  // Mock upsert
  await supabase.from('learner_model').upsert(currentModel);
}

export async function writeToDashboard(
  result: SessionResult
): Promise<void> {
  const dashboardEvent = {
    learnerId: result.learnerId,
    gameId: result.gameId,
    sessionDate: result.completedAt,
    successRate: result.successRate,
    fatigueFlag: result.fatigueMarker.isFatigued,
    carryoverNote: result.carryoverRecommendation,
  };

  await supabase.from('therapist_dashboard_events').insert(dashboardEvent);
}

export async function completeSession(
  result: SessionResult
): Promise<{ ok: boolean; updatedModel: any }> {
  try {
    await Promise.all([
      writeSessionToLearnerModel(result),
      writeToDashboard(result),
    ]);

    return { ok: true, updatedModel: null };
  } catch (error) {
    console.error('Failed to complete session:', error);
    return { ok: false, updatedModel: null };
  }
}
