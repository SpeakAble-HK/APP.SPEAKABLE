import type { GameMetadata } from '../minigame-sdk/types';
import { GAME_REGISTRY } from '../minigame-sdk/game-registry';

export interface GameTemplate {
  gameId: string;
  name: string;
  mechanicType: string;
  therapeuticObjective: string;
  description: string;
}

export function getGameTemplates(): GameTemplate[] {
  return GAME_REGISTRY.map((game) => ({
    gameId: game.gameId,
    name: game.name,
    mechanicType: game.mechanicType,
    therapeuticObjective: game.therapeuticObjective,
    description: `${game.mechanicType} game targeting ${game.therapeuticObjective}`,
  }));
}

export interface AssignmentConfig {
  therapistId: string;
  learnerIds: string[];
  gameId: string;
  phonemeTargets: string[];
  difficultyLevel: number;
  customPrompt?: string;
  passThreshold: number;
  scheduledFor: string;
}

export async function createAssignment(config: AssignmentConfig): Promise<void> {
  // Mock API call
  console.log('Creating assignment:', config);

  // In production, this would POST to /api/therapist/assignments
  const response = await fetch('/api/therapist/assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(`Failed to create assignment: ${response.status}`);
  }
}
