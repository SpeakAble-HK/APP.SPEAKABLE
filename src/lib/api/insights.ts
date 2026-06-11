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
    .from("session_results" as never)
    .select("*")
    .eq("learner_id", id)
    .order("completed_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    if (error) console.error("getParentInsights failed:", error.message);
    return empty;
  }

  const rows = data as Array<Record<string, unknown>>;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const weeklyMs = rows
    .filter((r) => new Date(String(r.completed_at)).getTime() >= weekAgo)
    .reduce((sum, r) => {
      const fatigue = (r.fatigue_marker as { sessionDurationMs?: number }) ?? {};
      return sum + (fatigue.sessionDurationMs ?? 0);
    }, 0);

  const recentGameResults = rows.slice(0, 5).map((r) => ({
    gameName: String(r.game_id ?? "Game"),
    date: String(r.completed_at ?? "").slice(0, 10),
    stars: Number(r.reward_payout ?? 0),
    fatigueFlag: Boolean(
      (r.fatigue_marker as { isFatigued?: boolean })?.isFatigued,
    ),
  }));

  // Streak: count consecutive days (ending today) with at least one session.
  const days = new Set(
    rows.map((r) => String(r.completed_at ?? "").slice(0, 10)),
  );
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
