/**
 * Persists voice sample audio blobs in IndexedDB so they survive page refreshes.
 * Used by onboarding to store recordings and by TTS to retrieve them for voice cloning.
 */

const DB_NAME = "speakable_voice";
const DB_VERSION = 1;
const STORE = "samples";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Save a voice sample blob under a key (e.g. "sample1", "sample2"). */
export async function saveVoiceSample(key: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Retrieve a saved voice sample blob. Returns null if not found. */
export async function getVoiceSample(key: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

/** Check whether any voice sample exists. */
export async function hasVoiceSamples(): Promise<boolean> {
  try {
    const s1 = await getVoiceSample("sample1");
    return s1 !== null;
  } catch {
    return false;
  }
}

/** Delete all stored voice samples. */
export async function clearVoiceSamples(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
