/**
 * Demo audio generation pipeline for bilabial phoneme teaching.
 *
 * Flow per phoneme (/b/, /p/, /m/):
 *   1. Send the stored target recording to the vc API
 *   2. Cache the returned demo audio blob in IndexedDB for instant replay
 */

import { getVoiceSample } from "@/hooks/useVoiceSampleStore";
import { MIN_AUDIO_BYTES } from "./audioClipUtils";
import type { BilabialPhonemeKey } from "./bilabialTypes";

const VC_DEMO_URL = "http://comp.naozumi.me/api/vc";


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

export async function saveDemoClip(key: string, blob: Blob): Promise<void> {
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

async function generateVcDemoAudio(
  source: BilabialPhonemeKey,
  voiceSample: Blob
): Promise<Blob> {
  const fd = new FormData();
  fd.append("target_audio", voiceSample, "voice-sample.wav");
  fd.append("source", source);

  const res = await fetch(VC_DEMO_URL, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    throw new Error(`vc api failed: ${res.status}`);
  }

  const contentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  const blob = await res.blob();

  if (contentType === "application/zip") {
    throw new Error("vc api returned a zip bundle; expected a single wav for one phoneme");
  }

  if (contentType.startsWith("audio/") || contentType === "application/octet-stream" || contentType === "") {
    return new Blob([await blob.arrayBuffer()], { type: contentType || "audio/wav" });
  }

  throw new Error(`Unexpected vc api response: ${contentType || "unknown"}`);
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

    console.log(`[demoPipeline] Generating vc demo for /${key}/`);

    const audioBlob = await generateVcDemoAudio(key, voiceSample);
    console.log(`[demoPipeline] Generated demo for /${key}/:`, audioBlob.size, "bytes");

    if (audioBlob.size >= MIN_AUDIO_BYTES) {
      await saveDemoClip(`full_${key}`, audioBlob);
      await saveDemoClip(`word_${key}`, audioBlob);
      return audioBlob;
    }

    console.warn(`[demoPipeline] vc demo too small (${audioBlob.size} bytes) for /${key}/`);
    return null;
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
    if (cached && cached.size >= MIN_AUDIO_BYTES) {
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

  // If still no usable audio, stop quietly; this demo path no longer uses TTS.
  if (!blob || blob.size < MIN_AUDIO_BYTES) {
    console.warn(`[demoPipeline] No usable demo for /${key}/ (${variant})`);
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
