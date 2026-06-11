/**
 * SpeakAble 1.2 — Unified UtteranceAnalysis Schema
 *
 * This is the single contract between:
 *   - ASR 1.2 (phoneme timestamps + tone labels)
 *   - TTS 1.2 (expected timing + tone contours)
 *   - SNN/NEPA (micro-timing + pitch contour)
 *   - Fusion API (combined analysis + scoring)
 *
 * Used by:
 *   - Parent Dashboard v1 (simplified view)
 *   - Therapist Dashboard v1 (clinical depth)
 *   - Practice Flow (real-time feedback)
 *
 * Version: 1.2.0
 */

// ─── Phoneme Identity ────────────────────────────────────────────────────────

export type PhonemeType = "initial" | "final" | "tone" | "coda";

export type ToneLabel = "tone_1" | "tone_2" | "tone_3" | "tone_4" | "tone_5" | "tone_6";

export interface PhonemeId {
  symbol: string;
  type: PhonemeType;
  tone?: ToneLabel;
  jyutping?: string;
}

// ─── Timing ──────────────────────────────────────────────────────────────────

export interface TimingSpan {
  start_ms: number;
  end_ms: number;
  duration_ms: number;
}

export interface PitchPoint {
  time_ms: number;
  hz: number;
}

export interface ToneContour {
  tone: ToneLabel;
  points: PitchPoint[];
  start_hz: number;
  end_hz: number;
  peak_hz: number;
  direction: "rising" | "falling" | "level" | "dipping" | "rising_falling";
}

// ─── Per-Phoneme Analysis ────────────────────────────────────────────────────

export interface PhonemeAnalysis {
  phoneme: PhonemeId;
  position: number;
  syllable_index: number;

  timing: TimingSpan;
  expected_timing?: TimingSpan;
  timing_deviation_ms?: number;
  timing_status?: "early" | "on_time" | "late" | "too_long" | "too_short";

  confidence: number;
  is_correct: boolean;

  tone?: {
    detected: ToneLabel;
    expected: ToneLabel;
    contour?: ToneContour;
    expected_contour?: ToneContour;
    accuracy: number;
    is_correct: boolean;
  };

  source: {
    asr?: { confidence: number; is_correct: boolean };
    snn?: { confidence: number; timing_deviation_ms: number };
  };
}

// ─── Per-Syllable Analysis ───────────────────────────────────────────────────

export interface SyllableAnalysis {
  syllable_index: number;
  hanzi: string;
  intended_jyutping: string;
  spoken_jyutping: string;

  initial?: PhonemeAnalysis;
  final?: PhonemeAnalysis;
  tone_analysis?: PhonemeAnalysis["tone"];

  confidence: number;
  jy_conf: number;
  tone_conf: number;
  is_low_confidence: boolean;

  phonemes: PhonemeAnalysis[];
  timing: TimingSpan;
}

// ─── Utterance-Level Scores ──────────────────────────────────────────────────

export interface UtteranceScores {
  overall: number;
  articulation: number;
  tone_accuracy: number;
  smoothness: number;
  rhythm: number;

  initial_accuracy: number;
  final_accuracy: number;
  tone_accuracy_breakdown: Record<ToneLabel, number>;
}

// ─── Error Classification ────────────────────────────────────────────────────

export type ErrorCategory =
  | "articulation"
  | "tone"
  | "timing"
  | "omission"
  | "insertion"
  | "substitution";

export interface ErrorInstance {
  category: ErrorCategory;
  phoneme?: PhonemeId;
  syllable_index: number;
  position: number;
  expected?: string;
  actual?: string;
  severity: "minor" | "moderate" | "major";
  suggestion?: string;
}

// ─── Source Metadata ─────────────────────────────────────────────────────────

export interface ASRMetadata {
  model_version: string;
  phoneme_timestamps: boolean;
  tone_classification: boolean;
  noise_robustness: boolean;
  child_speech_optimized: boolean;
  wer?: number;
  tone_wer?: number;
}

