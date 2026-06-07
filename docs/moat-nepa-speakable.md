# NEPA + Speakable: The Moat

## For Speech Therapists & SEN Education (Cantonese, then Putonghua, then English)

---

### 1. The Problem Today

A speech therapist working with a Cantonese-speaking child has no real-time data. Their toolkit:

- **Picture cards** — no measurement
- **Ear** — subjective, inconsistent across sessions
- **Phone recording** — batch, no breakdown, no analytics
- **Generic ASR** — built for English/Mandarin, Cantonese tone is invisible
- **Azure Pronunciation Assessment** — Cantonese support is weak, no tone breakdown
- **Deepgram / Whisper** — streaming transcript, not phoneme-level feedback

The result: therapists guess, children don't improve between sessions, parents have no visibility.

---

### 2. The NEPA + Speakable Solution

```
              ┌─────────────────────────────────────┐
              │        Speakable (Frontend)          │
              │  Lesson UI, Feedback, Dashboard      │
              └──────────────┬──────────────────────┘
                             │ POST /phonemes
                             │ POST /synthesize
                             │ WS /ws/speech/phonemes (streaming)
                             ▼
              ┌─────────────────────────────────────┐
              │         NEPA Bridge Service          │
              │  Agent dispatch, NATS orchestration  │
              └──────┬──────────────────────┬───────┘
                     │                     │
                     ▼                     ▼
         ┌──────────────────┐   ┌──────────────────┐
         │  Hon9Kon9ize     │   │  NEPA Core       │
         │  (Cantonese ASR) │   │  SNN + STDP      │
         │  Accurate model  │   │  Online learning  │
         └──────────────────┘   └──────────────────┘
                     │                     │
                     └──────┬──────────────┘
                            ▼
              ┌─────────────────────────────────────┐
              │        PhonemeEvent[] Output         │
              │  initial: /l/   confidence: 0.92    │
              │  final: /aa/    confidence: 0.95    │
              │  tone: 1 → 3   timing: 320ms        │
              │  drift detected at 450ms             │
              └─────────────────────────────────────┘
```

### 3. The Technical Moat (4 Layers)

#### Layer 1: Streaming Cantonese Phoneme Pipeline

No service on earth streams real-time Cantonese phoneme breakdown (initial/final/tone with millisecond timing). Not Azure. Not Deepgram. Not Google.

**What the therapist sees:**

```
Child says "三" (saam1)

  Time  │ Phoneme   │ What happened
 ───────┼───────────┼─────────────────────
   0ms  │ /s/       │ Initial ✅
  80ms  │ /s/→/s/   │ Steady ✅
 160ms  │ /aa/      │ Vowel starts ✅
 240ms  │ /aa/→/aa/ │ Steady ✅
 320ms  │ tone 1    │ High level ✅
 400ms  │ tone 1→3  │ ⚠️ Drifting down
 480ms  │ tone 3    │ ❌ Ended mid-rising
```

The therapist says: *"See here at 400ms — your pitch dropped. Try again and keep it high for the whole sound."*

This is physically impossible with any batch ASR.

#### Layer 2: STDP Online Learning (The Platform Moat)

Every ASR on the market is a **static model**. You pay for inference. The model never changes.

NEPA's SNN with spike-timing-dependent plasticity learns **every session**:

| Aspect | Static ASR | NEPA STDP |
|---|---|---|
| Model updates | Every 6 months via retraining | **Every utterance, online** |
| Per-user adaptation | None | Learns each child's error patterns |
| Tone sensitivity | Fixed threshold | **Adapts** — tighter for tonal kids, looser for beginners |
| Fatigue detection | Impossible | Detects when a child's /s/ devoices after 10 minutes |
| Nocturnal consolidation | None | Offline STDP replay between sessions |

**Practical example:**

Session 1: Child is /l/→/n/ confused. The SNN adjusts synaptic weights to be more sensitive to that distinction.
Session 2: Same child — the system already knows their profile. Classification improves without any label.
Session 5: The child has improved. The system adapts again, tightening the threshold, pushing them to native accuracy.

No other ASR does this. **Every session makes the system smarter for that specific user.**

#### Layer 3: World Model Agent (The Orchestration Moat)

The NEPA agent is not just a router. It builds a **world model** of the child:

```
SpeakableAgent.world_model = {
  user: "child_123",
  phoneme_profile: {
    "/l/":    { accuracy: 0.72, trend: "improving", confusion: ["/n/"] },
    "/n/":    { accuracy: 0.88, trend: "stable" },
    "tone_2": { accuracy: 0.45, trend: "declining", fatigue_delta: 0.15 },
  },
  session_context: {
    attempted: 12, fatigued_at_minute: 8,
    next_best_exercise: "minimal_pair_l_n",
  }
}
```

**What this enables:**

- Agent chooses the next exercise based on phoneme weakness, not a fixed curriculum
- Agent detects fatigue and switches to easier sounds
- Agent recommends minimal pairs the child actually struggles with (not generic ones)
- Agent generates a report for the therapist: *"/l/ improving, tone 2 declining after 8 minutes — suggest 5-min sessions with tone focus"*

This is not a rule engine. This is a learning agent that improves with every interaction.

#### Layer 4: Hon9Kon9ize Wrapper (The Accuracy Safety Net)

NEPA's SNN learns, but Hon9Kon9ize's dedicated Cantonese model provides the **ground truth** for initial training and periodic calibration:

```
Session 1-10: Hon9Kon9ize drives inference
              NEPA SNN learns by observing (STDP)
Session 11+:  NEPA SNN takes over
              Hon9Kon9ize used as calibrator (confidence check)
```

This means:
- You launch with accurate results from day 1
- The SNN bootstraps from real data, not synthetic
- Hon9Kon9ize serves as a teacher signal for online learning
- If Hon9Kon9ize goes down, the SNN still works (it's already learned)

---

### 4. The Business Moat (Why Investors Care)

| Dimension | Competitors | Speakable + NEPA |
|---|---|---|
| **Cantonese phoneme breakdown** | ❌ None | ✅ Real-time, streaming |
| **Real-time feedback** | ❌ Batch only | ✅ Per-phoneme, millisecond |
| **Per-user adaptation** | ❌ One model for all | ✅ STDP learns each user |
| **Fatigue detection** | ❌ Impossible | ✅ World model tracks decline |
| **Offline learning** | ❌ Requires GPU cluster | ✅ Local STDP consolidation |
| **Transfer to Putonghua** | ❌ Need new model | ✅ Swap phoneme map, same SNN |
| **Transfer to English** | ❌ Need new model | ✅ Same architecture |
| **Clinical evidence** | ❌ Generic | ✅ HKU + EDU backing |

---

### 5. The Vision

Today: **Cantonese speech therapy** — a beachhead with clinical validation, HKSTP backing, and no competition.

12 months: **Putonghua oral assessment** — K-12 market in HK, Guangdong, Singapore. Every school needs it.

24 months: **English pronunciation** — ESL market across Asia. Same tech, different phoneme model.

36 months: **NEPA as platform** — any language, any assessment, any learning. Licensing to EdTech companies globally.

---

### 6. One-Liner for Investors

> "We built the only real-time Cantonese phoneme engine that learns from every session. It works for speech therapy today, scales to every oral language assessment in Asia tomorrow, and no one else can do any of it."
