import { supabase } from "@/integrations/supabase/client";
import type { UnifiedEvent } from "../minigame-sdk/types";

// Supabase-backed data access for unified telemetry events.
// Replaces the former `fetch('/api/telemetry/unified')` calls.

async function currentLearnerId(explicit?: string): Promise<string | null> {
  if (explicit) return explicit;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

function eventType(event: UnifiedEvent): string {
  return "type" in event && event.type === "story" ? "story_scene" : "game_attempt";
}

function contextId(event: UnifiedEvent): string {
  return "type" in event && event.type === "story"
    ? event.sceneId
    : (event as { gameId: string }).gameId;
}

export async function insertUnifiedEvents(events: UnifiedEvent[]): Promise<void> {
  if (events.length === 0) return;

  const fallbackLearner = await currentLearnerId();

  const rows = events.map((event) => ({
    event_type: eventType(event),
    learner_id: event.learnerId || fallbackLearner,
    context_id: contextId(event),
    event_data: event,
  }));

  const { error } = await supabase
    .from("unified_telemetry" as never)
    .insert(rows as never);

  if (error) console.error("insertUnifiedEvents failed:", error.message);
}

export async function insertStoryTelemetry(row: {
  learnerId: string;
  storyId: string;
  chapterId: string;
  sceneId: string;
  completed: boolean;
  attempts: number;
  phonemeSymbol: string;
  confidenceScore: number;
  branchTaken: string;
  timeOnSceneMs: number;
  abandoned?: boolean;
  reEngaged?: boolean;
  frustrationFlag?: boolean;
}): Promise<void> {
  const learnerId = await currentLearnerId(row.learnerId);
  if (!learnerId) return;

  const { error } = await supabase.from("story_telemetry" as never).insert({
    learner_id: learnerId,
    story_id: row.storyId,
    chapter_id: row.chapterId,
    scene_id: row.sceneId,
    completed: row.completed,
    attempts: row.attempts,
    phoneme_symbol: row.phonemeSymbol,
    confidence_score: row.confidenceScore,
    branch_taken: row.branchTaken,
    time_on_scene_ms: row.timeOnSceneMs,
    abandoned: row.abandoned ?? false,
    re_engaged: row.reEngaged ?? false,
    frustration_flag: row.frustrationFlag ?? false,
  } as never);

  if (error) console.error("insertStoryTelemetry failed:", error.message);
}
