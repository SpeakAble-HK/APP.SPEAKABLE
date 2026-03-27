/**
 * Shared audio clipping utilities for extracting target words from carrier phrases.
 */

/** Minimum useful audio size in bytes (WAV header = 44 bytes) */
export const MIN_AUDIO_BYTES = 200;

/** Encode an AudioBuffer region as a WAV blob. */
export function encodeWav(buffer: AudioBuffer, startSample: number, endSample: number): Blob {
  const numCh = buffer.numberOfChannels;
  const len = endSample - startSample;
  const sr = buffer.sampleRate;
  const bitsPerSample = 16;
  const blockAlign = numCh * (bitsPerSample / 8);
  const dataSize = len * blockAlign;
  const headerSize = 44;
  const buf = new ArrayBuffer(headerSize + dataSize);
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
 * Find the start sample of the last word/syllable.
 * 
 * Strategy: For carrier phrases ending with a single target syllable,
 * we use a time-based approach (last ~1.0s) as primary, then refine
 * by scanning for a silence gap within that window.
 * This avoids the fragile full-scan that often clips at wrong positions.
 */
export function findLastWordStart(
  buffer: AudioBuffer,
  maxTailMs = 1000,
  minSilenceMs = 100,
  threshold = 0.02
): number {
  const data = buffer.getChannelData(0);
  const sr = buffer.sampleRate;
  const totalSamples = data.length;

  // Start searching from at most `maxTailMs` before the end
  const searchStart = Math.max(0, totalSamples - Math.round((maxTailMs / 1000) * sr));
  const windowSize = Math.round((minSilenceMs / 1000) * sr);

  // Scan forward from searchStart looking for a silence gap
  for (let pos = searchStart; pos + windowSize < totalSamples - Math.round(0.1 * sr); pos += Math.round(windowSize / 3)) {
    let sum = 0;
    for (let i = pos; i < pos + windowSize; i++) sum += data[i] * data[i];
    const rms = Math.sqrt(sum / windowSize);
    if (rms < threshold) {
      // Found silence — find where speech resumes after it
      for (let j = pos + windowSize; j < totalSamples; j++) {
        if (Math.abs(data[j]) > threshold * 2) {
          // Add a small pre-roll (30ms) for natural onset
          return Math.max(0, j - Math.round(0.03 * sr));
        }
      }
      // Silence found but no speech after — use position after silence
      return Math.min(pos + windowSize, totalSamples - Math.round(0.2 * sr));
    }
  }

  // No clear silence gap found — take the last 0.8s as fallback
  return Math.max(0, totalSamples - Math.round(0.8 * sr));
}

/**
 * Clip the last word from an audio blob using silence detection.
 * Returns the clipped blob, or the original if clipping fails.
 */
export async function clipLastWord(audioBlob: Blob): Promise<Blob> {
  const ctx = new AudioContext();
  try {
    const arrayBuf = await audioBlob.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arrayBuf);
    const wordStart = findLastWordStart(decoded);
    const clipped = encodeWav(decoded, wordStart, decoded.length);
    console.log(`[audioClip] Clipped: ${wordStart}/${decoded.length} samples → ${clipped.size} bytes`);
    if (clipped.size >= MIN_AUDIO_BYTES) {
      return clipped;
    }
    console.warn(`[audioClip] Clipped too small, returning original`);
    return audioBlob;
  } catch (err) {
    console.warn(`[audioClip] Clipping failed:`, err);
    return audioBlob;
  } finally {
    await ctx.close();
  }
}
