# SpeakAble StoryVerse — Architecture

## Overview

StoryVerse is an interactive story engine that connects **therapist progress** to **narrative progression**. Children advance through story worlds by completing speech missions powered by the NEPA fusion pipeline (ASR + TTS + SNN).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STORYVERSE ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   Therapist      │         │   Child          │
│   Dashboard      │         │   Interface      │
│                  │         │                  │
│ • Phoneme select │         │ • Story scenes   │
│ • Tone select    │         │ • Speech missions│
│ • Word select    │         │ • Rewards        │
│ • Difficulty     │         │ • Progress       │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│  Therapist →     │         │  Story Engine    │
│  Story Mapping   │         │                  │
│                  │         │ • Scene nav      │
│ • World match    │         │ • Mission eval   │
│ • Chapter select │         │ • Branching      │
│ • Difficulty adj │         │ • Adaptive diff  │
│ • Session plan   │         │ • Progress track │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │    ┌──────────────────┐    │
         └───►│  Story Data      │◄───┘
              │                  │
              │ • Worlds (5)     │
              │ • Chapters (10)  │
              │ • Scenes (20-30) │
              │ • Missions (50+) │
              │ • Rewards        │
              └──────────────────┘
                       │
                       ▼
              ┌──────────────────┐
              │  UtteranceAnalysis│
              │  (Phase 0.1)     │
              │                  │
              │ • Phoneme timing │
              │ • Tone accuracy  │
              │ • Smoothness     │
              │ • Error classify │
              └──────────────────┘
```

## Data Model

### Hierarchy
```
StoryWorld (e.g. "bear-adventure")
  └── StoryChapter (e.g. "bear-ch1: Benny Wakes Up")
       └── StoryScene (e.g. "bear-ch1-s2: Say 'baa1'")
            ├── Dialogue (character speech)
            ├── SpeechMission (target word + success criteria)
            ├── Reward (sticker/badge/xp)
            └── Branch[] (conditional next scenes)
```

### Key Types

| Type | Purpose |
|------|---------|
| `StoryWorld` | Top-level container: characters, chapters, phoneme/tone focus |
| `StoryChapter` | Sequential unit: target phonemes, difficulty, scenes |
| `StoryScene` | Atomic unit: dialogue + optional mission + reward + branches |
| `SpeechMission` | Speech target: word, jyutping, phonemes, tone, success criteria |
| `MissionAttempt` | Single try: analysis, scores, result, errors |
| `StoryProgress` | Per-child state: scene/chapter completion, XP, streaks |

### Branching Logic
```
Scene branches on MissionResult:
  "success"        → next scene (reward + progress)
  "almost"         → retry scene (encouragement)
  "needs_practice" → hint scene (extra help)
  "always"         → unconditional fallback
