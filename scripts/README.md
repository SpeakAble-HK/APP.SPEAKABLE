# SpeakAble Pilot — NEPA Synthetic Data Generation

Generate realistic Cantonese speech therapy training data that matches NEPA's exact API shapes and the SpeakAble pilot consent model.

## Quick Start

```bash
# 1. Set your LLM API key (OpenRouter, OpenAI-compatible, or OPENCODE GO)
$env:NEPA_LLM_API_KEY="your-key-here"

# Optional: use a different API endpoint
$env:NEPA_LLM_API_URL="https://your-api.com/v1/chat/completions"
$env:NEPA_LLM_MODEL="your-model-name"

# 2. Generate all data types
npm run nepa:generate:all

# 3. Validate
npm run nepa:validate
```

## What This Generates

### Participant Records (`participants`)
Complete pilot participant data matching NEPA API shapes:
- **Consent record** — pilot_consent + separate training_consent (per consent form section 5)
- **NEPA World Model** — exact shape of `/api/v1/world-model/{patient_id}` response
- **NEPA Dashboard** — exact shape of `/api/v1/dashboard/{patient_id}` response
- **Exercise Recommendations** — exact shape of `/api/v1/exercise/recommend` response
- **Session Records** — word attempts with phoneme events matching `usePronunciationAPI` interfaces

### Confusion Matrices (`confusion_matrices`)
Phoneme confusion patterns for NEPA's SNN:
- Initial confusions (/n/↔/l/, /b/↔/p/, /z/↔/c/)
- Tone confusions (tone_2↔tone_5, tone_1↔tone_3)
- Final confusions (/oe/↔/eo/, /an/↔/ang/)
- Age and diagnosis-specific adjustments

### Fatigue Patterns (`fatigue_patterns`)
Cognitive load patterns for NEPA fatigue detection:
- Onset timing by age group (4-6: 4-6min, 7-9: 8-12min)
- Severity by diagnosis
- Affected phonemes (tones first, then complex, then simple)
- Recovery time estimates

### Exercise Recommendations (`exercise_recommendations`)
NEPA exercise prescriptions matching SpeakAble's exercise types:
- `tone_drill` — tone recognition/production
- `minimal_pair` — phoneme discrimination
- `syllable_repeat` — motor memory building
- `word_practice` — lexical context
- `sentence_build` — connected speech

## SpeakAble-Specific Alignment

### Phoneme Inventory (NEPA format)
- **Initials**: /b/ /p/ /m/ /f/ /d/ /t/ /n/ /l/ /g/ /k/ /ng/ /h/ /gw/ /kw/ /w/ /z/ /c/ /s/ /j/
- **Tones**: tone_1 tone_2 tone_3 tone_4 tone_5 tone_6
- **Finals**: /aa/ /a/ /e/ /i/ /o/ /u/ /oe/ /eo/ /yu/ + diphthongs + codas

### Practice Islands (app content)
1. **Bilabial** — /b/ /p/ /m/ (雙唇音)
2. **Alveolar** — /d/ /t/ /n/ (齒齦音)

### Cantonese Lexicon
Uses words from `data/canto_lexicon.seed.json`:
- **Tier 1** (easiest): 你好, 多謝, 爸爸, 媽媽, 哥哥, 姐姐...
- **Tier 2** (harder): 蘋果, 香蕉, 飲茶, 叉燒, 蝦餃...

### Pilot Consent Model
Each participant has:
- `pilot_consent: true` — consent to participate (sections 1-4)
- `training_consent: true/false` — separate consent for model training (section 5)

**Data with `training_consent: false` MUST be filtered out before entering the NEPA training set.**

### Participant Codes
Anonymised format: `p-0001`, `p-0002`, etc. Never real names.

## Usage

```bash
# Generate specific data type
npm run nepa:generate -- --type students --count 10
npm run nepa:generate -- --type confusion --count 5
npm run nepa:generate -- --type fatigue --count 1
npm run nepa:generate -- --type exercises --count 10

# Generate everything (20 participants + all supporting data)
npm run nepa:generate:all

# Validate generated data
npm run nepa:validate
```

## Output Structure

