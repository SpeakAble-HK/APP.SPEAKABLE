/**
 * SpeakAble Pilot — Synthetic Data Validator
 * 
 * Validates generated data against NEPA API shapes + pilot consent model.
 * 
 * Usage:
 *   node scripts/validate-synthetic.js data/synthetic/participants-2026-06-05.json
 *   node scripts/validate-synthetic.js data/synthetic/  (validates all)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// SpeakAble phoneme inventory (NEPA format)
const INITIALS = ['/b/', '/p/', '/m/', '/f/', '/d/', '/t/', '/n/', '/l/', '/g/', '/k/', '/ng/', '/h/', '/gw/', '/kw/', '/w/', '/z/', '/c/', '/s/', '/j/'];
const VOWELS = ['/aa/', '/a/', '/e/', '/i/', '/o/', '/u/', '/oe/', '/eo/', '/yu/'];
const DIPTHONGS = ['/ai/', '/ei/', '/oi/', '/ui/', '/au/', '/eu/', '/iu/'];
const NASAL_CODAS = ['/m/', '/ng/'];
const STOP_CODAS = ['/p/', '/t/', '/k/'];
const TONES = ['tone_1', 'tone_2', 'tone_3', 'tone_4', 'tone_5', 'tone_6'];
const ALL_PHONEMES = [...INITIALS, ...VOWELS, ...DIPTHONGS, ...NASAL_CODAS, ...STOP_CODAS, ...TONES];

const VALID_AGE_GROUPS = ['4-6', '7-9', '10-12'];
const VALID_DIAGNOSES = ['typical', 'speech_delay', 'phonological_disorder', 'articulation_disorder', 'cas'];
const VALID_LANGUAGES = ['cantonese', 'putonghua', 'bilingual'];
const VALID_EXERCISE_TYPES = ['tone_drill', 'minimal_pair', 'syllable_repeat', 'word_practice', 'sentence_build'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_TRENDS = ['improving', 'stable', 'declining'];
const VALID_SEVERITIES = ['mild', 'moderate', 'severe'];
const VALID_PHONEME_TYPES = ['initial', 'final', 'tone', 'coda'];

const errors = [];
const warnings = [];

function validatePhoneme(phoneme, context) {
  if (!ALL_PHONEMES.includes(phoneme)) {
    errors.push(`${context}: Invalid phoneme "${phoneme}" (not in NEPA inventory)`);
  }
}

function validateRange(value, min, max, context) {
  if (typeof value !== 'number' || value < min || value > max) {
    errors.push(`${context}: Value ${value} out of range [${min}, ${max}]`);
  }
}

function validateParticipantCode(code, context) {
  if (!/^p-[0-9]{4}$/.test(code)) {
    errors.push(`${context}: Invalid participant code "${code}" (must be p-XXXX)`);
  }
}

function validateWordId(wordId, context) {
  if (!/^w[0-9]{4}$/.test(wordId)) {
    warnings.push(`${context}: Unusual word_id "${wordId}" (expected wXXXX format)`);
  }
}

function validateConsent(consent, index) {
  const ctx = `Consent[${index}]`;
  
  validateParticipantCode(consent.participant_code, ctx);
  if (typeof consent.pilot_consent !== 'boolean') errors.push(`${ctx}: pilot_consent must be boolean`);
  if (typeof consent.training_consent !== 'boolean') errors.push(`${ctx}: training_consent must be boolean`);
  if (!VALID_AGE_GROUPS.includes(consent.age_group)) errors.push(`${ctx}: Invalid age_group "${consent.age_group}"`);
  if (!VALID_DIAGNOSES.includes(consent.diagnosis)) errors.push(`${ctx}: Invalid diagnosis "${consent.diagnosis}"`);
  if (!VALID_LANGUAGES.includes(consent.native_language)) warnings.push(`${ctx}: Unusual native_language "${consent.native_language}"`);
}

function validateWorldModel(wm, index) {
  const ctx = `WorldModel[${index}]`;
  
  validateParticipantCode(wm.user_id, `${ctx}.user_id`);
  
  if (wm.phoneme_profile) {
    for (const [phoneme, profile] of Object.entries(wm.phoneme_profile)) {
      const pCtx = `${ctx}.phoneme_profile[${phoneme}]`;
      validatePhoneme(phoneme, pCtx);
      validateRange(profile.accuracy, 0, 1, `${pCtx}.accuracy`);
      if (!VALID_TRENDS.includes(profile.trend)) errors.push(`${pCtx}: Invalid trend "${profile.trend}"`);
      if (profile.confusion) {
        profile.confusion.forEach(c => validatePhoneme(c, `${pCtx}.confusion`));
      }
      if (profile.fatigue_delta !== undefined) {
        validateRange(profile.fatigue_delta, -1, 1, `${pCtx}.fatigue_delta`);
      }
    }
  }
  
  if (typeof wm.total_attempts !== 'number') errors.push(`${ctx}: total_attempts must be number`);
}

function validateDashboard(dash, index) {
  const ctx = `Dashboard[${index}]`;
  
  validateParticipantCode(dash.user_id, `${ctx}.user_id`);
  if (typeof dash.total_sessions !== 'number') errors.push(`${ctx}: total_sessions must be number`);
  validateRange(dash.overall_accuracy, 0, 1, `${ctx}.overall_accuracy`);
  
  if (dash.phoneme_breakdown) {
    for (const [phoneme, stats] of Object.entries(dash.phoneme_breakdown)) {
      const pCtx = `${ctx}.phoneme_breakdown[${phoneme}]`;
      validatePhoneme(phoneme, pCtx);
      validateRange(stats.accuracy, 0, 1, `${pCtx}.accuracy`);
      if (!VALID_TRENDS.includes(stats.trend)) errors.push(`${pCtx}: Invalid trend "${stats.trend}"`);
    }
  }
}

function validateSession(sess, index) {
  const ctx = `Session[${index}]`;
  
  validateParticipantCode(sess.participant_code, `${ctx}.participant_code`);
  validateRange(sess.duration_minutes, 1, 30, `${ctx}.duration_minutes`);
  validateRange(sess.overall_accuracy, 0, 1, `${ctx}.overall_accuracy`);
  
  if (sess.words_practised) {
    sess.words_practised.forEach(w => validateWordId(w, `${ctx}.words_practised`));
  }
  
  if (sess.word_attempts) {
    sess.word_attempts.forEach((att, i) => {
      const aCtx = `${ctx}.word_attempts[${i}]`;
      validateWordId(att.word_id, `${aCtx}.word_id`);
      validateRange(att.confidence, 0, 1, `${aCtx}.confidence`);
      validateRange(att.jy_conf, 0, 1, `${aCtx}.jy_conf`);
      validateRange(att.tone_conf, 0, 1, `${aCtx}.tone_conf`);
      
      if (att.events) {
        att.events.forEach((evt, j) => {
          const eCtx = `${aCtx}.events[${j}]`;
          validateRange(evt.confidence, 0, 1, `${eCtx}.confidence`);
          if (!VALID_PHONEME_TYPES.includes(evt.phoneme_type)) {
            errors.push(`${eCtx}: Invalid phoneme_type "${evt.phoneme_type}"`);
          }
          if (evt.start_ms < 0) errors.push(`${eCtx}: start_ms must be >= 0`);
          if (evt.end_ms < evt.start_ms) errors.push(`${eCtx}: end_ms < start_ms`);
        });
      }
    });
  }
}

function validateExerciseRec(rec, index) {
  const ctx = `ExerciseRec[${index}]`;
  
  if (!VALID_EXERCISE_TYPES.includes(rec.exercise_type)) {
    errors.push(`${ctx}: Invalid exercise_type "${rec.exercise_type}"`);
  }
  if (!VALID_DIFFICULTIES.includes(rec.difficulty)) {
    errors.push(`${ctx}: Invalid difficulty "${rec.difficulty}"`);
  }
  
  if (rec.target_phonemes) {
    rec.target_phonemes.forEach(p => validatePhoneme(p, `${ctx}.target_phonemes`));
  }
}

function validateConfusionEntry(entry, index) {
  const ctx = `Confusion[${index}]`;
  
  validatePhoneme(entry.intended, `${ctx}.intended`);
  validatePhoneme(entry.recognized, `${ctx}.recognized`);
  validateRange(entry.frequency, 0, 1, `${ctx}.frequency`);
  
  if (!['initial', 'final', 'tone', 'any'].includes(entry.context)) {
    errors.push(`${ctx}: Invalid context "${entry.context}"`);
  }
}

function validateFatiguePattern(pattern, index) {
  const ctx = `Fatigue[${index}]`;
  
  if (!VALID_AGE_GROUPS.includes(pattern.age_group)) {
    errors.push(`${ctx}: Invalid age_group "${pattern.age_group}"`);
  }
  validateRange(pattern.onset_minutes, 1, 30, `${ctx}.onset_minutes`);
  if (!VALID_SEVERITIES.includes(pattern.severity)) {
    errors.push(`${ctx}: Invalid severity "${pattern.severity}"`);
  }
  
  if (pattern.affected_phonemes) {
    pattern.affected_phonemes.forEach(p => validatePhoneme(p, `${ctx}.affected_phonemes`));
  }
}

function validateFile(filepath) {
  console.log(`\nValidating: ${filepath}`);
  
  let data;
  try {
    data = JSON.parse(readFileSync(filepath, 'utf-8'));
  } catch (e) {
    console.error(`  ✗ Failed to parse JSON: ${e.message}`);
    return { errors: 1, warnings: 0 };
  }
  
  errors.length = 0;
  warnings.length = 0;
  
  // Validate participants (full SpeakAble pilot records)
  if (data.participants) {
    console.log(`  Checking ${data.participants.length} participants...`);
    data.participants.forEach((p, i) => {
      if (p.consent) validateConsent(p.consent, i);
      if (p.world_model) validateWorldModel(p.world_model, i);
      if (p.dashboard) validateDashboard(p.dashboard, i);
      if (p.recommendations) {
        p.recommendations.forEach((r, j) => validateExerciseRec(r, j));
      }
      if (p.sessions) {
        p.sessions.forEach((s, j) => validateSession(s, j));
      }
    });
  }
  
  // Validate confusion matrices
  if (data.confusion_matrices) {
    console.log(`  Checking ${data.confusion_matrices.length} confusion matrices...`);
    data.confusion_matrices.forEach((m, i) => {
      if (m.entries) {
        m.entries.forEach((e, j) => validateConfusionEntry(e, j));
      }
    });
  }
  
  // Validate fatigue patterns
  if (data.fatigue_patterns) {
    console.log(`  Checking ${data.fatigue_patterns.length} fatigue patterns...`);
    data.fatigue_patterns.forEach((p, i) => validateFatiguePattern(p, i));
  }
  
  // Validate exercise recommendations
  if (data.exercise_recommendations) {
    console.log(`  Checking ${data.exercise_recommendations.length} exercise recommendations...`);
    data.exercise_recommendations.forEach((r, i) => validateExerciseRec(r, i));
  }
  
  if (errors.length > 0) {
    console.log(`\n  ✗ ${errors.length} errors:`);
    errors.slice(0, 10).forEach(e => console.log(`    - ${e}`));
    if (errors.length > 10) console.log(`    ... and ${errors.length - 10} more`);
  }
  
  if (warnings.length > 0) {
    console.log(`\n  ⚠ ${warnings.length} warnings:`);
    warnings.slice(0, 5).forEach(w => console.log(`    - ${w}`));
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('  ✓ All validations passed');
  }
  
  return { errors: errors.length, warnings: warnings.length };
}

function main() {
  const target = process.argv[2];
  
  if (!target) {
    console.log('Usage:');
    console.log('  node scripts/validate-synthetic.js data/synthetic/participants-2026-06-05.json');
    console.log('  node scripts/validate-synthetic.js data/synthetic/');
    process.exit(0);
  }
  
  const fullPath = join(ROOT, target);
  let totalErrors = 0;
  let totalWarnings = 0;
  
  if (statSync(fullPath).isDirectory()) {
    const files = readdirSync(fullPath).filter(f => extname(f) === '.json');
    console.log(`Found ${files.length} JSON files in ${target}`);
    
    for (const file of files) {
      const result = validateFile(join(fullPath, file));
      totalErrors += result.errors;
      totalWarnings += result.warnings;
    }
  } else {
    const result = validateFile(fullPath);
    totalErrors += result.errors;
    totalWarnings += result.warnings;
  }
  
  console.log(`\n════════════════════════════════════════════`);
  console.log(`Total: ${totalErrors} errors, ${totalWarnings} warnings`);
  console.log(`════════════════════════════════════════════\n`);
  
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
