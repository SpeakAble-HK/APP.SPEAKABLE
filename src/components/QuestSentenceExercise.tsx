import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Loader2, Volume2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePronunciationAPI, PhonemeResult } from "@/hooks/usePronunciationAPI";
import type { QuestLessonData } from "@/data/questLessons";
import { resolveSpeechLesson } from "@/data/loadSpeechLesson";
import { useSpeechExerciseMachine } from "@/hooks/useSpeechExerciseMachine";
import { adaptPronunciationFeedback, type NormalizedPronunciationFeedback } from "@/lib/pronunciationFeedbackAdapter";
import {
  SPEECH_PASS_ACCURACY_THRESHOLD,
  canContinueToNext,
  nextBestScore,
  shouldOfferRetry,
} from "@/lib/speechExerciseRules";
import { logPronunciationAttempt } from "@/lib/learningAttemptLog";
import { SpeechExerciseShell } from "@/components/speechExercise/SpeechExerciseShell";
import { QuestSentenceFeedback } from "./QuestSentenceFeedback";
import mascot from "@/assets/pipi-mascot.png";

interface ExerciseResult {
  spoken: PhonemeResult[];
  intended: PhonemeResult[];
  generatedAudioUrl: string | null;
  recordingUrl: string | null;
  normalized: NormalizedPronunciationFeedback;
}

interface Props {
  lesson: QuestLessonData;
  onComplete: (xpEarned: number, accuracy: number) => void;
  onExit: () => void;
}

