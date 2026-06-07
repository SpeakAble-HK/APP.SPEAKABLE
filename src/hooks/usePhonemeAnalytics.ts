import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PhonemeStat {
  label: string;
  accuracy: number;
  count: number;
}

export function usePhonemeAnalytics(studentId: string) {
  const [stats, setStats] = useState<PhonemeStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setStats([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      const { data: rows } = await supabase
        .from('pronunciation_results')
        .select('overall_accuracy, initial_accuracy, final_accuracy, tone_accuracy')
        .eq('user_id', studentId);

      if (cancelled) return;

      if (!rows || rows.length === 0) {
        setStats([]);
        setLoading(false);
        return;
      }

      const categories = [
        { label: '整體準確率', key: 'overall_accuracy' as const },
        { label: '聲母', key: 'initial_accuracy' as const },
        { label: '韻母', key: 'final_accuracy' as const },
        { label: '聲調', key: 'tone_accuracy' as const },
      ];

      const result: PhonemeStat[] = categories.map((cat) => {
        const vals = rows.map((r) => r[cat.key]).filter((v) => v != null);
        const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        return { label: cat.label, accuracy: avg, count: vals.length };
      });

      setStats(result);
      setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [studentId]);

  return { phonemeStats: stats, loading };
}
