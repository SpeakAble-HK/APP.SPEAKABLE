import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserStats {
  daily_goal_minutes: number;
  daily_progress_minutes: number;
  fluency_score: number;
  fluency_change: number;
  streak_days: number;
  best_streak: number;
  last_activity_date: string | null;
}

const defaultStats: UserStats = {
  daily_goal_minutes: 15,
  daily_progress_minutes: 0,
  fluency_score: 0,
  fluency_change: 0,
  streak_days: 0,
  best_streak: 0,
  last_activity_date: null,
};

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      setStats(defaultStats);
      setLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user stats:', error);
        return;
      }

      if (data) {
        setStats({
          daily_goal_minutes: data.daily_goal_minutes,
          daily_progress_minutes: data.daily_progress_minutes,
          fluency_score: data.fluency_score,
          fluency_change: data.fluency_change,
          streak_days: data.streak_days,
          best_streak: data.best_streak,
          last_activity_date: data.last_activity_date,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (updates: Partial<UserStats>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating user stats:', error);
        return;
      }

      setStats(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  const dailyGoalProgress = stats.daily_goal_minutes > 0 
    ? Math.min(100, Math.round((stats.daily_progress_minutes / stats.daily_goal_minutes) * 100))
    : 0;

  return {
    stats,
    loading,
    dailyGoalProgress,
    updateStats,
    refetch: fetchStats,
  };
};
