import type { DifficultyLevel, ContextComplexity, DifficultyConfig } from './types';

export interface ChapterConfig {
  chapterId: string;
  phase: 'onboarding' | 'midgame' | 'advanced';
  expositionRatio: number;
  emotionalMotivationRatio: number;
  repetitionDensity: number;
  challengeProgressionCurve: 'linear' | 'stepped' | 'adaptive';
  targetPhonemeFamily: string[];
  estimatedMinutes: number;
}

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

export function validateChapterBalance(config: ChapterConfig): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (config.repetitionDensity > 4) {
    warnings.push('Repetition density exceeds 4/min (over-drilling)');
  }

  if (config.expositionRatio > 0.35) {
    warnings.push('Exposition ratio exceeds 0.35 (too much text, low engagement)');
  }

  if (
    config.challengeProgressionCurve === 'linear' &&
    config.phase === 'advanced'
  ) {
    errors.push('Linear progression not allowed in advanced phase');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

export const CHAPTER_CONFIGS: ChapterConfig[] = [
  {
    chapterId: 'ch1',
    phase: 'onboarding',
    expositionRatio: 0.25,
    emotionalMotivationRatio: 0.2,
    repetitionDensity: 2.5,
    challengeProgressionCurve: 'linear',
    targetPhonemeFamily: ['/b/', '/p/', '/m/'],
    estimatedMinutes: 8,
  },
  {
    chapterId: 'ch2',
    phase: 'midgame',
    expositionRatio: 0.2,
    emotionalMotivationRatio: 0.15,
    repetitionDensity: 3,
    challengeProgressionCurve: 'stepped',
    targetPhonemeFamily: ['/n/', '/l/'],
    estimatedMinutes: 10,
  },
  {
    chapterId: 'ch3',
    phase: 'midgame',
    expositionRatio: 0.18,
    emotionalMotivationRatio: 0.15,
    repetitionDensity: 3.2,
    challengeProgressionCurve: 'stepped',
    targetPhonemeFamily: ['/n/', '/l/'],
    estimatedMinutes: 10,
  },
  {
    chapterId: 'ch4',
    phase: 'midgame',
    expositionRatio: 0.15,
    emotionalMotivationRatio: 0.12,
    repetitionDensity: 3.5,
    challengeProgressionCurve: 'adaptive',
    targetPhonemeFamily: ['/g/', '/k/'],
    estimatedMinutes: 12,
  },
  {
    chapterId: 'ch5',
    phase: 'midgame',
    expositionRatio: 0.15,
    emotionalMotivationRatio: 0.12,
    repetitionDensity: 3.5,
    challengeProgressionCurve: 'adaptive',
    targetPhonemeFamily: ['/z/', '/c/', '/s/'],
    estimatedMinutes: 12,
  },
  {
    chapterId: 'ch6',
    phase: 'advanced',
    expositionRatio: 0.1,
    emotionalMotivationRatio: 0.1,
    repetitionDensity: 3,
    challengeProgressionCurve: 'adaptive',
    targetPhonemeFamily: ['/n/', '/l/', '/g/', '/k/'],
    estimatedMinutes: 15,
  },
];
