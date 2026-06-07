# Speakable: Neuroscience-Driven Cantonese Speech Therapy Platform

## A Clinical Framework Powered by Neuromorphic AI

---

## 1. Executive Summary

Speakable is a digital therapeutic platform that bridges **neuroscience**, **speech-language pathology**, and **AI engineering** to deliver the first real-time, per-phoneme Cantonese speech therapy system. At its core is **NEPA** (Neuromorphic Engine for Phoneme Analysis), a spiking neural network that models how the human auditory cortex processes speech sounds — then uses that same neural code to detect, analyse, and train Cantonese phonemes at sub-second resolution.

Unlike generic ASR (speech-to-text) systems that map audio to whole words, NEPA operates at the **phoneme level** — detecting initials (聲母), finals (韻母), and tones (聲調) independently with millisecond timing. This mirrors how speech therapists actually work: breaking speech into its component sounds and rebuilding them one at a time.

The platform serves three user roles in a continuous feedback loop:

| Role | Tool | Function |
|------|------|----------|
| **Child (Explorer)** | 3D Enchanted Forest + mini-games | Practises speech through play |
| **Therapist** | NEPA Dashboard + AI Game Builder | Plans sessions, monitors progress, generates targeted exercises |
| **Parent** | Parent Portal | Consents, tracks insights, manages billing |

---

## 2. Neuroscience Foundation

### 2.1 Cantonese Phonology: Why It Matters

Cantonese is one of the most phonologically complex spoken languages:

- **19 initials (聲母)** — stops, nasals, fricatives, affricates, approximants
- **56 finals (韻母)** — structured as (medial) + nucleus + (coda), where codas include nasals /m, n, ŋ/ and stops /p, t, k/
- **6 contrastive tones (聲調)** — pitch patterns that distinguish lexical meaning (e.g., 詩 si1 vs 時 si4)

This means a Cantonese-speaking child must learn to produce and perceive approximately **75 unique phonemes × 6 tones = 450+ phoneme-tone combinations** before reaching phonological maturity (typically by age 6; So & Dodd, 1995; Wong & Stokes, 2001). Each of these can be impaired independently in children with phonological disorders.

Common Cantonese phonological error patterns include:

| Error Type | Example | Target Phonemes |
|------------|---------|-----------------|
| Stop-nasal confusion | 你 (nei5) → lei5 | /n/ → /l/ |
| Deaspiration | 怕 (paa3) → baa3 | /pʰ/ → /p/ |
| Final neutralisation | 三 (saam1) → saan1 | /m/ → /n/ |
| Tone confusion | 媽 (maa1) → maa5 | Tone 1 → Tone 5 |
| Cluster reduction | 瓜 (gwaa1) → gaa1 | /gw/ → /g/ |

Generic ASR (Whisper, Google Speech, Azure Speech) transcribes entire utterances and does not expose individual phoneme accuracy. A therapist cannot tell *which* phoneme a child misarticulated — only that the word was "wrong." This is the fundamental technical gap that NEPA was built to solve.

### 2.2 Spike-Timing-Dependent Plasticity (STDP)

The human brain learns speech through a neural mechanism called **spike-timing-dependent plasticity** (Bi & Poo, 1998): when a presynaptic neuron fires *before* a postsynaptic neuron, the synaptic connection is strengthened; when it fires *after*, the connection is weakened. This is Hebbian learning ("fire together, wire together") refined to the millisecond timescale.

**NEPA implements STDP directly in its phoneme detection pipeline.** Every time a child speaks into the microphone:

1. The audio signal is converted into spike trains (temporal encoding via cochlear filterbank)
2. SNN layers process these spike trains through leaky-integrate-and-fire neurons
3. STDP updates are computed online: correct productions strengthen the target phoneme's neural pathway; incorrect productions weaken the error pathway
4. The updated weights immediately affect future phoneme detection for *this specific child*

This means NEPA does not just recognise phonemes — it **learns each child's unique articulatory profile in real time**, continuously adapting its detection model to that child's voice, accent, and error patterns. After 10–15 sessions, NEPA's internal model of the child converges with high specificity, reducing false positives on their specific error patterns (e.g., learning that this child tends to substitute /l/ for /n/ in syllable-initial position, and adjusting its confidence weighting accordingly).

**Why this matters clinically:**
- Traditional speech assessment requires a trained professional to *listen* and *judge* each production
- Generic ASR treats "correct" as a binary match against a canonical adult form
- NEPA's STDP model provides a **continuous accuracy score per phoneme** that learns what "correct" means for *this child at this stage of development* — a true developmental approach to phoneme assessment

