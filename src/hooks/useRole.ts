import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'explorer' | 'therapist';

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }
    fetchRole(user.id);
  }, [user?.id]);

  const fetchRole = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    setRole((data?.role as AppRole) ?? null);
    setLoading(false);
  };

  const setUserRole = useCallback(async (newRole: AppRole) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: newRole });
    if (!error) setRole(newRole);
    return { error };
  }, [user]);

  return { role, loading, setUserRole };
}
