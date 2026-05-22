import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PhonemeResult {
  character: string;
  phoneme: string | string[] | null;
  confidence?: number;
  jyConf?: number;
  toneConf?: number;
  isLowConfidence?: boolean;
}

interface ASRResult {
  success: boolean;
  result: [string, string | string[] | null][]; // Array of [character, jyutping] pairs
}

const normalizePhoneme = (phoneme: string | string[] | null | unknown): string | string[] | null => {
  if (phoneme == null) return null;
  if (typeof phoneme === 'string') return phoneme.trim() || null;
  if (Array.isArray(phoneme)) {
    const values = phoneme
      .flatMap((item) => {
        if (item == null) return [];
        return String(item).split(',');
      })
      .map((item) => item.trim())
      .filter(Boolean);
    return values.length > 0 ? values : null;
  }
  return String(phoneme).trim() || null;
};

const stringifyPhoneme = (phoneme: string | string[] | null): string | null => {
  if (typeof phoneme === 'string') return phoneme.trim() || null;
  if (Array.isArray(phoneme)) {
    const joined = phoneme.map((item) => String(item).trim()).filter(Boolean).join(',');
    return joined || null;
  }
  return null;
};

interface JyutpingResult {
  success: boolean;
  result: [string, string | null][]; // Array of [character, jyutping] pairs
}

interface ASRPhoneVerifyItem {
  verify: string;
  predicted: string;
  match: boolean;
  conf: number;
  jy_conf: number;
  tone_conf: number;
}

interface ASRPhoneResult {
  success: boolean;
  predicted: string;
  verify_check: ASRPhoneVerifyItem[];
}

interface VoiceCloneResult {
  success: boolean;
  audio_base64: string;
  content_type: string;
  size: number;
}

const CONFIDENCE_THRESHOLD = 0.5;

