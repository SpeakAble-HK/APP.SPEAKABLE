

## 懶音檢測 (Lazy Sound Detection) — Public Page

### Overview
A standalone public page at `/lazy-sound` accessible from the Resources page (`/ngo`). Users record themselves reading common test phrases and get instant phoneme-level feedback — no login, no voice cloning.

### Workflow

```text
┌─────────────────────────────────┐
│  1. 選擇測試類別               │
│     n/l 不分 │ ng/∅ 脫落 │     │
│     gw/g 混淆 │ 自由輸入       │
└──────────────┬──────────────────┘
               ▼
┌─────────────────────────────────┐
│  2. 顯示測試詞組               │
│     e.g. "你 / 李"  "我 / 哦"  │
│     Optional: 用戶自行輸入文字  │
└──────────────┬──────────────────┘
               ▼
┌─────────────────────────────────┐
│  3. 錄音                        │
│     大按鈕錄音 → 預覽播放       │
└──────────────┬──────────────────┘
               ▼
┌─────────────────────────────────┐
│  4. 分析 (reuse existing APIs)  │
│     jyutping(text) → target     │
│     asr(audio) → transcription  │
│     asrphone(audio, text) →     │
│       per-char confidence       │
└──────────────┬──────────────────┘
               ▼
┌─────────────────────────────────┐
│  5. 結果顯示                    │
│     每字: 聲母/韻母/聲調 表格   │
│     懶音標記 (紅色高亮)         │
│     簡單建議                    │
└─────────────────────────────────┘
```

### Lazy Sound Categories (Pre-built test sets)

| 類別 | 混淆對 | 測試詞 |
|------|--------|--------|
| n/l 不分 | /n/ vs /l/ | 你/李、男/藍、年/連 |
| ng 脫落 | /ng/ vs /∅/ | 我/哦、牙/啊、岸/按 |
| gw/g 混淆 | /gw/ vs /g/ | 國/各、廣/港、光/剛 |
| 自由輸入 | — | User types any text |

### Files to Create/Edit

1. **Create `src/pages/LazySoundPage.tsx`**
   - Category selector (tabs or cards)
   - Test phrase display with play button (browser TTS)
   - Optional text input for custom phrases
   - Record button (reuse MediaRecorder pattern from EchoSpeech)
   - Calls `usePronunciationAPI.processRecording()` but skips voice-clone step
   - Results table: per-character 聲母/韻母/聲調 with color-coded accuracy
   - Lazy-sound specific diagnosis: highlights which pairs are confused

2. **Create `src/hooks/useLazySoundAPI.ts`**
   - Simplified version of `usePronunciationAPI` — only steps 1-3 (jyutping → asr → asrphone), no voice-clone
   - Returns per-character breakdown with confidence scores
   - Adds lazy-sound diagnosis logic: compares predicted vs expected initials/finals

3. **Create `src/data/lazySoundTests.ts`**
   - Pre-defined test categories and word lists

4. **Edit `src/App.tsx`**
   - Add route `/lazy-sound` as standalone page (no AppLayout)

5. **Edit `src/pages/ResourcesPage.tsx`**
   - Add a prominent「懶音檢測」card linking to `/lazy-sound`

### Technical Notes
- Reuses existing edge functions (`jyutping`, `asr`, `asrphone`) — no API changes
- Anonymous auth (already implemented in `usePronunciationAPI`) handles JWT requirement
- No voice cloning involved — skip step 4 of the existing pipeline
- All UI text in Traditional Chinese
- BrandHeader + 返回 button included