### 2.3 Spiking Neural Networks (SNN)

Unlike conventional deep neural networks that use continuous-valued activations, **spiking neural networks** communicate through discrete spike events over time (Maass, 1997). This is biologically more realistic and offers three critical advantages for speech processing:

| Property | DNN | SNN |
|----------|-----|-----|
| Temporal encoding | Implicit (context windows) | Explicit (spike timing) |
| Energy efficiency | GPU-bound | Event-driven, 100–1000× lower power |
| Online learning | Requires replay buffers | Natural via STDP |
| Temporal resolution | Frame-based (~10ms) | Event-based (~0.1ms) |

For embedded deployment (Jetson Nano, 10W power budget), the SNN's event-driven computation means NEPA can run **continuous real-time phoneme detection on-device** without cloud connectivity — critical for clinic environments with unreliable internet and for data privacy in paediatric healthcare.

### 2.4 The NEPA Processing Pipeline

```
Microphone → Cochlear Filterbank (Gammatone) → Spike Encoding
    → SNN Layer Bank (initial / final / tone detectors)
        → STDP Weight Update (per-patient online learning)
            → PhonemeEvent[] with confidence scores
```

**PhonemeEvent** is the core data unit:
```typescript
interface PhonemeEvent {
  phoneme: string;       // e.g., "n", "aa", "1"
  type: "initial" | "final" | "tone";
  startMs: number;       // millisecond offset
  endMs: number;
  confidence: number;    // 0.0 – 1.0
}
```

This is emitted as a stream — not a batch — so the frontend can render **live phoneme trace panels** that show which phonemes the child is producing *as they speak*.

### 2.5 Hon9Kon9ize Integration

Hon9Kon9ize ("香港人"), a dedicated Cantonese ASR model, runs alongside NEPA as an **auditory calibrator**. Its role:

- **Initial seed**: Provides training data for NEPA's initial weight configuration
- **Periodic recalibration**: Every N sessions, Hon9Kon9ize evaluates the same audio to detect drift in NEPA's per-patient model
- **STDP teacher signal**: When Hon9Kon9ize's transcript disagrees with NEPA's phoneme detection, the divergence is treated as a learning signal — either Hon9Kon9ize is wrong (high noise environment) or NEPA has drifted (overfit to an error pattern)

This dual-engine architecture (SNN + external ASR validator) is unique: NEPA provides the **speed and per-phoneme granularity**; Hon9Kon9ize provides the **broad-coverage ground truth** for calibration.

---

## 3. Speech Therapy Framework

### 3.1 The Clinical Cycle

Speakable implements the standard speech therapy clinical cycle, digitised end-to-end:

```
  ┌─────────────────────────────────────────┐
  │  1. ASSESSMENT                          │
  │  └─ NEPA world model initialisation      │
  │     └─ Phoneme profile baseline           │
  └──────────────────┬──────────────────────┘
                     │
  ┌──────────────────▼──────────────────────┐
  │  2. GOAL SETTING                        │
  │  └─ Agent identifies weakest phonemes    │
  │     └─ Therapist confirms targets         │
  └──────────────────┬──────────────────────┘
                     │
  ┌──────────────────▼──────────────────────┐
  │  3. INTERVENTION                        │
  │  └─ AI generates targeted games          │
  │     └─ Child practises in 3D forest       │
  │     └─ NEPA streams live phoneme data     │
  └──────────────────┬──────────────────────┘
                     │
  ┌──────────────────▼──────────────────────┐
  │  4. MONITORING                          │
  │  └─ World model updates (STDP deltas)    │
  │     └─ Trend analysis per phoneme         │
  │     └─ Fatigue detection                  │
  └──────────────────┬──────────────────────┘
                     │
                     └──→ Return to step 2
```

### 3.2 Assessment: The World Model

When a new child uses the platform, their first session creates a **World Model** — a structured representation of their current phonological system:

```typescript
interface WorldModel {
  patient_id: string;
  phoneme_profiles: PhonemeProfile[];  // one per phoneme they've attempted
  session_context: {
    attempted: number;                   // total phonemes attempted
    fatigued_at_minute: number | null;   // session fatigue threshold
    next_best_focus: string;            // STDP-driven recommendation
  };
}

interface PhonemeProfile {
  phoneme: string;
  accuracy: number;        // STDP-weighted moving average
  trend: "improving" | "stable" | "declining";
  confusions: string[];    // phonemes this child substitutes
  fatigue_delta: number;   // accuracy drop under fatigue
}
```

