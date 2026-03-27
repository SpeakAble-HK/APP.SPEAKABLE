/** Config-driven mascot copy (design §1.9). Triggers stay minimal. */

export type MascotTrigger = "start_lesson" | "pass" | "fail" | "streak";

export const mascotMessages: Record<
  MascotTrigger,
  { en: string; zhTW: string; zhCN: string }
> = {
  start_lesson: {
    en: "Let's try this phrase.",
    zhTW: "試試這一句。",
    zhCN: "试试这一句。",
  },
  pass: {
    en: "Good job!",
    zhTW: "做得好！",
    zhCN: "做得好！",
  },
  fail: {
    en: "Try again — you've got this.",
    zhTW: "再試一次，你可以的。",
    zhCN: "再试一次，你可以的。",
  },
  streak: {
    en: "Streak on fire!",
    zhTW: "連續練習加油！",
    zhCN: "连续练习加油！",
  },
};

export function getMascotLine(
  trigger: MascotTrigger,
  lang: "en-GB" | "zh-TW" | "zh-CN"
): string {
  const row = mascotMessages[trigger];
  if (lang === "en-GB") return row.en;
  if (lang === "zh-TW") return row.zhTW;
  return row.zhCN;
}