export const usePronunciationAPI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [spokenPhonemes, setSpokenPhonemes] = useState<PhonemeResult[]>([]);
  const [intendedPhonemes, setIntendedPhonemes] = useState<PhonemeResult[]>([]);
  const [voiceCloneResult, setVoiceCloneResult] = useState<VoiceCloneResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = async (): Promise<string> => {
    let { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      // Create anonymous session for guests — edge functions need a valid JWT
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
      // Do NOT set Content-Type — browser sets multipart boundary automatically
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

  const processRecording = async (audioBlob: Blob, intendedText: string, language: string = 'yue') => {
    setIsProcessing(true);
    setError(null);
    setSpokenPhonemes([]);
    setIntendedPhonemes([]);
    setVoiceCloneResult(null);

    try {
      // Step 1: Get intended phonemes from jyutping API
      const jyutpingFormData = new FormData();
      jyutpingFormData.append('text', intendedText);

      const jyutpingData = await invokeFunction('jyutping', jyutpingFormData);
      if (!jyutpingData.success) throw new Error(jyutpingData.error || 'Jyutping conversion failed');
      
      const intended: PhonemeResult[] = (jyutpingData as JyutpingResult).result.map(([char, phoneme]) => ({
        character: char,
        phoneme: normalizePhoneme(phoneme),
      }));
      setIntendedPhonemes(intended);
      console.log('Intended Phonemes:', intended);

      // Step 2: Send audio to ASR endpoint to get spoken phonemes
      const asrFormData = new FormData();
      asrFormData.append('audio', audioBlob, 'recording.webm');
      asrFormData.append('language', language);

      const asrData = await invokeFunction('asr', asrFormData);
      if (!asrData.success) throw new Error(asrData.error || 'ASR failed');
      
      let spoken: PhonemeResult[] = (asrData as ASRResult).result.map(([char, phoneme]) => ({
        character: char,
        phoneme: normalizePhoneme(phoneme),
      }));
      console.log('Initial Spoken Phonemes:', spoken);

      // Step 3: Use ASRPhone API to get confidence scores for verification
      const verifyText = intended
        .map(p => stringifyPhoneme(p.phoneme))
        .filter((p): p is string => p !== null)
        .join(' ');

      if (verifyText) {
        const asrPhoneFormData = new FormData();
        asrPhoneFormData.append('audio', audioBlob, 'recording.webm');
        asrPhoneFormData.append('verify_text', verifyText);

        try {
          const asrPhoneData = await invokeFunction('asrphone', asrPhoneFormData);

          if (asrPhoneData?.success && asrPhoneData?.verify_check) {
            const verifyCheck = (asrPhoneData as ASRPhoneResult).verify_check;
            console.log('ASRPhone Confidence Data:', verifyCheck);

            // Update intended phonemes with confidence data
            let verifyIndex = 0;
            const updatedIntended: PhonemeResult[] = intended.map((p) => {
              if (p.phoneme !== null && verifyIndex < verifyCheck.length) {
                const confItem = verifyCheck[verifyIndex];
                verifyIndex++;
                return {
                  ...p,
                  confidence: confItem.conf,
                  jyConf: confItem.jy_conf,
                  toneConf: confItem.tone_conf,
                  isLowConfidence: confItem.conf < CONFIDENCE_THRESHOLD || 
                                   confItem.jy_conf < CONFIDENCE_THRESHOLD || 
                                   confItem.tone_conf < CONFIDENCE_THRESHOLD
                };
              }
              return p;
            });
            setIntendedPhonemes(updatedIntended);
            console.log('Updated Intended Phonemes with Confidence:', updatedIntended);

            // Update spoken phonemes based on predictions
            verifyIndex = 0;
            spoken = spoken.map((p) => {
              if (p.phoneme !== null && verifyIndex < verifyCheck.length) {
                const confItem = verifyCheck[verifyIndex];
                verifyIndex++;
                return {
                  ...p,
                  phoneme: normalizePhoneme(confItem.predicted || p.phoneme),
                  confidence: confItem.conf,
                  jyConf: confItem.jy_conf,
                  toneConf: confItem.tone_conf,
                  isLowConfidence: confItem.conf < CONFIDENCE_THRESHOLD || 
                                   confItem.jy_conf < CONFIDENCE_THRESHOLD || 
                                   confItem.tone_conf < CONFIDENCE_THRESHOLD
                };
              }
              return p;
            });
          }
        } catch (phoneErr) {
          console.warn('ASRPhone API error (continuing without confidence):', phoneErr);
        }
      }

      setSpokenPhonemes(spoken);
      console.log('Final Spoken Phonemes:', spoken);

      // Step 4: Generate voice clone with correct pronunciation (only if ASR returned results)
      const transcribedText = spoken.map(p => p.character).join('');
      
      let clone: VoiceCloneResult | null = null;
      if (transcribedText.trim().length > 0) {
        const ttsFormData = new FormData();
        ttsFormData.append('text', intendedText);
        ttsFormData.append('prompt_text', transcribedText);
        ttsFormData.append('prompt_audio', audioBlob, 'recording.webm');

        const cloneData = await invokeFunction('voice-clone', ttsFormData);
        if (!cloneData.success) throw new Error(cloneData.error || 'Voice clone failed');
        
        clone = cloneData as VoiceCloneResult;
        setVoiceCloneResult(clone);
        console.log('Voice Clone Result:', clone);
      } else {
        console.warn('Skipping voice clone: ASR returned no transcription');
      }

      return { spoken, intended, clone };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Processing error:', err);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const getGeneratedAudioUrl = (): string | null => {
    if (!voiceCloneResult?.audio_base64) return null;
    const contentType = voiceCloneResult.content_type || 'audio/wav';
    return `data:${contentType};base64,${voiceCloneResult.audio_base64}`;
  };

  return {
    processRecording,
    isProcessing,
    spokenPhonemes,
    intendedPhonemes,
    voiceCloneResult,
    error,
    getGeneratedAudioUrl,
  };
};
