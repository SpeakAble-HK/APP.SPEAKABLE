import type { MiniGameBlueprint, PhonemeTarget, DifficultyLevel, MechanicType, PatientContext, ChallengeItem } from "./types";
import { generateSceneConfig, SCENE_CAMERA } from "./sceneGenerator";

const MECHANIC_BY_TARGET: Record<string, MechanicType> = {
  initial: "select-correct",
  final: "drag-sort",
  tone: "tone-wheel",
};

const MECHANIC_POOL: MechanicType[] = [
  "select-correct",
  "drag-sort",
  "tone-wheel",
  "repeat-after",
  "match-pair",
  "minimal-pair-dash",
];

const THEME_BY_TARGET: Record<string, { scene: string; particles: string; primary: string; secondary: string }> = {
  initial: { scene: "forest", particles: "sparkles", primary: "#2563eb", secondary: "#10b981" },
  final: { scene: "underwater", particles: "bubbles", primary: "#0891b2", secondary: "#6366f1" },
  tone: { scene: "space", particles: "stars", primary: "#7c3aed", secondary: "#ec4899" },
};

const SCENE_ENV: Record<string, { environment: string; particleEffect: "sparkles" | "bubbles" | "stars" }> = {
  forest: { environment: "forest", particleEffect: "sparkles" },
  underwater: { environment: "underwater", particleEffect: "bubbles" },
  space: { environment: "space", particleEffect: "stars" },
};

const PHONEME_TO_TYPE: Record<string, "initial" | "final" | "tone"> = {
  b: "initial", p: "initial", m: "initial", f: "initial",
  d: "initial", t: "initial", n: "initial", l: "initial",
  g: "initial", k: "initial", ng: "initial", h: "initial",
  gw: "initial", kw: "initial",
  w: "initial", j: "initial",
  aa: "final", aai: "final", aau: "final", aam: "final", aan: "final", aang: "final", aap: "final", aat: "final", aak: "final",
  i: "final", iu: "final", im: "final", in: "final", ing: "final", ip: "final", it: "final", ik: "final",
  u: "final", ui: "final", un: "final", ung: "final", ut: "final", uk: "final",
  e: "final", ei: "final", eng: "final", ek: "final",
  o: "final", oi: "final", ou: "final", on: "final", ong: "final", ot: "final", ok: "final",
  oe: "final", oeng: "final", oek: "final",
  eo: "final", eoi: "final", eon: "final", eot: "final",
  yu: "final", yun: "final", yut: "final",
  1: "tone", "2": "tone", "3": "tone", "4": "tone", "5": "tone", "6": "tone",
};

