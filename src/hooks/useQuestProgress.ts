import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { LessonStatus, getAllQuestLessons } from '@/data/questLessons';
import { recordLearningActivity } from '@/hooks/useLearningStreak';

const LOCAL_KEY = "speakable-quest-progress-v2";

export interface QuestProgressData {
  completedLessons: Set<number>;
  totalXp: number;
  spentPoints: number;
}

function loadLocal(): QuestProgressData {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      const d = JSON.parse(saved);
      return {
        completedLessons: new Set(d.completedLessons || []),
        totalXp: d.totalXp || 0,
        spentPoints: d.spentPoints || 0,
      };
    }
  } catch {}
  return { completedLessons: new Set(), totalXp: 0, spentPoints: 0 };
}

function saveLocal(data: QuestProgressData) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify({
    completedLessons: [...data.completedLessons],
    totalXp: data.totalXp,
    spentPoints: data.spentPoints,
  }));
}

export function useQuestProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<QuestProgressData>(loadLocal);
  const [loading, setLoading] = useState(true);

  const allLessons = getAllQuestLessons();

  // Load from DB for authenticated users
  useEffect(() => {
    if (!user || user.is_anonymous) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('quest_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && !error) {
          const dbProgress: QuestProgressData = {
            completedLessons: new Set((data.completed_lessons as number[]) || []),
            totalXp: data.total_xp || 0,
            spentPoints: data.spent_points || 0,
          };
          setProgress(dbProgress);
          saveLocal(dbProgress);
        }
      } catch (e) {
        console.error('Error loading quest progress:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const persistProgress = useCallback(async (data: QuestProgressData) => {
    saveLocal(data);
    if (user && !user.is_anonymous) {
      try {
        await (supabase as any)
          .from('quest_progress')
          .upsert({
            user_id: user.id,
            completed_lessons: [...data.completedLessons],
            total_xp: data.totalXp,
            spent_points: data.spentPoints,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } catch (e) {
        console.error('Error saving quest progress:', e);
      }
    }
  }, [user]);

  const getLessonStatus = useCallback((lessonId: number): LessonStatus => {
    if (progress.completedLessons.has(lessonId)) return "completed";
    const idx = allLessons.findIndex(l => l.lesson_id === lessonId);
    if (idx === 0) return "unlocked";
    const prevLesson = allLessons[idx - 1];
    if (prevLesson && progress.completedLessons.has(prevLesson.lesson_id)) return "unlocked";
    return "locked";
  }, [progress.completedLessons, allLessons]);

  const completeLesson = useCallback(async (lessonId: number, xpEarned: number) => {
    const newCompleted = new Set([...progress.completedLessons, lessonId]);
    const newData: QuestProgressData = {
      completedLessons: newCompleted,
      totalXp: progress.totalXp + xpEarned,
      spentPoints: progress.spentPoints,
    };
    setProgress(newData);
    await persistProgress(newData);
    recordLearningActivity();
  }, [progress, persistProgress]);

  const spendPoints = useCallback(async (amount: number) => {
    const newData: QuestProgressData = {
      ...progress,
      spentPoints: progress.spentPoints + amount,
    };
    setProgress(newData);
    await persistProgress(newData);
  }, [progress, persistProgress]);

  return {
    progress,
    loading,
    getLessonStatus,
    completeLesson,
    spendPoints,
    availablePoints: progress.totalXp - progress.spentPoints,
    completedCount: progress.completedLessons.size,
    totalLessons: allLessons.length,
  };
}
