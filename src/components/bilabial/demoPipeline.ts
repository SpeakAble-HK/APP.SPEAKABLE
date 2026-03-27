/**
 * Demo audio generation pipeline for bilabial phoneme teaching.
 *
 * Flow per phoneme (/b/, /p/, /m/):
 *   1. TTS voice-clone → full instruction sentence (user's voice)
 *   2. Decode audio → detect last silence gap → clip the final word
 *   3. Cache the clipped demo blob in IndexedDB for instant replay
 */

import { supabase } from "@/integrations/supabase/client";
import { getVoiceSample } from "@/hooks/useVoiceSampleStore";
import { speakCantonese } from "./cantoneseTTS";
import type { BilabialPhonemeKey } from "./bilabialTypes";

// ── Instruction sentences fed to TTS ────────────────────────────────
const DEMO_SENTENCES: Record<BilabialPhonemeKey, string> = {
  b: "雙唇閉緊，輕輕彈開，，爸。",
  p: "雙唇閉緊，強力噴氣，，爬。",
  m: "雙唇閉合，鼻震動，，唔。",
};

// Fallback words for Web Speech API when voice-clone fails
const FALLBACK_WORDS: Record<BilabialPhonemeKey, string> = {
  b: "爸",
  p: "爬",
  m: "唔",
};

/** Minimum useful audio size in bytes (WAV header = 44 bytes) */
const MIN_AUDIO_BYTES = 200;

// ── IndexedDB store for demo clips ──────────────────────────────────
const DB_NAME = "speakable_demos";
const DB_VERSION = 1;
const STORE = "clips";

function openDemoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveDemoClip(key: string, blob: Blob): Promise<void> {
  const db = await openDemoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getDemoClip(key: string): Promise<Blob | null> {
  try {
    const db = await openDemoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const r = tx.objectStore(STORE).get(key);
      r.onsuccess = () => resolve(r.result ?? null);
      r.onerror = () => reject(r.error);
    });
  } catch {
    return null;
  }
}

export async function clearDemoClips(): Promise<void> {
  try {
    const db = await openDemoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignore */
  }
}

// ── Auth helper ─────────────────────────────────────────────────────
async function getToken(): Promise<string> {
  let { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.session?.access_token) throw new Error("No session");
    session = data.session;
  }
  return session.access_token;
}

