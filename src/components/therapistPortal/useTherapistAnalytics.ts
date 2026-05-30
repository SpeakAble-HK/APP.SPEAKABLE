// Hook to fetch therapist analytics data (mocked for now)

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserAnalytics {
  userId: string;
  name: string;
  sessions: number;
  accuracy: number;
  phonemeStats: Array<{
    phoneme: string;
    accuracy: number;
    errors: number;
  }>;
  errorTypes: Record<string, number>;
  progress: Array<{ date: string; accuracy: number }>;
}

  const [data, setData] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // Fetch user profile for display name
        const { data: profile, error: profileError } = await supabase
          .from('explorer_profiles')
          .select('nickname')
          .eq('user_id', userId)
          .maybeSingle();
        if (profileError) throw profileError;

        // Fetch session count (lesson_progress)
        const { count: sessions } = await supabase
          .from('lesson_progress')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);

        // Fetch phoneme stats (aggregate pronunciation_results)
        const { data: results, error: resultsError } = await supabase
          .from('pronunciation_results')
          .select('intended_phonemes, spoken_phonemes, overall_accuracy')
          .eq('user_id', userId);
        if (resultsError) throw resultsError;

        // Aggregate phoneme stats
        const phonemeStatsMap: Record<string, { accuracySum: number; count: number; errors: number }> = {};
        const errorTypes: Record<string, number> = {};
        let accuracySum = 0;
        let accuracyCount = 0;
        const progress: Array<{ date: string; accuracy: number }> = [];

        (results || []).forEach((row: any) => {
          // Assume intended_phonemes and spoken_phonemes are arrays of strings
          const intended = Array.isArray(row.intended_phonemes) ? row.intended_phonemes : [];
          const spoken = Array.isArray(row.spoken_phonemes) ? row.spoken_phonemes : [];
          row.intended_phonemes?.forEach?.((phoneme: string, idx: number) => {
            if (!phonemeStatsMap[phoneme]) phonemeStatsMap[phoneme] = { accuracySum: 0, count: 0, errors: 0 };
            phonemeStatsMap[phoneme].count++;
            // Simple error: intended != spoken at same index
            if (spoken[idx] !== phoneme) phonemeStatsMap[phoneme].errors++;
          });
          // Overall accuracy
          if (typeof row.overall_accuracy === 'number') {
            accuracySum += row.overall_accuracy;
            accuracyCount++;
            // For progress over time, fake date as not available
            progress.push({ date: '', accuracy: row.overall_accuracy });
          }
        });

        const phonemeStats = Object.entries(phonemeStatsMap).map(([phoneme, stats]) => ({
          phoneme,
          accuracy: stats.count > 0 ? (stats.count - stats.errors) / stats.count : 0,
          errors: stats.errors,
        }));

        // Error types: just count errors for now
        Object.entries(phonemeStatsMap).forEach(([phoneme, stats]) => {
          errorTypes[phoneme] = stats.errors;
        });

        // Progress: use available data, fill in date if possible
        // (for now, just use index as date)
        const progressWithDate = progress.map((p, i) => ({
          date: `Session ${i + 1}`,
          accuracy: p.accuracy,
        }));

        const analytics: UserAnalytics = {
          userId,
          name: profile?.nickname || userId,
          sessions: sessions || 0,
          accuracy: accuracyCount > 0 ? accuracySum / accuracyCount : 0,
          phonemeStats,
          errorTypes,
          progress: progressWithDate,
        };
        if (!cancelled) setData(analytics);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { data, loading, error };
}
