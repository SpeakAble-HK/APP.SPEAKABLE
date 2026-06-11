import { useState, useEffect, useCallback } from 'react';

const NEPA_URL = import.meta.env.VITE_NEPA_URL || 'http://localhost:8100';

export interface PhonemeProfile {
  phoneme: string;
  accuracy: number;
  trend: 'improving' | 'stable' | 'declining';
  confusions: string[];
  fatigue_delta: number;
}

export interface WorldModel {
  patient_id: string;
  phoneme_profiles: PhonemeProfile[];
  session_context: {
    attempted: number;
    fatigued_at_minute: number | null;
    next_best_focus: string;
  };
}

export interface ExerciseRecommendation {
  exercise_type: string;
  target_phonemes: string[];
  difficulty: string;
  description: string;
}

export interface DashboardSummary {
  patient_id: string;
  name: string;
  total_sessions: number;
  overall_accuracy: number;
  phoneme_stats: {
    phoneme: string;
    accuracy: number;
    trend: string;
    errors: number;
  }[];
  recent_activity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
  fatigue_warnings: string[];
}

export function useNEPAWorldModel(patientId: string | null) {
  const [worldModel, setWorldModel] = useState<WorldModel | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorldModel = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${NEPA_URL}/api/v1/world-model/${patientId}`);
      if (res.ok) {
        const body = await res.json();
        const wm = body.world_model || body;
        setWorldModel({
          patient_id: wm.user_id || patientId,
          phoneme_profiles: Object.entries(wm.phoneme_profile || {}).map(([k, v]: [string, any]) => ({
            phoneme: k,
            accuracy: v.accuracy || 0,
            trend: v.trend || 'stable',
            confusions: v.confusion || [],
            fatigue_delta: v.fatigue_delta || 0,
          })),
          session_context: {
            attempted: wm.total_attempts || 0,
            fatigued_at_minute: wm.fatigue?.started_at_ms ? Math.floor(wm.fatigue.started_at_ms / 60000) : null,
            next_best_focus: wm.next_best_exercise?.target_phonemes?.[0] || '',
          },
        });
      }
    } catch (e) {
      console.warn('Failed to fetch world model:', e);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const fetchDashboard = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${NEPA_URL}/api/v1/dashboard/${patientId}`);
      if (res.ok) {
        const body = await res.json();
        const s = body.summary || body;
        setDashboard({
          patient_id: s.user_id || patientId,
          name: s.name || s.user_id || patientId,
          total_sessions: s.total_sessions || 0,
          overall_accuracy: s.overall_accuracy || 0,
          phoneme_stats: Object.entries(s.phoneme_breakdown || {}).map(([k, v]: [string, any]) => ({
            phoneme: k,
            accuracy: v.accuracy || 0,
            trend: v.trend || 'stable',
            errors: v.errors || 0,
          })),
          recent_activity: (s.recent_history || []).map((a: any) => ({
            type: a.type || 'session',
            description: a.description || '',
            timestamp: a.timestamp || a.created_at || '',
          })),
          fatigue_warnings: s.fatigue_status?.detected ? ['Fatigue detected'] : [],
        });
      }
    } catch (e) {
      setError('Failed to fetch dashboard');
      console.warn('Dashboard fetch failed:', e);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const fetchRecommendations = useCallback(async () => {
    if (!patientId) return;
    try {
      const res = await fetch(`${NEPA_URL}/api/v1/exercise/recommend?patient_id=${encodeURIComponent(patientId)}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.recommendations || data.exercises || (data.exercise_type ? [data] : []);
        setRecommendations(
          items.map((r: any) => ({
            exercise_type: r.exercise_type || r.type || 'unknown',
            target_phonemes: r.target_phonemes || r.targets || [],
            difficulty: r.difficulty || 'medium',
            description: r.description || r.reason || '',
          }))
        );
      }
    } catch (e) {
      console.warn('Failed to fetch recommendations:', e);
    }
  }, [patientId]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchWorldModel(), fetchDashboard(), fetchRecommendations()]);
  }, [fetchWorldModel, fetchDashboard, fetchRecommendations]);

  useEffect(() => {
    if (patientId) {
      refreshAll();
    } else {
      setWorldModel(null);
      setDashboard(null);
      setRecommendations([]);
    }
  }, [patientId]);

  return {
    worldModel,
    dashboard,
    recommendations,
    loading,
    error,
    refreshAll,
    fetchWorldModel,
    fetchDashboard,
    fetchRecommendations,
  };
}