export function QuestSentenceExercise({ lesson, onComplete, onExit }: Props) {
  const { language } = useLanguage();
  const { processRecording, isProcessing } = usePronunciationAPI();
  const lessonKey = String(lesson.lesson_id);
  const speechMeta = resolveSpeechLesson(lesson);

  const { step, setStep, captureGeneration, isCurrentGeneration, resetToReference } =
    useSpeechExerciseMachine(lessonKey);

  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const [attempts, setAttempts] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [currentResult, setCurrentResult] = useState<ExerciseResult | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setAttempts(0);
    setBestScore(0);
    setCurrentResult(null);
    setRecordingUrl(null);
  }, [lesson.lesson_id]);

  const playReference = useCallback(() => {
    const text = lesson.sentence;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-HK";
    utterance.rate = 0.75;
    speechSynthesis.speak(utterance);
  }, [lesson.sentence]);

  const handleStartRecording = async () => {
    if (isProcessing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        void handleAnalyze(blob, url);
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      /* mic denied */
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = async (blob: Blob, recUrl: string) => {
    const gen = captureGeneration();
    setStep("processing");

    const result = await processRecording(blob, lesson.sentence);

    if (!isCurrentGeneration(gen)) {
      URL.revokeObjectURL(recUrl);
      return;
    }

    if (result && "spoken" in result) {
      const normalized = adaptPronunciationFeedback(
        result.intended,
        result.spoken,
        SPEECH_PASS_ACCURACY_THRESHOLD
      );

      let generatedAudioUrl: string | null = null;
      if (result.clone?.audio_base64) {
        const ct = result.clone.content_type || "audio/wav";
        generatedAudioUrl = `data:${ct};base64,${result.clone.audio_base64}`;
      }

      setBestScore((prev) => nextBestScore(prev, normalized.accuracy));
      setCurrentResult({
        spoken: result.spoken,
        intended: result.intended,
        generatedAudioUrl,
        recordingUrl: recUrl,
        normalized,
      });
      setAttempts((prev) => prev + 1);
      setStep("feedback");
    } else {
      URL.revokeObjectURL(recUrl);
      setRecordingUrl(null);
      setStep("recording");
    }
  };

  const handleTryAgain = () => {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setCurrentResult(null);
    setRecordingUrl(null);
    resetToReference();
  };

  const handleContinue = () => {
    if (currentResult) {
      logPronunciationAttempt({
        lessonId: String(lesson.lesson_id),
        intended: currentResult.intended,
        spoken: currentResult.spoken,
        accuracy: currentResult.normalized.accuracy,
      });
      onComplete(lesson.xp_reward, currentResult.normalized.accuracy);
    }
  };

  const passed = currentResult?.normalized.passed ?? false;
  const showRetry = Boolean(currentResult && shouldOfferRetry(passed, attempts));
  const showContinue = Boolean(currentResult && canContinueToNext(passed, attempts));

  const mascotText = (() => {
    switch (step) {
      case "reference":
        return isEn ? "Listen carefully, then speak." : isTW ? "仔細聽，然後說。" : "仔细听，然后说。";
      case "recording":
        return isEn ? "Say the sentence now!" : isTW ? "現在說這句話！" : "现在说这句话！";
      case "processing":
        return isEn ? "Analyzing pronunciation…" : isTW ? "分析發音中⋯" : "分析发音中…";
      case "feedback":
        if (currentResult && currentResult.normalized.passed) return isEn ? "Great job!" : "做得好！";
        return isEn ? "Keep trying!" : isTW ? "繼續努力！" : "继续努力！";
    }
  })();

  if (step === "feedback" && currentResult) {
    return (
      <QuestSentenceFeedback
        lesson={lesson}
        accuracy={currentResult.normalized.accuracy}
        normalized={currentResult.normalized}
        spokenPhonemes={currentResult.spoken}
        intendedPhonemes={currentResult.intended}
        recordingUrl={currentResult.recordingUrl}
        generatedAudioUrl={currentResult.generatedAudioUrl}
        attempts={attempts}
        bestScore={bestScore}
        onTryAgain={showRetry ? handleTryAgain : undefined}
        onContinue={showContinue ? handleContinue : undefined}
        passed={passed}
      />
    );
  }

  return (
    <SpeechExerciseShell
      header={
        <div className="sticky top-0 z-20 border-b-2 border-border bg-card px-4 py-3">
          <div className="mx-auto flex max-w-md items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onExit} className="min-h-11 shrink-0 font-bold">
              ✕
            </Button>
            <div className="flex-1 text-center">
              <span className="text-sm font-extrabold text-muted-foreground">
                {isEn ? `Lesson ${lesson.lesson_id}` : `第 ${lesson.lesson_id} 課`}
              </span>
            </div>
            <div className="w-10" />
          </div>
        </div>
      }
    >
      <img src={mascot} alt="" className="mascot-bounce mb-4 h-20 w-20" />
      <p className="mb-6 text-center text-sm font-bold text-muted-foreground">{mascotText}</p>

      <div className="mb-8 text-center" data-lesson-type={speechMeta.lesson_type}>
        <p className="text-4xl font-extrabold leading-snug text-foreground">{lesson.sentence}</p>
        <p className="mt-2 text-sm text-muted-foreground">{lesson.english_translation}</p>
      </div>

      {step === "reference" && (
        <div className="flex w-full flex-col items-center gap-4">
          <Button
            onClick={playReference}
            disabled={isProcessing}
            className="game-btn h-14 min-h-11 gap-2 rounded-2xl px-8 text-base font-extrabold"
            style={{ boxShadow: "0 4px 0 hsl(var(--primary-dark))" }}
          >
            <Volume2 className="h-5 w-5" />
            {isEn ? "Listen" : "聆聽"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("recording")}
            disabled={isProcessing}
            className="h-12 min-h-11 rounded-2xl font-bold"
          >
            <ArrowRight className="mr-1 h-4 w-4" />
            {isEn ? "Ready to speak" : isTW ? "準備說" : "准备说"}
          </Button>
        </div>
      )}

      {step === "recording" && (
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isProcessing}
            className={`flex h-28 min-h-[44px] w-28 min-w-[44px] items-center justify-center rounded-full transition-all focus-visible:ring-2 focus-visible:ring-ring ${
              isRecording ? "animate-pulse bg-destructive shadow-lg" : "game-btn bg-primary shadow-md hover:bg-primary/90"
            }`}
            style={!isRecording ? { boxShadow: "0 5px 0 hsl(var(--primary-dark))" } : {}}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <Square className="h-9 w-9 text-primary-foreground" />
            ) : (
              <Mic className="h-10 w-10 text-primary-foreground" />
            )}
          </button>
          <p className="text-sm font-bold text-muted-foreground">
            {isRecording
              ? `🔴 ${isEn ? "Recording..." : "錄音中..."}`
              : isEn
                ? "Tap to speak"
                : isTW
                  ? "點擊開始說"
                  : "点击开始说"}
          </p>
          {attempts > 0 && (
            <p className="text-xs text-muted-foreground">
              {isEn ? `Attempt ${attempts + 1}/3 · Best ${bestScore}%` : `第 ${attempts + 1}/3 次 · 最佳 ${bestScore}%`}
            </p>
          )}
        </div>
      )}

      {step === "processing" && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm font-bold text-muted-foreground">
            {isEn ? "Analyzing pronunciation…" : "分析發音中⋯"}
          </p>
        </div>
      )}
    </SpeechExerciseShell>
  );
}
