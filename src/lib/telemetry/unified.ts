import type { GameEvent, StorySceneEvent, UnifiedEvent } from '../minigame-sdk/types';

export type TelemetryContext = 'game' | 'story';

export function useTelemetry(
  context: TelemetryContext,
  contextId: string,
  learnerId: string
) {
  const queue: UnifiedEvent[] = [];
  let flushTimer: NodeJS.Timeout | null = null;

  const trackEvent = (event: UnifiedEvent) => {
    queue.push(event);

    // Debounced flush every 5 seconds
    if (!flushTimer) {
      flushTimer = setTimeout(() => {
        flush();
        flushTimer = null;
      }, 5000);
    }
  };

  const flush = async () => {
    if (queue.length === 0) return;

    const eventsToFlush = [...queue];
    queue.length = 0;

    try {
      await fetch('/api/telemetry/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventsToFlush),
      });
    } catch (error) {
      console.error('Failed to flush unified telemetry:', error);
      // Re-queue failed events
      queue.unshift(...eventsToFlush);
    }
  };

  return {
    trackEvent,
    flush,
  };
}