const baseWords: Record<string, { char: string; jyutping: string }[]> = {
  b: [{ char: "爸", jyutping: "baa1" }, { char: "波", jyutping: "bo1" }, { char: "杯", jyutping: "bui1" }, { char: "筆", jyutping: "bat1" }],
  p: [{ char: "怕", jyutping: "paa3" }, { char: "婆", jyutping: "po4" }, { char: "跑", jyutping: "paau2" }, { char: "平", jyutping: "ping4" }],
  m: [{ char: "媽", jyutping: "maa1" }, { char: "毛", jyutping: "mou4" }, { char: "米", jyutping: "mai5" }, { char: "門", jyutping: "mun4" }],
  d: [{ char: "大", jyutping: "daai6" }, { char: "地", jyutping: "dei6" }, { char: "刀", jyutping: "dou1" }, { char: "燈", jyutping: "dang1" }],
  t: [{ char: "他", jyutping: "taa1" }, { char: "天", jyutping: "tin1" }, { char: "頭", jyutping: "tau4" }, { char: "糖", jyutping: "tong4" }],
  n: [{ char: "你", jyutping: "nei5" }, { char: "男", jyutping: "naam4" }, { char: "女", jyutping: "neoi5" }, { char: "年", jyutping: "nin4" }],
  l: [{ char: "啦", jyutping: "laa1" }, { char: "來", jyutping: "loi4" }, { char: "老", jyutping: "lou5" }, { char: "龍", jyutping: "lung4" }],
  g: [{ char: "哥", jyutping: "go1" }, { char: "家", jyutping: "gaa1" }, { char: "狗", jyutping: "gau2" }, { char: "高", jyutping: "gou1" }],
  k: [{ char: "卡", jyutping: "kaa1" }, { char: "橋", jyutping: "kiu4" }, { char: "口", jyutping: "hau2" }, { char: "看", jyutping: "hon3" }],
  gw: [{ char: "瓜", jyutping: "gwaa1" }, { char: "鬼", jyutping: "gwai2" }, { char: "光", jyutping: "gwong1" }, { char: "關", jyutping: "gwaan1" }],
  kw: [{ char: "誇", jyutping: "kwaa1" }, { char: "困", jyutping: "kwan3" }, { char: "群", jyutping: "kwan4" }],
  aa: [{ char: "沙", jyutping: "saa1" }, { char: "花", jyutping: "faa1" }],
  i: [{ char: "詩", jyutping: "si1" }, { char: "知", jyutping: "zi1" }],
  u: [{ char: "夫", jyutping: "fu1" }],
  e: [{ char: "些", jyutping: "se1" }],
  o: [{ char: "疏", jyutping: "so1" }, { char: "哥", jyutping: "go1" }],
  1: [{ char: "媽", jyutping: "maa1" }, { char: "花", jyutping: "faa1" }, { char: "詩", jyutping: "si1" }, { char: "東", jyutping: "dung1" }],
  2: [{ char: "反", jyutping: "faan2" }, { char: "好", jyutping: "hou2" }, { char: "走", jyutping: "zau2" }, { char: "九", jyutping: "gau2" }],
  3: [{ char: "罵", jyutping: "maa3" }, { char: "化", jyutping: "faa3" }, { char: "試", jyutping: "si3" }, { char: "四", jyutping: "sei3" }],
  4: [{ char: "牛", jyutping: "ngau4" }, { char: "人", jyutping: "jan4" }, { char: "裙", jyutping: "kwan4" }, { char: "橋", jyutping: "kiu4" }],
  5: [{ char: "你", jyutping: "nei5" }, { char: "雨", jyutping: "jyu5" }, { char: "老", jyutping: "lou5" }, { char: "米", jyutping: "mai5" }],
  6: [{ char: "話", jyutping: "waa6" }, { char: "畫", jyutping: "waa6" }, { char: "樹", jyutping: "syu6" }, { char: "路", jyutping: "lou6" }],
  ng: [{ char: "牛", jyutping: "ngau4" }, { char: "牙", jyutping: "ngaa4" }],
  h: [{ char: "好", jyutping: "hou2" }, { char: "花", jyutping: "faa1" }],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function inferPhonemeType(phonemes: string[]): "initial" | "final" | "tone" {
  for (const ph of phonemes) {
    const t = PHONEME_TO_TYPE[ph];
    if (t) return t;
  }
  return "initial";
}

function generateChallenges(
  target: PhonemeTarget,
  count: number,
  confusionMap?: Record<string, string[]>,
): { text: string; jyutping: string; correctAnswer: string; options: string[] }[] {
  const phonemePool = target.phonemes;
  if (phonemePool.length < 2) return [];

  const challenges: { text: string; jyutping: string; correctAnswer: string; options: string[] }[] = [];
  const used: Set<string> = new Set();

  for (let i = 0; i < count * 3 && challenges.length < count; i++) {
    const mainPh = phonemePool[i % phonemePool.length];

    const mainWords = baseWords[mainPh];
    if (!mainWords) continue;

    const word = mainWords[i % mainWords.length];
    if (!word || used.has(word.char)) continue;
    used.add(word.char);

    const answer = target.type === "initial"
      ? mainPh
      : target.type === "final"
        ? word.jyutping.slice(1).replace(/[0-9]$/, "")
        : word.jyutping.slice(-1);

    const possibleDistractors: string[] = [];

    if (confusionMap && confusionMap[mainPh]) {
      possibleDistractors.push(...confusionMap[mainPh]);
    }

    const others = phonemePool.filter((ph) => ph !== mainPh);
    possibleDistractors.push(...others);

    const distractorPh = pick(possibleDistractors) || pick(phonemePool.filter((_, idx) => idx !== i % phonemePool.length));

    const wrongPh = target.type === "initial"
      ? distractorPh
      : target.type === "final"
        ? pick(Object.keys(baseWords).filter((k) => k !== mainPh))
        : String(Number(answer) + 1 > 6 ? 1 : Number(answer) + 1);

    const optionsSet = new Set<string>([answer, wrongPh]);
    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    challenges.push({
      text: word.char,
      jyutping: word.jyutping,
      correctAnswer: answer,
      options: options.length >= 2 ? options : [answer, wrongPh],
    });
  }

  return challenges;
}

function pickWeakestPhonemes(ctx: PatientContext, maxCount: number): PhonemeTarget | null {
  const sorted = [...ctx.phonemeProfiles]
    .filter((p) => p.accuracy < 0.8)
    .sort((a, b) => a.accuracy - b.accuracy);

  if (sorted.length === 0) return null;

  const targetPhonemes = sorted.slice(0, maxCount).map((p) => p.phoneme);
  const type = inferPhonemeType(targetPhonemes);

  return { type, phonemes: targetPhonemes };
}

function buildConfusionMap(ctx: PatientContext): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const p of ctx.phonemeProfiles) {
    if (p.confusions.length > 0) {
      map[p.phoneme] = p.confusions;
    }
  }
  return map;
}

function patientAdjustedDifficulty(ctx: PatientContext, preferred: DifficultyLevel): DifficultyLevel {
  if (ctx.overallAccuracy < 0.45) return "easy";
  if (ctx.overallAccuracy > 0.85) return "hard";
  return preferred;
}

