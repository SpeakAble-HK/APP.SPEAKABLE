import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const STREAK_BONUS_XP = 25;

export function useStreak() {
  const { user } = useAuth();
  const [streakDays, setStreakDays] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastActivity, setLastActivity] = useState<string | null>(null);
  const [bonusAwarded, setBonusAwarded] = useState(false);

  useEffect(() => {
    if (!user || user.is_anonymous) return;
    (async () => {
      const { data } = await supabase
        .from("user_stats")
        .select("streak_days, best_streak, last_activity_date")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setStreakDays(data.streak_days);
        setBestStreak(data.best_streak);
        setLastActivity(data.last_activity_date);
      }
    })();
  }, [user]);

  const recordActivity = useCallback(async (): Promise<{ newStreak: number; bonusXp: number }> => {
    if (!user || user.is_anonymous) return { newStreak: streakDays, bonusXp: 0 };

    const today = new Date().toISOString().split("T")[0];
    if (lastActivity === today) return { newStreak: streakDays, bonusXp: 0 };

    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const isConsecutive = lastActivity === yesterday;

    const newStreak = isConsecutive ? streakDays + 1 : 1;
    const newBest = Math.max(newStreak, bestStreak);
    const bonusXp = newStreak >= 3 && !bonusAwarded ? STREAK_BONUS_XP * Math.min(newStreak, 10) : 0;

    setStreakDays(newStreak);
    setBestStreak(newBest);
    setLastActivity(today);
    setBonusAwarded(bonusXp > 0);

    await supabase
      .from("user_stats")
      .update({
        streak_days: newStreak,
        best_streak: newBest,
        last_activity_date: today,
      })
      .eq("user_id", user.id);

    return { newStreak, bonusXp };
  }, [user, lastActivity, streakDays, bestStreak, bonusAwarded]);

  return { streakDays, bestStreak, lastActivity, recordActivity };
}
