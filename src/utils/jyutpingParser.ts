// Jyutping phoneme parser - separates initials, finals, and tones

// All valid Jyutping initials
const INITIALS = [
  'ng', 'gw', 'kw', 
  'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 
  'g', 'k', 'h', 'w', 'z', 'c', 's', 'j'
];

// Sort by length descending to match longest first
const SORTED_INITIALS = [...INITIALS].sort((a, b) => b.length - a.length);

export interface ParsedPhoneme {
  character: string;
  phoneme: string | null;
  initial: string | null;
  final: string | null;
  tone: string | null;
}

/**
 * Parse a Jyutping syllable into initial, final, and tone
 * @param phoneme - The full Jyutping syllable (e.g., "gong1", "aa3")
 * @returns Object with initial, final, and tone
 */
export function parseJyutping(phoneme: string | null): { initial: string | null; final: string | null; tone: string | null } {
  if (!phoneme) {
    return { initial: null, final: null, tone: null };
  }

  let remaining = phoneme.toLowerCase();
  let initial: string | null = null;
  let final: string | null = null;
  let tone: string | null = null;

  // Extract tone (last character if it's a digit 1-6)
  const lastChar = remaining.slice(-1);
  if (/[1-6]/.test(lastChar)) {
    tone = lastChar;
    remaining = remaining.slice(0, -1);
  }

  // Extract initial
  for (const init of SORTED_INITIALS) {
    if (remaining.startsWith(init)) {
      initial = init;
      remaining = remaining.slice(init.length);
      break;
    }
  }

  // The rest is the final (vowel + optional ending consonant)
  if (remaining.length > 0) {
    final = remaining;
  }

  // Handle syllables with no initial (null initial, starts with vowel)
  // In this case, the whole syllable minus tone is the final
  if (initial === null && final === null && remaining.length === 0) {
    // Edge case: phoneme was just a tone number
    final = null;
  }

  return { initial, final, tone };
}

/**
 * Parse a PhonemeResult into a ParsedPhoneme with separated components
 */
export function parsePhonemeResult(result: { character: string; phoneme: string | null }): ParsedPhoneme {
  const { initial, final, tone } = parseJyutping(result.phoneme);
  return {
    character: result.character,
    phoneme: result.phoneme,
    initial,
    final,
    tone
  };
}

/**
 * Get tone description for display
 */
export function getToneDescription(tone: string | null): string {
  const toneDescriptions: Record<string, string> = {
    '1': 'High Level',
    '2': 'High Rising',
    '3': 'Mid Level',
    '4': 'Low Falling',
    '5': 'Low Rising',
    '6': 'Low Level'
  };
  return tone ? toneDescriptions[tone] || tone : '-';
}