export function generateBlueprint(
  id: string,
  target: PhonemeTarget,
  difficulty: DifficultyLevel,
  name?: string,
  rounds?: number,
  patientContext?: PatientContext,
  mechanicType?: MechanicType,
): MiniGameBlueprint {
  const theme = THEME_BY_TARGET[target.type] || THEME_BY_TARGET.initial;
  const scene = SCENE_ENV[theme.scene] || SCENE_ENV.forest;
  const multiplier = difficulty === "easy" ? 0.4 : difficulty === "hard" ? 1.0 : 0.7;
  const challengeCount = difficulty === "easy" ? 4 : difficulty === "hard" ? 8 : 6;
  const timeLimit = difficulty === "easy" ? 30 : difficulty === "hard" ? 10 : 20;

  const confusionMap = patientContext ? buildConfusionMap(patientContext) : undefined;
  const challenges = generateChallenges(target, rounds || challengeCount, confusionMap);

  const sceneConfig = generateSceneConfig(scene.environment, [target], difficulty, target);

  const phonemeLabel = target.phonemes.join(" / ");
  const patientLabel = patientContext ? `[${patientContext.name}] ` : "";
  const fatigueSec = patientContext?.fatiguedAtMinute
    ? patientContext.fatiguedAtMinute * 60
    : 600;

  const mt = mechanicType || MECHANIC_BY_TARGET[target.type] || "select-correct";

  return {
    id,
    name: name || `${patientLabel}${phonemeLabel} 辨別練習`,
    description: patientContext
      ? `針對 ${patientContext.name} 的 ${phonemeLabel} 弱點 (準確率 ${Math.round(Math.min(...target.phonemes.map((ph) => {
          const match = patientContext.phonemeProfiles.find((p) => p.phoneme === ph);
          return match ? match.accuracy * 100 : 0;
        })))}%) — ${difficulty === "easy" ? "基礎" : difficulty === "hard" ? "進階" : "中階"}難度`
      : `在${difficulty === "easy" ? "基礎" : difficulty === "hard" ? "進階" : "中階"}難度中辨別 ${phonemeLabel}`,
    phonemeTargets: [target],
    mechanic: {
      type: mt,
      timeLimitSec: timeLimit,
      itemsPerRound: challenges.length,
      roundsPerGame: 1,
      showScore: true,
      showTimer: true,
      allowRetry: false,
      passThreshold: difficulty === "easy" ? 0.5 : difficulty === "hard" ? 0.8 : 0.65,
    },
    scene: {
      environment: scene.environment,
      particleEffect: scene.particleEffect,
      camera_position: SCENE_CAMERA[scene.environment]?.position,
    },
    sceneConfig,
    ui: {
      cardStyle: "card",
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
      accentColor: "#f59e0b",
      showCharacter: true,
      showJyutping: true,
    },
    rewards: {
      onCorrect: "sparkle",
      onStreak: "badge",
      onComplete: "summary",
    },
    challenges: challenges.map((c, i) => ({
      id: `${id}-${i}`,
      text: c.text,
      jyutping: c.jyutping,
      correctAnswer: c.correctAnswer,
      options: c.options,
      difficulty: difficulty,
    })),
    adaptationRules: {
      difficultyMultiplier: multiplier,
      fatigueThresholdSec: fatigueSec,
      adaptiveDifficulty: true,
    },
    generatedBy: "ai",
    createdAt: new Date().toISOString(),
  };
}

export function generateBlueprintFromDescription(
  description: string,
  difficulty: DifficultyLevel,
  patientContext?: PatientContext,
  mechanicType?: MechanicType,
): MiniGameBlueprint {
  const desc = description.toLowerCase();
  let target: PhonemeTarget;

  if (patientContext) {
    const autoTarget = pickWeakestPhonemes(patientContext, 3);
    if (autoTarget) {
      target = autoTarget;
      difficulty = patientAdjustedDifficulty(patientContext, difficulty);
    } else {
      target = { type: "initial", phonemes: ["b", "p", "m"] };
    }
  } else if (desc.includes("tone") || desc.includes("聲調")) {
    target = { type: "tone", phonemes: ["1", "3", "6"] };
  } else if (desc.includes("final") || desc.includes("韻尾") || desc.includes("韻母")) {
    target = { type: "final", phonemes: ["ng", "n"] };
  } else if (desc.includes("gw") || desc.includes("kw") || desc.includes("圓唇")) {
    target = { type: "initial", phonemes: ["gw", "kw"] };
  } else if (desc.includes("n") || desc.includes("l") || desc.includes("鼻音")) {
    target = { type: "initial", phonemes: ["n", "l"] };
  } else {
    target = { type: "initial", phonemes: ["b", "p", "m"] };
  }

  return generateBlueprint(`ai-${Date.now()}`, target, difficulty, description, undefined, patientContext, mechanicType);
}
