import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TRIAL_USED_KEY = 'echo_speech_trial_used';

export function useGuestTrial(isAuthenticated: boolean) {
  const [trialUsed, setTrialUsed] = useState(() => {
    return localStorage.getItem(TRIAL_USED_KEY) === 'true';
  });
  const [showTrialModal, setShowTrialModal] = useState(false);

  // If user is authenticated (not anonymous), never show trial restrictions
  const isLocked = !isAuthenticated && trialUsed;

  useEffect(() => {
    if (isLocked) {
      setShowTrialModal(true);
    }
  }, [isLocked]);

  const markTrialUsed = useCallback(() => {
    localStorage.setItem(TRIAL_USED_KEY, 'true');
    setTrialUsed(true);
    setShowTrialModal(true);
  }, []);

  const ensureGuestSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Sign in anonymously to get a valid token for the edge function
      await supabase.auth.signInAnonymously();
    }
  }, []);

  return {
    trialUsed,
    showTrialModal,
    setShowTrialModal,
    isLocked,
    markTrialUsed,
    ensureGuestSession,
  };
}
