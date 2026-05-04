import type { PhonemeResult } from "@/hooks/usePronunciationAPI";
import type { BilabialPhonemeKey } from "./bilabialTypes";

function normalizeJyutpingInput(jp: unknown): string {
  if (typeof jp === "string") return jp.trim().toLowerCase();
  if (typeof jp === "number") return String(jp);
  if (!jp) return "";

  if (Array.isArray(jp)) {
    for (const item of jp) {
      const normalized = normalizeJyutpingInput(item);
      if (normalized) return normalized;
    }
    return "";
  }

  if (typeof jp === "object") {
    const candidate = (jp as Record<string, unknown>).phoneme
      ?? (jp as Record<string, unknown>).predicted
      ?? (jp as Record<string, unknown>).jyutping;
    return normalizeJyutpingInput(candidate);
  }

  return "";
}

/** Parse Jyutping body into initial / final / tone (tone digit at end). */
export function parseJyutping(jp: unknown): { initial: string; final: string; tone: string } {
  const normalized = normalizeJyutpingInput(jp);
  const toneMatch = normalized.match(/(\d)$/);
  const tone = toneMatch ? toneMatch[1] : "";
  const body = normalized.replace(/\d$/, "");
  const initials = [
    "ng",
    "gw",
    "kw",
    "ph",
    "ts",
    "dz",
    "b",
    "p",
    "m",
    "f",
    "d",
    "t",
    "n",
    "l",
    "g",
    "k",
    "h",
    "z",
    "c",
    "s",
    "j",
    "w",
  ];
  let initial = "";
  for (const ini of initials) {
    if (body.startsWith(ini)) {
      initial = ini;
      break;
    }
  }
  const final = body.slice(initial.length);
  return { initial, final, tone };
}

/** Map exercise key to API-expected onset (ph counts as p for 婆婆). */
export function normalizeInitialForTarget(initial: string, target: BilabialPhonemeKey): boolean {
  const i = initial.toLowerCase();
  if (target === "b") return i === "b";
  if (target === "p") return i === "p" || i === "ph";
  if (target === "m") return i === "m";
  return false;
}

export function getPracticeWordForPhoneme(key: BilabialPhonemeKey): string {
  if (key === "b") return "爸爸";
  if (key === "p") return "婆婆";
  return "媽媽";
}

export function computeAccuracyFromResult(intended: PhonemeResult[], spoken: PhonemeResult[]): number {
  const withPh = intended.filter((p) => p.phoneme !== null);
  if (withPh.length === 0) return 0;
  let match = 0;
  withPh.forEach((ip, idx) => {
    const sp = spoken[idx];
    if (!sp?.phoneme) return;
    if (ip.phoneme === sp.phoneme) match++;
    else {
      const ei = parseJyutping(ip.phoneme || "");
      const si = parseJyutping(sp.phoneme || "");
      if (ei.initial === si.initial && ei.final === si.final && ei.tone === si.tone) match++;
    }
  });
  return Math.round((match / withPh.length) * 100);
}

export function firstSpokenInitial(spoken: PhonemeResult[]): string {
  const first = spoken.find((p) => p.phoneme);
  if (!first?.phoneme) return "";
  return parseJyutping(first.phoneme).initial;
}

export function isolationCorrectionMessage(
  target: BilabialPhonemeKey,
  spokenInitial: string
): string {
  const s = spokenInitial.toLowerCase();
  if (target === "b" && (s === "m" || s === "ng")) {
    return "收起牙齒，合上嘴唇";
  }
  if (target === "p" && s === "b") {
    return "試著把手指放在嘴前，感受氣流";
  }
  if (target === "m") {
    return "試著閉嘴，用鼻子發聲";
  }
  return "再試一次，留意嘴形同氣流。";
}

export function matchingWrongMessage(expected: BilabialPhonemeKey, confusedAs: BilabialPhonemeKey): string {
  const label = (k: BilabialPhonemeKey) =>
    k === "b" ? "爸爸音 /b/" : k === "p" ? "婆婆音 /p/" : "媽媽音 /m/";
  return `你把${label(expected)}讀成了${label(confusedAs)}，試著不要噴氣。`;
}

/** Guess confused phoneme from wrong image's shell key (for feedback copy). */
export function shellKeyFromPhonemeString(ph: string): BilabialPhonemeKey | null {
  if (ph.includes("b") && !ph.includes("p")) return "b";
  if (ph.includes("p")) return "p";
  if (ph.includes("m")) return "m";
  return null;
}

/** Map lesson data `phoneme` field like `/b/` to exercise key. */
export function phonemeLabelToKey(phoneme: string): BilabialPhonemeKey {
  if (phoneme.startsWith("/m")) return "m";
  if (phoneme.startsWith("/p")) return "p";
  return "b";
}
