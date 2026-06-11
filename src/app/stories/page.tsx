import { CampaignMap } from '../../components/story/CampaignMap';
import { CHAPTER_CONFIGS } from '../../lib/story-engine/narrative-grammar';

export default function StoriesIndexPage() {
  const completedChapters: string[] = []; // Would come from learner state

  return (
    <div className="stories-index p-8">
      <h1 className="text-3xl font-bold mb-6">Interactive Stories</h1>
      <CampaignMap
        chapters={CHAPTER_CONFIGS}
        completedChapters={completedChapters}
        onChapterSelect={(chapterId) => {
          window.location.href = `/stories/aura-journey/${chapterId}`;
        }}
      />
    </div>
  );
}
