import type { SceneMetadata, StoryState } from '../../lib/story-engine/types';

export interface ScenePlayerProps {
  scene: SceneMetadata;
  storyState: StoryState;
  onComplete: (result: any) => void;
  onSkip: () => void;
}

export function ScenePlayer({
  scene,
  storyState,
  onComplete,
  onSkip,
}: ScenePlayerProps) {
  return (
    <div className="scene-player">
      <div className="character-panel">
        <div className="speech-bubble">{scene.characterLine}</div>
      </div>

      <div className="learner-task-panel">
        {scene.learnerTask === 'listen' && (
          <button>Play Audio</button>
        )}
        {scene.learnerTask === 'repeat' && (
          <button>Record</button>
        )}
        {scene.learnerTask === 'fill-gap' && (
          <input type="text" placeholder="Fill in the gap" />
        )}
        {scene.learnerTask === 'choose' && (
          <div className="choices">
            <button>Option 1</button>
            <button>Option 2</button>
          </div>
        )}
      </div>

      <div className="controls">
        <button onClick={onSkip}>Skip</button>
      </div>
    </div>
  );
}
