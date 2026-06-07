# SpeakAble 1.2 — UtteranceAnalysis Schema Architecture

## Overview

The `UtteranceAnalysis` schema (v1.2.0) is the **single unified contract** between all speech analysis components in SpeakAble 1.2. It replaces the fragmented type system with a coherent data model that serves both parent-friendly and clinical views.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UTTERANCE ANALYSIS PIPELINE                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   ASR 1.2    │      │   TTS 1.2    │      │  SNN / NEPA  │
│              │      │              │      │              │
│ • Phonemes   │      │ • Expected   │      │ • Micro-     │
│ • Timestamps │      │   timing     │      │   timing     │
│ • Tone labels│      │ • Tone       │      │ • Pitch      │
│ • Confidence │      │   contours   │      │   contour    │
│ • Noise      │      │ • Voice      │      │ • Confidence │
│   robustness │      │   variants   │      │ • Fatigue    │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             │
                             ▼
                   ┌─────────────────────┐
                   │    FUSION API       │
                   │                     │
                   │  Combines ASR +     │
                   │  TTS + SNN into     │
                   │  unified analysis   │
                   └──────────┬──────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   UtteranceAnalysis v1.2.0    │
              │                               │
              │  {                            │
              │    phonemes: [...],           │
              │    syllables: [...],          │
              │    timing: {...},             │
              │    tone: {...},               │
              │    scores: {...},             │
              │    errors: [...],             │
              │    metadata: {...}            │
              │  }                            │
              └───────────────┬───────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
   ┌─────────────────────┐        ┌─────────────────────┐
   │  Parent Dashboard   │        │ Therapist Dashboard │
   │       v1            │        │        v1           │
   │                     │        │                     │
   │ • Sound badges      │        │ • Phoneme timeline  │
   │ • Smoothness bar    │        │ • Duration panel    │
   │ • Tone shape        │        │ • Tone contour      │
   │ • Weekly heatmap    │        │   overlay           │
   │ • Encouragement     │        │ • ASR table         │
   │                     │        │ • Error classify    │
   │ projectToParent     │        │ • Fatigue assess    │
   │ Summary()           │        │                     │
   └─────────────────────┘        │ projectToTherapist  │
                                  │ View()              │
                                  └─────────────────────┘
