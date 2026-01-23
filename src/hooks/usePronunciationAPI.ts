import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PhonemeResult {
  character: string;
  phoneme: string | null;
  confidence?: number;
  jyConf?: number;
  toneConf?: number;
  isLowConfidence?: boolean;
}

interface ASRResult {
  success: boolean;
  result: [string, string | null][]; // Array of [character, jyutping] pairs
}

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

      const { data: jyutpingData, error: jyutpingError } = await supabase.functions.invoke('jyutping', {
        body: jyutpingFormData,
      });

      if (jyutpingError) throw new Error(jyutpingError.message);
      if (!jyutpingData.success) throw new Error(jyutpingData.error || 'Jyutping conversion failed');
      
      const intended: PhonemeResult[] = (jyutpingData as JyutpingResult).result.map(([char, phoneme]) => ({
        character: char,
        phoneme: phoneme
      }));
      setIntendedPhonemes(intended);
      console.log('Intended Phonemes:', intended);

      // Step 2: Send audio to ASR endpoint to get spoken phonemes
      const asrFormData = new FormData();
      asrFormData.append('audio', audioBlob, 'recording.webm');
      asrFormData.append('language', language);

      const { data: asrData, error: asrError } = await supabase.functions.invoke('asr', {
        body: asrFormData,
      });

      if (asrError) throw new Error(asrError.message);
      if (!asrData.success) throw new Error(asrData.error || 'ASR failed');
      
      let spoken: PhonemeResult[] = (asrData as ASRResult).result.map(([char, phoneme]) => ({
        character: char,
        phoneme: phoneme
      }));
      console.log('Initial Spoken Phonemes:', spoken);

      // Step 3: Use ASRPhone API to get confidence scores for verification
      // Build verify_text from intended phonemes (only phonemes, space-separated)
      const verifyText = intended
        .filter(p => p.phoneme !== null)
        .map(p => p.phoneme)
        .join(' ');

      if (verifyText) {
        const asrPhoneFormData = new FormData();
        asrPhoneFormData.append('audio', audioBlob, 'recording.webm');
        asrPhoneFormData.append('verify_text', verifyText);

        const { data: asrPhoneData, error: asrPhoneError } = await supabase.functions.invoke('asrphone', {
          body: asrPhoneFormData,
        });

        if (asrPhoneError) {
          console.warn('ASRPhone API error:', asrPhoneError.message);
          // Continue without confidence data
        } else if (asrPhoneData?.success && asrPhoneData?.verify_check) {
          const verifyCheck = (asrPhoneData as ASRPhoneResult).verify_check;
          console.log('ASRPhone Confidence Data:', verifyCheck);

          // Map confidence scores to intended phonemes
          const phonemeConfidenceMap = new Map<string, ASRPhoneVerifyItem>();
          verifyCheck.forEach((item) => {
            // Use the verify phoneme as key
            if (!phonemeConfidenceMap.has(item.verify)) {
              phonemeConfidenceMap.set(item.verify, item);
            }
          });

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
          const predictedPhonemes = asrPhoneData.predicted?.split(' ') || [];
          verifyIndex = 0;
          spoken = spoken.map((p, idx) => {
            if (p.phoneme !== null && verifyIndex < verifyCheck.length) {
              const confItem = verifyCheck[verifyIndex];
              verifyIndex++;
              return {
                ...p,
                phoneme: confItem.predicted || p.phoneme,
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
      }

      setSpokenPhonemes(spoken);
      console.log('Final Spoken Phonemes:', spoken);

      // Step 4: Generate voice clone with correct pronunciation
      const transcribedText = spoken.map(p => p.character).join('');
      
      const ttsFormData = new FormData();
      ttsFormData.append('text', intendedText);
      ttsFormData.append('prompt_text', transcribedText);
      ttsFormData.append('prompt_audio', audioBlob, 'recording.webm');

      const { data: cloneData, error: cloneError } = await supabase.functions.invoke('voice-clone', {
        body: ttsFormData,
      });

      if (cloneError) throw new Error(cloneError.message);
      if (!cloneData.success) throw new Error(cloneData.error || 'Voice clone failed');
      
      const clone = cloneData as VoiceCloneResult;
      setVoiceCloneResult(clone);
      console.log('Voice Clone Result:', clone);

      return { spoken, intended, clone };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Processing error:', err);
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
