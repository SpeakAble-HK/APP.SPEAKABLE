import { ScenePlayer } from '../../components/story/ScenePlayer';
import type { SceneMetadata, StoryState } from '../../lib/story-engine/types';

export default function AuraJourneyChapterPage() {
  // Mock scene data - would come from API
  const mockScene: SceneMetadata = {
    sceneId: 'scene-1',
    storyId: 'aura-journey',
    chapterId: 'ch1',
    order: 1,
    narrativeState: 'opening',
    targetPhoneme: { symbol: '/b/', ipa: 'b', position: 'initial' },
    characterLine: '波波，你好！',
    learnerTask: 'repeat',
    successCondition: { minConfidence: 0.55, maxAttempts: 3 },
    branchingOutcome: {
      onSuccess: 'scene-2',
      onFailure: 'scene-support-1',
    },
    rewardOnComplete: 10,
  };

  const mockStoryState: StoryState = {
    storyId: 'aura-journey',
    learnerId: 'current-learner',
    currentSceneId: 'scene-1',
    completedScenes: [],
    phonemeProgress: {},
    emotionalState: 'engaged',
    lastUpdated: new Date().toISOString(),
  };

  const handleComplete = (result: any) => {
    console.log('Scene complete:', result);
    // Would call completeScene() from runtime
  };

  const handleSkip = () => {
    console.log('Scene skipped');
  };

  return (
    <div className="aura-journey-chapter p-8">
      <h1 className="text-3xl font-bold mb-6">Aura Journey - Chapter 1</h1>
      <ScenePlayer
        scene={mockScene}
        storyState={mockStoryState}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </div>
  );
}
