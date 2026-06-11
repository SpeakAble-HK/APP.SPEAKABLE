import { GAME_REGISTRY, getGameMetadata } from '../minigame-sdk/game-registry';
import { insertAssignment } from '../api/assignments';

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
  const game = getGameMetadata(config.gameId);
  const difficultyConfig =
    game?.difficulties.find((d) => d.level === config.difficultyLevel) ??
    { level: config.difficultyLevel };

  await insertAssignment({
    therapistId: config.therapistId,
    learnerIds: config.learnerIds,
    gameId: config.gameId,
    phonemeTargets: config.phonemeTargets,
    difficultyConfig,
    customPrompt: config.customPrompt,
    passThreshold: config.passThreshold,
    scheduledFor: config.scheduledFor,
  });
}
