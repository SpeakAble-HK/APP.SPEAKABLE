import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// Supabase-backed data access for therapist assignments.
// Replaces the former `fetch('/api/therapist/assignments')` call.

export interface AssignmentRow {
  therapistId: string;
  learnerIds: string[];
  gameId: string;
  phonemeTargets: string[];
  difficultyConfig: Json;
  customPrompt?: string;
  passThreshold: number;
  scheduledFor?: string | null;
  allowCoop?: boolean;
}

async function currentTherapistId(explicit?: string): Promise<string | null> {
  if (explicit) return explicit;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function insertAssignment(row: AssignmentRow): Promise<void> {
  const therapistId = await currentTherapistId(row.therapistId);
  if (!therapistId) throw new Error("Not authenticated");

  const { error } = await supabase.from("therapist_assignments").insert({
    therapist_id: therapistId,
    learner_ids: row.learnerIds,
    game_id: row.gameId,
    phoneme_targets: row.phonemeTargets,
    difficulty_config: row.difficultyConfig,
    custom_prompt: row.customPrompt ?? null,
    pass_threshold: row.passThreshold,
    scheduled_for: row.scheduledFor ?? null,
    allow_coop: row.allowCoop ?? true,
  });

  if (error) throw new Error(`Failed to create assignment: ${error.message}`);
}

export async function listAssignments(): Promise<unknown[]> {
  const therapistId = await currentTherapistId();
  if (!therapistId) return [];

  const { data, error } = await supabase
    .from("therapist_assignments")
    .select("*")
    .eq("therapist_id", therapistId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listAssignments failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function savePhonemeTags(
  learnerId: string,
  phonemeSymbols: string[],
): Promise<void> {
  const therapistId = await currentTherapistId();
  if (!therapistId) throw new Error("Not authenticated");

  const rows = phonemeSymbols.map((symbol) => ({
    therapist_id: therapistId,
    learner_id: learnerId,
    phoneme_symbol: symbol,
    priority: "primary",
  }));

  const { error } = await supabase
    .from("therapist_phoneme_tags")
    .upsert(rows, { onConflict: "therapist_id,learner_id,phoneme_symbol" });

  if (error) throw new Error(`Failed to save phoneme tags: ${error.message}`);
}
