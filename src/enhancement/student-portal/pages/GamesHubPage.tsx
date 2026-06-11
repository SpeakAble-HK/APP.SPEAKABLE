import { useNavigate } from "react-router-dom";
import PortalShell from "@/shared/components/PortalShell";
import { GAME_REGISTRY } from "@/lib/minigame-sdk/game-registry";

// Mini-games hub listing the GAME_REGISTRY. Playable games route to their
// screens; the rest are shown as upcoming.
const PLAYABLE = new Set(["phoneme-pairs", "tone-match"]);

const PATH: Record<string, string> = {
  "phoneme-pairs": "/games/phoneme-pairs",
  "tone-match": "/games/tone-match",
};

export default function GamesHubPage() {
  const navigate = useNavigate();

  return (
    <PortalShell width="wide" hasBottomNav>
      <h1 className="text-3xl font-bold mb-6">Mini Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAME_REGISTRY.map((game) => {
          const playable = PLAYABLE.has(game.gameId);
          return (
            <button
              key={game.gameId}
              disabled={!playable}
              onClick={() => playable && navigate(PATH[game.gameId])}
              className={`text-left p-6 rounded-2xl border border-outline-variant/30 transition-all ${
                playable
                  ? "bg-surface-container-high/40 hover:shadow-lg hover:scale-[1.02] active:scale-95"
                  : "bg-surface-container/30 opacity-60 cursor-not-allowed"
              }`}
            >
              <h2 className="text-xl font-semibold mb-1">{game.name}</h2>
              <p className="text-sm text-on-surface-variant capitalize">
                {game.mechanicType} · {game.therapeuticObjective}
              </p>
              <p className="text-xs text-on-surface-variant mt-3">
                {playable
                  ? `~${game.estimatedSessionMinutes} min · ages ${game.minAgeYears}+`
                  : "Coming soon"}
              </p>
            </button>
          );
        })}
      </div>
    </PortalShell>
  );
}
