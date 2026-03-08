import { useState, useRef, useCallback } from "react";
import { Mic, Square, Play, Loader2, ArrowRight, Volume2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePronunciationAPI, PhonemeResult } from "@/hooks/usePronunciationAPI";
import { useAuth } from "@/hooks/useAuth";
import { useGuestTrial } from "@/hooks/useGuestTrial";
import { QuestFeedback } from "./QuestFeedback";
import { QuestLesson } from "@/data/questWorlds";
import { PracticeWord } from "@/data/practiceTopics";
import mascot from "@/assets/mascot.png";

type ExerciseStep = "listen" | "record" | "analyzing" | "result";

interface ExerciseResult {
  spoken: PhonemeResult[];
  intended: PhonemeResult[];
  generatedAudioUrl: string | null;
  recordingUrl: string | null;
  accuracy: number;
}

interface QuestExerciseProps {
  lesson: QuestLesson;
  onComplete: (xpEarned: number, avgAccuracy: number) => void;
  onExit: () => void;
}

export function QuestExercise({ lesson, onComplete, onExit }: QuestExerciseProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isAuthenticated = !!user && !user.is_anonymous;
  const { ensureGuestSession } = useGuestTrial(isAuthenticated);
  const { processRecording, isProcessing } = usePronunciationAPI();

  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const [wordIndex, setWordIndex] = useState(0);
  const [step, setStep] = useState<ExerciseStep>("listen");
  const [attempts, setAttempts] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [currentResult, setCurrentResult] = useState<ExerciseResult | null>(null);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);

  const word: PracticeWord = lesson.words[wordIndex];
  const totalWords = lesson.words.length;
  const progressPct = (wordIndex / totalWords) * 100;

  const mascotText = (() => {
    switch (step) {
      case "listen": return isEn ? "Listen carefully." : isTW ? "仔細聽。" : "仔细听。";
      case "record": return isEn ? "Now try saying it." : isTW ? "現在試試說。" : "现在试试说。";
      case "analyzing": return isEn ? "Let me check..." : isTW ? "讓我看看..." : "让我看看...";
      case "result":
        if (currentResult && currentResult.accuracy >= 70) return isEn ? "Well done!" : isTW ? "做得好！" : "做得好！";
        return isEn ? "Good effort. Try again." : isTW ? "不錯的嘗試。再試一次。" : "不错的尝试。再试一次。";
    }
  })();

  const playReference = useCallback(() => {
    // Use browser speech synthesis as a quick reference audio
    const utterance = new SpeechSynthesisUtterance(word.character);
    utterance.lang = "zh-HK";
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }, [word.character]);

  const handleStartRecording = async () => {
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
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        handleAnalyze(blob, url);
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      // mic error handled silently
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = async (blob: Blob, recUrl: string) => {
    setStep("analyzing");
    if (!isAuthenticated) await ensureGuestSession();

    const result = await processRecording(blob, word.character);

    if (result && "spoken" in result) {
      const spokenWithConf = result.intended.filter((p: PhonemeResult) => p.phoneme !== null);
      const matchCount = spokenWithConf.filter((p: PhonemeResult) => !p.isLowConfidence).length;
      const accuracy = spokenWithConf.length > 0 ? Math.round((matchCount / spokenWithConf.length) * 100) : 0;

      let generatedAudioUrl: string | null = null;
      if (result.clone?.audio_base64) {
        const ct = result.clone.content_type || "audio/wav";
        generatedAudioUrl = `data:${ct};base64,${result.clone.audio_base64}`;
      }

      const exerciseResult: ExerciseResult = {
        spoken: result.spoken,
        intended: result.intended,
        generatedAudioUrl,
        recordingUrl: recUrl,
        accuracy,
      };

      setCurrentResult(exerciseResult);
      setAttempts((prev) => prev + 1);
      setStep("result");
    } else {
      // API failed — let user retry
      setStep("record");
    }
  };

  const handleTryAgain = () => {
    setCurrentResult(null);
    setRecordingUrl(null);
    setStep("listen");
  };

  const handleContinue = () => {
    if (currentResult) {
      setResults((prev) => [...prev, currentResult]);
    }

    if (wordIndex + 1 < totalWords) {
      setWordIndex((prev) => prev + 1);
      setStep("listen");
      setAttempts(0);
      setCurrentResult(null);
      setRecordingUrl(null);
    } else {
      // Lesson complete
      const allResults = currentResult ? [...results, currentResult] : results;
      const avgAccuracy = allResults.length > 0
        ? Math.round(allResults.reduce((s, r) => s + r.accuracy, 0) / allResults.length)
        : 0;
      onComplete(lesson.xp, avgAccuracy);
    }
  };

  // ─── RESULT SCREEN ───
  if (step === "result" && currentResult) {
    return (
      <QuestFeedback
        word={word}
        accuracy={currentResult.accuracy}
        spokenPhonemes={currentResult.spoken}
        intendedPhonemes={currentResult.intended}
        recordingUrl={currentResult.recordingUrl}
        generatedAudioUrl={currentResult.generatedAudioUrl}
        attempts={attempts}
        onTryAgain={attempts < 3 ? handleTryAgain : undefined}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div className="min-h-full bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-card border-b-2 border-border px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onExit} className="shrink-0 font-bold">
            ✕
          </Button>
          <Progress value={progressPct} className="h-3 flex-1" />
          <span className="text-xs font-extrabold text-muted-foreground">
            {wordIndex + 1}/{totalWords}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full">
        {/* Mascot */}
        <img src={mascot} alt="" className="h-20 w-20 mb-4 mascot-bounce" />
        <p className="text-sm font-bold text-muted-foreground mb-6 text-center">{mascotText}</p>

        {/* Word display */}
        <div className="text-center mb-8">
          <p className="text-5xl font-extrabold text-foreground mb-2">{word.character}</p>
          <p className="text-lg text-primary font-bold">{word.jyutping}</p>
          <p className="text-sm text-muted-foreground mt-1">{word.meaning}</p>
        </div>

        {/* Step-specific UI */}
        {step === "listen" && (
          <div className="flex flex-col items-center gap-4 w-full">
            <Button
              onClick={playReference}
              size="lg"
              className="gap-2 h-14 px-8 rounded-2xl game-btn text-base font-extrabold"
              style={{ boxShadow: "0 4px 0 hsl(var(--primary-dark))" }}
            >
              <Volume2 className="h-5 w-5" />
              {isEn ? "Listen" : "聆聽"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep("record")}
              className="gap-2 h-12 rounded-2xl font-bold"
            >
              <ArrowRight className="h-4 w-4" />
              {isEn ? "Ready to speak" : isTW ? "準備說" : "准备说"}
            </Button>
          </div>
        )}

        {step === "record" && (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-ring ${
                isRecording
                  ? "bg-destructive animate-pulse shadow-lg"
                  : "bg-primary hover:bg-primary/90 shadow-md game-btn"
              }`}
              style={!isRecording ? { boxShadow: "0 5px 0 hsl(var(--primary-dark))" } : {}}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? (
                <Square className="h-8 w-8 text-primary-foreground" />
              ) : (
                <Mic className="h-9 w-9 text-primary-foreground" />
              )}
            </button>
            <p className="text-sm text-muted-foreground font-bold">
              {isRecording
                ? `🔴 ${isEn ? "Recording..." : "錄音中..."}`
                : isEn ? "Tap to speak" : isTW ? "點擊開始說" : "点击开始说"}
            </p>
            {attempts > 0 && (
              <p className="text-xs text-muted-foreground">
                {isEn ? `Attempt ${attempts + 1}/3` : `第 ${attempts + 1}/3 次`}
              </p>
            )}
          </div>
        )}

        {step === "analyzing" && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm font-bold text-muted-foreground">
              {isEn ? "Analysing..." : "分析中..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