```

## Schema Structure

```
UtteranceAnalysis
├── schema_version: "1.2.0"
├── analysis_id: UUID
├── timestamp: ISO8601
│
├── input
│   ├── audio_url?: URI
│   ├── audio_duration_ms: number
│   ├── intended_text: string
│   ├── intended_jyutping: JyutpingString
│   └── sample_rate_hz: 8000|16000|22050|44100|48000
│
├── phonemes: PhonemeAnalysis[]
│   ├── phoneme: PhonemeId { symbol, type, tone?, jyutping? }
│   ├── position: number
│   ├── syllable_index: number
│   ├── timing: TimingSpan { start_ms, end_ms, duration_ms }
│   ├── expected_timing?: TimingSpan
│   ├── timing_deviation_ms?: number
│   ├── timing_status?: "early"|"on_time"|"late"|"too_long"|"too_short"
│   ├── confidence: 0..1
│   ├── is_correct: boolean
│   ├── tone?: {
│   │   ├── detected: ToneLabel
│   │   ├── expected: ToneLabel
│   │   ├── contour?: ToneContour
│   │   ├── expected_contour?: ToneContour
│   │   ├── accuracy: 0..1
│   │   └── is_correct: boolean
│   │ }
│   └── source: {
│       ├── asr?: { confidence, is_correct }
│       └── snn?: { confidence, timing_deviation_ms }
│     }
│
├── syllables: SyllableAnalysis[]
│   ├── syllable_index: number
│   ├── hanzi: string
│   ├── intended_jyutping: string
│   ├── spoken_jyutping: string
│   ├── initial?: PhonemeAnalysis
│   ├── final?: PhonemeAnalysis
│   ├── tone_analysis?: ToneAnalysis
│   ├── confidence: 0..1
│   ├── jy_conf: 0..1
│   ├── tone_conf: 0..1
│   ├── is_low_confidence: boolean
│   ├── phonemes: PhonemeAnalysis[]
│   └── timing: TimingSpan
│
├── timing
│   ├── total_duration_ms: number
│   ├── speech_onset_ms: number
│   ├── speech_offset_ms: number
│   ├── pauses: TimingSpan[]
│   └── speech_rate_syllables_per_sec: number
│
├── tone
│   ├── overall_accuracy: 0..1
│   ├── per_tone: Record<ToneLabel, { accuracy, count }>
│   └── confusions: Array<{ expected, detected, count }>
│
├── smoothness_score: 0..1
├── articulation_score: 0..1
├── tone_accuracy_score: 0..1
│
├── scores: UtteranceScores
│   ├── overall: 0..1
│   ├── articulation: 0..1
│   ├── tone_accuracy: 0..1
│   ├── smoothness: 0..1
│   ├── rhythm: 0..1
│   ├── initial_accuracy: 0..1
│   ├── final_accuracy: 0..1
│   └── tone_accuracy_breakdown: Record<ToneLabel, 0..1>
│
├── errors: ErrorInstance[]
│   ├── category: "articulation"|"tone"|"timing"|"omission"|"insertion"|"substitution"
│   ├── phoneme?: PhonemeId
│   ├── syllable_index: number
│   ├── position: number
│   ├── expected?: string
│   ├── actual?: string
│   ├── severity: "minor"|"moderate"|"major"
│   └── suggestion?: string
│
└── metadata: FusionMetadata
    ├── pipeline_version: string
    ├── asr: ASRMetadata
    │   ├── model_version: string
    │   ├── phoneme_timestamps: boolean
    │   ├── tone_classification: boolean
    │   ├── noise_robustness: boolean
    │   ├── child_speech_optimized: boolean
    │   ├── wer?: 0..1
    │   └── tone_wer?: 0..1
    ├── tts: TTSMetadata
    │   ├── model_version: string
    │   ├── voice_variant: "child_friendly"|"slow"|"normal"|"fast"
    │   ├── expected_timing_profile: string
    │   └── tone_contour_source: "canonical"|"personalized"
    ├── snn: SNNMetadata
    │   ├── model_version: string
    │   ├── inference_time_ms: number
    │   ├── stdp_weight: 0..1
    │   ├── fatigue_detected: boolean
    │   └── fatigue_onset_ms?: number
    ├── fusion_strategy: "weighted_average"|"voting"|"neural"
    └── processing_time_ms: number
```

## Type Migration Guide

### From Existing Types → UtteranceAnalysis

| Old Type | New Location | Migration Notes |
|----------|--------------|-----------------|
| `PhonemeEvent` (schema.json) | `PhonemeAnalysis.timing` | Now includes expected_timing + deviation |
| `PhonemeResult` (usePronunciationAPI) | `SyllableAnalysis` | Split into syllable-level with phoneme array |
| `WordAttempt` (schema.json) | `SyllableAnalysis` | Renamed, added tone contour |
| `WordResult` (usePronunciationAPI) | `SyllableAnalysis` | Merged, added source tracking |
| `QuestionResult` (usePracticeSession) | `UtteranceAnalysis` | Now includes full timing + error classification |
| `ParsedPhoneme` (jyutpingParser) | `PhonemeId` | Simplified, added type field |
| `VerifyCheckItem` (asrphone) | `PhonemeAnalysis.source.asr` | Now tracks both ASR + SNN sources |
| `PronunciationResult` (DB) | `UtteranceAnalysis` | Now includes full analysis, not just scores |
| `PhonemeProfile` (useNEPAWorldModel) | `PhonemeAnalysis` + `metadata.snn` | Split into per-utterance + session-level |
| `AttemptTag` (learningData) | `ErrorInstance.category` | Expanded from 3 to 6 categories |

### Backward Compatibility

The schema includes projection functions that map `UtteranceAnalysis` back to legacy shapes:

```typescript
// Parent Dashboard (existing)
projectToParentSummary(analysis) → ParentSessionSummary

