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
 * For very short text (≤2 chars), wraps in a carrier phrase so the TTS
 * generates enough audio, then clips to the final word.
 * Falls back to Web Speech API if no stored sample or API fails.
 */
export async function speakWithClonedVoice(text: string, promptText?: string): Promise<void> {
  const sample = await getStoredSample();
  if (!sample) {
    return speakCantonese(text);
  }

  try {
    const token = await getAuthToken();
    const projectUrl = import.meta.env.VITE_SUPABASE_URL;

    // For short text, use a carrier phrase so TTS produces real audio
    const needsCarrier = text.length <= 2;
    const ttsText = needsCarrier ? `請跟住讀，${text}。` : text;

    const fd = new FormData();
    fd.append("text", ttsText);
    fd.append("prompt_text", promptText || ttsText);
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
    let audioBlob = new Blob([u8], { type: contentType });

    // Clip to last word if we used a carrier phrase
    if (needsCarrier && audioBlob.size > 1000) {
      try {
        audioBlob = await clipLastWord(audioBlob);
      } catch (e) {
        console.warn("[clonedVoiceTTS] clip failed, using full audio:", e);
      }
    }

    console.log(`[clonedVoiceTTS] Playing audio: ${audioBlob.size} bytes, type: ${contentType}, carrier: ${needsCarrier}`);

    const audioUrl = URL.createObjectURL(audioBlob);
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

// ── Silence-based clipping (reused from demoPipeline logic) ─────────

async function clipLastWord(audioBlob: Blob): Promise<Blob> {
  const ctx = new AudioContext();
  try {
    const arrayBuf = await audioBlob.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arrayBuf);
    const wordStart = findLastWordStart(decoded);
    return encodeWav(decoded, wordStart, decoded.length);
  } finally {
    await ctx.close();
  }
}

function findLastWordStart(buffer: AudioBuffer, minSilenceMs = 200, threshold = 0.02): number {
  const data = buffer.getChannelData(0);
  const sr = buffer.sampleRate;
  const windowSize = Math.round((minSilenceMs / 1000) * sr);
  const totalSamples = data.length;

  for (let end = totalSamples; end - windowSize > 0; end -= Math.round(windowSize / 4)) {
    const start = end - windowSize;
    let sum = 0;
    for (let i = start; i < end; i++) sum += data[i] * data[i];
    const rms = Math.sqrt(sum / windowSize);
    if (rms < threshold) {
      for (let j = end; j < totalSamples; j++) {
        if (Math.abs(data[j]) > threshold * 2) {
          return Math.max(0, j - Math.round(0.05 * sr));
        }
      }
      return end;
    }
  }
  return Math.round(totalSamples * 0.6);
}

function encodeWav(buffer: AudioBuffer, startSample: number, endSample: number): Blob {
  const numCh = buffer.numberOfChannels;
  const len = endSample - startSample;
  const sr = buffer.sampleRate;
  const bitsPerSample = 16;
  const blockAlign = numCh * (bitsPerSample / 8);
  const dataSize = len * blockAlign;
  const buf = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buf);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let i = 0; i < len; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      let s = buffer.getChannelData(ch)[startSample + i];
      s = Math.max(-1, Math.min(1, s));
      view.setInt16(offset, s * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([buf], { type: "audio/wav" });
}
