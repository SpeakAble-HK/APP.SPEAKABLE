# AI Features Status

**Project**: SpeakAble HK (`attfmtheguhpaufhajhj`)
**Demo user**: `demo@speakable.hk` / `Demo2024!`

## ✅ Deployed & Working

| Feature | Status | Details |
|---------|--------|---------|
| **Jyutping** (Cantonese romanization) | ✅ Working | Text-only API proxy — tested and returns correct Jyutping |
| **Supabase Edge Functions** (all 4) | ✅ Deployed | `asr`, `asrphone`, `jyutping`, `voice-clone` all ACTIVE |
| **Database tables** (18 migrations) | ✅ Applied | All tables including `calibration_audit` (new migration) |
| **Demo user** | ✅ Created | Both `explorer` + `therapist` roles assigned |

## ❌ Not Working — External Backend Issue

| Feature | Status | Details |
|---------|--------|---------|
| **ASR** | ❌ Failing | External API `comp.naozumi.me/api/asr` returns 500 |
| **ASRPhone** | ❌ Failing | External API `comp.naozumi.me/api/asrphone` returns 400/parse error |
| **Voice Clone (TTS)** | ❌ Failing | External API `comp.naozumi.me/api/tts` returns 500 |

The Supabase edge functions are deployed and authenticating correctly (passes auth check), but the external AI backend at `http://comp.naozumi.me` is not processing audio correctly. The `Jyutping` endpoint works because it only handles text.

## Resolution

The AI backend service (`comp.naozumi.me`) needs to be checked/repaired for ASR and TTS endpoints.
