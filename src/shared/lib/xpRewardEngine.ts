/** Bonus / penalty rules for quest XP (design §1.4) — frontend only. */

export interface LessonXpParams {
  baseXp: number;
  accuracy: number;
  attemptCount: number;
  /** Subtract small XP for extra tries after the first. */
  applyRetryPenalty?: boolean;
}

export function computeLessonXpReward(params: LessonXpParams): number {
  let xp = params.baseXp;
  if (params.accuracy >= 90) {
    xp = Math.round(xp * 1.1);
  }
  if (params.applyRetryPenalty && params.attemptCount > 1) {
    xp -= 5 * (params.attemptCount - 1);
  }
  return Math.max(0, Math.round(xp));
}
