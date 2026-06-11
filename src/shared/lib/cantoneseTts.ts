// Reliable Cantonese text-to-speech with voice-readiness handling and fallback.
//
// Browser speechSynthesis voices load asynchronously; calling speak() before
// getVoices() is populated frequently yields silence or a wrong-language voice.
// This helper waits for voices, prefers zh-HK (then zh-TW / zh-CN / any zh),
// and exposes whether a real Cantonese voice is available so callers can warn.

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesReady = false;
const readyWaiters: Array<() => void> = [];

function refreshVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const v = window.speechSynthesis.getVoices();
  if (v && v.length > 0) {
    cachedVoices = v;
    voicesReady = true;
    while (readyWaiters.length) readyWaiters.shift()?.();
  }
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

/** Resolve once the voice list is available (or immediately if already loaded). */
export function ensureVoices(timeoutMs = 1500): Promise<void> {
  if (voicesReady) return Promise.resolve();
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve();
  refreshVoices();
  if (voicesReady) return Promise.resolve();
  return new Promise((resolve) => {
    const t = window.setTimeout(() => resolve(), timeoutMs);
    readyWaiters.push(() => {
      window.clearTimeout(t);
      resolve();
    });
  });
}

const ZH_PRIORITY = ["zh-HK", "yue", "zh-TW", "zh-CN", "zh"];

export function pickCantoneseVoice(): SpeechSynthesisVoice | undefined {
  for (const pref of ZH_PRIORITY) {
    const match = cachedVoices.find(
      (v) => v.lang?.toLowerCase().startsWith(pref.toLowerCase()) ||
             v.name?.toLowerCase().includes("cantonese") ||
             v.name?.toLowerCase().includes("yue"),
    );
    if (match) return match;
  }
  return undefined;
}

/** Is a genuine Cantonese (zh-HK / yue) voice available on this device? */
export function hasCantoneseVoice(): boolean {
  return !!cachedVoices.find(
    (v) => v.lang?.toLowerCase().startsWith("zh-hk") ||
           v.lang?.toLowerCase().startsWith("yue") ||
           v.name?.toLowerCase().includes("cantonese"),
  );
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onend?: () => void;
  onerror?: () => void;
}

/**
 * Speak Cantonese text reliably. Returns true if speech was dispatched.
 * Falls back to the closest Chinese voice when no zh-HK voice exists, but always
 * sets lang="zh-HK" so devices with OS-level Cantonese still pronounce correctly.
 */
export async function speakCantonese(text: string, opts: SpeakOptions = {}): Promise<boolean> {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) {
    opts.onerror?.();
    return false;
  }
  await ensureVoices();
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-HK";
  utterance.rate = opts.rate ?? 0.85;
  utterance.pitch = opts.pitch ?? 1;
  const voice = pickCantoneseVoice();
  if (voice) utterance.voice = voice;
  if (opts.onend) utterance.onend = opts.onend;
  utterance.onerror = () => opts.onerror?.();

  // Safari/Chrome sometimes need a tick after cancel().
  window.setTimeout(() => window.speechSynthesis.speak(utterance), 30);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
