import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PronunciationResult {
  id: string;
  user_id: string;
  intended_text: string;
  spoken_phonemes: { character: string; phoneme: string | null }[];
  intended_phonemes: { character: string; phoneme: string | null }[];
  overall_accuracy: number;
  initial_accuracy: number;
  final_accuracy: number;
  tone_accuracy: number;
  created_at: string;
}

const SESSION_KEY = 'echo_speech_session_results';

function getSessionResults(): PronunciationResult[] {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
  } catch {
    return [];
  }
}

function setSessionResults(results: PronunciationResult[]) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(results));
}

export function usePronunciationResults() {
  const { user } = useAuth();
  const isAuthenticated = !!user && !user.is_anonymous;
  const [results, setResults] = useState<PronunciationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    if (!isAuthenticated) {
      setResults(getSessionResults());
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('pronunciation_results')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const typedResults: PronunciationResult[] = (data || []).map((item: any) => ({
        ...item,
        spoken_phonemes: item.spoken_phonemes as { character: string; phoneme: string | null }[],
        intended_phonemes: item.intended_phonemes as { character: string; phoneme: string | null }[],
      }));

      setResults(typedResults);
    } catch (err: any) {
      console.error("Error fetching pronunciation results:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveResult = async (
    intendedText: string,
    spokenPhonemes: { character: string; phoneme: string | null }[],
    intendedPhonemes: { character: string; phoneme: string | null }[],
    overallAccuracy: number,
    initialAccuracy: number,
    finalAccuracy: number,
    toneAccuracy: number
  ): Promise<string | null> => {
    if (!isAuthenticated) {
      const sessionResult: PronunciationResult = {
        id: crypto.randomUUID(),
        user_id: 'guest',
        intended_text: intendedText,
        spoken_phonemes: spokenPhonemes,
        intended_phonemes: intendedPhonemes,
        overall_accuracy: overallAccuracy,
        initial_accuracy: initialAccuracy,
        final_accuracy: finalAccuracy,
        tone_accuracy: toneAccuracy,
        created_at: new Date().toISOString(),
      };
      const existing = getSessionResults();
      const updated = [sessionResult, ...existing];
      setSessionResults(updated);
      setResults(updated);
      return sessionResult.id;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('pronunciation_results')
        .insert({
          user_id: user!.id,
          intended_text: intendedText,
          spoken_phonemes: spokenPhonemes,
          intended_phonemes: intendedPhonemes,
          overall_accuracy: overallAccuracy,
          initial_accuracy: initialAccuracy,
          final_accuracy: finalAccuracy,
          tone_accuracy: toneAccuracy,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      await fetchResults();
      return data?.id || null;
    } catch (err: any) {
      console.error("Error saving pronunciation result:", err);
      setError(err.message);
      return null;
    }
  };

  const deleteResult = async (resultId: string) => {
    if (!isAuthenticated) {
      const updated = getSessionResults().filter(r => r.id !== resultId);
      setSessionResults(updated);
      setResults(updated);
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('pronunciation_results')
        .delete()
        .eq('id', resultId)
        .eq('user_id', user!.id);

      if (deleteError) throw deleteError;

      setResults(prev => prev.filter(r => r.id !== resultId));
    } catch (err: any) {
      console.error("Error deleting pronunciation result:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [user]);

  return {
    results,
    isLoading,
    error,
    saveResult,
    deleteResult,
    refetch: fetchResults,
  };
}
