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
 * Find the start sample of the last word by scanning backwards for a silence
 * gap ≥ `minSilenceMs` (amplitude RMS below `threshold`).
 */
export function findLastWordStart(
  buffer: AudioBuffer,
  minSilenceMs = 150,
  threshold = 0.015
): number {
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
      // Found silence — scan forward for first non-silent sample
      for (let j = end; j < totalSamples; j++) {
        if (Math.abs(data[j]) > threshold * 2) {
          return Math.max(0, j - Math.round(0.05 * sr));
        }
      }
      return end;
    }
  }
  // Fallback: last 35% of audio (biased toward shorter target words)
  return Math.round(totalSamples * 0.65);
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