export interface TTSMetadata {
  model_version: string;
  voice_variant: "child_friendly" | "slow" | "normal" | "fast";
  expected_timing_profile: string;
  tone_contour_source: "canonical" | "personalized";
}

export interface SNNMetadata {
  model_version: string;
  inference_time_ms: number;
  stdp_weight: number;
  fatigue_detected: boolean;
  fatigue_onset_ms?: number;
}

export interface FusionMetadata {
  pipeline_version: string;
  asr: ASRMetadata;
  tts: TTSMetadata;
  snn: SNNMetadata;
  fusion_strategy: "weighted_average" | "voting" | "neural";
  processing_time_ms: number;
}

// ─── Main Schema ─────────────────────────────────────────────────────────────

export interface UtteranceAnalysis {
  schema_version: "1.2.0";
  analysis_id: string;
  timestamp: string;

  input: {
    audio_url?: string;
    audio_duration_ms: number;
    intended_text: string;
    intended_jyutping: string;
    sample_rate_hz: number;
  };

  phonemes: PhonemeAnalysis[];
  syllables: SyllableAnalysis[];
  timing: {
    total_duration_ms: number;
    speech_onset_ms: number;
    speech_offset_ms: number;
    pauses: TimingSpan[];
    speech_rate_syllables_per_sec: number;
  };

  tone: {
    overall_accuracy: number;
    per_tone: Record<ToneLabel, { accuracy: number; count: number }>;
    confusions: Array<{ expected: ToneLabel; detected: ToneLabel; count: number }>;
  };

  smoothness_score: number;
  articulation_score: number;
  tone_accuracy_score: number;
  scores: UtteranceScores;

  errors: ErrorInstance[];

  metadata: FusionMetadata;
}

// ─── Request/Response Contracts ──────────────────────────────────────────────

export interface AnalyzeUtteranceRequest {
  audio: Blob | ArrayBuffer;
  intended_text: string;
  intended_jyutping: string;
  options?: {
    voice_variant?: TTSMetadata["voice_variant"];
    noise_profile?: "clean" | "home" | "school" | "clinic";
    child_optimized?: boolean;
  };
}

export interface AnalyzeUtteranceResponse {
  success: boolean;
  analysis: UtteranceAnalysis;
  error?: string;
}

export interface SessionSummaryRequest {
  session_id: string;
  user_id: string;
}

export interface SessionSummaryResponse {
  success: boolean;
  session_id: string;
  user_id: string;
  total_attempts: number;
  average_scores: UtteranceScores;
  phoneme_progress: Array<{
    phoneme: string;
    first_accuracy: number;
    last_accuracy: number;
    trend: "improving" | "stable" | "declining";
  }>;
  tone_progress: Array<{
    tone: ToneLabel;
    first_accuracy: number;
    last_accuracy: number;
    trend: "improving" | "stable" | "declining";
  }>;
  error_patterns: Array<{
    category: ErrorCategory;
    count: number;
    most_common_phoneme?: string;
  }>;
  fatigue_detected: boolean;
  recommendations: Array<{
    exercise_type: string;
    target_phonemes: string[];
    difficulty: string;
    reason: string;
  }>;
}

export interface HistoryRequest {
  user_id: string;
  date_from?: string;
  date_to?: string;
  phoneme_filter?: string[];
  tone_filter?: ToneLabel[];
}

export interface HistoryResponse {
  success: boolean;
  user_id: string;
  sessions: Array<{
    session_id: string;
    timestamp: string;
    duration_minutes: number;
    words_practiced: number;
    average_accuracy: number;
    tone_accuracy: number;
    smoothness: number;
  }>;
  trends: {
    daily_accuracy: Array<{ date: string; accuracy: number }>;
    daily_tone_accuracy: Array<{ date: string; accuracy: number }>;
    phoneme_mastery: Array<{ phoneme: string; mastery_date?: string; current_accuracy: number }>;
  };
}

