import { supabase } from "@/integrations/supabase/client";
import type { DashboardSummary } from "@/shared/hooks/useNEPAWorldModel";

const LS_PREFIX = "nepa_sync_";

function isSupabaseConfigured(): boolean {
  return !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
}

function lsKey(suffix: string) {
  return `${LS_PREFIX}${suffix}`;
}

export interface StudentProgressRow {
  student_id: string;
  exercise_id: string;
  accuracy: number;
  attempts: number;
  completed_at: string;
}

export interface PhonemeResultRow {
  student_id: string;
  phoneme: string;
  confidence: number;
  spoken_text: string;
  intended_text: string;
  created_at: string;
}

export interface NEPASummaryRow {
  student_id: string;
  summary_data: Record<string, unknown>;
  fatigue_warnings: string[];
  created_at: string;
}

export async function syncStudentProgress(
  studentId: string,
  progressData: Omit<StudentProgressRow, "student_id">
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      const key = lsKey(`progress_${studentId}`);
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push({ student_id: studentId, ...progressData });
      localStorage.setItem(key, JSON.stringify(existing));
      return { success: true };
    }

    const { error } = await supabase.from("student_progress").insert({
      student_id: studentId,
      exercise_id: progressData.exercise_id,
      accuracy: progressData.accuracy,
      attempts: progressData.attempts,
      completed_at: progressData.completed_at || new Date().toISOString(),
    });

    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    console.warn("[NEPA Sync] syncStudentProgress failed:", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}

export async function fetchStudentProgress(
  studentId: string
): Promise<StudentProgressRow[]> {
  try {
    if (!isSupabaseConfigured()) {
      const key = lsKey(`progress_${studentId}`);
      return JSON.parse(localStorage.getItem(key) || "[]");
    }

    const { data, error } = await supabase
      .from("student_progress")
      .select("*")
      .eq("student_id", studentId)
      .order("completed_at", { ascending: false });

    if (error) throw error;
    return (data || []) as StudentProgressRow[];
  } catch (e: any) {
    console.warn("[NEPA Sync] fetchStudentProgress failed:", e);
    return [];
  }
}

export async function syncPhonemeResults(
  studentId: string,
  results: Omit<PhonemeResultRow, "student_id">[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      const key = lsKey(`phoneme_${studentId}`);
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const rows = results.map((r) => ({ student_id: studentId, ...r }));
      localStorage.setItem(key, JSON.stringify([...existing, ...rows]));
      return { success: true };
    }

    const rows = results.map((r) => ({
      student_id: studentId,
      phoneme: r.phoneme,
      confidence: r.confidence,
      spoken_text: r.spoken_text,
      intended_text: r.intended_text,
      created_at: r.created_at || new Date().toISOString(),
    }));

    const { error } = await supabase.from("phoneme_results").insert(rows);
    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    console.warn("[NEPA Sync] syncPhonemeResults failed:", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}

export async function fetchPhonemeHistory(
  studentId: string,
  days: number = 30
): Promise<PhonemeResultRow[]> {
  try {
    if (!isSupabaseConfigured()) {
      const key = lsKey(`phoneme_${studentId}`);
      const all: PhonemeResultRow[] = JSON.parse(localStorage.getItem(key) || "[]");
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return all.filter((r) => new Date(r.created_at) >= cutoff);
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const { data, error } = await supabase
      .from("phoneme_results")
      .select("*")
      .eq("student_id", studentId)
      .gte("created_at", cutoff.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as PhonemeResultRow[];
  } catch (e: any) {
    console.warn("[NEPA Sync] fetchPhonemeHistory failed:", e);
    return [];
  }
}

export async function syncNEPASummary(
  studentId: string,
  summary: { summary_data: Record<string, unknown>; fatigue_warnings: string[] }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      const key = lsKey(`summary_${studentId}`);
      localStorage.setItem(key, JSON.stringify({
        student_id: studentId,
        summary_data: summary.summary_data,
        fatigue_warnings: summary.fatigue_warnings,
        created_at: new Date().toISOString(),
      }));
      return { success: true };
    }

    const { data: existing } = await supabase
      .from("nepa_summaries")
      .select("id")
      .eq("student_id", studentId)
      .limit(1);

    if (existing && existing.length > 0) {
      const { error } = await supabase
        .from("nepa_summaries")
        .update({
          summary_data: summary.summary_data,
          fatigue_warnings: summary.fatigue_warnings,
          created_at: new Date().toISOString(),
        })
        .eq("student_id", studentId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("nepa_summaries").insert({
        student_id: studentId,
        summary_data: summary.summary_data,
        fatigue_warnings: summary.fatigue_warnings,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    }

    return { success: true };
  } catch (e: any) {
    console.warn("[NEPA Sync] syncNEPASummary failed:", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}

export async function fetchNEPASummary(
  studentId: string
): Promise<NEPASummaryRow | null> {
  try {
    if (!isSupabaseConfigured()) {
      const key = lsKey(`summary_${studentId}`);
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }

    const { data, error } = await supabase
      .from("nepa_summaries")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as NEPASummaryRow | null;
  } catch (e: any) {
    console.warn("[NEPA Sync] fetchNEPASummary failed:", e);
    return null;
  }
}
