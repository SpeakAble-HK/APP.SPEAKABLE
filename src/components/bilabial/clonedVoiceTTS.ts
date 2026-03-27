/**
 * Cantonese TTS using the voice-clone API with the user's stored voice sample.
 * Falls back to Web Speech API if no voice sample is available or if the API fails.
 */
import { supabase } from "@/integrations/supabase/client";
import { getVoiceSample } from "@/hooks/useVoiceSampleStore";
import { speakCantonese } from "./cantoneseTTS";

let cachedSampleBlob: Blob | null | undefined = undefined; // undefined = not loaded yet

async function getStoredSample(): Promise<Blob | null> {
  if (cachedSampleBlob !== undefined) return cachedSampleBlob;
  try {
    cachedSampleBlob = await getVoiceSample("sample1");
  } catch {
    cachedSampleBlob = null;
  }
  return cachedSampleBlob;
}

/** Invalidate cache so next call re-reads from IndexedDB (call after new recording). */
export function invalidateVoiceCache() {
  cachedSampleBlob = undefined;
}

async function getAuthToken(): Promise<string> {
  let { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.session?.access_token) throw new Error("No session");
    session = data.session;
  }
  return session.access_token;
}

/**
 * Speak text using the user's cloned voice.
 * Falls back to Web Speech API if no stored sample or API fails.
 */
export async function speakWithClonedVoice(text: string, promptText?: string): Promise<void> {
  if (!text.trim()) return;

  const sample = await getStoredSample();
  if (!sample) {
    return speakCantonese(text);
  }

  try {
    const token = await getAuthToken();
    const projectUrl = import.meta.env.VITE_SUPABASE_URL;

    const cleanText = text.trim();
    const useCarrier = cleanText.length <= 2;
    const ttsText = useCarrier ? `請跟住讀，${cleanText}。` : cleanText;
    const ttsPrompt = promptText?.trim() || ttsText;

    const fd = new FormData();
    fd.append("text", ttsText);
    fd.append("prompt_text", ttsPrompt);
    fd.append("prompt_audio", sample, "voice-sample.webm");

    const res = await fetch(`${projectUrl}/functions/v1/voice-clone`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: fd,
    });

    if (!res.ok) throw new Error(`voice-clone ${res.status}`);

    const data = await res.json();
    if (!data.success || !data.audio_base64) throw new Error("No audio returned");

    const contentType = data.content_type || "audio/wav";
    const raw = atob(data.audio_base64);
    const u8 = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
    const blob = new Blob([u8], { type: contentType });
    const audioUrl = URL.createObjectURL(blob);

    console.log(`[clonedVoiceTTS] Playing audio: ${blob.size} bytes, type: ${contentType}, carrier: ${useCarrier}`);

    await new Promise<void>((resolve, reject) => {
      const a = new Audio(audioUrl);
      a.onended = () => { URL.revokeObjectURL(audioUrl); resolve(); };
      a.onerror = (e) => { URL.revokeObjectURL(audioUrl); reject(new Error(`Audio playback error: ${e}`)); };
      a.play().catch((e) => { URL.revokeObjectURL(audioUrl); reject(e); });
    });
  } catch (err) {
    console.warn("Voice clone TTS failed, falling back to Web Speech:", err);
    return speakCantonese(text);
  }
}
