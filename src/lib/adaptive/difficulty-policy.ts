import type { DifficultyConfig, GameMetadata } from '../minigame-sdk/types';

export interface PolicyDecision {
  action:
    | 'upgrade_context'
    | 'switch_mechanic'
    | 'reduce_difficulty'
    | 'reduce_length'
    | 'recommend_transfer'
    | 'maintain';
  rationale: string;
  newConfig?: Partial<DifficultyConfig>;
  recommendedGameId?: string;
}

export interface SessionHistory {
  gameId: string;
  successRate: number;
  contextComplexity: string;
  fatigueFlag: boolean;
  completedAt: string;
}

export async function evaluatePolicy(
  learnerId: string,
  gameId: string,
  sessionHistory: SessionHistory[]
): Promise<PolicyDecision> {
  const last5Sessions = sessionHistory.slice(-5);

  // Rule 1: FAST_MASTERY
  const recentSuccessRates = last5Sessions.map((s) => s.successRate);
  const avgRecentSuccess =
    recentSuccessRates.reduce((sum, r) => sum + r, 0) /
    recentSuccessRates.length;

  if (
    avgRecentSuccess > 0.85 &&
    last5Sessions.length >= 3 &&
    last5Sessions[last5Sessions.length - 1].contextComplexity !== 'sentence'
  ) {
    return {
      action: 'upgrade_context',
      rationale:
        'High success rate sustained for 3+ sessions, ready for increased context complexity',
      newConfig: {
        contextComplexity: upgradeContext(
          last5Sessions[last5Sessions.length - 1].contextComplexity
        ),
      },
    };
  }

  // Rule 2: PLATEAU
  if (
    avgRecentSuccess >= 0.6 &&
    avgRecentSuccess <= 0.75 &&
    last5Sessions.length >= 5
  ) {
    return {
      action: 'switch_mechanic',
      rationale:
        'Success rate plateaued at 60-75% for 5 sessions, switching game mechanic',
      recommendedGameId: getAlternativeGame(gameId),
    };
  }

  // Rule 3: REGRESSION
  const peakSuccess = Math.max(...recentSuccessRates);
  const currentSuccess = last5Sessions[last5Sessions.length - 1].successRate;

  if (peakSuccess - currentSuccess > 0.2) {
    return {
      action: 'reduce_difficulty',
      rationale: 'Success rate dropped >20% from peak, reducing difficulty',
      newConfig: {
        level: Math.max(1, (last5Sessions[last5Sessions.length - 1] as any).level - 1),
      },
    };
  }

  // Rule 4: FRUSTRATION
  const fatigueCount = last5Sessions.filter((s) => s.fatigueFlag).length;
  if (fatigueCount >= 2) {
    return {
      action: 'reduce_length',
      rationale: 'Fatigue detected in 2+ of last 3 sessions, reducing session length',
      newConfig: {
        fatigueThresholdAttempts: 8,
      },
    };
  }

  // Rule 5: TRANSFER_READY
  if (
    avgRecentSuccess > 0.8 &&
    last5Sessions[last5Sessions.length - 1].contextComplexity === 'word'
  ) {
    return {
      action: 'recommend_transfer',
      rationale: 'High success at word level, ready for conversational transfer',
      recommendedGameId: 'pipi-dialogue',
    };
  }

  // Default: maintain
  return {
    action: 'maintain',
    rationale: 'Performance stable, maintaining current configuration',
  };
}

function upgradeContext(current: string): string {
  const progression = ['isolated', 'syllable', 'word', 'phrase', 'sentence'];
  const currentIndex = progression.indexOf(current);
  return progression[Math.min(currentIndex + 1, progression.length - 1)];
}

function getAlternativeGame(currentGameId: string): string {
  const alternatives: Record<string, string> = {
    'phoneme-pairs': 'tone-match',
    'tone-match': 'syllable-timer',
    'syllable-timer': 'story-collect',
    'story-collect': 'pipi-dialogue',
    'pipi-dialogue': 'phoneme-pairs',
  };
  return alternatives[currentGameId] || 'phoneme-pairs';
}
