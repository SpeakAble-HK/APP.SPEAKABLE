import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LessonProgressEntry {
  lesson_id: string;
  completed: boolean;
  accuracy_score: number;
  attempts: number;
  xp_earned: number;
}

export function useLessonProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Map<string, LessonProgressEntry>>(new Map());
  const [loading, setLoading] = useState(true);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    if (!user) { setProgress(new Map()); setLoading(false); return; }
    fetchProgress(user.id);
  }, [user?.id]);

  const fetchProgress = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed, accuracy_score, attempts, xp_earned')
      .eq('user_id', userId);
    const map = new Map<string, LessonProgressEntry>();
    let xp = 0;
    (data || []).forEach((row: any) => {
      map.set(row.lesson_id, row);
      xp += row.xp_earned || 0;
    });
    setProgress(map);
    setTotalXp(xp);
    setLoading(false);
  };

  const recordResult = useCallback(async (lessonId: string, accuracyScore: number, xpEarned: number) => {
    if (!user) return;
    const existing = progress.get(lessonId);
    const completed = accuracyScore >= 70;

    if (existing) {
      await supabase
        .from('lesson_progress')
        .update({
          accuracy_score: Math.max(existing.accuracy_score, accuracyScore),
          completed: existing.completed || completed,
          attempts: existing.attempts + 1,
          xp_earned: existing.completed ? existing.xp_earned : (completed ? existing.xp_earned + xpEarned : existing.xp_earned),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId);
    } else {
      await supabase
        .from('lesson_progress')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          accuracy_score: accuracyScore,
          completed,
          xp_earned: completed ? xpEarned : 0,
        });
    }
    await fetchProgress(user.id);
  }, [user, progress]);

  const completedCount = Array.from(progress.values()).filter(p => p.completed).length;

  return { progress, loading, totalXp, completedCount, recordResult };
}
