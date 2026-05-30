
import { useState, useRef } from 'react';

export function useVoiceCloning() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording(promptText?: string, text?: string) {
    setError(null);
    setAudioUrl(null);
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        // Upload to Supabase Edge Function
        try {
          const fd = new FormData();
          fd.append('prompt_audio', blob, 'voice-sample.webm');
          fd.append('prompt_text', promptText || '請跟讀這句話');
          fd.append('text', text || '你好，這是語音克隆測試');
          const res = await fetch('/functions/v1/voice-clone', {
            method: 'POST',
            headers: {
              // Authorization header will be added by Supabase client if needed
            },
            body: fd,
          });
          const data = await res.json();
          if (data && data.audio_base64 && data.content_type) {
            // Convert base64 to Blob URL for playback
            const audioBlob = b64toBlob(data.audio_base64, data.content_type);
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
          } else {
            setError(data?.error || 'Failed to generate voice.');
          }
        } catch (err) {
          setError('Upload or synthesis failed.');
        }
        setRecording(false);
      };
      mr.start();
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mr.state === 'recording') mr.stop();
      }, 5000);
    } catch (e) {
      setError('Could not access microphone.');
      setRecording(false);
    }
  }

  function reset() {
    setAudioUrl(null);
    setRecording(false);
    setError(null);
  }

  // Helper: convert base64 to Blob
  function b64toBlob(b64Data: string, contentType: string) {
    const byteCharacters = atob(b64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  return {
    recording,
    audioUrl,
    error,
    startRecording,
    reset,
  };
}
