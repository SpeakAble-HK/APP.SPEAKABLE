import type { DifficultyConfig, GameMetadata } from '../minigame-sdk/types';
import { GAME_REGISTRY } from '../minigame-sdk/game-registry';

export interface GameRecommendation {
  gameId: string;
  phonemeTarget: string;
  difficultyLevel: number;
  rationale: string;
}

export interface LearnerModel {
  learnerId: string;
  weakestPhonemes: string[];
  improvedPhonemes: string[];
  fatigueTrend: 'improving' | 'stable' | 'worsening';
  lastGamePlayed: string;
  totalSessions: number;
  therapistAssignments: string[];
}

export async function selectNextGame(
  learnerId: string,
  learnerModel: LearnerModel
): Promise<GameRecommendation> {
  // Rule 1: Therapist assignment
  if (learnerModel.therapistAssignments.length > 0) {
    const assignedGameId = learnerModel.therapistAssignments[0];
    return {
      gameId: assignedGameId,
      phonemeTarget: learnerModel.weakestPhonemes[0] || '/b/',
      difficultyLevel: 2,
      rationale: 'Therapist-assigned game',
    };
  }

  // Rule 2: Fatigue trend
  if (learnerModel.fatigueTrend === 'worsening') {
    const shortestGame = GAME_REGISTRY.reduce((prev, curr) =>
      prev.estimatedSessionMinutes < curr.estimatedSessionMinutes ? prev : curr
    );
    return {
      gameId: shortestGame.gameId,
      phonemeTarget: learnerModel.weakestPhonemes[0] || '/b/',
      difficultyLevel: 1,
      rationale: 'Fatigue detected, selecting shortest game with easiest difficulty',
    };
  }

  // Rule 3: Improved phoneme - upgrade context
  if (learnerModel.improvedPhonemes.length > 0) {
    const improvedPhoneme = learnerModel.improvedPhonemes[0];
    return {
      gameId: learnerModel.lastGamePlayed || 'phoneme-pairs',
      phonemeTarget: improvedPhoneme,
      difficultyLevel: 3,
      rationale: `Phoneme ${improvedPhoneme} improved, upgrading context complexity`,
    };
  }

  // Rule 4: Weakest phoneme unchanged - switch mechanic
  if (learnerModel.weakestPhonemes.length > 0) {
    const weakestPhoneme = learnerModel.weakestPhonemes[0];
    const alternativeGame =
      learnerModel.lastGamePlayed === 'phoneme-pairs'
        ? 'tone-match'
        : 'phoneme-pairs';
    return {
      gameId: alternativeGame,
      phonemeTarget: weakestPhoneme,
      difficultyLevel: 2,
      rationale: `Weakest phoneme ${weakestPhoneme} unchanged, switching game mechanic`,
    };
  }

  // Default
  return {
    gameId: 'phoneme-pairs',
    phonemeTarget: '/b/',
    difficultyLevel: 1,
    rationale: 'Default recommendation',
  };
}

export async function selectDifficulty(
  learnerId: string,
  gameId: string,
  recentSessions: { successRate: number }[]
): Promise<DifficultyConfig> {
  const gameMetadata = GAME_REGISTRY.find((g) => g.gameId === gameId);
  if (!gameMetadata) {
    return GAME_REGISTRY[0].difficulties[0];
  }

  // Default to level 2
  let recommendedLevel = 2;

  if (recentSessions.length >= 2) {
    const avgSuccess =
      recentSessions.reduce((sum, s) => sum + s.successRate, 0) /
      recentSessions.length;

    if (avgSuccess > 0.8) {
      recommendedLevel = Math.min(5, 3); // Increment
    } else if (avgSuccess < 0.5) {
      recommendedLevel = Math.max(1, 1); // Decrement
    }
  }

  return (
    gameMetadata.difficulties[recommendedLevel - 1] ||
    gameMetadata.difficulties[0]
  );
}
