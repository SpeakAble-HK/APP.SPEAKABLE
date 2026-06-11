import { useState, useRef } from 'react';
import { toast } from 'sonner';

export interface PhonemeEvent {
  phoneme: string;
  start_ms: number;
  end_ms: number;
  confidence: number;
  phoneme_type: string;
}

export interface PhonemeResult {
  character: string;
  phoneme: string | string[] | null;
  confidence?: number;
  jyConf?: number;
  toneConf?: number;
  isLowConfidence?: boolean;
}

interface WordResult {
  character: string;
  intended_jyutping: string | null;
  spoken_jyutping: string | null;
  confidence: number;
  jy_conf: number;
  tone_conf: number;
  is_low_confidence: boolean;
  events: PhonemeEvent[];
}

interface SynthesizeResponse {
  success: boolean;
  audio_base64: string;
  content_type: string;
  size: number;
}

interface VoiceCloneResult {
  success: boolean;
  audio_base64: string;
  content_type: string;
  size: number;
}

const CONFIDENCE_THRESHOLD = 0.5;
const API_BASE_URL = import.meta.env.VITE_NEPA_URL || 'http://localhost:8100';

function normalizePhoneme(value: string | string[] | null | unknown): string | string[] | null {
  if (value == null) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (Array.isArray(value)) {
    return value.map((v) => v.trim()).filter(Boolean) as string[];
  }
  return null;
}

function audioBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function usePronunciationAPI() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [spokenPhonemes, setSpokenPhonemes] = useState<PhonemeResult[]>([]);
  const [intendedPhonemes, setIntendedPhonemes] = useState<PhonemeResult[]>([]);
  const [voiceCloneResult, setVoiceCloneResult] = useState<VoiceCloneResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const calibratorWeight = useRef(0.3);

  const processRecording = async (
    audioBlob: Blob,
    intendedText: string,
    _language: string = 'yue',
    patientId?: string,
  ) => {
    setIsProcessing(true);
    setError(null);
    setSpokenPhonemes([]);
    setIntendedPhonemes([]);
    setVoiceCloneResult(null);

    try {
      // Call the Speakable Core phonemes endpoint via multipart upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`${API_BASE_URL}/api/v1/speech/phonemes`, {
        method: 'POST',
        body: formData,
      });

      const words: WordResult[] = [];

      if (response.ok) {
        const result = await response.json();
        const phonemeArray = result.phonemes || [];

        const intendedChars = intendedText.split('').map((ch, i) => ({
          character: ch,
          phoneme: (phonemeArray[i] as any)?.phoneme || null,
        }));
        setIntendedPhonemes(
          intendedChars.map((c) => ({
            character: c.character,
            phoneme: normalizePhoneme(c.phoneme),
          }))
        );

        const spoken: PhonemeResult[] = phonemeArray.map((p: any) => ({
          character: p.phoneme || '',
          phoneme: p.phoneme || null,
          confidence: p.confidence || 0,
          jyConf: p.confidence || 0,
          toneConf: 0,
          isLowConfidence: (p.confidence || 0) < CONFIDENCE_THRESHOLD,
        }));
        setSpokenPhonemes(spoken);

        phonemeArray.forEach((p: any, i: number) => {
          words.push({
            character: intendedChars[i]?.character || '',
            intended_jyutping: intendedChars[i]?.phoneme as string || null,
            spoken_jyutping: p.phoneme || null,
            confidence: p.confidence || 0,
            jy_conf: p.confidence || 0,
            tone_conf: 0,
            is_low_confidence: (p.confidence || 0) < CONFIDENCE_THRESHOLD,
            events: [],
          });
        });
      } else {
        throw new Error(`Phoneme processing failed (${response.status})`);
      }

      // Voice clone via Supabase edge function
      let clone: VoiceCloneResult | null = null;
      if (intendedText.trim().length > 0) {
        try {
          const synthResponse = await fetch(`${API_BASE_URL}/api/v1/speech/synthesize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: intendedText,
              voice_id: 'default',
              prompt_audio_base64: await audioBlobToBase64(audioBlob),
              prompt_text: intendedText,
              ...(patientId ? { patient_id: patientId } : {}),
            }),
          });

          if (synthResponse.ok) {
            const synthData: SynthesizeResponse = await synthResponse.json();
            if (synthData.success) {
              clone = {
                success: true,
                audio_base64: synthData.audio_base64,
                content_type: synthData.content_type,
                size: synthData.size,
              };
              setVoiceCloneResult(clone);
            }
          }
        } catch (synthErr) {
          console.warn('Synthesis unavailable, skipping voice clone:', synthErr);
        }
      }

      return { spoken: spokenPhonemes, intended: intendedPhonemes, clone };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Phoneme processing error:', err);
      toast.error(message);
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
}
