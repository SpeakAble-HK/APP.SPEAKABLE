import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getDailyChallenges, DailyChallengeDef } from "@/data/dailyChallenges";
import { toast } from "@/hooks/use-toast";

const LOCAL_KEY = "speakable-daily-challenges-v1";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

interface DailyChallengeState {
  date: string;
  completedIds: string[];
  todayLessonIds: number[];
}

function loadLocal(): DailyChallengeState {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      const d = JSON.parse(saved);
      if (d.date === getToday()) return d;
    }
  } catch {}
  return { date: getToday(), completedIds: [], todayLessonIds: [] };
}

function saveLocal(state: DailyChallengeState) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
}

export function useDailyChallenges() {
  const { user } = useAuth();
  const today = getToday();
  const challenges = getDailyChallenges(today);

  const [state, setState] = useState<DailyChallengeState>(loadLocal);

  // Reset if new day
  useEffect(() => {
    if (state.date !== today) {
      const fresh = { date: today, completedIds: [], todayLessonIds: [] };
      setState(fresh);
      saveLocal(fresh);
    }
  }, [today, state.date]);

  // Load completions from DB
  useEffect(() => {
    if (!user || user.is_anonymous) return;
    (async () => {
      try {
        const { data } = await (supabase as any)
          .from("daily_challenge_completions")
          .select("challenge_id")
          .eq("user_id", user.id)
          .eq("challenge_date", today);
        if (data) {
          const ids = data.map((r: any) => r.challenge_id);
          setState(prev => {
            const updated = { ...prev, completedIds: ids };
            saveLocal(updated);
            return updated;
          });
        }
      } catch {}
    })();
  }, [user, today]);

  const recordLessonCompleted = useCallback((lessonId: number) => {
    setState(prev => {
      const updated = {
        ...prev,
        todayLessonIds: [...prev.todayLessonIds, lessonId],
      };
      saveLocal(updated);
      return updated;
    });
  }, []);

  const checkAndCompleteChallenges = useCallback(
    async (completedLessons: Set<number>): Promise<number> => {
      let totalBonus = 0;
      const newCompletedIds = [...state.completedIds];

      for (const ch of challenges) {
        if (state.completedIds.includes(ch.id)) continue;
        if (ch.check({ completedLessons, todayCompletedIds: state.todayLessonIds })) {
          newCompletedIds.push(ch.id);
          totalBonus += ch.bonusXp;

          // Persist to DB
          if (user && !user.is_anonymous) {
            try {
              await (supabase as any)
                .from("daily_challenge_completions")
                .insert({
                  user_id: user.id,
                  challenge_id: ch.id,
                  challenge_date: today,
                  bonus_xp: ch.bonusXp,
                });
            } catch {}
          }

          toast({
            title: `${ch.emoji} Challenge Complete!`,
            description: `+${ch.bonusXp} bonus XP`,
          });
        }
      }

      if (newCompletedIds.length > state.completedIds.length) {
        const updated = { ...state, completedIds: newCompletedIds };
        setState(updated);
        saveLocal(updated);
      }

      return totalBonus;
    },
    [state, challenges, user, today]
  );

  return {
    challenges,
    completedIds: new Set(state.completedIds),
    todayLessonIds: state.todayLessonIds,
    recordLessonCompleted,
    checkAndCompleteChallenges,
  };
}
