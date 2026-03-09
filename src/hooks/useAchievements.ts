import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { allAchievements, AchievementDef } from "@/data/achievements";
import { toast } from "@/hooks/use-toast";

const LOCAL_KEY = "speakable-achievements-v1";

function loadLocal(): Set<string> {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) return new Set(JSON.parse(saved));
  } catch {}
  return new Set();
}

function saveLocal(ids: Set<string>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify([...ids]));
}

export function useAchievements() {
  const { user } = useAuth();
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(loadLocal);
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementDef[]>([]);

  // Load from DB
  useEffect(() => {
    if (!user || user.is_anonymous) return;
    (async () => {
      try {
        const { data } = await (supabase as any)
          .from("achievements")
          .select("achievement_id")
          .eq("user_id", user.id);
        if (data) {
          const ids = new Set<string>(data.map((r: any) => r.achievement_id));
          setUnlockedIds(ids);
          saveLocal(ids);
        }
      } catch {}
    })();
  }, [user]);

  const checkAndUnlock = useCallback(
    async (ctx: { completedLessons: Set<number>; totalXp: number; streakDays: number }) => {
      const fresh: AchievementDef[] = [];

      for (const ach of allAchievements) {
        if (unlockedIds.has(ach.id)) continue;
        if (ach.check(ctx)) {
          fresh.push(ach);
        }
      }

      if (fresh.length === 0) return;

      const newIds = new Set([...unlockedIds, ...fresh.map(a => a.id)]);
      setUnlockedIds(newIds);
      saveLocal(newIds);
      setNewlyUnlocked(fresh);

      // Persist to DB
      if (user && !user.is_anonymous) {
        for (const ach of fresh) {
          try {
            await (supabase as any)
              .from("achievements")
              .insert({ user_id: user.id, achievement_id: ach.id });
          } catch {}
        }
      }

      // Show toasts
      for (const ach of fresh) {
        toast({
          title: `${ach.emoji} Achievement Unlocked!`,
          description: ach.titleEn,
        });
      }
    },
    [unlockedIds, user]
  );

  const clearNewlyUnlocked = useCallback(() => setNewlyUnlocked([]), []);

  return {
    unlockedIds,
    unlockedCount: unlockedIds.size,
    totalCount: allAchievements.length,
    allAchievements,
    newlyUnlocked,
    clearNewlyUnlocked,
    checkAndUnlock,
  };
}
