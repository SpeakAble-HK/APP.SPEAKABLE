import type { AttemptRecord } from "@/types/learningData";

export interface AggregatedMetrics {
  avgAccuracy: number;
  weakPhonemeTags: Record<string, number>;
  attemptCount: number;
}

export function aggregateAttempts(attempts: AttemptRecord[]): AggregatedMetrics {
  if (attempts.length === 0) {
    return { avgAccuracy: 0, weakPhonemeTags: {}, attemptCount: 0 };
  }
  const sum = attempts.reduce((s, a) => s + a.accuracy_score, 0);
  const weakPhonemeTags: Record<string, number> = {};
  for (const a of attempts) {
    for (const t of a.phoneme_flags) {
      weakPhonemeTags[t] = (weakPhonemeTags[t] ?? 0) + 1;
    }
  }
  return {
    avgAccuracy: Math.round(sum / attempts.length),
    weakPhonemeTags,
    attemptCount: attempts.length,
  };
}
