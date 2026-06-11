// Mini-Game SDK Types

export type PhonemePosition = 'initial' | 'medial' | 'final';

export interface PhonemeTarget {
  symbol: string;
  ipa: string;
  position: PhonemePosition;
}

export interface GameEvent {
  gameId: string;
  sessionId: string;
  learnerId: string;
  phonemeTarget: PhonemeTarget;
  attemptNumber: number;
  responseLatencyMs: number;
  isSuccess: boolean;
  confidenceScore: number;
  timestamp: number;
}

export interface FatigueMarker {
  sessionDurationMs: number;
  errorRate5min: number;
  pauseCount: number;
  isFatigued: boolean;
}

export interface SessionResult {
  sessionId: string;
  learnerId: string;
  gameId: string;
  totalAttempts: number;
  successRate: number;
  avgLatencyMs: number;
  fatigueMarker: FatigueMarker;
  rewardPayout: number;
  carryoverRecommendation: string;
  completedAt: string;
}

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export type ContextComplexity = 'isolated' | 'syllable' | 'word' | 'phrase' | 'sentence';

export interface DifficultyConfig {
  level: DifficultyLevel;
  targetPhonemeCount: number;
  stimulusExposureMs: number;
  distractorCount: number;
  timePressure: boolean;
  contextComplexity: ContextComplexity;
  fatigueThresholdAttempts: number;
  rewardMultiplier: number;
}

export type MechanicType = 'reaction' | 'sequencing' | 'navigation' | 'conversation' | 'collection';

export type TherapeuticObjective = 'discrimination' | 'repetition' | 'persistence' | 'transfer';

export interface GameMetadata {
  gameId: string;
  name: string;
  mechanicType: MechanicType;
  therapeuticObjective: TherapeuticObjective;
  difficulties: DifficultyConfig[];
  minAgeYears: number;
  estimatedSessionMinutes: number;
}

export interface GameSession {
  sessionId: string;
  learnerId: string;
  gameId: string;
  startedAt: number;
  events: GameEvent[];
}

export interface SceneResult {
  sceneId: string;
  learnerId: string;
  attempts: number;
  confidenceScore: number;
  branchTaken: 'success' | 'failure' | 'partial';
  timeOnSceneMs: number;
}

export interface StorySceneEvent {
  type: 'story';
  sceneId: string;
  storyId: string;
  chapterId: string;
  learnerId: string;
  sessionId: string;
  phonemeTarget: PhonemeTarget;
  attemptNumber: number;
  responseLatencyMs: number;
  isSuccess: boolean;
  confidenceScore: number;
  branchTaken: 'success' | 'failure' | 'partial';
  timestamp: number;
}

export type UnifiedEvent = GameEvent | StorySceneEvent;
