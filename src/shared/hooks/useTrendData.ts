import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TrendPoint {
  date: string;
  accuracy: number;
}

export function useTrendData(studentId: string) {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setData([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: rows } = await supabase
        .from('pronunciation_results')
        .select('created_at, overall_accuracy')
        .eq('user_id', studentId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (cancelled) return;

      if (!rows || rows.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      const dailyMap = new Map<string, { sum: number; count: number }>();
      for (const row of rows) {
        const dateKey = row.created_at.slice(0, 10);
        const entry = dailyMap.get(dateKey) || { sum: 0, count: 0 };
        entry.sum += row.overall_accuracy;
        entry.count++;
        dailyMap.set(dateKey, entry);
      }

      const trend: TrendPoint[] = [];
      for (let d = 0; d < 30; d++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(date.getDate() + d);
        const key = date.toISOString().slice(0, 10);
        const day = dailyMap.get(key);
        trend.push({
          date: key,
          accuracy: day ? Math.round(day.sum / day.count) : 0,
        });
      }

      setData(trend);
      setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [studentId]);

  return { trend: data, loading };
}
