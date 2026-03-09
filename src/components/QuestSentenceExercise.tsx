import { useState, useRef, useCallback } from "react";
import { Mic, Square, Loader2, Volume2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePronunciationAPI, PhonemeResult } from "@/hooks/usePronunciationAPI";
import { QuestLessonData } from "@/data/questLessons";
import { QuestSentenceFeedback } from "./QuestSentenceFeedback";
import mascot from "@/assets/mascot.png";

type Step = "listen" | "record" | "analyzing" | "result";

interface ExerciseResult {
  spoken: PhonemeResult[];
  intended: PhonemeResult[];
  generatedAudioUrl: string | null;
  recordingUrl: string | null;
  accuracy: number;
}

interface Props {
  lesson: QuestLessonData;
  onComplete: (xpEarned: number, accuracy: number) => void;
  onExit: () => void;
}

export function QuestSentenceExercise({ lesson, onComplete, onExit }: Props) {
  const { language } = useLanguage();
  const { processRecording, isProcessing } = usePronunciationAPI();

  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const [step, setStep] = useState<Step>("listen");
  const [attempts, setAttempts] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [currentResult, setCurrentResult] = useState<ExerciseResult | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const mascotText = (() => {
    switch (step) {
      case "listen": return isEn ? "Listen carefully, then speak." : isTW ? "仔細聽，然後說。" : "仔细听，然后说。";
      case "record": return isEn ? "Say the sentence now!" : isTW ? "現在說這句話！" : "现在说这句话！";
      case "analyzing": return isEn ? "Checking your pronunciation..." : isTW ? "正在檢查你的發音..." : "正在检查你的发音...";
      case "result":
        if (currentResult && currentResult.accuracy >= 70) return isEn ? "Great job! 🎉" : "做得好！🎉";
        return isEn ? "Keep trying! You'll get it." : isTW ? "繼續努力！" : "继续努力！";
    }
  })();

  const playReference = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(lesson.sentence);
    utterance.lang = "zh-HK";
    utterance.rate = 0.75;
    speechSynthesis.speak(utterance);
  }, [lesson.sentence]);

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
        stream.getTracks().forEach(t => t.stop());
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        handleAnalyze(blob, url);
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      // mic error
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

    const result = await processRecording(blob, lesson.sentence);

    if (result && "spoken" in result) {
      const spokenWithConf = result.intended.filter((p: PhonemeResult) => p.phoneme !== null);
      const matchCount = spokenWithConf.filter((p: PhonemeResult) => !p.isLowConfidence).length;
      const accuracy = spokenWithConf.length > 0 ? Math.round((matchCount / spokenWithConf.length) * 100) : 0;

      let generatedAudioUrl: string | null = null;
      if (result.clone?.audio_base64) {
        const ct = result.clone.content_type || "audio/wav";
        generatedAudioUrl = `data:${ct};base64,${result.clone.audio_base64}`;
      }

      setCurrentResult({
        spoken: result.spoken,
        intended: result.intended,
        generatedAudioUrl,
        recordingUrl: recUrl,
        accuracy,
      });
      setAttempts(prev => prev + 1);
      setStep("result");
    } else {
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
      onComplete(lesson.xp_reward, currentResult.accuracy);
    }
  };

  // ─── RESULT SCREEN ───
  if (step === "result" && currentResult) {
    return (
      <QuestSentenceFeedback
        lesson={lesson}
        accuracy={currentResult.accuracy}
        spokenPhonemes={currentResult.spoken}
        intendedPhonemes={currentResult.intended}
        recordingUrl={currentResult.recordingUrl}
        generatedAudioUrl={currentResult.generatedAudioUrl}
        attempts={attempts}
        onTryAgain={currentResult.accuracy < 70 && attempts < 3 ? handleTryAgain : undefined}
        onContinue={handleContinue}
        passed={currentResult.accuracy >= 70}
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
          <div className="flex-1 text-center">
            <span className="text-sm font-extrabold text-muted-foreground">
              {isEn ? `Lesson ${lesson.lesson_id}` : `第 ${lesson.lesson_id} 課`}
            </span>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full">
        {/* Mascot */}
        <img src={mascot} alt="" className="h-20 w-20 mb-4 mascot-bounce" />
        <p className="text-sm font-bold text-muted-foreground mb-6 text-center">{mascotText}</p>

        {/* Sentence display */}
        <div className="text-center mb-8">
          <p className="text-4xl font-extrabold text-foreground mb-3 leading-snug">{lesson.sentence}</p>
          <p className="text-base text-muted-foreground">{lesson.english_translation}</p>
        </div>

        {/* Step UI */}
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
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-ring ${
                isRecording
                  ? "bg-destructive animate-pulse shadow-lg"
                  : "bg-primary hover:bg-primary/90 shadow-md game-btn"
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
              {isEn ? "Analysing your pronunciation..." : "分析你的發音..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
