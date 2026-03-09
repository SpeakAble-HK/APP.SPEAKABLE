import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_xp: number;
  streak_days: number;
  best_streak: number;
  lessons_completed: number;
}

export function useLeaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("leaderboard_view")
        .select("*")
        .order("total_xp", { ascending: false })
        .limit(50);

      if (data && !error) {
        setEntries(data);
        if (user) {
          const idx = data.findIndex((e: LeaderboardEntry) => e.user_id === user.id);
          setUserRank(idx >= 0 ? idx + 1 : null);
        }
      }
    } catch {
      // View might not exist yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  return { entries, loading, userRank, refetch: fetchLeaderboard };
}
