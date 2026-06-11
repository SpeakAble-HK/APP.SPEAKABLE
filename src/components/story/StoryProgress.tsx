import type { StoryState, SceneMetadata } from '../../lib/story-engine/types';

export interface StoryProgressProps {
  storyState: StoryState;
  totalScenes: number;
  onContinue: () => void;
}

export function StoryProgress({
  storyState,
  totalScenes,
  onContinue,
}: StoryProgressProps) {
  const progress = (storyState.completedScenes.length / totalScenes) * 100;

  return (
    <div className="story-progress">
      <div className="progress-header">
        <h3>Story Progress</h3>
        <span className="emotional-state">{storyState.emotionalState}</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="progress-stats">
        <span>{storyState.completedScenes.length} / {totalScenes} scenes</span>
        <span>{Math.round(progress)}% complete</span>
      </div>

      <div className="phoneme-progress">
        <h4>Phoneme Progress</h4>
        {Object.entries(storyState.phonemeProgress).map(([phoneme, score]) => (
          <div key={phoneme} className="phoneme-stat">
            <span>{phoneme}</span>
            <span>{Math.round(score * 100)}%</span>
          </div>
        ))}
      </div>

      <button onClick={onContinue} className="continue-button">
        Continue Story
      </button>
    </div>
  );
}
