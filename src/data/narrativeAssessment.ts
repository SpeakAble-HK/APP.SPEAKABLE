// ─────────────────────────────────────────────────────────────────────────────
// Narrative Assessment Profile (NAP) + Rubric Scale for Cantonese Speech Therapy
//
// Clinically grounded in the standard SLP narrative-language assessment literature:
//  • MISL — Monitoring Indicators of Scholarly Language (Gillam, Gillam & Petersen):
//    macrostructure (story grammar) + microstructure subscales combined into a
//    total narrative-proficiency score. 0–3 per element.
//  • NSS — Narrative Scoring Scheme (Heilmann, Miller, Nockerts & Dunaway, 2010):
//    0–5 Likert ratings across coherence/cohesion dimensions.
//  • To, Stokes, Cheung & T'sou (2010, JSLHR) — Narrative assessment for
//    Cantonese-speaking children: syntactic complexity, semantic score,
//    referencing, connective use as the validated Cantonese microstructure markers.
//
// References:
//  - MISL rubric: https://cdn-links.lww.com/permalink/tld/a/tld_2015_12_07_sandra_1500023_sdc2.pdf
//  - NSS scoring guide: https://www.saltsoftware.com/media/wysiwyg/codeaids/NSS_Scoring_Guide.pdf
//  - Cantonese narrative norms: https://web.edu.hku.hk/f/staff/333/61175/2010_JSLHR_Narrative_To%20et%20al.%20.pdf
// ─────────────────────────────────────────────────────────────────────────────

export type RubricDomain = "macrostructure" | "microstructure" | "intelligibility";

/** Each element is scored 0–4 (extended MISL/NSS-style continuum). */
export const RUBRIC_MIN = 0;
export const RUBRIC_MAX = 4;

export interface RubricLevelDescriptor {
  score: number; // 0..4
  /** English clinical descriptor */
  en: string;
  /** Cantonese (zh-HK) descriptor shown to bilingual therapists */
  zh: string;
}

export interface RubricElement {
  id: string;
  domain: RubricDomain;
  /** English element name */
  label: string;
  /** Cantonese element name */
  labelZh: string;
  /** What this element measures, plain-language for the therapist */
  description: string;
  descriptionZh: string;
  /** Story-grammar SALT code where applicable (e.g. CH, ST, IE) */
  saltCode?: string;
  /** Which Aura Journey adaptationKeys / mini-game data feed an auto-suggested score */
  evidenceKeys?: string[];
  /** 0–4 anchored descriptors */
  levels: RubricLevelDescriptor[];
}

// Helper to build a standard 0/2/4 anchored continuum quickly.
function anchors(
  zeroEn: string, zeroZh: string,
  twoEn: string, twoZh: string,
  fourEn: string, fourZh: string,
): RubricLevelDescriptor[] {
  return [
    { score: 0, en: zeroEn, zh: zeroZh },
    { score: 1, en: `Emerging — between: ${zeroEn} / ${twoEn}`, zh: `萌芽 — 介乎：${zeroZh} / ${twoZh}` },
    { score: 2, en: twoEn, zh: twoZh },
    { score: 3, en: `Developing — between: ${twoEn} / ${fourEn}`, zh: `發展中 — 介乎：${twoZh} / ${fourZh}` },
    { score: 4, en: fourEn, zh: fourZh },
  ];
}

