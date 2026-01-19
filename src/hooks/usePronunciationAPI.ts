import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ASRResult {
  success: boolean;
  transcription: string;
  confidence: number;
  duration_ms: number;
}

interface VoiceCloneResult {
  success: boolean;
  audio_base64: string;
  intended_text: string;
  original_transcription: string;
  message: string;
}

export const usePronunciationAPI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [asrResult, setAsrResult] = useState<ASRResult | null>(null);
  const [voiceCloneResult, setVoiceCloneResult] = useState<VoiceCloneResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processRecording = async (audioBlob: Blob, intendedText: string) => {
    setIsProcessing(true);
    setError(null);
    setAsrResult(null);
    setVoiceCloneResult(null);

    try {
      // Step 1: Send to ASR endpoint
      const asrFormData = new FormData();
      asrFormData.append('audio', audioBlob, 'recording.webm');

      const { data: asrData, error: asrError } = await supabase.functions.invoke('asr', {
        body: asrFormData,
      });

      if (asrError) throw new Error(asrError.message);
      
      const asr = asrData as ASRResult;
      setAsrResult(asr);
      console.log('ASR Result:', asr);

      // Step 2: Send to voice clone endpoint with ASR result, user voice, and intended text
      const voiceCloneFormData = new FormData();
      voiceCloneFormData.append('user_voice', audioBlob, 'recording.webm');
      voiceCloneFormData.append('intended_text', intendedText);
      voiceCloneFormData.append('asr_result', asr.transcription);

      const { data: cloneData, error: cloneError } = await supabase.functions.invoke('voice-clone', {
        body: voiceCloneFormData,
      });

      if (cloneError) throw new Error(cloneError.message);
      
      const clone = cloneData as VoiceCloneResult;
      setVoiceCloneResult(clone);
      console.log('Voice Clone Result:', clone);

      return { asr, clone };
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
    return `data:audio/wav;base64,${voiceCloneResult.audio_base64}`;
  };

  return {
    processRecording,
    isProcessing,
    asrResult,
    voiceCloneResult,
    error,
    getGeneratedAudioUrl,
  };
};
