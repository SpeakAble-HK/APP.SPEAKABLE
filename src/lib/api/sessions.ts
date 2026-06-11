import { supabase } from "@/integrations/supabase/client";
import type { SessionResult } from "../minigame-sdk/types";

// Supabase-backed data access for mini-game session results.
// Replaces the former `fetch('/api/telemetry/session')` and mock supabase client.

async function currentLearnerId(explicit?: string): Promise<string | null> {
  if (explicit) return explicit;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function insertSessionResult(result: SessionResult): Promise<void> {
  const learnerId = await currentLearnerId(result.learnerId);
  if (!learnerId) return;

  const { error } = await supabase.from("session_results" as never).insert({
    session_id: result.sessionId,
    learner_id: learnerId,
    game_id: result.gameId,
    total_attempts: result.totalAttempts,
    success_rate: result.successRate,
    avg_latency_ms: result.avgLatencyMs,
    fatigue_marker: result.fatigueMarker,
    reward_payout: result.rewardPayout,
    carryover_recommendation: result.carryoverRecommendation,
    completed_at: result.completedAt,
  } as never);

  if (error) console.error("insertSessionResult failed:", error.message);
}

export async function upsertLearnerModel(result: SessionResult): Promise<void> {
  const learnerId = await currentLearnerId(result.learnerId);
  if (!learnerId) return;

  // Read the current model so totals/averages roll forward instead of resetting.
  const { data: existing } = await supabase
    .from("learner_model" as never)
    .select("*")
    .eq("learner_id", learnerId)
    .maybeSingle();

  const prev = (existing as Record<string, unknown> | null) ?? {};
  const prevSessions = Number(prev.total_sessions ?? 0);
  const prevAvg = Number(prev.avg_session_duration ?? 0);
  const totalSessions = prevSessions + 1;
  const avgSessionDuration =
    (prevAvg * prevSessions + result.fatigueMarker.sessionDurationMs) /
    totalSessions;

  const fatigueTrend = result.fatigueMarker.isFatigued
    ? "worsening"
    : result.successRate > 0.8
      ? "improving"
      : (prev.fatigue_trend as string | undefined) ?? "stable";

  const { error } = await supabase.from("learner_model" as never).upsert({
    learner_id: learnerId,
    last_game_played: result.gameId,
    total_sessions: totalSessions,
    avg_session_duration: avgSessionDuration,
    fatigue_trend: fatigueTrend,
    updated_at: new Date().toISOString(),
  } as never);

  if (error) console.error("upsertLearnerModel failed:", error.message);
}

export async function insertDashboardEvent(result: SessionResult): Promise<void> {
  const learnerId = await currentLearnerId(result.learnerId);
  if (!learnerId) return;

  const { error } = await supabase
    .from("therapist_dashboard_events" as never)
    .insert({
      learner_id: learnerId,
      game_id: result.gameId,
      session_date: result.completedAt,
      success_rate: result.successRate,
      fatigue_flag: result.fatigueMarker.isFatigued,
      carryover_note: result.carryoverRecommendation,
    } as never);

  if (error) console.error("insertDashboardEvent failed:", error.message);
}

export async function saveStoryState(state: {
  learnerId: string;
  storyId: string;
  currentSceneId: string;
  completedScenes: string[];
  phonemeProgress: Record<string, number>;
  emotionalState: string;
}): Promise<void> {
  const learnerId = await currentLearnerId(state.learnerId);
  if (!learnerId) return;

  const { error } = await supabase
    .from("learner_story_state" as never)
    .upsert({
      learner_id: learnerId,
      story_id: state.storyId,
      current_scene_id: state.currentSceneId,
      completed_scenes: state.completedScenes,
      phoneme_progress: state.phonemeProgress,
      emotional_state: state.emotionalState,
      last_updated: new Date().toISOString(),
    } as never);

  if (error) console.error("saveStoryState failed:", error.message);
}
