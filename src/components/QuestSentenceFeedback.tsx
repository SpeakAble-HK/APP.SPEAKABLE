import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Square, RotateCcw, ArrowRight, ChevronDown, ChevronUp, Volume2, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { PhonemeResult } from "@/hooks/usePronunciationAPI";
import type { QuestLessonData } from "@/data/questLessons";
import type { NormalizedPronunciationFeedback } from "@/lib/pronunciationFeedbackAdapter";
import mascot from "@/assets/pipi-mascot.png";

const CONFETTI_COLORS = [
  "hsl(38, 95%, 60%)",  // accent gold
  "hsl(174, 62%, 47%)", // primary teal
  "hsl(142, 60%, 45%)", // success green
  "hsl(280, 70%, 60%)", // purple
  "hsl(0, 72%, 55%)",   // red
  "hsl(200, 80%, 55%)", // blue
];

function ConfettiEffect() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${Math.random() * 0.8}s`,
    size: `${6 + Math.random() * 8}px`,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" aria-hidden="true">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            width: p.size,
            height: p.size,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function XPPopup({ xp }: { xp: number }) {
  return (
    <div className="animate-xp-pop text-2xl font-extrabold text-accent flex items-center gap-1 justify-center">
      <Star className="h-6 w-6" />
      +{xp} XP
    </div>
  );
}

interface Props {
  lesson: QuestLessonData;
  accuracy: number;
  normalized?: NormalizedPronunciationFeedback;
  spokenPhonemes: PhonemeResult[];
  intendedPhonemes: PhonemeResult[];
  recordingUrl: string | null;
  generatedAudioUrl: string | null;
  attempts: number;
  bestScore?: number;
  onTryAgain?: () => void;
  /** Omitted until pass or max attempts — user must retry first. */
  onContinue?: () => void;
  passed: boolean;
}

export function QuestSentenceFeedback({
  lesson,
  accuracy,
  normalized,
  spokenPhonemes,
  intendedPhonemes,
  recordingUrl,
  generatedAudioUrl,
  attempts,
  bestScore = 0,
  onTryAgain,
  onContinue,
  passed,
}: Props) {
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const [showDetail, setShowDetail] = useState(false);
  const [playingUser, setPlayingUser] = useState(false);
  const [playingRef, setPlayingRef] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const refAudioRef = useRef<HTMLAudioElement | null>(null);

  // Play celebration sound and confetti on pass
  const playCelebration = useCallback(() => {
    if (!passed) return;
    setShowConfetti(true);

    // Simple celebration chime using Web Audio API
    try {
      const ctx = new AudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.5);
      });
    } catch {
      // Audio not available
    }

    setTimeout(() => setShowConfetti(false), 3000);
  }, [passed]);

  useEffect(() => {
    playCelebration();
  }, [playCelebration]);

  // Play a fail buzzer for < 70%
  useEffect(() => {
    if (passed) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 200;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio not available
    }
  }, [passed]);

  const scoreColor = accuracy >= 80 ? "text-success" : accuracy >= 50 ? "text-accent" : "text-destructive";
  const scoreBg = accuracy >= 80 ? "bg-success/10 border-success/30" : accuracy >= 50 ? "bg-accent/10 border-accent/30" : "bg-destructive/10 border-destructive/30";

  const feedbackMsg = (() => {
    if (normalized) {
      return isEn ? normalized.shortMessageEn : normalized.shortMessageZh;
    }
    if (accuracy >= 90) return isEn ? "Excellent pronunciation!" : isTW ? "發音非常好！" : "发音非常好！";
    if (accuracy >= 70) return isEn ? "Good job! Lesson passed." : isTW ? "做得好！通過了。" : "做得好！通过了。";
    if (accuracy >= 50) return isEn ? "Almost there! Some tones need work." : isTW ? "差一點！有些聲調需要改進。" : "差一点！有些声调需要改进。";
    return isEn ? "Keep practising! Focus on the tones." : isTW ? "繼續練習！注意聲調。" : "继续练习！注意声调。";
  })();

  const jyutpingStr = intendedPhonemes
    .filter(p => p.phoneme)
    .map(p => p.phoneme)
    .join(" ");

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
      {showConfetti && <ConfettiEffect />}

      <div className="max-w-md w-full space-y-6 animate-in fade-in duration-300">
        {/* Sentence & Score */}
        <div className="text-center">
          <p className="text-3xl font-extrabold text-foreground mb-1">{lesson.sentence}</p>
          <p className="text-sm text-muted-foreground mb-4">{lesson.english_translation}</p>

          <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full border-4 ${scoreBg} animate-score-count`}>
            <span className={`text-4xl font-extrabold ${scoreColor}`}>{accuracy}%</span>
          </div>

          <p className="mt-4 text-base font-bold text-foreground">{feedbackMsg}</p>
          {bestScore > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {isEn ? `Best this round: ${bestScore}%` : isTW ? `本輪最佳：${bestScore}%` : `本轮最佳：${bestScore}%`}
            </p>
          )}

          {passed && (
            <div className="mt-3">
              <XPPopup xp={lesson.xp_reward} />
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
            className="h-12 min-h-11 rounded-2xl gap-2 font-bold"
            disabled={!recordingUrl}
          >
            {playingUser ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isEn ? "Your voice" : isTW ? "你的聲音" : "你的声音"}
          </Button>
          <Button
            variant="outline"
            onClick={() => playAudio(generatedAudioUrl, setPlayingRef, refAudioRef)}
            className="h-12 min-h-11 rounded-2xl gap-2 font-bold"
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
              className="h-12 min-h-11 w-full rounded-2xl gap-2 font-bold"
            >
              <RotateCcw className="h-4 w-4" />
              {isEn ? "Try Again" : isTW ? "再試一次" : "再试一次"}
              <span className="ml-1 text-xs text-muted-foreground">({attempts}/3)</span>
            </Button>
          )}
          {onContinue && (
            <Button
              onClick={onContinue}
              className="game-btn h-14 min-h-11 w-full gap-2 rounded-2xl text-base font-extrabold"
              style={{ boxShadow: "0 4px 0 hsl(var(--primary-dark))" }}
            >
              {passed
                ? isEn
                  ? "Continue"
                  : "繼續"
                : isEn
                  ? "Back to Map"
                  : isTW
                    ? "返回地圖"
                    : "返回地图"}
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
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