This is not a simple accuracy log. The STDP model tracks **confusion vectors**: if /n/ is confused with /l/ 73% of the time but with /m/ only 12% of the time, the world model records this asymmetric confusion pattern, which directly informs intervention target selection.

### 3.3 Minimal Pair Therapy (Digitised)

Minimal pair therapy is one of the most evidence-based approaches for phonological disorders (Baker, 2010; Weiner, 1981). It presents word pairs that differ by a single phoneme (e.g., 你 nei5 / 里 lei5 for /n/ vs /l/) and trains the child to discriminate and produce the contrast.

Speakable's AI Game Generator implements minimal pair therapy through:

1. **Target identification**: World model identifies phonemes with confusion patterns
2. **Pair selection**: The confusion vectors dictate which minimal pairs to use (e.g., child confuses /n/→/l/, so pairs are n-initial vs l-initial words)
3. **Presentation modes**:
   - **SelectCorrect**: "Which one has the /n/ sound?" — child picks from 2–4 options
   - **DragSort**: "Sort these words by their first sound" — drag into /n/ or /l/ buckets
   - **RepeatAfter**: "Say the word — NEPA scores your production"
4. **Adaptive difficulty**: As accuracy improves, the pool expands to harder contrasts (e.g., /n/ vs /l/ in different vowel contexts)

### 3.4 Traditional Articulation Therapy

Beyond minimal pairs, the platform supports the **traditional articulation therapy hierarchy** (Van Riper, 1978):

| Level | Description | Speakable Implementation |
|-------|-------------|------------------------|
| **Isolation** | Produce the phoneme alone | NEPA phoneme-only detection mode |
| **Syllable** | CV or VC combinations | "Say /na/ → /ni/ → /nu/" |
| **Word** | Target in word-initial/final position | Challenge items in AI games |
| **Sentence** | Target in connected speech | Aura Journey voice prompts |
| **Conversation** | Spontaneous use | Forest voice interactions |

The AI Game Generator maps this hierarchy to specific game mechanics:

- Isolation → Tone Wheel (spin and produce a single tone)
- Syllable → Repeat After (listen and repeat CV syllables)
- Word → SelectCorrect / Minimal Pair Dash (discriminate and produce words)
- Sentence → Aura Journey scenes (voice recording prompts)
- Conversation → Free exploration in Enchanted Forest (voice-activated hotspots)

### 3.5 Fatigue Detection

Speech therapy research shows that **articulatory accuracy declines significantly after 15–25 minutes of intensive practice** (Kent, 2000). Children with motor speech disorders fatigue faster.

NEPA tracks **fatigue_delta** per phoneme: the difference in accuracy between the first and second halves of a session. When fatigue is detected:

- The game difficulty scales down (more time per question, fewer options)
- The agent recommends a break or a cooldown activity
- The session data is flagged in the world model
- Future session planning accounts for the child's typical fatigue threshold

### 3.6 The AI Game Generator (Agent Workflow)

The game generator is the bridge between NEPA's world model and the child's practice. It operates as an **orchestrating agent** with a clear workflow:

```
Therapist: "小明 needs n/l work"
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │  1. FETCH PATIENT WORLD MODEL        │
  │  └─ Weakest phonemes: n (62% ↓)     │
  │  └─ Confusions: n → [l]             │
  │  └─ Fatigue threshold: 18 minutes   │
  │  └─ Overall accuracy: 54%           │
  └─────────────────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │  2. GENERATE BLUEPRINT              │
  │  └─ Target: initial /n, l/          │
  │  └─ Difficulty: easy (overall 54%)  │
  │  └─ Distractors: confusion pairs    │
  │  └─ Rounds: 4 (fatigue-adjusted)    │
  │  └─ Scene: underwater               │
  └─────────────────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │  3. RENDER 3D SCENE                 │
  │  └─ Underwater environment           │
  │  └─ Floating objects with animations │
  │  └─ Bubble particles                 │
  └─────────────────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │  4. THERAPIST PREVIEW & CONFIRM      │
  │  └─ Reviews challenges               │
  │  └─ Confirms, regenerates, or tests  │
  └─────────────────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────┐
  │  5. SAVED → FOREST HOTSPOT           │
  │  └─ Child plays, NEPA scores         │
  │  └─ World model updates              │
  └─────────────────────────────────────┘
```

