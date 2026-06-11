import type { PhonemeResult } from "@/shared/hooks/usePronunciationAPI";
import { parseJyutping } from "@/shared/components/bilabial/bilabialUtils";

/** Frontend-only normalized view of API output (no API changes). */
export type FeedbackIssue = "tone" | "consonant" | "vowel";

export interface NormalizedPronunciationFeedback {
  accuracy: number;
  passed: boolean;
  /** Which dimensions had at least one mismatch. */
  issues: FeedbackIssue[];
  /** Short learner-facing line (Traditional Chinese). */
  shortMessageZh: string;
  /** Optional short English line. */
  shortMessageEn: string;
  /** Raw phoneme rows for expandable “details” UI. */
  optionalDetails: {
    character: string;
    intendedJyutping: string | null;
    spokenJyutping: string | null;
  }[];
}

function computeAccuracyPercent(intended: PhonemeResult[]): number {
  const withPh = intended.filter((p) => p.phoneme !== null);
  if (withPh.length === 0) return 0;
  const matchCount = withPh.filter((p) => !p.isLowConfidence).length;
  return Math.round((matchCount / withPh.length) * 100);
}

function buildShortMessages(
  accuracy: number,
  issues: FeedbackIssue[],
  passed: boolean
): { zh: string; en: string } {
  if (passed) {
    return {
      zh: "發音達標，做得很好！",
      en: "Great — you passed this attempt.",
    };
  }
  if (issues.includes("tone") && !issues.includes("consonant")) {
    return {
      zh: "試著把聲調稍微拉高或調整。",
      en: "Try raising or adjusting your tone slightly.",
    };
  }
  if (issues.includes("consonant")) {
    return {
      zh: "試著把字音開頭發得更清楚。",
      en: "Try a clearer starting sound.",
    };
  }
  if (accuracy >= 50) {
    return {
      zh: "再試一次，留意聲調與嘴形。",
      en: "Try again — focus on tone and mouth shape.",
    };
  }
  return {
    zh: "多聽示範，再慢慢模仿。",
    en: "Listen to the model again, then imitate slowly.",
  };
}

/**
 * Map `processRecording` outputs to simplified feedback.
 * Accuracy matches existing QuestSentenceExercise logic.
 */
export function adaptPronunciationFeedback(
  intended: PhonemeResult[],
  spoken: PhonemeResult[],
  passThreshold: number = 70
): NormalizedPronunciationFeedback {
  const accuracy = computeAccuracyPercent(intended);
  const passed = accuracy >= passThreshold;

  const issues: FeedbackIssue[] = [];
  let toneIssues = 0;
  let consIssues = 0;
  let vowelIssues = 0;

  intended.forEach((ip, idx) => {
    const sp = spoken[idx];
    if (!ip.phoneme || !sp?.phoneme) return;
    const ei = parseJyutping(ip.phoneme);
    const si = parseJyutping(sp.phoneme);
    if (ei.tone !== si.tone) toneIssues++;
    if (ei.initial !== si.initial) consIssues++;
    if (ei.final !== si.final) vowelIssues++;
  });

  if (toneIssues > 0) issues.push("tone");
  if (consIssues > 0) issues.push("consonant");
  if (vowelIssues > 0) issues.push("vowel");

  const { zh, en } = buildShortMessages(accuracy, issues, passed);

  const optionalDetails = intended.map((ip, idx) => ({
    character: ip.character,
    intendedJyutping: ip.phoneme,
    spokenJyutping: spoken[idx]?.phoneme ?? null,
  }));

  return {
    accuracy,
    passed,
    issues,
    shortMessageZh: zh,
    shortMessageEn: en,
    optionalDetails,
  };
}
