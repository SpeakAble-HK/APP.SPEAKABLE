/** Central rules for speech exercises (aligns with design doc §1.7). */

export const SPEECH_PASS_ACCURACY_THRESHOLD = 70;

/** Max analysis attempts per exercise item before forced continue. */
export const SPEECH_MAX_ATTEMPTS_PER_EXERCISE = 3;

export interface AttemptRollup {
  attemptCount: number;
  bestScore: number;
  lastScore: number;
}

export function passesAccuracy(accuracy: number): boolean {
  return accuracy >= SPEECH_PASS_ACCURACY_THRESHOLD;
}

/** After an attempt, should we show "try again"? */
export function shouldOfferRetry(passed: boolean, attemptCount: number): boolean {
  return !passed && attemptCount < SPEECH_MAX_ATTEMPTS_PER_EXERCISE;
}

/** User may continue when they passed, hit max attempts, or exhausted retries after fail. */
export function canContinueToNext(passed: boolean, attemptCount: number): boolean {
  if (passed) return true;
  return attemptCount >= SPEECH_MAX_ATTEMPTS_PER_EXERCISE;
}

export function nextBestScore(prev: number, accuracy: number): number {
  return Math.max(prev, accuracy);
}