Key clinical properties of the generated games:

| Property | How It's Clinical |
|----------|-------------------|
| **Per-patient targeting** | Targets = weakest phonemes + actual confusions |
| **Distractor selection** | Chosen from child's real error patterns, not random |
| **Difficulty titration** | Scaled to overall accuracy, adjusted per fatigue state |
| **Scene theming** | Environment colour and objects matched to phoneme type (initial → forest, final → underwater, tone → space) |
| **Round count** | Capped at fatigue threshold |
| **Feedback timing** | 800–1200ms delay optimised for reinforcing correct productions |

---

## 4. Platform Architecture

### 4.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SPEAKABLE FRONTEND                          │
│  React + TypeScript + Three.js (@react-three/fiber)                 │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    APP ROUTER                                 │   │
│  │  /forest ← Enchanted Forest (R3F 3D world)                  │   │
│  │  /st-nepa ← NEPA Dashboard (world model + analytics)        │   │
│  │  /st-game-builder ← AI Game Builder (agent workflow)        │   │
│  │  /aura ← Aura Journey (cinematic voice cloning experience)  │   │
│  │  /parent ← Parent Portal (consent + billing + insights)     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    GAME ENGINE                                │   │
│  │  GameDirector → Mechanic components (SelectCorrect,          │   │
│  │  DragSort, ToneWheel, etc.) + SceneRenderer (R3F Canvas)    │   │
│  │                                                               │   │
│  │  Blueprint = { phonemeTargets, mechanic, scene, challenges,   │   │
│  │                adaptationRules } ← JSON, LLM-generable       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTP / WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        NEPA BACKEND (Jetson)                        │
│  FastAPI + Python                                                   │
│                                                                     │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  SNN     │  │  STDP     │  │  World Model  │  │  Hon9Kon9ize │  │
│  │  Engine  │  │  Learner  │  │  Agent        │  │  Wrapper     │  │
│  └──────────┘  └───────────┘  └──────────────┘  └──────────────┘  │
│                                                                     │
│  REST API:                                                          │
│  POST /phonemes    → PhonemeResponse (processed + STDP update)     │
│  GET  /api/v1/world-model/{id}  → WorldModel                       │
│  GET  /api/v1/dashboard/{id}   → DashboardSummary                  │
│  POST /api/v1/exercise/recommend → ExerciseRecommendation[]        │
│  POST /synthesize  → SynthesizeResponse (voice clone inference)    │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Edge Deployment

NEPA runs on an **NVIDIA Jetson Nano (or AGX Orin)** at the clinic or school site:

- **Model**: Jetson AGX Orin (preferred) / Jetson Nano (minimum)
- **Power**: 7–15W (Nano) / 15–60W (Orin)
- **Kernel**: Linux 4.9.253-tegra (tested arm64)
- **C++ backend**: HPC-optimised with ARM64/NEON intrinsics via `jetson_backend.hpp`
- **No cloud dependency**: All phoneme processing is on-device → zero latency, zero data egress cost, GDPR/HK PDPO compliant

### 4.3 Data Flow

```
┌──────────┐    Audio     ┌──────────┐   PhonemeEvent[]   ┌──────────┐
│  Browser │──(mic)──────▶│  NEPA    │───────────────────▶│  Frontend │
│  (user)  │              │  Engine  │                     │  (render) │
└──────────┘              └────┬─────┘                     └──────────┘
                               │ STDP weight update
                               ▼
                        ┌──────────────┐
                        │  World Model  │
                        │  (per child)   │
                        └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  Game Agent   │
                        │  (generator)   │
                        └──────────────┘
```

---

## 5. Clinical Workflow Walkthrough

### Session 1: Initial Assessment

1. **Therapist creates a student profile** in the NEPA Dashboard
2. **Child practises** in the Enchanted Forest for 15 minutes — producing target words at each hotspot
3. **NEPA streams phoneme data** to build the initial world model:
   - /n/: 38% accuracy, declining trend, confused with /l/
   - /l/: 42% accuracy, stable trend, confused with /n/
   - /gw/: 65% accuracy, improving trend
   - Fatigue detected at 14 minutes
4. **World model auto-suggests** target phonemes: /n/ and /l/ (highest priority)

### Session 2: First Targeted Intervention

