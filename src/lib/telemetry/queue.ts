import type { GameEvent, StorySceneEvent, UnifiedEvent } from '../minigame-sdk/types';

export interface TelemetryQueue {
  events: UnifiedEvent[];
  lastFlush: number;
}

export function createTelemetryQueue(): TelemetryQueue {
  return {
    events: [],
    lastFlush: Date.now(),
  };
}

export function addToQueue(queue: TelemetryQueue, event: UnifiedEvent): void {
  queue.events.push(event);
}

export function shouldFlush(queue: TelemetryQueue, intervalMs: number = 5000): boolean {
  return Date.now() - queue.lastFlush >= intervalMs;
}

export function flushQueue(queue: TelemetryQueue): UnifiedEvent[] {
  const eventsToFlush = [...queue.events];
  queue.events = [];
  queue.lastFlush = Date.now();
  return eventsToFlush;
}

export async function postTelemetry(events: UnifiedEvent[]): Promise<void> {
  try {
    const response = await fetch('/api/telemetry/unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(events),
    });

    if (!response.ok) {
      throw new Error(`Telemetry POST failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to post telemetry:', error);
    // Re-queue would happen at a higher level
  }
}