```
data/
├── schema.json                    # JSON Schema matching NEPA API shapes
├── canto_lexicon.seed.json        # Practice words
└── synthetic/
    ├── participants-2026-06-05.json
    ├── confusion_matrices-2026-06-05.json
    ├── fatigue_patterns-2026-06-05.json
    └── exercise_recommendations-2026-06-05.json
```

Each file contains:
```json
{
  "metadata": {
    "generated_at": "2026-06-05T12:00:00Z",
    "generator": "speakable-nepa-synthetic",
    "model": "qwen/qwen-2.5-72b-instruct",
    "count": 20,
    "pilot_id": "speakable-hk-pilot-2026"
  },
  "participants": [...]
}
```

## Integration with NEPA

### Loading participant data into NEPA

```javascript
import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('data/synthetic/participants-2026-06-05.json'));

for (const p of data.participants) {
  // Skip participants without training consent
  if (!p.consent.training_consent) continue;
  
  // Feed world model to NEPA
  await fetch('http://localhost:8100/api/v1/training/world-model', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p.world_model),
  });
  
  // Feed session data
  for (const session of p.sessions) {
    await fetch('http://localhost:8100/api/v1/training/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
  }
}
```

### Using as mock data for frontend testing

```javascript
// In useNEPAWorldModel.ts, replace fetch with mock:
const mockData = JSON.parse(readFileSync('data/synthetic/participants-2026-06-05.json'));
const participant = mockData.participants[0];

// world_model matches NEPA response exactly
setWorldModel(participant.world_model);
setDashboard(participant.dashboard);
setRecommendations(participant.recommendations);
```

## Validation

The validator checks:
- Participant code format (p-XXXX)
- Phoneme validity (must be in NEPA inventory)
- Value ranges (accuracy 0-1, duration 1-30min, etc.)
- Enum values (age groups, diagnoses, trends, exercise types)
- Word ID format (wXXXX from lexicon)
- PhonemeEvent timing (start_ms >= 0, end_ms >= start_ms)
- Consent flags (boolean)

```bash
npm run nepa:validate
```

## LLM Configuration

The generator supports any OpenAI-compatible API:

| Provider | API URL | Model |
|----------|---------|-------|
| OpenRouter | `https://openrouter.ai/api/v1/chat/completions` | `qwen/qwen-2.5-72b-instruct` |
| OpenAI | `https://api.openai.com/v1/chat/completions` | `gpt-4o` |
| Custom | Your endpoint | Your model |

```bash
# OpenRouter (default)
$env:NEPA_LLM_API_KEY="sk-or-..."

# OpenAI
$env:NEPA_LLM_API_URL="https://api.openai.com/v1/chat/completions"
$env:NEPA_LLM_API_KEY="sk-..."
$env:NEPA_LLM_MODEL="gpt-4o"

# OPENCODE GO or other compatible API
$env:NEPA_LLM_API_URL="https://api.opencode.go/v1/chat/completions"
$env:NEPA_LLM_API_KEY="your-key"
$env:NEPA_LLM_MODEL="qwen-3.7-plus"
```

## Cost Estimate

Using Qwen 3.7 Plus via OpenRouter:
- ~$0.002 per participant (full record with sessions)
- ~$0.001 per confusion matrix
- ~$0.002 per fatigue pattern set
- ~$0.001 per exercise recommendation set

**Full pilot dataset (50 participants, 25 matrices, fatigue, exercises): ~$0.15**

## Prompt Templates

Located in `scripts/prompts/`:
- `student-profile.txt` — Full participant record with consent
- `confusion-matrix.txt` — Phoneme confusion data
- `fatigue-patterns.txt` — Cognitive load patterns
- `exercise-recommendations.txt` — Exercise prescriptions

All prompts reference:
- Actual SpeakAble practice islands and exercises
- Real words from `canto_lexicon.seed.json`
- NEPA phoneme key format
- Pilot consent model

## Ethical Notes

1. **Consent filtering** — Data with `training_consent: false` must never enter the training set
2. **Anonymisation** — Only participant codes (p-XXXX), never real names
3. **Data retention** — Synthetic data can be kept indefinitely; real pilot data follows consent form terms
4. **Clinical plausibility** — Generated data should be reviewed by an SLP before use in training
