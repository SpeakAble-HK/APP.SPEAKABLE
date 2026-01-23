import { useState, useCallback } from 'react';
import { usePronunciationAPI, PhonemeResult } from './usePronunciationAPI';
import { PracticeTopic, PracticeWord } from '@/data/practiceTopics';
import { parsePhonemeResult, ParsedPhoneme } from '@/utils/jyutpingParser';

export interface QuestionResult {
  word: PracticeWord;
  spokenPhonemes: PhonemeResult[];
  intendedPhonemes: PhonemeResult[];
  overallAccuracy: number;
  vowelAccuracy: number;
  consonantAccuracy: number;
  toneAccuracy: number;
  generatedAudioUrl: string | null;
  recordingUrl: string | null;
}

export interface PracticeSessionState {
  currentQuestionIndex: number;
  totalQuestions: number;
  results: QuestionResult[];
  isComplete: boolean;
}

export function usePracticeSession(topic: PracticeTopic) {
  const { processRecording, isProcessing, error } = usePronunciationAPI();
  const [sessionState, setSessionState] = useState<PracticeSessionState>({
    currentQuestionIndex: 0,
    totalQuestions: Math.min(10, topic.words.length),
    results: [],
    isComplete: false,
  });
  const [currentResult, setCurrentResult] = useState<QuestionResult | null>(null);

  const getCurrentWord = useCallback((): PracticeWord => {
    return topic.words[sessionState.currentQuestionIndex];
  }, [topic.words, sessionState.currentQuestionIndex]);

  const calculateAccuracies = (
    spokenPhonemes: PhonemeResult[],
    intendedPhonemes: PhonemeResult[]
  ) => {
    const parsedIntended: ParsedPhoneme[] = intendedPhonemes
      .filter((p) => p.phoneme !== null)
      .map(parsePhonemeResult);

    const parsedSpoken: ParsedPhoneme[] = spokenPhonemes
      .filter((p) => p.phoneme !== null)
      .map(parsePhonemeResult);

    let vowelMatch = 0;
    let consonantMatch = 0;
    let toneMatch = 0;
    let fullMatch = 0;
    const total = parsedIntended.length;

    parsedIntended.forEach((intended, index) => {
      const spoken = parsedSpoken[index];
      if (!spoken) return;

      if (spoken.initial === intended.initial) vowelMatch++;
      if (spoken.final === intended.final) consonantMatch++;
      if (spoken.tone === intended.tone) toneMatch++;
      if (
        spoken.initial === intended.initial &&
        spoken.final === intended.final &&
        spoken.tone === intended.tone
      ) {
        fullMatch++;
      }
    });

    return {
      overall: total > 0 ? Math.round((fullMatch / total) * 100) : 0,
      vowel: total > 0 ? Math.round((vowelMatch / total) * 100) : 0,
      consonant: total > 0 ? Math.round((consonantMatch / total) * 100) : 0,
      tone: total > 0 ? Math.round((toneMatch / total) * 100) : 0,
    };
  };

  const analyzeRecording = async (
    audioBlob: Blob,
    recordingUrl: string
  ): Promise<QuestionResult | null> => {
    const word = getCurrentWord();
    const result = await processRecording(audioBlob, word.character);

    if (!result) return null;

    const accuracies = calculateAccuracies(result.spoken, result.intended);
    const contentType = result.clone.content_type || 'audio/wav';
    const generatedAudioUrl = `data:${contentType};base64,${result.clone.audio_base64}`;

    const questionResult: QuestionResult = {
      word,
      spokenPhonemes: result.spoken,
      intendedPhonemes: result.intended,
      overallAccuracy: accuracies.overall,
      vowelAccuracy: accuracies.vowel,
      consonantAccuracy: accuracies.consonant,
      toneAccuracy: accuracies.tone,
      generatedAudioUrl,
      recordingUrl,
    };

    setCurrentResult(questionResult);
    return questionResult;
  };

  const confirmAndNext = useCallback(() => {
    if (!currentResult) return;

    setSessionState((prev) => {
      const newResults = [...prev.results, currentResult];
      const nextIndex = prev.currentQuestionIndex + 1;
      const isComplete = nextIndex >= prev.totalQuestions;

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        results: newResults,
        isComplete,
      };
    });
    setCurrentResult(null);
  }, [currentResult]);

  const getSummaryStats = useCallback(() => {
    const { results } = sessionState;
    if (results.length === 0) {
      return { avgOverall: 0, avgVowel: 0, avgConsonant: 0, avgTone: 0 };
    }

    const avgOverall = Math.round(
      results.reduce((sum, r) => sum + r.overallAccuracy, 0) / results.length
    );
    const avgVowel = Math.round(
      results.reduce((sum, r) => sum + r.vowelAccuracy, 0) / results.length
    );
    const avgConsonant = Math.round(
      results.reduce((sum, r) => sum + r.consonantAccuracy, 0) / results.length
    );
    const avgTone = Math.round(
      results.reduce((sum, r) => sum + r.toneAccuracy, 0) / results.length
    );

    return { avgOverall, avgVowel, avgConsonant, avgTone };
  }, [sessionState]);

  const resetSession = useCallback(() => {
    setSessionState({
      currentQuestionIndex: 0,
      totalQuestions: Math.min(10, topic.words.length),
      results: [],
      isComplete: false,
    });
    setCurrentResult(null);
  }, [topic.words.length]);

  return {
    sessionState,
    currentResult,
    isProcessing,
    error,
    getCurrentWord,
    analyzeRecording,
    confirmAndNext,
    getSummaryStats,
    resetSession,
  };
}
