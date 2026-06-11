import type { GameEvent, FatigueMarker } from '../minigame-sdk/types';

export interface SessionConfig {
  maxAttempts: number;
  maxDurationMs: number;
  breakAfterAttempts: number;
  difficulty: number;
}

export interface FatigueDecision {
  shouldBreak: boolean;
  shouldEnd: boolean;
  breakDurationMs?: number;
}

export interface BreakActivity {
  type: 'breathing' | 'encouragement' | 'rest';
  durationMs: number;
  message: string;
}

export class SessionController {
  private learnerId: string;
  private gameId: string;
  private sessionStart: number;
  private attemptCount: number;
  private breakCount: number;

  constructor(learnerId: string, gameId: string) {
    this.learnerId = learnerId;
    this.gameId = gameId;
    this.sessionStart = Date.now();
    this.attemptCount = 0;
    this.breakCount = 0;
  }

  async start(): Promise<SessionConfig> {
    // Default configuration
    const maxDurationMs = 8 * 60 * 1000; // 8 minutes
    const timeOfDay = new Date().getHours();

    // Morning sessions: shorter
    const adjustedDuration =
      timeOfDay < 12 ? Math.min(maxDurationMs, 6 * 60 * 1000) : maxDurationMs;

    return {
      maxAttempts: 15,
      maxDurationMs: adjustedDuration,
      breakAfterAttempts: 5,
      difficulty: 2,
    };
  }

  checkFatigue(events: GameEvent[]): FatigueDecision {
    this.attemptCount = events.length;

    // Sliding window: last 5 events
    const recentEvents = events.slice(-5);
    const errorRate =
      recentEvents.length > 0
        ? recentEvents.filter((e) => !e.isSuccess).length / recentEvents.length
        : 0;

    // Check latency increase
    const avgLatency =
      recentEvents.reduce((sum, e) => sum + e.responseLatencyMs, 0) /
      recentEvents.length;

    const shouldBreak = errorRate > 0.6 || this.breakCount >= 3;
    const shouldEnd = this.breakCount >= 3;

    return {
      shouldBreak,
      shouldEnd,
      breakDurationMs: shouldBreak ? 15000 : undefined,
    };
  }

  onBreak(): BreakActivity {
    this.breakCount++;

    const activities: BreakActivity[] = [
      {
        type: 'breathing',
        durationMs: 15000,
        message: 'Take a deep breath. You\'re doing great!',
      },
      {
        type: 'encouragement',
        durationMs: 10000,
        message: 'PiPi says: "Keep going! Practice makes perfect!"',
      },
      {
        type: 'rest',
        durationMs: 20000,
        message: 'Take a short rest. We\'ll continue soon.',
      },
    ];

    return activities[this.breakCount % activities.length];
  }

  getSessionDuration(): number {
    return Date.now() - this.sessionStart;
  }

  getAttemptCount(): number {
    return this.attemptCount;
  }
}
