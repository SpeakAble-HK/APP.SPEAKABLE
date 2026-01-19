import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ASRResult {
  success: boolean;
  text: string;
  language: string;
  duration: number;
}

interface VoiceCloneResult {
  success: boolean;
  audio_base64: string;
  content_type: string;
  size: number;
}

export const usePronunciationAPI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [asrResult, setAsrResult] = useState<ASRResult | null>(null);
  const [voiceCloneResult, setVoiceCloneResult] = useState<VoiceCloneResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processRecording = async (audioBlob: Blob, intendedText: string, language: string = 'auto') => {
    setIsProcessing(true);
    setError(null);
    setAsrResult(null);
    setVoiceCloneResult(null);

    try {
      // Step 1: Send to ASR endpoint
      const asrFormData = new FormData();
      asrFormData.append('audio', audioBlob, 'recording.webm');
      asrFormData.append('language', language);

      const { data: asrData, error: asrError } = await supabase.functions.invoke('asr', {
        body: asrFormData,
      });

      if (asrError) throw new Error(asrError.message);
      if (!asrData.success) throw new Error(asrData.error || 'ASR failed');
      
      const asr = asrData as ASRResult;
      setAsrResult(asr);
      console.log('ASR Result:', asr);

      // Step 2: Send to TTS/voice-clone endpoint
      // - text: what we want the AI to speak (intended pronunciation)
      // - prompt_text: the ASR transcription (what user actually said)
      // - prompt_audio: the user's voice recording (for voice cloning)
      const ttsFormData = new FormData();
      ttsFormData.append('text', intendedText);
      ttsFormData.append('prompt_text', asr.text);
      ttsFormData.append('prompt_audio', audioBlob, 'recording.webm');

      const { data: cloneData, error: cloneError } = await supabase.functions.invoke('voice-clone', {
        body: ttsFormData,
      });

      if (cloneError) throw new Error(cloneError.message);
      if (!cloneData.success) throw new Error(cloneData.error || 'Voice clone failed');
      
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
    const contentType = voiceCloneResult.content_type || 'audio/wav';
    return `data:${contentType};base64,${voiceCloneResult.audio_base64}`;
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
