import { useState, useRef } from "react";
import { Play, Square, RotateCcw, ArrowRight, ChevronDown, ChevronUp, Volume2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { PhonemeResult } from "@/hooks/usePronunciationAPI";
import { QuestLessonData } from "@/data/questLessons";
import mascot from "@/assets/mascot.png";

interface Props {
  lesson: QuestLessonData;
  accuracy: number;
  spokenPhonemes: PhonemeResult[];
  intendedPhonemes: PhonemeResult[];
  recordingUrl: string | null;
  generatedAudioUrl: string | null;
  attempts: number;
  onTryAgain?: () => void;
  onContinue: () => void;
  passed: boolean;
}

export function QuestSentenceFeedback({
  lesson, accuracy, spokenPhonemes, intendedPhonemes,
  recordingUrl, generatedAudioUrl, attempts, onTryAgain, onContinue, passed,
}: Props) {
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const [showDetail, setShowDetail] = useState(false);
  const [playingUser, setPlayingUser] = useState(false);
  const [playingRef, setPlayingRef] = useState(false);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const refAudioRef = useRef<HTMLAudioElement | null>(null);

  const scoreColor = accuracy >= 80 ? "text-success" : accuracy >= 50 ? "text-accent" : "text-destructive";
  const scoreBg = accuracy >= 80 ? "bg-success/10 border-success/30" : accuracy >= 50 ? "bg-accent/10 border-accent/30" : "bg-destructive/10 border-destructive/30";

  const feedbackMsg = (() => {
    if (accuracy >= 90) return isEn ? "Excellent pronunciation!" : isTW ? "發音非常好！" : "发音非常好！";
    if (accuracy >= 70) return isEn ? "Good job! Lesson passed." : isTW ? "做得好！通過了。" : "做得好！通过了。";
    if (accuracy >= 50) return isEn ? "Almost there! Some tones need work." : isTW ? "差一點！有些聲調需要改進。" : "差一点！有些声调需要改进。";
    return isEn ? "Keep practising! Focus on the tones." : isTW ? "繼續練習！注意聲調。" : "继续练习！注意声调。";
  })();

  // Build jyutping string from intended phonemes
  const jyutpingStr = intendedPhonemes
    .filter(p => p.phoneme)
    .map(p => p.phoneme)
    .join(" ");

  // Build recognized text from spoken phonemes
  const recognizedText = spokenPhonemes.map(p => p.character).join("");

  const playAudio = (url: string | null, setPlaying: (v: boolean) => void, audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (!url) return;
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.addEventListener("ended", () => setPlaying(false));
    audio.play();
    setPlaying(true);
  };

  return (
    <div className="min-h-full bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6 animate-in fade-in duration-300">
        {/* Sentence & Score */}
        <div className="text-center">
          <p className="text-3xl font-extrabold text-foreground mb-1">{lesson.sentence}</p>
          <p className="text-sm text-muted-foreground mb-4">{lesson.english_translation}</p>

          <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full border-4 ${scoreBg}`}>
            <span className={`text-4xl font-extrabold ${scoreColor}`}>{accuracy}%</span>
          </div>

          <p className="mt-4 text-base font-bold text-foreground">{feedbackMsg}</p>

          {passed && (
            <div className="mt-2 flex items-center justify-center gap-1 text-accent font-extrabold text-sm">
              <Trophy className="h-4 w-4" />
              +{lesson.xp_reward} XP
            </div>
          )}
        </div>

        {/* Recognition result */}
        <div className="bg-card border-2 border-border rounded-2xl p-4 space-y-2">
          <div>
            <p className="text-xs font-extrabold text-muted-foreground uppercase mb-1">
              {isEn ? "You said" : isTW ? "你說的" : "你说的"}
            </p>
            <p className="text-lg font-bold text-foreground">{recognizedText || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-extrabold text-muted-foreground uppercase mb-1">
              {isEn ? "Jyutping" : "粵拼"}
            </p>
            <p className="text-sm font-mono text-primary">{jyutpingStr || "—"}</p>
          </div>
        </div>

        {/* Audio buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => playAudio(recordingUrl, setPlayingUser, userAudioRef)}
            className="h-12 rounded-2xl gap-2 font-bold"
            disabled={!recordingUrl}
          >
            {playingUser ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isEn ? "Your voice" : isTW ? "你的聲音" : "你的声音"}
          </Button>
          <Button
            variant="outline"
            onClick={() => playAudio(generatedAudioUrl, setPlayingRef, refAudioRef)}
            className="h-12 rounded-2xl gap-2 font-bold"
            disabled={!generatedAudioUrl}
          >
            <Volume2 className="h-4 w-4" />
            {isEn ? "Correct" : isTW ? "正確發音" : "正确发音"}
          </Button>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {onTryAgain && (
            <Button
              variant="outline"
              onClick={onTryAgain}
              className="w-full h-12 rounded-2xl gap-2 font-bold"
            >
              <RotateCcw className="h-4 w-4" />
              {isEn ? "Try Again" : isTW ? "再試一次" : "再试一次"}
              <span className="text-xs text-muted-foreground ml-1">({attempts}/3)</span>
            </Button>
          )}
          <Button
            onClick={onContinue}
            className="w-full h-14 rounded-2xl gap-2 text-base font-extrabold game-btn"
            style={{ boxShadow: "0 4px 0 hsl(var(--primary-dark))" }}
          >
            {passed
              ? (isEn ? "Continue" : "繼續")
              : (isEn ? "Back to Map" : isTW ? "返回地圖" : "返回地图")}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Detailed analysis */}
        <Button
          variant="ghost"
          onClick={() => setShowDetail(!showDetail)}
          className="w-full gap-2 text-muted-foreground font-bold"
        >
          {showDetail ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {isEn ? "Detailed analysis" : isTW ? "詳細分析" : "详细分析"}
        </Button>

        {showDetail && (
          <div className="bg-card border-2 border-border rounded-2xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <h3 className="text-sm font-extrabold text-foreground">
              {isEn ? "Character Breakdown" : isTW ? "逐字分析" : "逐字分析"}
            </h3>
            <div className="space-y-2">
              {intendedPhonemes.filter(p => p.phoneme).map((intended, i) => {
                const spoken = spokenPhonemes[i];
                const match = spoken?.phoneme === intended.phoneme;
                return (
                  <div key={i} className={`flex items-center justify-between p-2 rounded-xl text-sm ${match ? 'bg-success/5' : 'bg-destructive/5'}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-foreground">{intended.character}</span>
                      <span className="text-muted-foreground">{intended.phoneme}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={match ? "text-success font-bold" : "text-destructive font-bold"}>
                        {spoken?.phoneme || "—"}
                      </span>
                      {intended.confidence !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round((intended.confidence || 0) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-muted-foreground uppercase mb-2">
                {isEn ? "Tone Accuracy" : isTW ? "聲調準確度" : "声调准确度"}
              </h4>
              <div className="flex gap-1">
                {intendedPhonemes.filter(p => p.phoneme).map((p, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full ${
                      p.toneConf !== undefined && p.toneConf >= 0.5 ? 'bg-success' : 'bg-destructive/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
