import type { GameEvent } from '../minigame-sdk/types';

export interface RewardProfile {
  learnerId: string;
  baseRewardRate: number;
  bonusMultiplier: number;
  streakCount: number;
  lastRewardAt: number;
  totalStars: number;
}

export function computeReward(
  attempt: GameEvent,
  profile: RewardProfile,
  difficultyMultiplier: number = 1
): number {
  // Base reward
  let total = attempt.isSuccess ? difficultyMultiplier * 10 : 2;

  // Streak bonus
  if (attempt.isSuccess) {
    const streakBonus = Math.min(profile.streakCount, 5) * 5;
    total += streakBonus;
  }

  // Speed bonus
  if (attempt.responseLatencyMs < 1500) {
    total += 3;
  }

  // Fatigue penalty (reduce pressure)
  // Note: fatigueFlag would come from profile or session state
  // For now, we'll skip this as it requires additional context

  return Math.floor(total);
}

export function updateRewardProfile(
  profile: RewardProfile,
  earned: number,
  isSuccess: boolean
): RewardProfile {
  return {
    ...profile,
    totalStars: profile.totalStars + earned,
    streakCount: isSuccess ? profile.streakCount + 1 : 0,
    lastRewardAt: Date.now(),
  };
}

export function createInitialRewardProfile(learnerId: string): RewardProfile {
  return {
    learnerId,
    baseRewardRate: 10,
    bonusMultiplier: 1,
    streakCount: 0,
    lastRewardAt: 0,
    totalStars: 0,
  };
}
