/** Shared structured flow for all bilabial exercises (no skipping). */
export type BilabialFlowPhase =
  | "idle"
  | "instruction"
  | "demo"
  | "user_action"
  | "AI_evaluation"
  | "feedback"
  | "next";

export type BilabialPhonemeKey = "b" | "p" | "m";

export const PHONEME_OPTIONS: { key: BilabialPhonemeKey; label: string; symbol: string }[] = [
  { key: "b", label: "爸爸音", symbol: "/b/" },
  { key: "p", label: "婆婆音", symbol: "/p/" },
  { key: "m", label: "媽媽音", symbol: "/m/" },
];
