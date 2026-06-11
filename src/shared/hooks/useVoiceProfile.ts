import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useVoiceProfile(userId: string | undefined) {
  const [hasVoiceProfile, setHasVoiceProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setHasVoiceProfile(false);
      setLoading(false);
      return;
    }

    const check = async () => {
      const { data } = await supabase
        .from('voice_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      setHasVoiceProfile(!!data);
      setLoading(false);
    };
    check();
  }, [userId]);

  const markProfileCreated = async (userId: string) => {
    const { error } = await supabase
      .from('voice_profiles')
      .insert({ user_id: userId });
    if (!error) setHasVoiceProfile(true);
    return { error };
  };

  return { hasVoiceProfile, loading, markProfileCreated };
}
