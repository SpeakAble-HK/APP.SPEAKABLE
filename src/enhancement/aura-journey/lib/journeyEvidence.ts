import { supabase } from "@/integrations/supabase/client";

// ─────────────────────────────────────────────────────────────────────────────
// Aura Journey → Narrative Rubric adaptation-engine bridge
//
// Each interactive-story chapter declares an `adaptationKey` (e.g.
// "wh_question_response"). When a child engages a chapter, we record a 0..1
// `signal` against that key. The therapist portal reads these signals back as
// evidence and feeds them to `suggestScoresFromEvidence()` in
// src/data/narrativeAssessment.ts, which maps adaptationKeys → rubric elements.
//
// Resilient by design (per the graceful-fallback decision): writes/reads go to
// Supabase `journey_progress` when reachable, and transparently fall back to
// localStorage so the journey + rubric keep working offline or before the table
// is provisioned.
// ─────────────────────────────────────────────────────────────────────────────

export interface JourneyEvidenceEntry {
  adaptation_key: string;
  signal: number; // 0..1
  attempts: number;
  scene_index?: number;
  updated_at: string;
}

const LS_KEY = (studentId: string) => `speakable-journey-progress-${studentId}`;

function loadLocal(studentId: string): Record<string, JourneyEvidenceEntry> {
  try {
    const raw = localStorage.getItem(LS_KEY(studentId));
    return raw ? (JSON.parse(raw) as Record<string, JourneyEvidenceEntry>) : {};
  } catch {
    return {};
  }
}

function saveLocal(studentId: string, map: Record<string, JourneyEvidenceEntry>) {
  try {
    localStorage.setItem(LS_KEY(studentId), JSON.stringify(map));
  } catch {
    /* noop */
  }
}

/** Resolve the acting user's id (the "student" in journey context). */
async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Record a journey adaptation signal for a completed/attempted chapter.
 * `signal` is 0..1 (e.g. cloned line produced = ~0.9, skipped = ~0.3). Rolls a
 * simple running average with prior attempts so repeated practice converges.
 * Never throws — journey UX must not break on a failed write.
 */
export async function recordJourneyEvidence(params: {
  adaptationKey: string;
  signal: number;
  sceneIndex?: number;
}): Promise<void> {
  const signal = Math.max(0, Math.min(1, params.signal));
  const userId = await currentUserId();

  // Local first (always succeeds, keeps offline parity).
  if (userId) {
    const map = loadLocal(userId);
    const prev = map[params.adaptationKey];
    const attempts = (prev?.attempts ?? 0) + 1;
    const rolled = prev ? (prev.signal * (attempts - 1) + signal) / attempts : signal;
    map[params.adaptationKey] = {
      adaptation_key: params.adaptationKey,
      signal: rolled,
      attempts,
      scene_index: params.sceneIndex,
      updated_at: new Date().toISOString(),
    };
    saveLocal(userId, map);
  }

  // Best-effort upsert to Supabase.
  if (!userId) return;
  try {
    const { data: existing } = await supabase
      .from("journey_progress" as never)
      .select("signal, attempts")
      .eq("student_id", userId)
      .eq("adaptation_key", params.adaptationKey)
      .maybeSingle();

    const prevSignal = (existing as { signal?: number } | null)?.signal;
    const prevAttempts = (existing as { attempts?: number } | null)?.attempts ?? 0;
    const attempts = prevAttempts + 1;
    const rolled =
      typeof prevSignal === "number"
        ? (prevSignal * prevAttempts + signal) / attempts
        : signal;

    const { error } = await supabase.from("journey_progress" as never).upsert(
      {
        student_id: userId,
        adaptation_key: params.adaptationKey,
        signal: rolled,
        attempts,
        scene_index: params.sceneIndex ?? null,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "student_id,adaptation_key" } as never,
    );
    if (error) throw error;
  } catch (err) {
    // Non-fatal: localStorage already holds the signal.
    console.warn("[aura-journey] evidence record fell back to local:", err);
  }
}

/**
 * Read all journey adaptation signals for a student as evidenceKey -> 0..1.
 * Merges Supabase (authoritative) over localStorage. Used by the therapist
 * portal to feed the rubric's auto-suggest.
 */
export async function loadJourneyEvidence(
  studentId: string,
): Promise<Record<string, number>> {
  const out: Record<string, number> = {};

  // localStorage baseline (the current device's own journey runs).
  const local = loadLocal(studentId);
  for (const [key, entry] of Object.entries(local)) {
    if (typeof entry.signal === "number") out[key] = entry.signal;
  }

  try {
    const { data, error } = await supabase
      .from("journey_progress" as never)
      .select("adaptation_key, signal")
      .eq("student_id", studentId);
    if (error) throw error;
    for (const row of (data as unknown as JourneyEvidenceEntry[]) ?? []) {
      if (typeof row.signal === "number") out[row.adaptation_key] = row.signal;
    }
  } catch {
    // Table missing / offline → localStorage values already populated.
  }

  return out;
}
