import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_NEPA_URL || 'http://localhost:8100';

export interface VoiceCloneResult {
  audioUrl: string;
  phonemes: PhonemeResult[];
  confidence: number;
}

export interface PhonemeResult {
  character: string;
  phoneme: string | null;
  confidence: number;
  isLowConfidence: boolean;
}

export function useVoiceCloning() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [cloneResult, setCloneResult] = useState<VoiceCloneResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioUrl(null);
    setCloneResult(null);
    setDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        
        if (chunksRef.current.length === 0) {
          setError("沒有錄到聲音，請重試。");
          setRecording(false);
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
        
        if (blob.size < 1000) {
          setError("錄音太短，請重試。");
          setRecording(false);
          return;
        }

        await processVoiceClone(blob);
      };

      mediaRecorder.start(100);
      startTimeRef.current = Date.now();
      setRecording(true);
      
      timerRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
      
    } catch (err) {
      console.error('Microphone error:', err);
      setError("無法使用咪高峰，請檢查權限。");
      setRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const processVoiceClone = async (audioBlob: Blob) => {
    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-sample.webm");

      const phonemeResponse = await fetch(`${API_BASE_URL}/api/v1/speech/phonemes`, {
        method: "POST",
        body: formData,
      });

      let phonemes: PhonemeResult[] = [];
      let overallConfidence = 0;

      if (phonemeResponse.ok) {
        const result = await phonemeResponse.json();
        const phonemeArray = result.phonemes || [];
        
        phonemes = phonemeArray.map((p: any) => ({
          character: p.character || p.phoneme || '',
          phoneme: p.phoneme || null,
          confidence: p.confidence || 0,
          isLowConfidence: (p.confidence || 0) < 0.5,
        }));
        
        overallConfidence = phonemes.length > 0
          ? phonemes.reduce((sum, p) => sum + p.confidence, 0) / phonemes.length
          : 0;
      }

      const synthFormData = new FormData();
      synthFormData.append("prompt_audio", audioBlob, "voice-sample.webm");
      synthFormData.append("prompt_text", "你好，呢個係語音複製測試。");
      synthFormData.append("text", "你好，呢個係語音複製測試。");

      const synthResponse = await fetch(`${API_BASE_URL}/api/v1/speech/synthesize`, {
        method: "POST",
        body: synthFormData,
      });

      let generatedAudioUrl: string | null = null;

      if (synthResponse.ok) {
        const synthData = await synthResponse.json();
        
        if (synthData?.audio_base64 && synthData?.content_type) {
          const audioBlob = b64toBlob(synthData.audio_base64, synthData.content_type);
          generatedAudioUrl = URL.createObjectURL(audioBlob);
        }
      }

      if (generatedAudioUrl) {
        setAudioUrl(generatedAudioUrl);
        setCloneResult({
          audioUrl: generatedAudioUrl,
          phonemes,
          confidence: overallConfidence,
        });
        toast.success("語音複製完成！");
      } else {
        setError("語音生成失敗，請重試。");
      }
      
    } catch (err) {
      console.error('Voice clone error:', err);
      setError("語音處理失敗，請重試。");
    } finally {
      setRecording(false);
      setProcessing(false);
    }
  };

  const reset = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setCloneResult(null);
    setRecording(false);
    setProcessing(false);
    setError(null);
    setDuration(0);
  }, [audioUrl]);

  const playGeneratedAudio = useCallback(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        console.error('Playback error:', err);
        toast.error("無法播放音频");
      });
    }
  }, [audioUrl]);

  return {
    recording,
    processing,
    audioUrl,
    cloneResult,
    error,
    duration,
    startRecording,
    stopRecording,
    reset,
    playGeneratedAudio,
  };
}

function b64toBlob(b64Data: string, contentType: string) {
  const byteCharacters = atob(b64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i += 1) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: contentType });
}
