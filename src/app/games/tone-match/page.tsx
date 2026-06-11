import { ToneMatchGame } from '../../components/games/ToneMatchGame';
import { useGameTelemetry } from '../../lib/minigame-sdk/telemetry';

export default function ToneMatchGamePage() {
  const sessionId = `session-${Date.now()}`;
  const learnerId = 'current-learner';

  const { trackAttempt, finalizeSession, flush } = useGameTelemetry(
    'tone-match',
    sessionId,
    learnerId
  );

  const handleComplete = (result: any) => {
    const sessionResult = finalizeSession();
    console.log('Session complete:', sessionResult);
    flush();
  };

  return (
    <div className="tone-match-page p-8">
      <ToneMatchGame
        config={{
          level: 2,
          targetPhonemeCount: 2,
          stimulusExposureMs: 2500,
          distractorCount: 2,
          contextComplexity: 'syllable',
        }}
        session={{
          sessionId,
          learnerId,
          gameId: 'tone-match',
        }}
        onComplete={handleComplete}
      />
    </div>
  );
}
