import { supabase } from "@/integrations/supabase/client";

// Supabase-backed parent/learner insights derived from real session data.

export interface ParentInsights {
  weeklyPracticeMinutes: number;
  weeklyGoal: number;
  streakDays: number;
  recentGameResults: {
    gameName: string;
    date: string;
    stars: number;
    fatigueFlag: boolean;
  }[];
}

async function currentLearnerId(explicit?: string): Promise<string | null> {
  if (explicit) return explicit;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function getParentInsights(
  learnerId?: string,
): Promise<ParentInsights> {
  const empty: ParentInsights = {
    weeklyPracticeMinutes: 0,
    weeklyGoal: 60,
    streakDays: 0,
    recentGameResults: [],
  };

  const id = await currentLearnerId(learnerId);
  if (!id) return empty;

  const { data, error } = await supabase
    .from("session_results")
    .select("*")
    .eq("learner_id", id)
    .order("completed_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    if (error) console.error("getParentInsights failed:", error.message);
    return empty;
  }

  const rows = data;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  // fatigue_marker is a JSON column; read its fields through a narrow shape.
  const fatigueOf = (marker: unknown) =>
    (marker as { sessionDurationMs?: number; isFatigued?: boolean }) ?? {};

  const weeklyMs = rows
    .filter((r) => new Date(r.completed_at).getTime() >= weekAgo)
    .reduce((sum, r) => sum + (fatigueOf(r.fatigue_marker).sessionDurationMs ?? 0), 0);

  const recentGameResults = rows.slice(0, 5).map((r) => ({
    gameName: r.game_id ?? "Game",
    date: (r.completed_at ?? "").slice(0, 10),
    stars: r.reward_payout ?? 0,
    fatigueFlag: Boolean(fatigueOf(r.fatigue_marker).isFatigued),
  }));

  // Streak: count consecutive days (ending today) with at least one session.
  const days = new Set(rows.map((r) => (r.completed_at ?? "").slice(0, 10)));
  let streakDays = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    weeklyPracticeMinutes: Math.round(weeklyMs / 60000),
    weeklyGoal: 60,
    streakDays,
    recentGameResults,
  };
}
