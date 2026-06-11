import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MiniGameBlueprint, DifficultyLevel, PatientContext } from "@/shared/lib/miniGameBuilder/types";

interface UseAIBlueprintReturn {
  generate: (description: string, difficulty: DifficultyLevel, patientContext?: PatientContext) => Promise<MiniGameBlueprint | null>;
  loading: boolean;
  error: string | null;
}

export function useAIBlueprint(): UseAIBlueprintReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (
    description: string,
    difficulty: DifficultyLevel,
    patientContext?: PatientContext,
  ): Promise<MiniGameBlueprint | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${projectUrl}/functions/v1/ai-blueprint`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          difficulty,
          patientContext: patientContext ? {
            name: patientContext.name,
            overallAccuracy: patientContext.overallAccuracy,
            phonemeProfiles: patientContext.phonemeProfiles,
            fatigueWarnings: patientContext.fatigueWarnings,
          } : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      if (!data.success || !data.blueprint) {
        throw new Error("Invalid response from AI");
      }

      return data.blueprint as MiniGameBlueprint;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate blueprint";
      setError(message);
      console.error("AI blueprint generation error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading, error };
}
