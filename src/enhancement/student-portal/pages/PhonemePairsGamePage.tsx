import { useNavigate } from "react-router-dom";
import PortalShell from "@/shared/components/PortalShell";
import { PhonemePairsGame } from "../components/PhonemePairsGame";
import { getGameMetadata } from "@/lib/minigame-sdk/game-registry";

export default function PhonemePairsGamePage() {
  const navigate = useNavigate();
  const sessionId = `session-${Date.now()}`;
  const difficulty = getGameMetadata("phoneme-pairs")?.difficulties[1];

  return (
    <PortalShell width="default" hasBottomNav>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Phoneme Pairs</h1>
        <button
          onClick={() => navigate("/games")}
          className="text-sm text-on-surface-variant hover:text-primary"
        >
          ← Games
        </button>
      </div>
      <PhonemePairsGame
        config={{
          level: difficulty?.level ?? 2,
          targetPhonemeCount: difficulty?.targetPhonemeCount ?? 2,
          distractorCount: difficulty?.distractorCount ?? 2,
          contextComplexity: difficulty?.contextComplexity ?? "syllable",
        }}
        session={{ sessionId, learnerId: "", gameId: "phoneme-pairs" }}
        onComplete={() => undefined}
      />
    </PortalShell>
  );
}