// ── MACROSTRUCTURE (Story Grammar) ──────────────────────────────────────────
const macroElements: RubricElement[] = [
  {
    id: "character",
    domain: "macrostructure",
    label: "Character",
    labelZh: "角色",
    saltCode: "CH",
    description: "Mentions and differentiates main vs. supporting characters.",
    descriptionZh: "提及並區分主角與配角。",
    evidenceKeys: ["sentence_turn_taking", "descriptive_language", "wh_question_response", "full_narrative_retell"],
    levels: anchors(
      "No character named, or only ambiguous pronouns.",
      "冇講出角色，或只用含糊代名詞。",
      "Main character named with some supporting characters.",
      "講出主角及部分配角。",
      "Clearly discriminates main vs. supporting characters with description.",
      "清楚區分主角同配角，並加以描述。",
    ),
  },
  {
    id: "setting",
    domain: "macrostructure",
    label: "Setting",
    labelZh: "場景",
    saltCode: "ST",
    description: "Establishes where/when the story takes place.",
    descriptionZh: "建立故事發生嘅時間同地點。",
    evidenceKeys: ["descriptive_language", "calm_listening", "full_narrative_retell"],
    levels: anchors(
      "No setting provided.",
      "冇提供場景。",
      "Partial setting (place OR time).",
      "部分場景（地點或時間其一）。",
      "Rich, relevant setting (place AND time / atmosphere).",
      "豐富而貼題嘅場景（地點同時間／氣氛）。",
    ),
  },
  {
    id: "initiating_event",
    domain: "macrostructure",
    label: "Initiating Event",
    labelZh: "起始事件",
    saltCode: "IE",
    description: "States the problem/event that drives the story.",
    descriptionZh: "講出推動故事嘅問題或事件。",
    evidenceKeys: ["shape_request_response", "following_directions", "story_sequencing", "full_narrative_retell"],
    levels: anchors(
      "No initiating event.",
      "冇起始事件。",
      "Initiating event implied or vague.",
      "起始事件隱晦或含糊。",
      "Clear, explicit initiating event.",
      "清晰明確嘅起始事件。",
    ),
  },
  {
    id: "internal_response",
    domain: "macrostructure",
    label: "Internal Response / Feelings",
    labelZh: "內在反應／情緒",
    saltCode: "IR",
    description: "Characters' feelings, thoughts or intentions.",
    descriptionZh: "角色嘅感受、諗法或意圖。",
    evidenceKeys: ["calm_listening", "voice_volume_turns", "cause_effect_reasoning", "emotion_vocabulary", "full_narrative_retell"],
    levels: anchors(
      "No internal response.",
      "冇內在反應。",
      "Single feeling/thought stated.",
      "講出單一感受或諗法。",
      "Multiple feelings/intentions tied to events.",
      "多種感受／意圖並連繫到事件。",
    ),
  },
  {
    id: "plan_attempt",
    domain: "macrostructure",
    label: "Plan & Attempt",
    labelZh: "計劃同嘗試",
    saltCode: "PL/AT",
    description: "Character's plan and actions to solve the problem.",
    descriptionZh: "角色解決問題嘅計劃同行動。",
    evidenceKeys: ["following_directions", "repair_attempts", "cause_effect_reasoning", "full_narrative_retell"],
    levels: anchors(
      "No plan or attempt.",
      "冇計劃或嘗試。",
      "Attempt without a clear plan.",
      "有嘗試但冇清晰計劃。",
      "Explicit plan linked to one or more attempts.",
      "明確計劃並連繫一個或多個嘗試。",
    ),
  },
  {
    id: "consequence_resolution",
    domain: "macrostructure",
    label: "Consequence / Resolution",
    labelZh: "結果／解決",
    saltCode: "CON",
    description: "Outcome of the attempt and story resolution.",
    descriptionZh: "嘗試嘅結果同故事結局。",
    evidenceKeys: ["repair_attempts", "home_practice_transfer", "story_sequencing", "confident_generalisation", "full_narrative_retell"],
    levels: anchors(
      "No consequence/resolution.",
      "冇結果或結局。",
      "Consequence stated but story not resolved.",
      "有結果但故事未完整結束。",
      "Clear consequence and satisfying resolution.",
      "清晰結果同圓滿結局。",
    ),
  },
];

