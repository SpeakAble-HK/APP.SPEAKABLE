import type { PhonemeResult } from "@/hooks/usePronunciationAPI";
import { parseJyutping } from "@/components/bilabial/bilabialUtils";
import type { AttemptTag } from "@/types/learningData";

/** Derive coarse tags for dataset / filtering (design §2.3). */
export function deriveAttemptTags(intended: PhonemeResult[], spoken: PhonemeResult[]): AttemptTag[] {
  const tags = new Set<AttemptTag>();
  intended.forEach((ip, idx) => {
    const sp = spoken[idx];
    if (!ip.phoneme || !sp?.phoneme) return;
    const ei = parseJyutping(ip.phoneme);
    const si = parseJyutping(sp.phoneme);
    if (ei.tone !== si.tone) tags.add("tone_error");
    if (ei.initial !== si.initial) tags.add("consonant_error");
    if (ei.final !== si.final) tags.add("vowel_error");
  });
  return [...tags];
}
