/**
 * SpeakAble Pilot — Synthetic Data Generator
 * 
 * Generates training data matching NEPA's exact API shapes + pilot consent model.
 * 
 * Usage:
 *   node scripts/generate-synthetic-data.js --type students --count 10
 *   node scripts/generate-synthetic-data.js --type confusion --count 5
 *   node scripts/generate-synthetic-data.js --type fatigue --count 1
 *   node scripts/generate-synthetic-data.js --type exercises --count 10
 *   node scripts/generate-synthetic-data.js --all --count 20
 * 
 * Environment:
 *   NEPA_LLM_API_URL  — API endpoint (default: https://openrouter.ai/api/v1/chat/completions)
 *   NEPA_LLM_API_KEY  — API key (required)
 *   NEPA_LLM_MODEL    — Model name (default: qwen/qwen-2.5-72b-instruct)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data', 'synthetic');
const PROMPTS_DIR = join(__dirname, 'prompts');
const LEXICON_PATH = join(ROOT, 'data', 'canto_lexicon.seed.json');

const API_URL = process.env.NEPA_LLM_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.NEPA_LLM_API_KEY || process.env.OPENROUTER_API_KEY;
const MODEL = process.env.NEPA_LLM_MODEL || 'qwen/qwen-2.5-72b-instruct';

// Load Cantonese lexicon
let LEXICON = { words: [] };
try {
  LEXICON = JSON.parse(readFileSync(LEXICON_PATH, 'utf-8'));
  console.log(`Loaded ${LEXICON.words.length} words from canto_lexicon.seed.json`);
} catch (e) {
  console.warn('Warning: Could not load lexicon, using empty word list');
}

const AGE_GROUPS = ['4-6', '7-9', '10-12'];
const DIAGNOSES = ['typical', 'speech_delay', 'phonological_disorder', 'articulation_disorder', 'cas'];
const LANGUAGES = ['cantonese', 'putonghua', 'bilingual'];

// Parse CLI args
const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function loadPrompt(templateName, vars = {}) {
  const path = join(PROMPTS_DIR, `${templateName}.txt`);
  let content = readFileSync(path, 'utf-8');
  for (const [key, value] of Object.entries(vars)) {
    content = content.replaceAll(`{{${key}}}`, String(value));
  }
  return content;
}

async function callLLM(prompt, maxTokens = 4000) {
  if (!API_KEY) {
    console.error('ERROR: API key not set');
    console.error('Set one of:');
    console.error('  $env:NEPA_LLM_API_KEY="your-key"');
    console.error('  $env:OPENROUTER_API_KEY="your-key"');
    console.error('');
    console.error('Optional:');
    console.error('  $env:NEPA_LLM_API_URL="https://your-api.com/v1/chat/completions"');
    console.error('  $env:NEPA_LLM_MODEL="your-model-name"');
    process.exit(1);
  }

  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  // OpenRouter-specific headers
  if (API_URL.includes('openrouter')) {
    headers['HTTP-Referer'] = 'https://speakable.hk';
    headers['X-Title'] = 'SpeakAble HK NEPA Training Data';
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a Cantonese speech-language pathologist. Always respond with valid JSON only, no markdown, no explanation.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Parse JSON from response
  try {
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    return JSON.parse(cleaned.trim());
  } catch (e) {
    console.error('Failed to parse JSON from response:');
    console.error(content.slice(0, 500));
    throw new Error('Invalid JSON response from LLM');
  }
}

function generateStudentParams() {
  return {
    AGE_GROUP: pick(AGE_GROUPS),
    DIAGNOSIS: pick(DIAGNOSES),
    NATIVE_LANGUAGE: pick(LANGUAGES),
    TOTAL_SESSIONS: Math.floor(Math.random() * 20) + 5,
    TRAINING_CONSENT: Math.random() > 0.3 ? 'true' : 'false', // 70% consent
  };
}

function generateConfusionParams() {
  return {
    AGE_GROUP: pick(AGE_GROUPS),
    DIAGNOSIS: pick(DIAGNOSES),
    SAMPLE_SIZE: Math.floor(Math.random() * 30) + 10,
  };
}

function generateExerciseParams() {
  const weakPhonemes = [pick(['/b/', '/p/', '/m/', '/d/', '/t/', '/n/']), pick(['tone_1', 'tone_2', 'tone_3', 'tone_5'])];
  return {
    AGE_GROUP: pick(AGE_GROUPS),
    DIAGNOSIS: pick(DIAGNOSES),
    WEAK_PHONEMES: weakPhonemes.join(', '),
    SESSIONS_COMPLETED: Math.floor(Math.random() * 15) + 3,
    CURRENT_ACCURACY: (Math.random() * 0.4 + 0.4).toFixed(2),
  };
}

async function generateStudents(count) {
  console.log(`\n=== Generating ${count} SpeakAble pilot participants ===\n`);
  const participants = [];
  
  for (let i = 0; i < count; i++) {
    const params = generateStudentParams();
    const code = `p-${String(i + 1).padStart(4, '0')}`;
    console.log(`[${i + 1}/${count}] ${code}: age=${params.AGE_GROUP}, dx=${params.DIAGNOSIS}, training_consent=${params.TRAINING_CONSENT}`);
    
    const prompt = loadPrompt('student-profile', { ...params, 'XXXX': String(i + 1).padStart(4, '0') });
    try {
      const profile = await callLLM(prompt, 6000);
      participants.push(profile);
      
      const wmPhonemes = Object.keys(profile.world_model?.phoneme_profile || {}).length;
      const sessions = profile.sessions?.length || 0;
      console.log(`  ✓ ${wmPhonemes} phonemes, ${sessions} sessions`);
    } catch (e) {
      console.error(`  ✗ Failed: ${e.message}`);
    }
    
    await new Promise(r => setTimeout(r, 1500)); // Rate limiting
  }
  
  return participants;
}

async function generateConfusionMatrices(count) {
  console.log(`\n=== Generating ${count} confusion matrices ===\n`);
  const matrices = [];
  
  for (let i = 0; i < count; i++) {
    const params = generateConfusionParams();
    console.log(`[${i + 1}/${count}] age=${params.AGE_GROUP}, dx=${params.DIAGNOSIS}`);
    
    const prompt = loadPrompt('confusion-matrix', params);
    try {
      const result = await callLLM(prompt);
      const entries = Array.isArray(result) ? result : result.entries || [];
      matrices.push({ ...params, entries });
      console.log(`  ✓ ${entries.length} confusion entries`);
    } catch (e) {
      console.error(`  ✗ Failed: ${e.message}`);
    }
    
    await new Promise(r => setTimeout(r, 1500));
  }
  
  return matrices;
}

async function generateFatiguePatterns() {
  console.log(`\n=== Generating fatigue patterns (all age × diagnosis) ===\n`);
  
  const prompt = loadPrompt('fatigue-patterns', {
    AGE_GROUP: 'all (4-6, 7-9, 10-12)',
    DIAGNOSIS: 'all (typical, speech_delay, phonological_disorder, articulation_disorder, cas)',
  });
  
  try {
    const result = await callLLM(prompt, 6000);
    const patterns = Array.isArray(result) ? result : result.patterns || [];
    console.log(`✓ ${patterns.length} fatigue patterns`);
    return patterns;
  } catch (e) {
    console.error(`✗ Failed: ${e.message}`);
    return [];
  }
}

async function generateExerciseRecommendations(count) {
  console.log(`\n=== Generating ${count} exercise recommendation sets ===\n`);
  const allRecs = [];
  
  for (let i = 0; i < count; i++) {
    const params = generateExerciseParams();
    console.log(`[${i + 1}/${count}] weak=${params.WEAK_PHONEMES}, acc=${params.CURRENT_ACCURACY}`);
    
    const prompt = loadPrompt('exercise-recommendations', params);
    try {
      const result = await callLLM(prompt);
      const recs = Array.isArray(result) ? result : result.recommendations || [];
      allRecs.push(...recs);
      console.log(`  ✓ ${recs.length} recommendations`);
    } catch (e) {
      console.error(`  ✗ Failed: ${e.message}`);
    }
    
    await new Promise(r => setTimeout(r, 1500));
  }
  
  return allRecs;
}

function saveDataset(name, data) {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  
  const date = new Date().toISOString().split('T')[0];
  const filename = `${name}-${date}.json`;
  const filepath = join(DATA_DIR, filename);
  
  const output = {
    metadata: {
      generated_at: new Date().toISOString(),
      generator: 'speakable-nepa-synthetic',
      model: MODEL,
      api_url: API_URL,
      count: Array.isArray(data) ? data.length : 1,
      pilot_id: 'speakable-hk-pilot-2026',
    },
    [name]: data,
  };
  
  writeFileSync(filepath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Saved to ${filepath}`);
  return filepath;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   SpeakAble Pilot — NEPA Synthetic Data Generator       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI: ${API_URL}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Lexicon: ${LEXICON.words.length} words`);
  
  const type = getArg('type');
  const count = parseInt(getArg('count') || '5', 10);
  const all = hasFlag('all');
  
  if (!type && !all) {
    console.log('\nUsage:');
    console.log('  node scripts/generate-synthetic-data.js --type students --count 10');
    console.log('  node scripts/generate-synthetic-data.js --type confusion --count 5');
    console.log('  node scripts/generate-synthetic-data.js --type fatigue --count 1');
    console.log('  node scripts/generate-synthetic-data.js --type exercises --count 10');
    console.log('  node scripts/generate-synthetic-data.js --all --count 20');
    console.log('\nEnvironment:');
    console.log('  NEPA_LLM_API_KEY  — API key (or OPENROUTER_API_KEY)');
    console.log('  NEPA_LLM_API_URL  — API endpoint (default: OpenRouter)');
    console.log('  NEPA_LLM_MODEL    — Model name');
    process.exit(0);
  }
  
  const startTime = Date.now();
  
  if (all || type === 'students') {
    const participants = await generateStudents(all ? count : count);
    saveDataset('participants', participants);
  }
  
  if (all || type === 'confusion') {
    const matrices = await generateConfusionMatrices(all ? Math.ceil(count / 2) : count);
    saveDataset('confusion_matrices', matrices);
  }
  
  if (all || type === 'fatigue') {
    const patterns = await generateFatiguePatterns();
    saveDataset('fatigue_patterns', patterns);
  }
  
  if (all || type === 'exercises') {
    const recs = await generateExerciseRecommendations(all ? count : count);
    saveDataset('exercise_recommendations', recs);
  }
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n════════════════════════════════════════════════════════════`);
  console.log(`✓ Complete in ${elapsed}s`);
  console.log(`════════════════════════════════════════════════════════════\n`);
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
