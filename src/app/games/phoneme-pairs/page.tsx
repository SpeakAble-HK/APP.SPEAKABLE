import { PhonemePairsGame } from '../../components/games/PhonemePairsGame';
import { useGameTelemetry } from '../../lib/minigame-sdk/telemetry';

export default function PhonemePairsGamePage() {
  const sessionId = `session-${Date.now()}`;
  const learnerId = 'current-learner'; // Would come from auth context

  const { trackAttempt, finalizeSession, flush } = useGameTelemetry(
    'phoneme-pairs',
    sessionId,
    learnerId
  );

  const handleComplete = (result: any) => {
    const sessionResult = finalizeSession();
    console.log('Session complete:', sessionResult);
    flush();
  };

  return (
    <div className="phoneme-pairs-page p-8">
      <PhonemePairsGame
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
          gameId: 'phoneme-pairs',
        }}
        onComplete={handleComplete}
      />
    </div>
  );
}