```

## Components

### 1. Type Definitions
**File:** `src/types/storyverse.ts` (377 lines)

All TypeScript interfaces for the story system. Key exports:
- `StoryWorld`, `StoryChapter`, `StoryScene`
- `SpeechMission`, `MissionSuccessCriteria`, `MissionAttempt`
- `StoryProgress`, `ChapterProgress`, `SceneProgress`
- `TherapistStoryAssignment`, `StoryRecommendation`
- `AdaptiveStoryConfig`
- API request/response contracts

### 2. Story Content
**File:** `src/data/storyverse/stories/bearAdventure.ts` (923 lines)

First story world: 小熊歷險記 (Bear Adventure)
- 3 chapters (demo), 10 chapters (full)
- Focus: /b/, /p/, /m/ + Tones 1, 4, 5
- Age: 4-6 years
- 8 scenes per chapter with branching
- Speech missions with hints and retry paths

**File:** `src/data/storyverse/index.ts` (145 lines)

Story world registry + recommendation engine:
- `getAllStoryWorlds()`, `getStoryWorld(id)`
- `getStoryWorldsByAge(age)`, `getStoryWorldsByPhoneme(phonemes)`
- `recommendStories(input)` — scores worlds by phoneme/tone match

### 3. Story Engine
**File:** `src/lib/storyverse/StoryEngine.ts` (367 lines)

Core engine class managing:
- **Scene navigation** — enter, navigate, next scene lookup
- **Mission evaluation** — compares `UtteranceAnalysis` against `MissionSuccessCriteria`
- **Branching logic** — selects next scene based on result (success/almost/needs_practice)
- **Adaptive difficulty** — auto-adjusts after N consecutive successes/failures
- **Progress tracking** — scene/chapter/world completion, XP, rewards

### 4. Therapist Mapping
**File:** `src/lib/storyverse/therapistMapping.ts` (268 lines)

Maps clinical intent to story content:
- `mapTherapistToStory(prescription)` — finds best worlds/chapters/scenes
- `customizeSuccessCriteria(base, prescription)` — adjusts thresholds for diagnosis
- `generateSessionPlan(prescription)` — creates full session plan (warm-up + story + cooldown)
- `generateRecommendationsFromProgress(summary)` — recommends next stories based on performance

### 5. React Hook
**File:** `src/lib/storyverse/useStoryVerse.ts` (180 lines)

React hook wrapping StoryEngine:
- `loadWorld(world, progress?)` — initialize engine
- `enterScene(sceneId)` / `navigateToScene(sceneId)` — scene navigation
- `evaluateAndSubmit(analysis)` — evaluate speech + submit attempt
- `checkChapterComplete()` / `checkWorldComplete()` — completion checks
- State: `currentScene`, `currentChapter`, `progress`, `difficulty`, `events`

## Integration Points

### With UtteranceAnalysis (Phase 0.1)
The `StoryEngine.evaluateMission()` method takes a `UtteranceAnalysis` and compares it against `MissionSuccessCriteria`:

```typescript
evaluateMission(analysis: UtteranceAnalysis, criteria: MissionSuccessCriteria): MissionResult
```

Checks:
- `analysis.scores.overall >= criteria.min_overall_accuracy`
- `analysis.scores.tone_accuracy >= criteria.min_tone_accuracy`
- `analysis.scores.articulation >= criteria.min_articulation_score`
- `max(timing_deviation_ms) <= criteria.max_timing_deviation_ms`
- `is_low_confidence` handling per difficulty

### With Parent Dashboard
Story progress feeds into parent view via `StoryProgress`:
- Chapters completed
- Sounds mastered (from mission targets)
- Weekly streak
- Rewards earned

### With Therapist Dashboard
Therapist mapping provides:
- Recommended stories based on child's weak phonemes/tones
- Session plans with clinical goals
- Progress tracking per mission

### With Existing Infrastructure
- **Aura Journey** — cinematic story chapters (can be wrapped as StoryVerse scenes)
- **Forest Games** — quiz-style games (can be referenced as scene types)
- **MiniGame Builder** — procedural games (can be triggered as reward scenes)
- **Quest System** — lesson progression (parallel system, can share XP)

## API Contracts

### POST /story/analyze_mission
Evaluate a speech attempt within a story mission.
```
Request:  { child_id, mission_id, audio, intended_jyutping }
Response: { result: "success"|"almost"|"needs_practice", next_scene_id, rewards[], progress }
```

### GET /story/next_scene?child_id=...
Get the next scene for a child's current story position.
```
Response: { scene, chapter, world, progress, adaptive_config }
```

### GET /story/progress?child_id=...
Get full story progress for a child.
```
Response: { progress, worlds[], recommendations[] }
```

### POST /story/therapist_assign
Create a therapist story assignment.
```
Request:  { child_id, therapist_id, target_phonemes[], target_tones[], difficulty? }
Response: { assignment, recommended_chapters[], session_plan }
```

## File Summary

| File | Lines | Purpose |
|------|-------|---------|
| `src/types/storyverse.ts` | 377 | All TypeScript types |
| `src/types/utteranceAnalysis.ts` | 439 | UtteranceAnalysis schema (Phase 0.1) |
| `src/data/storyverse/index.ts` | 145 | World registry + recommendations |
| `src/data/storyverse/stories/bearAdventure.ts` | 923 | Bear Adventure story (3 chapters) |
| `src/lib/storyverse/StoryEngine.ts` | 367 | Core engine |
| `src/lib/storyverse/therapistMapping.ts` | 268 | Therapist → Story mapping |
| `src/lib/storyverse/useStoryVerse.ts` | 180 | React hook |
| `src/lib/storyverse/index.ts` | 19 | Barrel export |
| `data/utterance-analysis.schema.json` | 332 | JSON Schema (Phase 0.1) |
| **Total** | **3,050** | |

## Next Steps

### Phase 1 — Content Creation (3-4 weeks)
- Create 4 more story worlds (bus-travel, underwater-friends, magic-forest, dragon-quest)
- Expand Bear Adventure to 10 chapters
- Add visual assets (characters, backgrounds, animations)
- Create TTS reference audio for all missions

### Phase 2 — Speech Mission Engine (3-5 weeks)
- Integrate Fusion API for real-time mission evaluation
- Implement branching UI (scene transitions, character animations)
- Add reward system (stickers, badges, unlockables)
- Build practice flow (record → analyze → feedback → branch)

### Phase 3 — Parent Dashboard Integration (2-3 weeks)
- Add story progress section to ParentDashboardPage
- Show chapters completed, sounds mastered, weekly streak
- Add encouraging language system

### Phase 4 — Therapist Dashboard Integration (3-4 weeks)
- Add story assignment UI to therapist portal
- Build session plan generator
- Add clinical tracking (mission pass rates, tone stability)

### Phase 5 — Adaptive Intelligence (4-6 weeks)
- Implement personalized story paths
- Build emotional feedback engine (character reactions)
- Add difficulty auto-adjustment based on NEPA world model