// ─── Parent-Friendly Projections ─────────────────────────────────────────────

export interface ParentSoundBadge {
  phoneme: string;
  label: string;
  status: "clear" | "almost" | "practice";
  emoji: string;
  tip: string;
}

export interface ParentSessionSummary {
  overall_emoji: string;
  overall_message: string;
  smoothness_pct: number;
  sound_badges: ParentSoundBadge[];
  tone_shape: {
    weakest_tone: string;
    weakest_tone_label: string;
    status: "mastered" | "almost" | "needs_practice";
  };
  weekly_heatmap: Array<{
    date: string;
    status: "mastered" | "improving" | "needs_practice" | "no_practice";
  }>;
  encouragement: string;
}

export function projectToParentSummary(analysis: UtteranceAnalysis): ParentSessionSummary {
  const overallPct = Math.round(analysis.scores.overall * 100);
  const overallEmoji = overallPct >= 80 ? "😊" : overallPct >= 60 ? "🙂" : overallPct >= 40 ? "😐" : "😟";
  const overallMessage =
    overallPct >= 80 ? "表現好好！" :
    overallPct >= 60 ? "進步緊！" :
    overallPct >= 40 ? "繼續努力！" : "唔緊要，慢慢嚟！";

  const soundBadges: ParentSoundBadge[] = analysis.syllables.flatMap(s =>
    s.phonemes.map(p => {
      const acc = Math.round(p.confidence * 100);
      const status: ParentSoundBadge["status"] = acc >= 80 ? "clear" : acc >= 60 ? "almost" : "practice";
      const emoji = status === "clear" ? "🟢" : status === "almost" ? "🟡" : "🔴";
      const tip = status === "clear" ? "做得好！" : status === "almost" ? "差啲啲！" : "再多啲練習！";
      return {
        phoneme: p.phoneme.symbol,
        label: p.phoneme.symbol,
        status,
        emoji,
        tip,
      };
    })
  );

  const toneEntries = Object.entries(analysis.tone.per_tone);
  const weakest = toneEntries.reduce((a, b) => (a[1].accuracy < b[1].accuracy ? a : b), toneEntries[0]);
  const weakestAcc = weakest ? Math.round(weakest[1].accuracy * 100) : 0;
  const toneStatus: ParentSessionSummary["tone_shape"]["status"] =
    weakestAcc >= 80 ? "mastered" : weakestAcc >= 60 ? "almost" : "needs_practice";

  return {
    overall_emoji: overallEmoji,
    overall_message: overallMessage,
    smoothness_pct: Math.round(analysis.smoothness_score * 100),
    sound_badges: soundBadges,
    tone_shape: {
      weakest_tone: weakest?.[0] || "tone_1",
      weakest_tone_label: weakest?.[0]?.replace("tone_", "第") + "聲" || "第一聲",
      status: toneStatus,
    },
    weekly_heatmap: [],
    encouragement: overallMessage,
  };
}

// ─── Therapist Clinical Projections ──────────────────────────────────────────

export interface TherapistSessionView {
  phoneme_timeline: Array<{
    phoneme: string;
    type: PhonemeType;
    start_ms: number;
    end_ms: number;
    confidence: number;
    is_correct: boolean;
    timing_deviation_ms?: number;
    tone_contour?: ToneContour;
    expected_contour?: ToneContour;
  }>;
  duration_panel: Array<{
    phoneme: string;
    actual_ms: number;
    expected_ms: number;
    deviation_ms: number;
    deviation_pct: number;
    status: "early" | "on_time" | "late" | "too_long" | "too_short";
  }>;
  tone_graph: {
    detected_contours: Array<{ syllable_index: number; contour: ToneContour }>;
    expected_contours: Array<{ syllable_index: number; contour: ToneContour }>;
    tone_accuracy_by_position: Array<{ position: number; accuracy: number }>;
  };
  asr_verification_table: Array<{
    syllable_index: number;
    hanzi: string;
    intended_jyutping: string;
    spoken_jyutping: string;
    initial_match: boolean;
    final_match: boolean;
    tone_match: boolean;
    confidence: number;
    is_low_confidence: boolean;
  }>;
  error_classification: ErrorInstance[];
  fatigue_assessment: {
    detected: boolean;
    onset_ms?: number;
    severity?: "mild" | "moderate" | "severe";
    affected_phonemes: string[];
  };
}

