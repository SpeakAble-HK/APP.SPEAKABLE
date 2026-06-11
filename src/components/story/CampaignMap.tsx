import type { ChapterConfig } from '../../lib/story-engine/narrative-grammar';

export interface CampaignMapProps {
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
    <div className="campaign-map">
      <h2>Aura Journey Campaign</h2>
      <div className="chapter-nodes">
        {chapters.map((chapter) => {
          const isCompleted = completedChapters.includes(chapter.chapterId);
          const isUnlocked =
            chapter.chapterId === 'ch1' ||
            completedChapters.includes(
              chapters[chapters.indexOf(chapter) - 1]?.chapterId
            );

          return (
            <button
              key={chapter.chapterId}
              className={`chapter-node ${
                isCompleted
                  ? 'completed'
                  : isUnlocked
                  ? 'unlocked'
                  : 'locked'
              }`}
              onClick={() => isUnlocked && onChapterSelect(chapter.chapterId)}
              disabled={!isUnlocked}
            >
              <div className="chapter-label">{chapter.chapterId}</div>
              <div className="phoneme-family">
                {chapter.targetPhonemeFamily.join(', ')}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
