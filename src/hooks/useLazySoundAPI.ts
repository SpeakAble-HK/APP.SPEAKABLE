import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PhonemeResult } from './usePronunciationAPI';

const CONFIDENCE_THRESHOLD = 0.5;

interface ASRPhoneVerifyItem {
  verify: string;
  predicted: string;
  match: boolean;
  conf: number;
  jy_conf: number;
  tone_conf: number;
}

export const useLazySoundAPI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [spokenPhonemes, setSpokenPhonemes] = useState<PhonemeResult[]>([]);
  const [intendedPhonemes, setIntendedPhonemes] = useState<PhonemeResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = async (): Promise<string> => {
    let { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data.session?.access_token) {
        throw new Error('Unable to start session. Please try again.');
      }
      session = data.session;
    }
    return session.access_token;
  };

  const invokeFunction = async (functionName: string, formData: FormData) => {
    const token = await getAuthToken();
    const projectUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = `${projectUrl}/functions/v1/${functionName}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = `Request failed (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData?.error) errorMsg = errorData.error;
      } catch {
        errorMsg = response.statusText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    return response.json();
  };

  const analyze = async (audioBlob: Blob, intendedText: string) => {
    setIsProcessing(true);
    setError(null);
    setSpokenPhonemes([]);
    setIntendedPhonemes([]);

    try {
      let intended: PhonemeResult[] = [];

      // Step 1: jyutping (skip if no text provided)
      if (intendedText) {
        const jyutpingFD = new FormData();
        jyutpingFD.append('text', intendedText);
        const jyutpingData = await invokeFunction('jyutping', jyutpingFD);
        if (!jyutpingData.success) throw new Error(jyutpingData.error || 'Jyutping conversion failed');

        intended = jyutpingData.result.map(([char, phoneme]: [string, string | null]) => ({
          character: char,
          phoneme,
        }));
        setIntendedPhonemes(intended);
      }

      // Step 2: ASR
      const asrFD = new FormData();
      asrFD.append('audio', audioBlob, 'recording.webm');
      asrFD.append('language', 'yue');
      const asrData = await invokeFunction('asr', asrFD);
      if (!asrData.success) throw new Error(asrData.error || 'ASR failed');

      let spoken: PhonemeResult[] = asrData.result.map(([char, phoneme]: [string, string | null]) => ({
        character: char,
        phoneme,
      }));

      // Step 2b: If no reference text, use ASR transcription as self-reference
      if (intended.length === 0) {
        const transcribedText = spoken.filter(p => p.character).map(p => p.character).join('');
        if (transcribedText) {
          const jyutpingFD2 = new FormData();
          jyutpingFD2.append('text', transcribedText);
          try {
            const jyutpingData2 = await invokeFunction('jyutping', jyutpingFD2);
            if (jyutpingData2.success) {
              intended = jyutpingData2.result.map(([char, phoneme]: [string, string | null]) => ({
                character: char,
                phoneme,
              }));
              setIntendedPhonemes(intended);
            }
          } catch (e) {
            console.warn('Jyutping self-reference error (continuing):', e);
          }
        }
      }

      // Step 3: ASRPhone verification
      const verifyText = intended.filter(p => p.phoneme !== null).map(p => p.phoneme).join(' ');

      if (verifyText) {
        const phoneFD = new FormData();
        phoneFD.append('audio', audioBlob, 'recording.webm');
        phoneFD.append('verify_text', verifyText);

        try {
          const phoneData = await invokeFunction('asrphone', phoneFD);

          if (phoneData?.success && phoneData?.verify_check) {
            const verifyCheck: ASRPhoneVerifyItem[] = phoneData.verify_check;

            let vi = 0;
            const updatedIntended = intended.map((p) => {
              if (p.phoneme !== null && vi < verifyCheck.length) {
                const c = verifyCheck[vi++];
                return {
                  ...p,
                  confidence: c.conf,
                  jyConf: c.jy_conf,
                  toneConf: c.tone_conf,
                  isLowConfidence: c.conf < CONFIDENCE_THRESHOLD || c.jy_conf < CONFIDENCE_THRESHOLD || c.tone_conf < CONFIDENCE_THRESHOLD,
                };
              }
              return p;
            });
            setIntendedPhonemes(updatedIntended);

            vi = 0;
            spoken = spoken.map((p) => {
              if (p.phoneme !== null && vi < verifyCheck.length) {
                const c = verifyCheck[vi++];
                return {
                  ...p,
                  phoneme: c.predicted || p.phoneme,
                  confidence: c.conf,
                  jyConf: c.jy_conf,
                  toneConf: c.tone_conf,
                  isLowConfidence: c.conf < CONFIDENCE_THRESHOLD || c.jy_conf < CONFIDENCE_THRESHOLD || c.tone_conf < CONFIDENCE_THRESHOLD,
                };
              }
              return p;
            });
          }
        } catch (phoneErr) {
          console.warn('ASRPhone error (continuing):', phoneErr);
        }
      }

      setSpokenPhonemes(spoken);
      return { spoken, intended };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      console.error('Lazy sound analysis error:', err);
      toast.error(msg);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { analyze, isProcessing, spokenPhonemes, intendedPhonemes, error };
};
