import { useState, useEffect, useCallback } from "react";
import { loadJourneyEvidence } from "@/enhancement/aura-journey/lib/journeyEvidence";

/**
 * Loads a student's Aura Journey adaptation signals (adaptationKey -> 0..1) so the
 * Narrative Rubric can auto-suggest macro/microstructure scores from interactive-
 * story participation, in addition to mini-game phoneme evidence.
 *
 * Resilient: returns {} when offline / unauthenticated / table missing.
 */
export function useJourneyEvidence(studentId: string | undefined) {
  const [evidence, setEvidence] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!studentId) {
      setEvidence({});
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setEvidence(await loadJourneyEvidence(studentId));
    } catch {
      setEvidence({});
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { journeyEvidence: evidence, loading, refresh };
}
