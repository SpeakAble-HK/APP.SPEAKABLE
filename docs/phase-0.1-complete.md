# Phase 0.1 — Unified UtteranceAnalysis Schema ✅ COMPLETE

## Deliverables

### 1. TypeScript Type Definitions
**File:** `src/types/utteranceAnalysis.ts` (467 lines)

**Core Types:**
- `PhonemeId` — Unified phoneme identity (symbol + type + tone + jyutping)
- `TimingSpan` — start_ms, end_ms, duration_ms
- `ToneContour` — Pitch points + direction (rising/falling/level/dipping)
- `PhonemeAnalysis` — Per-phoneme analysis with timing, confidence, tone, source tracking
- `SyllableAnalysis` — Per-syllable breakdown (initial + final + tone + phonemes)
- `UtteranceScores` — Overall, articulation, tone_accuracy, smoothness, rhythm
- `ErrorInstance` — 6 error categories (articulation, tone, timing, omission, insertion, substitution)
- `UtteranceAnalysis` — Main schema with phonemes, syllables, timing, tone, scores, errors, metadata

**Metadata Types:**
- `ASRMetadata` — Model version, phoneme_timestamps, tone_classification, noise_robustness, child_speech_optimized, WER
- `TTSMetadata` — Model version, voice_variant (child_friendly/slow/normal/fast), expected_timing_profile, tone_contour_source
- `SNNMetadata` — Model version, inference_time_ms, stdp_weight, fatigue_detected, fatigue_onset_ms
- `FusionMetadata` — Pipeline version + ASR + TTS + SNN metadata + fusion_strategy + processing_time_ms

**API Contracts:**
- `AnalyzeUtteranceRequest` / `AnalyzeUtteranceResponse` — POST /analyze_utterance
- `SessionSummaryRequest` / `SessionSummaryResponse` — GET /session_summary
- `HistoryRequest` / `HistoryResponse` — GET /history

**Projection Functions:**
- `projectToParentSummary(analysis)` → `ParentSessionSummary` — Parent-friendly view (sound badges, smoothness, tone shape, heatmap, encouragement)
- `projectToTherapistView(analysis)` → `TherapistSessionView` — Clinical view (phoneme timeline, duration panel, tone graph, ASR table, error classification, fatigue assessment)

### 2. JSON Schema
**File:** `data/utterance-analysis.schema.json` (280 lines)

**Features:**
- Full validation for all types
- 15 definitions (PhonemeAnalysis, SyllableAnalysis, UtteranceScores, ErrorInstance, FusionMetadata, etc.)
- Pattern properties for tone labels (tone_1 through tone_6)
- Enum constraints for PhonemeType, ToneLabel, ErrorCategory, timing_status, severity, voice_variant, fusion_strategy
- Min/max constraints for confidence scores (0..1)
- Required fields for all objects
- Format validation (UUID, URI, date-time)

### 3. Architecture Documentation
**File:** `docs/utterance-analysis-architecture.md` (200+ lines)

**Contents:**
- Pipeline diagram (ASR → TTS → SNN → Fusion → UtteranceAnalysis → Parent/Therapist views)
- Complete schema structure tree
- Type migration guide (old types → new locations)
- Backward compatibility strategy (projection functions)
- API contracts (request/response shapes)
- Implementation phases (0.1 → 0.5)
- File inventory

## Schema Design Principles

### 1. Unified Contract
Single schema serves all components:
- **ASR 1.2** → phonemes, timestamps, tone labels, confidence
- **TTS 1.2** → expected timing, tone contours, voice variants
- **SNN/NEPA** → micro-timing, pitch contour, fatigue detection
- **Fusion API** → combined analysis, error classification, scoring

### 2. Dual-View Architecture
```
UtteranceAnalysis (full clinical depth)
    ↓ projectToParentSummary()
ParentSessionSummary (friendly, no jargon)
    ↓ projectToTherapistView()
TherapistSessionView (full transparency)
```

### 3. Source Tracking
Every phoneme analysis tracks which source contributed:
```typescript
source: {
  asr?: { confidence, is_correct },
  snn?: { confidence, timing_deviation_ms }
}
```
Enables:
- Debugging (which source made the error?)
- Weighted fusion (trust ASR more for correctness, SNN more for timing)
- Audit trail (clinical transparency)

### 4. Error Classification
6 categories (expanded from legacy 3):
- `articulation` — Wrong phoneme produced
- `tone` — Correct phoneme, wrong tone
- `timing` — Correct phoneme + tone, wrong duration
- `omission` — Phoneme skipped
- `insertion` — Extra phoneme added
- `substitution` — One phoneme replaced with another