// Therapist Dashboard (existing)
projectToTherapistView(analysis) → TherapistSessionView

// Legacy compatibility (for migration period)
toLegacyPronunciationResult(analysis) → PronunciationResult
toLegacyWordAttempt(analysis, syllableIndex) → WordAttempt
toLegacyPhonemeEvent(analysis, phonemeIndex) → PhonemeEvent
```

## API Contracts

### POST /analyze_utterance

**Request:**
```typescript
{
  audio: Blob | ArrayBuffer,
  intended_text: string,
  intended_jyutping: string,
  options?: {
    voice_variant?: "child_friendly" | "slow" | "normal" | "fast",
    noise_profile?: "clean" | "home" | "school" | "clinic",
    child_optimized?: boolean
  }
}
```

**Response:**
```typescript
{
  success: boolean,
  analysis: UtteranceAnalysis,
  error?: string
}
```

### GET /session_summary?session_id={id}&user_id={id}

**Response:**
```typescript
{
  success: boolean,
  session_id: string,
  user_id: string,
  total_attempts: number,
  average_scores: UtteranceScores,
  phoneme_progress: [...],
  tone_progress: [...],
  error_patterns: [...],
  fatigue_detected: boolean,
  recommendations: [...]
}
```

### GET /history?user_id={id}&date_from={date}&date_to={date}

**Response:**
```typescript
{
  success: boolean,
  user_id: string,
  sessions: [...],
  trends: {
    daily_accuracy: [...],
    daily_tone_accuracy: [...],
    phoneme_mastery: [...]
  }
}
```

## Implementation Phases

### Phase 0.1 — Schema Definition ✅
- [x] TypeScript types (`src/types/utteranceAnalysis.ts`)
- [x] JSON Schema (`data/utterance-analysis.schema.json`)
- [x] Architecture diagram (this file)
- [x] Projection functions (parent + therapist views)

### Phase 0.2 — Validation Layer
- [ ] Create `src/utils/utteranceValidator.ts`
- [ ] Validate incoming analysis against JSON Schema
- [ ] Add runtime type guards
- [ ] Unit tests for validation

### Phase 0.3 — Mock Data Generator
- [ ] Create `scripts/generate-mock-analysis.ts`
- [ ] Generate realistic `UtteranceAnalysis` samples
- [ ] Cover all error types + edge cases
- [ ] Use for frontend development + testing

### Phase 0.4 — Frontend Integration
- [ ] Update `ParentDashboardPage.tsx` to use `projectToParentSummary()`
- [ ] Update `NEPADashboardPage.tsx` to use `projectToTherapistView()`
- [ ] Replace legacy types in practice flow
- [ ] Add loading + error states

### Phase 0.5 — Backend Stubs
- [ ] Create Supabase Edge Function `analyze-utterance`
- [ ] Stub response with mock data
- [ ] Add `session-summary` endpoint
- [ ] Add `history` endpoint

## Files Created

| File | Purpose |
|------|---------|
| `src/types/utteranceAnalysis.ts` | TypeScript types + projection functions |
| `data/utterance-analysis.schema.json` | JSON Schema for validation |
| `docs/utterance-analysis-architecture.md` | This file |

## Next Steps

1. **Phase 0.2**: Build validation layer
2. **Phase 0.3**: Create mock data generator
3. **Phase 0.4**: Integrate into frontend
4. **Phase 0.5**: Build backend stubs
5. **Phase 1**: Implement ASR 1.2 (phoneme timestamps + tone classification)
6. **Phase 2**: Implement TTS 1.2 (expected timing + tone contours)
7. **Phase 3**: Implement Fusion API (combine ASR + TTS + SNN)
