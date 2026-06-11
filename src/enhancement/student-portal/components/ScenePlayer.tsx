import type { SceneMetadata } from "@/lib/story-engine/types";

interface ScenePlayerProps {
  scene: SceneMetadata;
  onComplete: (branch: "success" | "failure" | "partial") => void;
  onSkip: () => void;
}

export function ScenePlayer({ scene, onComplete, onSkip }: ScenePlayerProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-high/40 p-6">
        <div className="text-xs uppercase tracking-wide text-on-surface-variant mb-2">
          {scene.narrativeState} · {scene.targetPhoneme.symbol}
        </div>
        <p className="text-2xl font-medium">{scene.characterLine}</p>
      </div>

      <div className="space-y-3">
        {scene.learnerTask === "listen" && (
          <button className="w-full rounded-full bg-primary text-on-primary py-3 font-semibold">
            ▶ Play Audio
          </button>
        )}
        {scene.learnerTask === "repeat" && (
          <button className="w-full rounded-full bg-primary text-on-primary py-3 font-semibold">
            🎤 Record
          </button>
        )}
        {scene.learnerTask === "fill-gap" && (
          <input
            className="w-full rounded-2xl border border-outline-variant/40 bg-surface px-4 py-3"
            placeholder="Fill in the gap"
          />
        )}
        {scene.learnerTask === "choose" && (
          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-2xl border border-outline-variant/30 py-4">Option 1</button>
            <button className="rounded-2xl border border-outline-variant/30 py-4">Option 2</button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onComplete("success")}
          className="flex-1 rounded-full bg-primary text-on-primary py-3 font-semibold active:scale-95 transition-transform"
        >
          Done
        </button>
        <button
          onClick={onSkip}
          className="rounded-full border border-outline-variant/40 px-6 py-3 text-on-surface-variant"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