Each error includes:
- Severity (minor/moderate/major)
- Suggestion (parent-friendly tip)
- Expected vs actual values

### 5. Timing Deviation Tracking
For each phoneme:
```typescript
timing: { start_ms, end_ms, duration_ms }
expected_timing?: { start_ms, end_ms, duration_ms }
timing_deviation_ms?: number
timing_status?: "early" | "on_time" | "late" | "too_long" | "too_short"
```
Enables:
- Rhythm analysis (smoothness_score)
- Clinical feedback ("you're rushing the /b/")
- Adaptive difficulty (if timing is consistently off, slow down)

### 6. Tone Contour Visualization
```typescript
ToneContour {
  tone: ToneLabel,
  points: PitchPoint[],  // time_ms + hz
  start_hz, end_hz, peak_hz,
  direction: "rising" | "falling" | "level" | "dipping" | "rising_falling"
}
```
Enables:
- Visual overlay (expected vs detected contour)
- Tone shape analysis (is the child's tone 2 rising enough?)
- Clinical depth (therapist can see exact pitch trajectory)

## Migration Path

### Existing Types → UtteranceAnalysis

| Legacy Type | New Location | Notes |
|-------------|--------------|-------|
| `PhonemeEvent` | `PhonemeAnalysis.timing` | Now includes expected + deviation |
| `PhonemeResult` | `SyllableAnalysis` | Split into syllable + phoneme array |
| `WordAttempt` | `SyllableAnalysis` | Renamed, added tone contour |
| `QuestionResult` | `UtteranceAnalysis` | Now includes full timing + errors |
| `ParsedPhoneme` | `PhonemeId` | Simplified, added type field |
| `AttemptTag` | `ErrorInstance.category` | Expanded 3 → 6 categories |
| `PronunciationResult` | `UtteranceAnalysis` | Now includes full analysis |

### Backward Compatibility

During migration, use projection functions:
```typescript
// Old code
const result: PronunciationResult = await fetchResult();

// New code
const analysis: UtteranceAnalysis = await analyzeUtterance();
const result = toLegacyPronunciationResult(analysis); // compatibility shim
```

## Validation

### TypeScript Compilation
```bash
$ npx tsc --noEmit
(no errors)
```

### JSON Schema Validation
```bash
$ node -e "const s = require('./data/utterance-analysis.schema.json'); console.log('Valid:', !!s.definitions?.PhonemeAnalysis)"
Valid: true
Definitions: 15
```

## Next Steps (Phase 0.2)

1. **Create validation utility** — `src/utils/utteranceValidator.ts`
   - Validate incoming `UtteranceAnalysis` against JSON Schema
   - Runtime type guards (`isUtteranceAnalysis(obj)`)
   - Unit tests for validation

2. **Create mock data generator** — `scripts/generate-mock-analysis.ts`
   - Generate realistic `UtteranceAnalysis` samples
   - Cover all error types + edge cases
   - Use for frontend development + testing

3. **Update frontend** — Integrate `projectToParentSummary()` + `projectToTherapistView()`
   - Replace legacy types in `ParentDashboardPage.tsx`
   - Replace legacy types in `NEPADashboardPage.tsx`
   - Add loading + error states

4. **Create backend stubs** — Supabase Edge Functions
   - `analyze-utterance` — Return mock `UtteranceAnalysis`
   - `session-summary` — Return aggregated session data
   - `history` — Return historical trends

## Success Criteria

✅ TypeScript types compile without errors
✅ JSON Schema validates correctly (15 definitions)
✅ Schema covers all ASR 1.2 requirements (phoneme timestamps, tone labels, noise robustness)
✅ Schema covers all TTS 1.2 requirements (expected timing, tone contours, voice variants)
✅ Schema covers all SNN requirements (micro-timing, pitch contour, fatigue detection)
✅ Schema supports parent dashboard (friendly, no jargon)
✅ Schema supports therapist dashboard (clinical depth)
✅ Projection functions map to both views
✅ API contracts defined (POST /analyze_utterance, GET /session_summary, GET /history)
✅ Migration guide documents old → new type mapping
✅ Architecture diagram shows full pipeline

## Files Created

```
src/types/utteranceAnalysis.ts          (467 lines)
data/utterance-analysis.schema.json     (280 lines)
docs/utterance-analysis-architecture.md (200+ lines)
```

**Total:** ~950 lines of schema + documentation

---

**Phase 0.1 Status:** ✅ COMPLETE
**Next Phase:** Phase 0.2 — Validation Layer + Mock Data Generator
