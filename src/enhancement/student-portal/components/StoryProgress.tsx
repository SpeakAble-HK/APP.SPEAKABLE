import type { StoryState } from "@/lib/story-engine/types";

interface StoryProgressProps {
  storyState: StoryState;
  totalScenes: number;
  onContinue: () => void;
}

export function StoryProgress({
  storyState,
  totalScenes,
  onContinue,
}: StoryProgressProps) {
  const progress = totalScenes
    ? (storyState.completedScenes.length / totalScenes) * 100
    : 0;

  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-high/40 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Story Progress</h3>
        <span className="text-sm capitalize text-on-surface-variant">
          {storyState.emotionalState}
        </span>
      </div>

      <div className="h-2 rounded-full bg-surface-container">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-on-surface-variant">
        <span>
          {storyState.completedScenes.length} / {totalScenes} scenes
        </span>
        <span>{Math.round(progress)}%</span>
      </div>

      <button
        onClick={onContinue}
        className="w-full rounded-full bg-primary text-on-primary py-3 font-semibold active:scale-95 transition-transform"
      >
        Continue Story
      </button>
    </div>
  );
}
