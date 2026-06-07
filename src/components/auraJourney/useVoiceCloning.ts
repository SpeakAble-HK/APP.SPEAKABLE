import { useCallback, useRef, useState } from "react";

export function useVoiceCloning() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async (promptText?: string, text?: string) => {
    setError(null);
    setAudioUrl(null);
    setRecording(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });

        try {
          const formData = new FormData();
          formData.append("prompt_audio", blob, "voice-sample.webm");
          formData.append("prompt_text", promptText || "請跟讀呢句說話");
          formData.append("text", text || "你好，呢個係語音複製測試。");

          const response = await fetch("/functions/v1/voice-clone", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();

          if (data?.audio_base64 && data?.content_type) {
            const audioBlob = b64toBlob(data.audio_base64, data.content_type);
            setAudioUrl(URL.createObjectURL(audioBlob));
          } else {
            setError(data?.error || "未能生成複製聲音。");
          }
        } catch {
          setError("上載或語音生成失敗。");
        }

        setRecording(false);
      };

      mediaRecorder.start();
      window.setTimeout(() => {
        if (mediaRecorder.state === "recording") mediaRecorder.stop();
      }, 5000);
    } catch {
      setError("未能使用咪高峰。");
      setRecording(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAudioUrl(null);
    setRecording(false);
    setError(null);
  }, []);

  return {
    recording,
    audioUrl,
    error,
    startRecording,
    reset,
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
