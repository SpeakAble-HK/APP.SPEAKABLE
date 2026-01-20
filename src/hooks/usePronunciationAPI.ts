import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PhonemeResult {
  character: string;
  phoneme: string | null;
}

interface ASRResult {
  success: boolean;
  result: [string, string | null][]; // Array of [character, jyutping] pairs
}

interface JyutpingResult {
  success: boolean;
  result: [string, string | null][]; // Array of [character, jyutping] pairs
}

interface VoiceCloneResult {
  success: boolean;
  audio_base64: string;
  content_type: string;
  size: number;
}

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
      
      const spoken: PhonemeResult[] = (asrData as ASRResult).result.map(([char, phoneme]) => ({
        character: char,
        phoneme: phoneme
      }));
      setSpokenPhonemes(spoken);
      console.log('Spoken Phonemes:', spoken);

      // Step 3: Generate voice clone with correct pronunciation
      // Get the transcribed text from ASR for prompt_text
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
