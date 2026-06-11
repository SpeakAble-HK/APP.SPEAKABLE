import type { GameEvent, PhonemeTarget, FatigueMarker } from './types';

export type GameAction =
  | { type: 'ATTEMPT'; event: GameEvent }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'END' };

export interface GameState {
  events: GameEvent[];
  sessionStart: number;
  pauseCount: number;
  isPaused: boolean;
  fatigueMarker: FatigueMarker;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ATTEMPT': {
      const events = [...state.events, action.event];
      const sessionDurationMs = Date.now() - state.sessionStart;
      const recentEvents = events.filter(
        (e) => Date.now() - e.timestamp < 5 * 60 * 1000
      );
      const errorRate5min =
        recentEvents.length > 0
          ? recentEvents.filter((e) => !e.isSuccess).length / recentEvents.length
          : 0;

      return {
        ...state,
        events,
        fatigueMarker: {
          sessionDurationMs,
          errorRate5min,
          pauseCount: state.pauseCount,
          isFatigued: errorRate5min > 0.6 || state.pauseCount > 3,
        },
      };
    }
    case 'PAUSE':
      return {
        ...state,
        isPaused: true,
        pauseCount: state.pauseCount + 1,
      };
    case 'RESUME':
      return {
        ...state,
        isPaused: false,
      };
    case 'END':
      return state;
    default:
      return state;
  }
}

export function createInitialGameState(
  sessionStart: number = Date.now()
): GameState {
  return {
    events: [],
    sessionStart,
    pauseCount: 0,
    isPaused: false,
    fatigueMarker: {
      sessionDurationMs: 0,
      errorRate5min: 0,
      pauseCount: 0,
      isFatigued: false,
    },
  };
}