1. **Therapist opens AI Game Builder**, selects the child
2. **NEPA context card** shows: "小明 — weakest: n (38% ↓) confused with l"
3. **Therapist clicks "交給 AI 設計遊戲"**
4. **Agent generates**:
   - Target: initial /n, l/
   - Scene: forest environment (initial-type)
   - 4 challenges using minimal pairs (你/里, 男/藍, 年/連, 女/旅)
   - Distractors from actual confusion vectors
   - Easy difficulty (adjusted from 38% accuracy)
   - Fatigue cap: 14 minutes
5. **Therapist previews** — sees the challenges, 3D scene preview, confirms
6. **Game appears** as a new hotspot in the child's forest
7. **Child plays** — NEPA scores every attempt, updates world model in real time

### Session 5: Progress Review

1. **Therapist opens NEPA Dashboard**
2. **STDP learning progress bar**: SNN weight for /n/ has increased from 0.38 → 0.71
3. **Trend chart**: /n/ improving, /l/ improving, fatigue threshold extending to 18 minutes
4. **Agent recommends**: Move to medium difficulty, add /n/ vs /l/ in final position
5. **Next session focus**: /ŋ/ final with /n/ final (/ŋ/ accuracy dropping to 55%)

---

## 6. Competitive Differentiation

| Feature | Speakable + NEPA | Competitors |
|---------|-----------------|-------------|
| Phoneme-level detection | ✅ Real-time initial/final/tone | ❌ Word-level only |
| Cantonese-specific | ✅ Native tone detection | ❌ Generic ASR |
| Per-patient adaptation | ✅ STDP online learning | ❌ Static models |
| Real-time feedback | ✅ <50ms latency | ❌ Batch/offline |
| Offline-capable | ✅ Jetson edge | ❌ Cloud required |
| Fatigue detection | ✅ Per-phoneme fatigue delta | ❌ Not available |
| AI game generation | ✅ Patient-data-driven | ❌ Fixed content |
| 3D immersive environment | ✅ React Three Fiber | ❌ 2D only |
| Source of truth | Clinical STDP model | Generic ASR |

---

## 7. Roadmap

| Priority | Feature | Status |
|----------|---------|--------|
| P0 | NEPA SNN + STDP phoneme engine | ✅ Built in NEPA repo |
| P0 | Enchanted Forest 3D environment | ✅ Built |
| P0 | NEPA Dashboard + world model | ✅ Built |
| P0 | AI Game Builder (agent workflow) | ✅ Built |
| P0 | Minimal Pair + SelectCorrect games | ✅ Built |
| P1 | Parent portal (consent + billing + insights) | ✅ Built |
| P1 | Aura Journey cinematic experience | ✅ Built |
| P1 | Session template mode (multi-round plans) | 🔜 Next |
| P1 | DragSort, ToneWheel, RepeatAfter mechanics | 🔜 Next |
| P1 | MatchPair, MinimalPairDash mechanics | 🔜 Next |
| P2 | Live phoneme trace panel (streaming) | 🔜 Next |
| P2 | Voice cloning pipeline (NEPA synthesis) | ⏳ Blocked |
| P2 | Stripe billing webhook | ⏳ Blocked |
| P3 | Putonghua phoneme support | Future |
| P3 | English phoneme support | Future |
| P3 | Multi-player forest sessions | Future |

---

## 8. References

- Baker, E. (2010). Minimal pair intervention. In A. L. Williams, S. McLeod, & R. J. McCauley (Eds.), *Interventions for speech sound disorders in children*.
- Bi, G., & Poo, M. (1998). Synaptic modifications in cultured hippocampal neurons: Dependence on spike timing, synaptic strength, and postsynaptic cell type. *Journal of Neuroscience*, 18(24), 10464–10472.
- Kent, R. D. (2000). Research on speech motor control and its disorders. *Journal of Communication Disorders*, 33(4), 391–426.
- Maass, W. (1997). Networks of spiking neurons: The third generation of neural network models. *Neural Networks*, 10(9), 1659–1671.
- So, L. K. H., & Dodd, B. J. (1995). The acquisition of phonology by Cantonese-speaking children. *Journal of Child Language*, 22(3), 473–495.
- Van Riper, C. (1978). *Speech correction: Principles and methods* (6th ed.). Prentice-Hall.
- Weiner, F. (1981). Treatment of phonological disability using the method of meaningful minimal contrast. *Journal of Speech and Hearing Disorders*, 46(1), 97–103.
- Wong, A. M.-Y., & Stokes, S. F. (2001). Cantonese consonantal development. *Clinical Linguistics & Phonetics*, 15(7), 547–566.
