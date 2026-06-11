import type { ChapterConfig } from "@/lib/story-engine/narrative-grammar";

interface CampaignMapProps {
  chapters: ChapterConfig[];
  completedChapters: string[];
  onChapterSelect: (chapterId: string) => void;
}

export function CampaignMap({
  chapters,
  completedChapters,
  onChapterSelect,
}: CampaignMapProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {chapters.map((chapter, index) => {
        const isCompleted = completedChapters.includes(chapter.chapterId);
        const prev = chapters[index - 1]?.chapterId;
        const isUnlocked =
          index === 0 || (prev ? completedChapters.includes(prev) : false);

        return (
          <button
            key={chapter.chapterId}
            onClick={() => isUnlocked && onChapterSelect(chapter.chapterId)}
            disabled={!isUnlocked}
            className={`text-left rounded-2xl border p-5 transition-all ${
              isCompleted
                ? "border-primary/40 bg-primary/10"
                : isUnlocked
                  ? "border-outline-variant/30 bg-surface-container-high/40 hover:scale-[1.02] active:scale-95"
                  : "border-outline-variant/20 bg-surface-container/30 opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="text-xs uppercase tracking-wide text-on-surface-variant">
              {chapter.phase}
            </div>
            <div className="text-xl font-bold mt-1">{chapter.chapterId}</div>
            <div className="text-sm text-on-surface-variant mt-2">
              {chapter.targetPhonemeFamily.join("  ·  ")}
            </div>
            <div className="text-xs text-on-surface-variant mt-3">
              {isCompleted ? "✓ Completed" : isUnlocked ? `~${chapter.estimatedMinutes} min` : "Locked"}
            </div>
          </button>
        );
      })}
    </div>
  );
}