// ── MICROSTRUCTURE (Sentence-level language) ────────────────────────────────
const microElements: RubricElement[] = [
  {
    id: "syntactic_complexity",
    domain: "microstructure",
    label: "Syntactic Complexity",
    labelZh: "句法複雜度",
    description: "Sentence length and use of subordinate/coordinate clauses.",
    descriptionZh: "句子長度同主從／並列句嘅運用。",
    evidenceKeys: ["sentence_turn_taking", "descriptive_language", "syllable_segmentation", "connective_expansion"],
    levels: anchors(
      "Single words / fragments only.",
      "只有單字或片語。",
      "Simple complete sentences.",
      "簡單完整句子。",
      "Complex sentences with subordination.",
      "含從句嘅複雜句子。",
    ),
  },
  {
    id: "connective_use",
    domain: "microstructure",
    label: "Connective / Cohesion Use",
    labelZh: "連接詞／連貫",
    description: "Temporal & causal connectives (e.g. 然後, 因為, 但係) linking events.",
    descriptionZh: "用時間／因果連接詞（如：然後、因為、但係）連繫事件。",
    evidenceKeys: ["following_directions", "syllable_segmentation", "connective_expansion", "story_sequencing"],
    levels: anchors(
      "No connectives; events listed.",
      "冇連接詞，事件零散羅列。",
      "Basic connectives (and / then).",
      "基本連接詞（同、然後）。",
      "Varied temporal & causal connectives.",
      "多樣化時間同因果連接詞。",
    ),
  },
  {
    id: "referencing",
    domain: "microstructure",
    label: "Referencing",
    labelZh: "指稱",
    description: "Clear antecedents for pronouns; listener can track who/what.",
    descriptionZh: "代名詞有清晰先行詞，聽者可追蹤人物／事物。",
    evidenceKeys: ["descriptive_language", "rhyme_matching", "wh_question_response"],
    levels: anchors(
      "Ambiguous referents throughout.",
      "全篇指稱含糊。",
      "Mostly clear with some ambiguity.",
      "大致清晰但偶有含糊。",
      "Consistently clear antecedents.",
      "指稱一致清晰。",
    ),
  },
  {
    id: "semantic_vocabulary",
    domain: "microstructure",
    label: "Semantic / Vocabulary",
    labelZh: "語義／詞彙",
    description: "Lexical diversity, elaborated noun phrases, mental/linguistic verbs.",
    descriptionZh: "詞彙多樣性、修飾名詞短語、心理／言語動詞。",
    evidenceKeys: ["descriptive_language", "initial_sound_blending", "emotion_vocabulary"],
    levels: anchors(
      "Immature / repetitive vocabulary.",
      "詞彙幼嫩或重複。",
      "Age-appropriate vocabulary.",
      "符合年齡嘅詞彙。",
      "Rich vocabulary with elaborated phrases & mental verbs.",
      "豐富詞彙、修飾短語同心理動詞。",
    ),
  },
  {
    id: "grammaticality",
    domain: "microstructure",
    label: "Grammaticality",
    labelZh: "語法正確度",
    description: "Grammatical accuracy of utterances (classifiers, aspect markers, word order).",
    descriptionZh: "句子語法正確度（量詞、時態助詞、語序）。",
    evidenceKeys: ["initial_sound_blending", "vowel_imitation"],
    levels: anchors(
      "Frequent grammatical errors disrupt meaning.",
      "頻繁語法錯誤影響意思。",
      "Occasional errors, meaning intact.",
      "偶有錯誤但意思清晰。",
      "Grammatically accurate throughout.",
      "全篇語法正確。",
    ),
  },
];

// ── INTELLIGIBILITY / SPEECH (phoneme-level, fed by mini-games) ─────────────
const intelligibilityElements: RubricElement[] = [
  {
    id: "phoneme_accuracy",
    domain: "intelligibility",
    label: "Phoneme Accuracy",
    labelZh: "音素準確度",
    description: "Accuracy on target Cantonese phoneme contrasts (n/l, ng/n, gw/kw).",
    descriptionZh: "目標粵語音素對比嘅準確度（n/l、ng/n、gw/kw）。",
    evidenceKeys: ["water-park", "maze", "fruit-ninja", "minimal_pair_discrimination"],
    levels: anchors(
      "<40% target phonemes accurate.",
      "目標音素準確率 <40%。",
      "~70% target phonemes accurate.",
      "目標音素準確率 約 70%。",
      "≥90% target phonemes accurate.",
      "目標音素準確率 ≥90%。",
    ),
  },
  {
    id: "tone_accuracy",
    domain: "intelligibility",
    label: "Tone Accuracy",
    labelZh: "聲調準確度",
    description: "Accuracy on the six Cantonese lexical tones.",
    descriptionZh: "六個粵語聲調嘅準確度。",
    evidenceKeys: ["catch-fly", "vowel_imitation", "minimal_pair_discrimination", "self_repair_tone"],
    levels: anchors(
      "Tones largely inaccurate (<40%).",
      "聲調大致不準（<40%）。",
      "Tones mostly accurate (~70%).",
      "聲調大致準確（約 70%）。",
      "Tones accurate & contrastive (≥90%).",
      "聲調準確且有對比（≥90%）。",
    ),
  },
  {
    id: "fluency_pacing",
    domain: "intelligibility",
    label: "Fluency & Pacing",
    labelZh: "流暢度同節奏",
    description: "Smoothness, rate, and listener effort during connected speech.",
    descriptionZh: "連續說話嘅流暢度、語速同聽者所需努力。",
    evidenceKeys: ["calm_listening", "voice_volume_turns", "pacing_fluency", "confident_generalisation"],
    levels: anchors(
      "Frequent breakdowns; high listener effort.",
      "經常中斷，聽者需高度努力。",
      "Some hesitations; intelligible with effort.",
      "間中遲疑，需努力但可理解。",
      "Smooth, well-paced, easily understood.",
      "流暢、節奏得宜、容易理解。",
    ),
  },
];

