import { deriveAttemptTags } from "@/shared/lib/deriveAttemptTags";
import type { PhonemeResult } from "@/shared/hooks/usePronunciationAPI";
import type { AttemptRecord } from "@/shared/types/learningData";
import { defaultLearningStorage, type LearningStorage } from "@/shared/lib/storage/learningStorage";
import { getUserProfile } from "@/shared/lib/userProfileStore";

function randomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Append-only local log of analysis outputs (design §2.2).
 * Skips rich logging if `consent_given` is false on profile.
 */
export function logPronunciationAttempt(params: {
  lessonId: string;
  intended: PhonemeResult[];
  spoken: PhonemeResult[];
  accuracy: number;
  storage?: LearningStorage;
}): AttemptRecord | null {
  const profile = getUserProfile();
  if (profile.consent_given === false) {
    return null;
  }

  const tags = deriveAttemptTags(params.intended, params.spoken);
  const row: AttemptRecord = {
    attempt_id: randomId(),
    lesson_id: params.lessonId,
    timestamp: new Date().toISOString(),
    accuracy_score: params.accuracy,
    phoneme_flags: tags,
    intended_summary: params.intended
      .map((p) => p.phoneme)
      .filter(Boolean)
      .join(" "),
    spoken_summary: params.spoken
      .map((p) => p.phoneme)
      .filter(Boolean)
      .join(" "),
  };

  (params.storage ?? defaultLearningStorage).saveAttempt(row);
  return row;
}