export function projectToTherapistView(analysis: UtteranceAnalysis): TherapistSessionView {
  const phonemeTimeline = analysis.phonemes.map(p => ({
    phoneme: p.phoneme.symbol,
    type: p.phoneme.type,
    start_ms: p.timing.start_ms,
    end_ms: p.timing.end_ms,
    confidence: p.confidence,
    is_correct: p.is_correct,
    timing_deviation_ms: p.timing_deviation_ms,
    tone_contour: p.tone?.contour,
    expected_contour: p.tone?.expected_contour,
  }));

  const durationPanel = analysis.phonemes
    .filter(p => p.expected_timing)
    .map(p => {
      const actual = p.timing.duration_ms;
      const expected = p.expected_timing!.duration_ms;
      const deviation = actual - expected;
      const deviationPct = expected > 0 ? (deviation / expected) * 100 : 0;
      const status: PhonemeAnalysis["timing_status"] =
        Math.abs(deviationPct) < 15 ? "on_time" :
        deviation < 0 ? "early" :
        deviationPct > 50 ? "too_long" : "late";
      return {
        phoneme: p.phoneme.symbol,
        actual_ms: actual,
        expected_ms: expected,
        deviation_ms: deviation,
        deviation_pct: Math.round(deviationPct),
        status,
      };
    });

  const toneGraph = {
    detected_contours: analysis.syllables
      .filter(s => s.tone_analysis?.contour)
      .map(s => ({
        syllable_index: s.syllable_index,
        contour: s.tone_analysis!.contour!,
      })),
    expected_contours: analysis.syllables
      .filter(s => s.tone_analysis?.expected_contour)
      .map(s => ({
        syllable_index: s.syllable_index,
        contour: s.tone_analysis!.expected_contour!,
      })),
    tone_accuracy_by_position: analysis.syllables.map(s => ({
      position: s.syllable_index,
      accuracy: s.tone_analysis?.accuracy || 0,
    })),
  };

  const asrTable = analysis.syllables.map(s => ({
    syllable_index: s.syllable_index,
    hanzi: s.hanzi,
    intended_jyutping: s.intended_jyutping,
    spoken_jyutping: s.spoken_jyutping,
    initial_match: s.initial?.is_correct || false,
    final_match: s.final?.is_correct || false,
    tone_match: s.tone_analysis?.is_correct || false,
    confidence: s.confidence,
    is_low_confidence: s.is_low_confidence,
  }));

  const fatigueOnset = analysis.metadata.snn.fatigue_onset_ms;
  const fatigueDetected = analysis.metadata.snn.fatigue_detected;

  return {
    phoneme_timeline: phonemeTimeline,
    duration_panel: durationPanel,
    tone_graph: toneGraph,
    asr_verification_table: asrTable,
    error_classification: analysis.errors,
    fatigue_assessment: {
      detected: fatigueDetected,
      onset_ms: fatigueOnset,
      severity: fatigueDetected ? (fatigueOnset && fatigueOnset < 180000 ? "severe" : fatigueOnset && fatigueOnset < 300000 ? "moderate" : "mild") : undefined,
      affected_phonemes: fatigueDetected ? analysis.phonemes.filter(p => p.confidence < 0.5).map(p => p.phoneme.symbol) : [],
    },
  };
}
