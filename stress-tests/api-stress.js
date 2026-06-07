/**
 * SpeakAble HK — API Stress Test Runner
 *
 * Usage:
 *   node stress-tests/api-stress.js --base-url http://localhost:8100 --users 20 --duration 30
 */

const BASE_URL = (() => {
  const idx = process.argv.indexOf('--base-url');
  return idx !== -1 ? process.argv[idx + 1] : 'http://localhost:8100';
})();

const CONCURRENT_USERS = (() => {
  const idx = process.argv.indexOf('--users');
  return idx !== -1 ? parseInt(process.argv[idx + 1], 10) : 10;
})();

const DURATION_SEC = (() => {
  const idx = process.argv.indexOf('--duration');
  return idx !== -1 ? parseInt(process.argv[idx + 1], 10) : 20;
})();

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

var __dirname = dirname(fileURLToPath(import.meta.url));
var REAL_AUDIO = readFileSync(resolve(__dirname, 'sample-audio.webm'));

const SAMPLE_PATIENTS = [
  'pat-demo-001', 'pat-demo-002', 'pat-demo-003',
  'pat-demo-004', 'pat-demo-005',
];

const stats = { total: 0, success: 0, failed: 0, byEndpoint: {} };

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function stall(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

async function timedFetch(label, url, init) {
  var start = performance.now();
  stats.total++;
  if (!stats.byEndpoint[label]) {
    stats.byEndpoint[label] = { ok: 0, fail: 0, ms: [] };
  }
  try {
    var res = await fetch(url, init);
    var elapsed = performance.now() - start;
    stats.byEndpoint[label].ms.push(elapsed);
    if (res.ok) {
      stats.success++;
      stats.byEndpoint[label].ok++;
    } else {
      stats.failed++;
      stats.byEndpoint[label].fail++;
    }
    return res;
  } catch (err) {
    var elapsed = performance.now() - start;
    stats.byEndpoint[label].ms.push(elapsed);
    stats.failed++;
    stats.byEndpoint[label].fail++;
    return null;
  }
}

async function runScenario(userId) {
  var startTime = Date.now();

  while (Date.now() - startTime < DURATION_SEC * 1000) {
    var patientId = pick(SAMPLE_PATIENTS);
    var dice = Math.random();

    if (dice < 0.25) {
      await timedFetch(
        'GET /api/v1/dashboard/:id',
        BASE_URL + '/api/v1/dashboard/' + patientId,
      );
    } else if (dice < 0.45) {
      await timedFetch(
        'GET /api/v1/world-model/:id',
        BASE_URL + '/api/v1/world-model/' + patientId,
      );
    } else if (dice < 0.6) {
      await timedFetch(
        'POST /api/v1/exercise/recommend',
        BASE_URL + '/api/v1/exercise/recommend?patient_id=' + patientId,
        { method: 'POST' },
      );
    } else if (dice < 0.8) {
      var form = new FormData();
      form.append('audio', new Blob([REAL_AUDIO], { type: 'audio/webm' }), 'recording-' + userId + '.webm');
      await timedFetch(
        'POST /api/v1/speech/phonemes',
        BASE_URL + '/api/v1/speech/phonemes',
        { method: 'POST', body: form },
      );
    } else {
      var form = new FormData();
      form.append('audio', new Blob([REAL_AUDIO], { type: 'audio/webm' }), 'asr-' + userId + '.webm');
      await timedFetch(
        'POST /api/v1/speech/asr',
        BASE_URL + '/api/v1/speech/asr',
        { method: 'POST', body: form },
      );
    }

    await stall(500 + Math.random() * 2500);
  }
}

var startTime = Date.now();

console.log('\n### SpeakAble HK Stress Test ###');
console.log('  Target:   ' + BASE_URL);
console.log('  Users:    ' + CONCURRENT_USERS);
console.log('  Duration: ' + DURATION_SEC + 's');
console.log('  Start:    ' + new Date().toISOString() + '\n');

var workers = [];
for (var i = 0; i < CONCURRENT_USERS; i++) {
  workers.push(runScenario(i + 1));
}

await Promise.all(workers);

var elapsed = (Date.now() - startTime) / 1000;

console.log('\n### Results (' + elapsed.toFixed(1) + 's) ###\n');
console.log('  Total requests: ' + stats.total);
console.log('  Succeeded:      ' + stats.success);
console.log('  Failed:         ' + stats.failed);
console.log('  Success rate:   ' + (stats.total ? ((stats.success / stats.total) * 100).toFixed(1) : '—') + '%\n');

var endpoints = Object.keys(stats.byEndpoint).sort();
for (var e = 0; e < endpoints.length; e++) {
  var ep = endpoints[e];
  var s = stats.byEndpoint[ep];
  var avg = s.ms.length ? (s.ms.reduce(function (a, b) { return a + b; }, 0) / s.ms.length).toFixed(0) : '—';
  var sorted = s.ms.slice().sort(function (a, b) { return a - b; });
  var p99 = sorted.length ? sorted[Math.floor(sorted.length * 0.99)] : '—';
  console.log('  ' + ep);
  console.log('    requests: ' + (s.ok + s.fail) + '  |  ok: ' + s.ok + '  |  fail: ' + s.fail);
  console.log('    avg: ' + avg + 'ms  |  p99: ' + p99 + 'ms\n');
}
