import { useNavigate } from "react-router-dom";
import PortalShell from "@/shared/components/PortalShell";
import { CampaignMap } from "../components/CampaignMap";
import { CHAPTER_CONFIGS } from "@/lib/story-engine/narrative-grammar";

export default function StoriesHubPage() {
  const navigate = useNavigate();
  // TODO: hydrate from learner_story_state once authored scenes exist in DB.
  const completedChapters: string[] = [];

  return (
    <PortalShell width="wide" hasBottomNav>
      <h1 className="text-3xl font-bold mb-2">Interactive Stories</h1>
      <p className="text-on-surface-variant mb-6">Aura Journey — guided phoneme adventures.</p>
      <CampaignMap
        chapters={CHAPTER_CONFIGS}
        completedChapters={completedChapters}
        onChapterSelect={(chapterId) =>
          navigate(`/stories/aura-journey/${chapterId}`)
        }
      />
    </PortalShell>
  );
}
