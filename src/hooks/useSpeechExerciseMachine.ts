import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechExerciseStep = "reference" | "recording" | "processing" | "feedback";

/**
 * Per-exercise UI state machine + generation guard so stale `processRecording` results
 * are ignored after lesson change / reset (design §1.10).
 */
export function useSpeechExerciseMachine(lessonKey: string) {
  const [step, setStep] = useState<SpeechExerciseStep>("reference");
  const generationRef = useRef(0);

  useEffect(() => {
    generationRef.current += 1;
    setStep("reference");
  }, [lessonKey]);

  const captureGeneration = useCallback(() => generationRef.current, []);

  const isCurrentGeneration = useCallback((gen: number) => gen === generationRef.current, []);

  const resetToReference = useCallback(() => {
    generationRef.current += 1;
    setStep("reference");
  }, []);

  return {
    step,
    setStep,
    generationRef,
    captureGeneration,
    isCurrentGeneration,
    resetToReference,
  };
}
