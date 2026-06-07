// SpeakAble HK — k6 API Stress Test
// Install: https://k6.io/docs/getting-started/installation/
// Run:     k6 run stress-tests/api-stress.k6.js
//
// Options:
//   k6 run --vus 20 --duration 30s stress-tests/api-stress.k6.js
//   k6 run -e BASE_URL=https://nepa.speakable.hk/api --vus 50 --duration 60s stress-tests/api-stress.k6.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8100';

const PATIENTS = new SharedArray('patients', () => [
  'pat-demo-001', 'pat-demo-002', 'pat-demo-003',
  'pat-demo-004', 'pat-demo-005',
]);

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // ramp up
    { duration: '30s', target: 50 },   // sustain
    { duration: '10s', target: 100 },  // spike
    { duration: '10s', target: 0 },    // cooldown
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.05'],    // <5% failure rate
  },
};

export default function () {
  const patientId = PATIENTS[Math.floor(Math.random() * PATIENTS.length)];
  const r = Math.random();

  if (r < 0.25) {
    // Therapist dashboard
    const res = http.get(`${BASE_URL}/api/v1/dashboard/${patientId}`);
    check(res, { 'dashboard ok': (r) => r.status === 200 });
  } else if (r < 0.45) {
    // World model
    const res = http.get(`${BASE_URL}/api/v1/world-model/${patientId}`);
    check(res, { 'world model ok': (r) => r.status === 200 });
  } else if (r < 0.6) {
    // Exercise recommendations
    const res = http.post(`${BASE_URL}/api/v1/exercise/recommend?patient_id=${patientId}`);
    check(res, { 'recommend ok': (r) => r.status === 200 });
  } else if (r < 0.8) {
    // Phoneme analysis with audio
    const audioData = open('./sample-audio.webm', 'b') || new Uint8Array(4096);
    const formData = {
      audio: http.file(audioData, 'recording.webm', 'audio/webm'),
    };
    const res = http.post(`${BASE_URL}/api/v1/speech/phonemes`, formData);
    check(res, { 'phonemes ok': (r) => r.status === 200 });
  } else {
    // ASR
    const audioData = open('./sample-audio.webm', 'b') || new Uint8Array(4096);
    const formData = {
      audio: http.file(audioData, 'recording.webm', 'audio/webm'),
    };
    const res = http.post(`${BASE_URL}/api/v1/speech/asr`, formData);
    check(res, { 'asr ok': (r) => r.status === 200 });
  }

  sleep(0.5 + Math.random() * 2);
}