export const RUBRIC_ELEMENTS: RubricElement[] = [
  ...macroElements,
  ...microElements,
  ...intelligibilityElements,
];

export const RUBRIC_DOMAINS: { id: RubricDomain; label: string; labelZh: string; weight: number }[] = [
  { id: "macrostructure", label: "Macrostructure (Story Grammar)", labelZh: "宏觀結構（故事文法）", weight: 0.4 },
  { id: "microstructure", label: "Microstructure (Sentence Language)", labelZh: "微觀結構（句子語言）", weight: 0.35 },
  { id: "intelligibility", label: "Intelligibility & Speech", labelZh: "可理解度同言語", weight: 0.25 },
];

export type RubricScores = Record<string, number>; // elementId -> 0..4

export interface DomainResult {
  domain: RubricDomain;
  raw: number;        // summed score
  max: number;        // max possible
  percent: number;    // 0..100
  weight: number;
}

export interface NarrativeProfileResult {
  domainResults: DomainResult[];
  /** Weighted total narrative proficiency, 0..100 (MISL "unified construct" analogue). */
  totalProficiency: number;
  /** Proficiency band label */
  band: "Emerging" | "Developing" | "Proficient" | "Advanced";
  bandZh: string;
  completedElements: number;
  totalElements: number;
}

export function elementsByDomain(domain: RubricDomain): RubricElement[] {
  return RUBRIC_ELEMENTS.filter((e) => e.domain === domain);
}

export function scoreBand(percent: number): { band: NarrativeProfileResult["band"]; bandZh: string } {
  if (percent >= 87.5) return { band: "Advanced", bandZh: "卓越" };
  if (percent >= 62.5) return { band: "Proficient", bandZh: "熟練" };
  if (percent >= 37.5) return { band: "Developing", bandZh: "發展中" };
  return { band: "Emerging", bandZh: "萌芽" };
}

/** Compute the full Narrative Assessment Profile result from per-element scores. */
export function computeNarrativeProfile(scores: RubricScores): NarrativeProfileResult {
  const domainResults: DomainResult[] = RUBRIC_DOMAINS.map((d) => {
    const els = elementsByDomain(d.id);
    const scored = els.filter((e) => typeof scores[e.id] === "number");
    const raw = scored.reduce((sum, e) => sum + (scores[e.id] ?? 0), 0);
    const max = els.length * RUBRIC_MAX;
    const percent = max > 0 && scored.length > 0 ? (raw / (scored.length * RUBRIC_MAX)) * 100 : 0;
    return { domain: d.id, raw, max, percent, weight: d.weight };
  });

  const anyScored = domainResults.some((d) => d.percent > 0 || d.raw > 0);
  const totalProficiency = anyScored
    ? domainResults.reduce((sum, d) => sum + d.percent * d.weight, 0)
    : 0;

  const { band, bandZh } = scoreBand(totalProficiency);
  const completedElements = RUBRIC_ELEMENTS.filter((e) => typeof scores[e.id] === "number").length;

  return {
    domainResults,
    totalProficiency: Math.round(totalProficiency * 10) / 10,
    band,
    bandZh,
    completedElements,
    totalElements: RUBRIC_ELEMENTS.length,
  };
}

/**
 * Auto-suggest rubric scores from observed evidence (mini-game phoneme accuracy +
 * Aura Journey adaptation signals). Therapist always reviews/overrides.
 * `evidence` maps an evidenceKey -> a 0..1 performance value.
 */
export function suggestScoresFromEvidence(evidence: Record<string, number>): RubricScores {
  const out: RubricScores = {};
  for (const el of RUBRIC_ELEMENTS) {
    const keys = (el.evidenceKeys ?? []).filter((k) => typeof evidence[k] === "number");
    if (keys.length === 0) continue;
    const avg = keys.reduce((s, k) => s + evidence[k], 0) / keys.length;
    out[el.id] = Math.round(avg * RUBRIC_MAX); // 0..1 -> 0..4
  }
  return out;
}
