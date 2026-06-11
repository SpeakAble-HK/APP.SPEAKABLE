import type { DifficultyConfig, GameMetadata } from '../minigame-sdk/types';

const baseDifficulties: DifficultyConfig[] = [
  {
    level: 1,
    targetPhonemeCount: 1,
    stimulusExposureMs: 3000,
    distractorCount: 1,
    timePressure: false,
    contextComplexity: 'isolated',
    fatigueThresholdAttempts: 15,
    rewardMultiplier: 1,
  },
  {
    level: 2,
    targetPhonemeCount: 2,
    stimulusExposureMs: 2500,
    distractorCount: 2,
    timePressure: false,
    contextComplexity: 'syllable',
    fatigueThresholdAttempts: 12,
    rewardMultiplier: 1.5,
  },
  {
    level: 3,
    targetPhonemeCount: 3,
    stimulusExposureMs: 2000,
    distractorCount: 2,
    timePressure: true,
    contextComplexity: 'word',
    fatigueThresholdAttempts: 10,
    rewardMultiplier: 2,
  },
  {
    level: 4,
    targetPhonemeCount: 4,
    stimulusExposureMs: 1500,
    distractorCount: 3,
    timePressure: true,
    contextComplexity: 'phrase',
    fatigueThresholdAttempts: 8,
    rewardMultiplier: 2.5,
  },
  {
    level: 5,
    targetPhonemeCount: 5,
    stimulusExposureMs: 1200,
    distractorCount: 3,
    timePressure: true,
    contextComplexity: 'sentence',
    fatigueThresholdAttempts: 6,
    rewardMultiplier: 3,
  },
];

export const GAME_REGISTRY: GameMetadata[] = [
  {
    gameId: 'phoneme-pairs',
    name: 'Phoneme Pairs',
    mechanicType: 'reaction',
    therapeuticObjective: 'discrimination',
    difficulties: baseDifficulties,
    minAgeYears: 4,
    estimatedSessionMinutes: 8,
  },
  {
    gameId: 'tone-match',
    name: 'Tone Match',
    mechanicType: 'sequencing',
    therapeuticObjective: 'discrimination',
    difficulties: baseDifficulties,
    minAgeYears: 5,
    estimatedSessionMinutes: 10,
  },
  {
    gameId: 'syllable-timer',
    name: 'Syllable Timer',
    mechanicType: 'reaction',
    therapeuticObjective: 'repetition',
    difficulties: baseDifficulties,
    minAgeYears: 6,
    estimatedSessionMinutes: 12,
  },
  {
    gameId: 'story-collect',
    name: 'Story Collect',
    mechanicType: 'collection',
    therapeuticObjective: 'persistence',
    difficulties: baseDifficulties,
    minAgeYears: 5,
    estimatedSessionMinutes: 15,
  },
  {
    gameId: 'pipi-dialogue',
    name: 'PiPi Dialogue',
    mechanicType: 'conversation',
    therapeuticObjective: 'transfer',
    difficulties: baseDifficulties,
    minAgeYears: 6,
    estimatedSessionMinutes: 10,
  },
];

export function getGameMetadata(gameId: string): GameMetadata | undefined {
  return GAME_REGISTRY.find((g) => g.gameId === gameId);
}
