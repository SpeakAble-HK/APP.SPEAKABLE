import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SPEECH_THERAPY_TASKS } from "@/data/speechTherapyTasks";
import type { GameId } from "./ForestGameTypes";

// Map each forest mini-game to the Cantonese phoneme contrast it targets, so the
// therapist analytics / narrative rubric receive phoneme-level evidence.
const GAME_PHONEMES: Record<GameId, string[]> = {
  "water-park": ["n", "l"],
  maze: ["ng", "n"],
  "fruit-ninja": ["gw", "kw"],
  "catch-fly": ["tone"],
};

export interface GamePhonemeReport {
  gameId: GameId;
  answerLog: { word: string; correct: boolean }[];
  score: number;
  total: number;
}

/**
 * Persists mini-game phoneme outcomes to `pronunciation_results` so therapists see
 * them in analytics and the rubric can auto-suggest intelligibility scores.
 * Fails silently (and logs) when offline / unauthenticated — the game still works.
 */
export function useGameResultReporter() {
  const report = useCallback(async (r: GamePhonemeReport) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId) return;

      const task = SPEECH_THERAPY_TASKS[r.gameId];
      const phonemes = GAME_PHONEMES[r.gameId] ?? [];
      const accuracy = r.total > 0 ? r.score / r.total : 0;
      const isTone = phonemes.includes("tone");

      const intended_phonemes = r.answerLog.map((a) => ({
        word: a.word,
        target: phonemes.join("/"),
      }));
      const spoken_phonemes = r.answerLog.map((a) => ({
        word: a.word,
        correct: a.correct,
      }));

      const { error } = await supabase.from("pronunciation_results").insert({
        user_id: userId,
        intended_text: task?.title ?? r.gameId,
        intended_phonemes: intended_phonemes as never,
        spoken_phonemes: spoken_phonemes as never,
        overall_accuracy: accuracy,
        initial_accuracy: accuracy,
        final_accuracy: accuracy,
        tone_accuracy: isTone ? accuracy : 0,
      });
      if (error) throw error;
    } catch (err) {
      // Non-fatal: gameplay must never break because reporting failed.
      console.warn("[mini-game] result report skipped:", err);
    }
  }, []);

  return { report };
}
