import { useState, useEffect } from 'react';

const NEPA_URL = import.meta.env.VITE_NEPA_URL || 'http://localhost:8100';

export interface PhonemeStat {
  phoneme: string;
  accuracy: number;
  errors: number;
}

export interface UserAnalytics {
  userId: string;
  name: string;
  sessions: number;
  accuracy: number;
  phonemeStats: PhonemeStat[];
  errorTypes: Record<string, number>;
  progress: Array<{ date: string; accuracy: number }>;
  fatigueWarnings: string[];
  trends: Record<string, 'improving' | 'stable' | 'declining'>;
}

export function useTherapistAnalytics(userId: string): {
  data: UserAnalytics | null;
  loading: boolean;
  error: string | null;
} {
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
        const res = await fetch(`${NEPA_URL}/api/v1/dashboard/${userId}`);
        if (!res.ok) {
          throw new Error(`NEPA dashboard returned ${res.status}`);
        }
        const body: any = await res.json();
        const dash = body.summary || body;

        const phonemeBreakdown = dash.phoneme_breakdown || {};
        const phonemeStats: PhonemeStat[] = Object.entries(phonemeBreakdown).map(
          ([phoneme, stats]: [string, any]) => ({
            phoneme,
            accuracy: stats.accuracy || 0,
            errors: stats.errors || 0,
          })
        );

        const errorTypes: Record<string, number> = {};
        phonemeStats.forEach((p) => {
          if (p.errors > 0) errorTypes[p.phoneme] = p.errors;
        });

        const progress: Array<{ date: string; accuracy: number }> = (
          dash.recent_history || []
        )
          .filter((a: any) => typeof a.accuracy === 'number')
          .map((a: any, i: number) => ({
            date: a.timestamp
              ? new Date(a.timestamp).toLocaleDateString('zh-HK')
              : `第 ${i + 1} 次`,
            accuracy: a.accuracy,
          }));

        const trends: Record<string, 'improving' | 'stable' | 'declining'> = {};
        phonemeStats.forEach((p) => {
          const profile = phonemeBreakdown[p.phoneme];
          trends[p.phoneme] = profile?.trend || 'stable';
        });

        const analytics: UserAnalytics = {
          userId,
          name: dash.name || dash.user_id || userId,
          sessions: dash.total_sessions || 0,
          accuracy: dash.overall_accuracy || 0,
          phonemeStats,
          errorTypes,
          progress,
          fatigueWarnings: dash.fatigue_status?.detected ? ['Fatigue detected'] : [],
          trends,
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
