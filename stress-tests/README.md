# SpeakAble HK — Stress Testing Harness

## Quick start (Node.js — no install needed)

```bash
# Default: 10 users, 20s, localhost:8100
node stress-tests/api-stress.js

# Custom
node stress-tests/api-stress.js --base-url http://localhost:8100 --users 20 --duration 30

# Against production
node stress-tests/api-stress.js --base-url https://nepa.speakable.hk/api --users 50 --duration 60
```

## k6 (professional load testing)

Install: https://k6.io/docs/getting-started/installation/

```bash
# Quick smoke test (10 VUs, 20s)
k6 run --vus 10 --duration 20s stress-tests/api-stress.k6.js

# Ramped test with thresholds
k6 run stress-tests/api-stress.k6.js

# Custom base URL
k6 run -e BASE_URL=https://nepa.speakable.hk/api stress-tests/api-stress.k6.js
```

### k6 thresholds (in script)
| Metric | Threshold |
|--------|-----------|
| p95 latency | < 2000ms |
| Error rate | < 5% |

## Artillery (Node.js)

Install: `npm install -g artillery`

```bash
# Run default test
artillery run stress-tests/artillery.yml

# Custom target
export TARGET=http://localhost:8100
artillery run stress-tests/artillery.yml

# HTML report
artillery run --output report.json stress-tests/artillery.yml
artillery report report.json
```

---

## What's tested

| Endpoint | Method | Scenario |
|----------|--------|----------|
| `/api/v1/dashboard/{id}` | GET | Therapist overview |
| `/api/v1/world-model/{id}` | GET | NEPA neural network |
| `/api/v1/exercise/recommend` | POST | Exercise suggestions |
| `/api/v1/speech/phonemes` | POST | Student audio submission |
| `/api/v1/speech/asr` | POST | Cantonese ASR |

## Traffic mix

| Scenario | Weight | Think time |
|----------|--------|------------|
| Dashboard / world model reads | ~45% | 1–3s |
| Exercise recommendations | ~15% | 1–2s |
| Audio phoneme submission | ~20% | 2–5s |
| ASR audio submission | ~20% | 2–5s |

## Interpreting results

**Targets for happy production:**

- **p95 latency < 1000ms** for reads (dashboard, world model)
- **p95 latency < 3000ms** for audio endpoints
- **Error rate < 1%** at 50 concurrent users
- **Error rate < 5%** at 100 concurrent users (spike)

If p95 exceeds thresholds, check:
1. NEPA API server CPU / memory
2. Supabase query performance (add indexes)
3. Network latency between client and API
4. Audio file size (compress before upload)
