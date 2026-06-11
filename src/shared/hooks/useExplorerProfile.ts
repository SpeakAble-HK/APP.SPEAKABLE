import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ExplorerProfile {
  id: string;
  user_id: string;
  nickname: string;
  age: number | null;
  gender: string | null;
  daily_reminder: boolean;
  onboarding_audio_url: string | null;
}

export function useExplorerProfile() {
  const { user } = useAuth();
  const [explorerProfile, setExplorerProfile] = useState<ExplorerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setExplorerProfile(null); setLoading(false); return; }
    fetchProfile(user.id);
  }, [user?.id]);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('explorer_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    setExplorerProfile(data as ExplorerProfile | null);
    setLoading(false);
  };

  const createProfile = useCallback(async (profile: {
    nickname: string;
    age?: number;
    gender?: string;
    daily_reminder?: boolean;
    onboarding_audio_url?: string;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { data, error } = await supabase
      .from('explorer_profiles')
      .insert({ user_id: user.id, ...profile })
      .select()
      .single();
    if (!error && data) setExplorerProfile(data as ExplorerProfile);
    return { error };
  }, [user]);

  return { explorerProfile, loading, createProfile };
}
