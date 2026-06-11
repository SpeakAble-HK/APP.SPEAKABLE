import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  computeNarrativeProfile,
  type RubricScores,
  type NarrativeProfileResult,
} from "@/data/narrativeAssessment";

export interface SavedNarrativeAssessment {
  id: string;
  student_id: string;
  therapist_id?: string | null;
  scores: RubricScores;
  result: NarrativeProfileResult;
  evidence: Record<string, number>;
  total_proficiency: number;
  band: string;
  notes?: string | null;
  assessed_at: string;
}

const LS_KEY = (studentId: string) => `speakable-narrative-assessments-${studentId}`;

function loadLocal(studentId: string): SavedNarrativeAssessment[] {
  try {
    const raw = localStorage.getItem(LS_KEY(studentId));
    return raw ? (JSON.parse(raw) as SavedNarrativeAssessment[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(studentId: string, items: SavedNarrativeAssessment[]) {
  try {
    localStorage.setItem(LS_KEY(studentId), JSON.stringify(items));
  } catch {
    /* noop */
  }
}

/**
 * Loads & persists Narrative Assessment Profiles for a student.
 * Uses Supabase when reachable; gracefully falls back to localStorage so the
 * therapist workflow keeps working offline / without the narrative_assessments
 * table provisioned yet.
 */
export function useNarrativeAssessment(studentId: string | undefined, therapistId?: string) {
  const [history, setHistory] = useState<SavedNarrativeAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const refresh = useCallback(async () => {
    if (!studentId) {
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("narrative_assessments" as never)
        .select("*")
        .eq("student_id", studentId)
        .order("assessed_at", { ascending: false });
      if (error) throw error;
      setHistory((data as unknown as SavedNarrativeAssessment[]) ?? []);
      setUsingFallback(false);
    } catch {
      // Table missing or network down → local fallback.
      setHistory(loadLocal(studentId));
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (scores: RubricScores, evidence: Record<string, number>, notes?: string) => {
      if (!studentId) return null;
      const result = computeNarrativeProfile(scores);
      const record: SavedNarrativeAssessment = {
        id: crypto.randomUUID(),
        student_id: studentId,
        therapist_id: therapistId ?? null,
        scores,
        result,
        evidence,
        total_proficiency: result.totalProficiency,
        band: result.band,
        notes: notes ?? null,
        assessed_at: new Date().toISOString(),
      };

      try {
        const { error } = await supabase.from("narrative_assessments" as never).insert({
          student_id: record.student_id,
          therapist_id: record.therapist_id,
          scores: record.scores as never,
          result: record.result as never,
          evidence: record.evidence as never,
          total_proficiency: record.total_proficiency,
          band: record.band,
          notes: record.notes,
          assessed_at: record.assessed_at,
        } as never);
        if (error) throw error;
        setUsingFallback(false);
      } catch {
        const next = [record, ...loadLocal(studentId)];
        saveLocal(studentId, next);
        setUsingFallback(true);
      }

      await refresh();
      return record;
    },
    [studentId, therapistId, refresh],
  );

  return { history, loading, usingFallback, save, refresh };
}
