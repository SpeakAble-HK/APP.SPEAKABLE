import type { SessionResult } from './types';
import { upsertLearnerModel, insertDashboardEvent } from '../api/sessions';

// Persist a finished session into the learner model and therapist dashboard feed.
// Backed by the real Supabase data-access layer (src/lib/api/sessions.ts).

export async function writeSessionToLearnerModel(
  result: SessionResult
): Promise<void> {
  await upsertLearnerModel(result);
}

export async function writeToDashboard(
  result: SessionResult
): Promise<void> {
  await insertDashboardEvent(result);
}

export async function completeSession(
  result: SessionResult
): Promise<{ ok: boolean; updatedModel: unknown }> {
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
