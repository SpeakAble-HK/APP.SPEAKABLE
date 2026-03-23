import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface StudentData {
  student_id: string;
  nickname: string;
  age: number | null;
  total_xp: number;
  completed_lessons: number;
  accuracy_avg: number;
  last_active: string | null;
}

export function useSTDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchStudents();
  }, [user?.id]);

  const fetchStudents = async () => {
    if (!user) return;
    setLoading(true);

    // Get linked students
    const { data: links } = await supabase
      .from('st_students')
      .select('student_id')
      .eq('therapist_id', user.id);

    if (!links || links.length === 0) {
      setStudents([]);
      setLoading(false);
      return;
    }

    const studentIds = links.map(l => l.student_id);

    // Get explorer profiles
    const { data: profiles } = await supabase
      .from('explorer_profiles')
      .select('user_id, nickname, age')
      .in('user_id', studentIds);

    // Get lesson progress for each student
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('user_id, completed, accuracy_score, xp_earned, updated_at')
      .in('user_id', studentIds);

    const studentMap = new Map<string, StudentData>();

    (profiles || []).forEach((p: any) => {
      studentMap.set(p.user_id, {
        student_id: p.user_id,
        nickname: p.nickname,
        age: p.age,
        total_xp: 0,
        completed_lessons: 0,
        accuracy_avg: 0,
        last_active: null,
      });
    });

    // Aggregate progress
    const accuracyTotals = new Map<string, { sum: number; count: number }>();
    (progressData || []).forEach((row: any) => {
      const s = studentMap.get(row.user_id);
      if (!s) return;
      s.total_xp += row.xp_earned || 0;
      if (row.completed) s.completed_lessons++;
      if (row.updated_at && (!s.last_active || row.updated_at > s.last_active)) {
        s.last_active = row.updated_at;
      }
      const acc = accuracyTotals.get(row.user_id) || { sum: 0, count: 0 };
      acc.sum += row.accuracy_score || 0;
      acc.count++;
      accuracyTotals.set(row.user_id, acc);
    });

    accuracyTotals.forEach((val, userId) => {
      const s = studentMap.get(userId);
      if (s && val.count > 0) s.accuracy_avg = Math.round(val.sum / val.count);
    });

    setStudents(Array.from(studentMap.values()));
    setLoading(false);
  };

  const addStudent = useCallback(async (studentUsername: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Find student by username
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('username', studentUsername)
      .maybeSingle();

    if (!profile) return { error: new Error('Student not found') };

    // Verify they have explorer role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profile.user_id)
      .eq('role', 'explorer')
      .maybeSingle();

    if (!roleData) return { error: new Error('User is not an explorer') };

    const { error } = await supabase
      .from('st_students')
      .insert({ therapist_id: user.id, student_id: profile.user_id });

    if (!error) await fetchStudents();
    return { error };
  }, [user]);

  const removeStudent = useCallback(async (studentId: string) => {
    if (!user) return;
    await supabase
      .from('st_students')
      .delete()
      .eq('therapist_id', user.id)
      .eq('student_id', studentId);
    await fetchStudents();
  }, [user]);

  const assignCategory = useCallback(async (studentId: string, category: string) => {
    if (!user) return;
    await supabase
      .from('st_assignments')
      .insert({ therapist_id: user.id, student_id: studentId, category });
  }, [user]);

  return { students, loading, addStudent, removeStudent, assignCategory, refresh: fetchStudents };
}
