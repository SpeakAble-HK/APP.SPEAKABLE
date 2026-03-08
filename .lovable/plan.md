

## Plan: Redesign Speech Quest as Duolingo-style Game + Supporting Pages

This is a large feature set. Here is the breakdown of all work items.

---

### 1. Redesign SpeechQuestPage with World-based Learning Map

Replace the current flat node list in `SpeechQuestPage.tsx` with a **world-based vertical progression map**.

**Data structure** (new file `src/data/questWorlds.ts`):
- 5 worlds: Basic Sounds, Greetings, Numbers, Food, Daily Conversation
- Each world contains 4-6 lesson nodes with: id, type (read-aloud), title (en/tw/cn), XP reward, words (from existing `PracticeWord` type)
- Nodes unlock sequentially within each world; worlds unlock when all nodes in the previous world are completed

**UI in `SpeechQuestPage.tsx`**:
- World headers with title + progress bar
- Vertical path with zigzag node layout (alternating left/right)
- Completed nodes: green checkmark, Locked: lock icon, Current: pulsing mascot
- Each node shows lesson icon + XP reward
- XP counter in sticky top bar (reuse existing pattern)
- Tapping an unlocked node navigates to the exercise screen

Progress stored in localStorage (extend existing `QUEST_STORAGE_KEY` pattern).

### 2. Create Pronunciation Exercise Screen

New component `src/components/QuestExercise.tsx` (rendered inside SpeechQuestPage when a node is selected).

**Exercise loop** (state machine: `listen` → `record` → `analyzing` → `result`):
1. **Listen**: Display word/phrase + play button. Uses existing voice-clone API to generate reference audio (call `processRecording` with the intended text). Mascot says "Listen carefully."
2. **Record**: Mic button appears. User records. Uses existing `MediaRecorder` pattern from `VoiceOnboarding.tsx`.
3. **Analyzing**: Calls existing `processRecording(audioBlob, word.character)` from `usePronunciationAPI` -- NO backend changes.
4. **Result**: Shows simplified feedback (see item 3 below).

UI elements: word display, play audio button, mic record button, attempt counter (max 3), next button. Mascot guidance text changes per step.

### 3. Simplified Pronunciation Feedback Component

New component `src/components/QuestFeedback.tsx`.

**Default view** (simple):
- Word/sentence practised (large text)
- Accuracy score as large percentage (e.g. "87%") with color coding
- Short feedback message generated from accuracy data (e.g. "The tone was slightly lower than expected.")
- Buttons: "Listen to your voice", "Listen to correct pronunciation", "Try again", "Continue"

**"Show detailed analysis" button** expands to reveal:
- Phoneme comparison table (reuse logic from `PronunciationResultsPage.tsx` `getComparisons`)
- Jyutping breakdown
- Tone accuracy
- Articulation analysis (TonguePositionModal trigger)

All data comes from existing API results -- no modifications.

### 4. Rewards Shop Enhancement

Update existing `RewardsShop.tsx`:
- Add new items: Microphone skins category
- Integrate into SpeechQuestPage (already there)
- XP counter already in top bar

### 5. Replace Sidebar Navigation with Mobile Bottom Navigation

The bottom nav already exists in `AppLayout.tsx` with 5 tabs. Update tabs to match:

| Tab | Icon | Route |
|-----|------|-------|
| Home | Home | `/` |
| Practice | Swords | `/speech-quest` |
| Progress | BarChart3 | `/learning/progress` |
| Learn | BookOpen | `/ipa` |
| Profile | User | `/profile` |

Remove the "Echo" and "Settings" tabs; settings accessible from profile or sidebar.

### 6. Speech Therapy Information Page

New page `src/pages/SpeechTherapyInfoPage.tsx` at route `/speech-therapy-info`.

Informational content sections:
- What is speech therapy?
- Common speech difficulties
- How speech therapy works
- Resources in Hong Kong
- **Disclaimer banner**: "SpeakAble HK does not provide diagnosis or medical treatment."

Update the "Speech Therapy Information" button on Index.tsx to navigate to `/speech-therapy-info` instead of `/about`.

### 7. Leaderboard Placeholder Page

New page `src/pages/LeaderboardPage.tsx` at route `/leaderboard`.

- Title: "Leaderboard"
- Message: "Community leaderboards and challenges are coming soon."
- Mock UI: disabled table with placeholder rows, greyed-out rank badges
- All interactions disabled

### Files to create
- `src/data/questWorlds.ts` — world/lesson data
- `src/components/QuestExercise.tsx` — exercise loop component
- `src/components/QuestFeedback.tsx` — simplified feedback
- `src/pages/SpeechTherapyInfoPage.tsx` — informational page
- `src/pages/LeaderboardPage.tsx` — placeholder

### Files to modify
- `src/pages/SpeechQuestPage.tsx` — full redesign with world map + exercise integration
- `src/components/RewardsShop.tsx` — add microphone skins category
- `src/components/AppLayout.tsx` — update bottom nav tabs
- `src/App.tsx` — add new routes
- `src/pages/Index.tsx` — update Speech Therapy button target

### Existing code reused without modification
- `usePronunciationAPI` hook (all backend calls)
- `usePracticeSession` hook (accuracy calculation logic)
- `jyutpingParser` utilities
- Voice clone edge function
- ASR / ASRPhone edge functions