// ── Step 1: Voice-clone TTS ─────────────────────────────────────────
async function generateFullAudio(
  text: string,
  voiceSample: Blob
): Promise<{ audioBlob: Blob; contentType: string }> {
  const token = await getToken();
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-clone`;

  const fd = new FormData();
  fd.append("text", text);
  fd.append("prompt_text", text);
  fd.append("prompt_audio", voiceSample, "voice-sample.webm");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: fd,
  });

  if (!res.ok) throw new Error(`TTS failed: ${res.status}`);
  const data = await res.json();
  if (!data.success || !data.audio_base64) throw new Error("No TTS audio");

  const ct = data.content_type || "audio/wav";
  const raw = atob(data.audio_base64);
  const u8 = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
  return { audioBlob: new Blob([u8], { type: ct }), contentType: ct };
}

// ── Step 2 & 3: Silence detection → clip last word ──────────────────

/** Encode an AudioBuffer region as a WAV blob. */
function encodeWav(buffer: AudioBuffer, startSample: number, endSample: number): Blob {
  const numCh = buffer.numberOfChannels;
  const len = endSample - startSample;
  const sr = buffer.sampleRate;
  const bitsPerSample = 16;
  const blockAlign = numCh * (bitsPerSample / 8);
  const dataSize = len * blockAlign;
  const headerSize = 44;
  const buf = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buf);

  // RIFF header
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = headerSize;
  for (let i = 0; i < len; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      let sample = buffer.getChannelData(ch)[startSample + i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([buf], { type: "audio/wav" });
}

/**
 * Find the start sample of the last word by scanning backwards for a silence
 * gap ≥ `minSilenceMs` (amplitude RMS below `threshold`).
 */
function findLastWordStart(
  buffer: AudioBuffer,
  minSilenceMs = 200,
  threshold = 0.02
): number {
  const data = buffer.getChannelData(0);
  const sr = buffer.sampleRate;
  const windowSize = Math.round((minSilenceMs / 1000) * sr);
  const totalSamples = data.length;

  // Walk backwards in windows until we find a silence window
  for (let end = totalSamples; end - windowSize > 0; end -= Math.round(windowSize / 4)) {
    const start = end - windowSize;
    let sum = 0;
    for (let i = start; i < end; i++) sum += data[i] * data[i];
    const rms = Math.sqrt(sum / windowSize);
    if (rms < threshold) {
      // Found silence — the word starts after this window
      // Scan forward from here to find first non-silent sample
      for (let j = end; j < totalSamples; j++) {
        if (Math.abs(data[j]) > threshold * 2) {
          // Add a tiny lead-in (50ms)
          return Math.max(0, j - Math.round(0.05 * sr));
        }
      }
      return end;
    }
  }
  // Fallback: last 40% of audio
  return Math.round(totalSamples * 0.6);
}

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

// ── Public API ──────────────────────────────────────────────────────

/**
 * Generate + clip + store a demo for a single phoneme.
 * Returns the clipped Blob (also saved to IndexedDB).
 */
export async function generateDemoForPhoneme(
  key: BilabialPhonemeKey
): Promise<Blob | null> {
  try {
    const voiceSample = await getVoiceSample("sample1");
    if (!voiceSample) {
      console.warn("No voice sample — cannot generate demo");
      return null;
    }

    const sentence = DEMO_SENTENCES[key];
    console.log(`[demoPipeline] Generating TTS for /${key}/: "${sentence}"`);

    // Step 1: Full TTS
    const { audioBlob: fullAudio } = await generateFullAudio(sentence, voiceSample);

    // Step 2 & 3: Clip last word via silence detection
    const clipped = await clipLastWord(fullAudio);
    console.log(`[demoPipeline] Clipped demo for /${key}/:`, clipped.size, "bytes");

    // Store full instruction audio
    await saveDemoClip(`full_${key}`, fullAudio);

    // Only store clipped word if it has real audio data (not just WAV header)
    if (clipped.size >= MIN_AUDIO_BYTES) {
      await saveDemoClip(`word_${key}`, clipped);
    } else {
      console.warn(`[demoPipeline] Clipped audio too small (${clipped.size} bytes) for /${key}/, storing full audio as word fallback`);
      await saveDemoClip(`word_${key}`, fullAudio);
    }

    return clipped.size >= MIN_AUDIO_BYTES ? clipped : fullAudio;
  } catch (err) {
    console.error(`[demoPipeline] Failed for /${key}/:`, err);
    return null;
  }
}

/**
 * Generate demos for all 3 phonemes in sequence.
 * Returns a map of the clipped word blobs.
 */
export async function generateAllDemos(): Promise<
  Record<BilabialPhonemeKey, Blob | null>
> {
  const result: Record<BilabialPhonemeKey, Blob | null> = { b: null, p: null, m: null };
  for (const key of ["b", "p", "m"] as BilabialPhonemeKey[]) {
    // Check cache first
    const cached = await getDemoClip(`word_${key}`);
    if (cached) {
      result[key] = cached;
      continue;
    }
    result[key] = await generateDemoForPhoneme(key);
  }
  return result;
}

/**
 * Play a demo clip — tries cached clip first, generates on-demand if missing.
 * @param variant "full" plays the full instruction, "word" plays just the clipped syllable.
 */
export async function playDemo(
  key: BilabialPhonemeKey,
  variant: "full" | "word" = "word"
): Promise<void> {
  const cacheKey = `${variant}_${key}`;
  let blob = await getDemoClip(cacheKey);

  if (!blob || blob.size < MIN_AUDIO_BYTES) {
    // Generate on demand
    await generateDemoForPhoneme(key);
    blob = await getDemoClip(cacheKey);
  }

  // If still no usable audio, fallback to Web Speech API
  if (!blob || blob.size < MIN_AUDIO_BYTES) {
    console.warn(`[demoPipeline] No usable demo for /${key}/ (${variant}), falling back to Web Speech`);
    const word = variant === "word" ? FALLBACK_WORDS[key] : DEMO_SENTENCES[key];
    await speakCantonese(word);
    return;
  }

  const url = URL.createObjectURL(blob);
  try {
    await new Promise<void>((resolve) => {
      const a = new Audio(url);
      a.onended = () => resolve();
      a.onerror = () => {
        console.warn(`[demoPipeline] Audio playback error for /${key}/ (${variant})`);
        resolve();
      };
      a.play().catch(() => resolve());
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
