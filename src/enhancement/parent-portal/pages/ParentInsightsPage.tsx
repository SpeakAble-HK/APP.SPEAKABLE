import { useEffect, useState } from "react";
import PortalShell from "@/shared/components/PortalShell";
import { WeeklyProgressRing } from "../components/WeeklyProgressRing";
import { getParentInsights, type ParentInsights } from "@/lib/api/insights";

export default function ParentInsightsPage() {
  const [insights, setInsights] = useState<ParentInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getParentInsights()
      .then((data) => active && setInsights(data))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <PortalShell width="wide" hasBottomNav>
      <h1 className="text-3xl font-bold mb-6">Your Child's Progress</h1>

      {loading || !insights ? (
        <div className="h-40 rounded-2xl bg-surface-container/40 animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-outline-variant/30 p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Practice</h2>
            <div className="flex justify-center">
              <WeeklyProgressRing
                practiceMinutes={insights.weeklyPracticeMinutes}
                weeklyGoal={insights.weeklyGoal}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/30 p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Practice Streak</h2>
            <div className="text-5xl font-bold text-orange-500">
              {insights.streakDays}
            </div>
            <div className="text-on-surface-variant">days in a row</div>
          </div>

          <div className="rounded-2xl border border-outline-variant/30 p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Recent Games</h2>
            {insights.recentGameResults.length === 0 ? (
              <p className="text-on-surface-variant">No sessions yet.</p>
            ) : (
              <div className="space-y-2">
                {insights.recentGameResults.map((r, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="capitalize">{r.gameName}</span>
                    <div className="flex items-center gap-2">
                      <span>⭐ {r.stars}</span>
                      {r.fatigueFlag && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Rest Day
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PortalShell>
  );
}
