import { useState } from "react";
import { ArrowRight, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { station1Teachings, PhonemeTeaching } from "@/data/bilabialLessons";
import pipi from "@/assets/pipi-parrot-only.png";

interface BilabialStation1Props {
  onComplete: () => void;
  onBack: () => void;
}

export function BilabialStation1({ onComplete, onBack }: BilabialStation1Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  const teaching = station1Teachings[currentIndex];

  const playSound = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'zh-HK';
    utterance.rate = 0.7;
    speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    if (currentIndex < station1Teachings.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowDetail(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-4"
        >
          ← 返回
        </button>

        <div className="text-center mb-6">
          <h1 className="text-lg font-extrabold text-foreground">🏝️ 雙唇海灘</h1>
          <p className="text-sm text-primary font-bold">第一站：噴氣實驗室</p>
          <p className="text-xs text-muted-foreground mt-1">
            {currentIndex + 1} / {station1Teachings.length}
          </p>
        </div>

        {/* Pipi mascot speech */}
        <div className="flex items-start gap-3 mb-6">
          <img src={pipi} alt="皮皮" className="h-16 w-16 object-contain shrink-0" loading="lazy" width={512} height={512} />
          <div className="bg-card border-2 border-primary/20 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
            <p className="text-sm font-bold text-foreground">
              聽下我用你把聲講呢個音有幾好聽！
            </p>
          </div>
        </div>

        {/* Phoneme card */}
        <div className="bg-card border-2 border-primary/20 rounded-3xl p-6 mb-4">
          <div className="text-center mb-4">
            <span className="text-6xl mb-2 block">{teaching.memoryEmoji}</span>
            <p className="text-3xl font-extrabold text-primary mb-1">{teaching.phoneme}</p>
            <p className="text-xl font-extrabold text-foreground">{teaching.label}</p>
            <p className="text-sm text-muted-foreground">（{teaching.familyWord}）</p>
          </div>

          {/* Mouth animation description */}
          <div className="bg-muted/50 rounded-2xl p-4 mb-4">
            <p className="text-xs font-bold text-muted-foreground mb-1">👄 嘴型教學</p>
            <p className="text-sm text-foreground">{teaching.description}</p>
          </div>

          {/* Memory trick */}
          <div className="bg-accent/10 rounded-2xl p-4 mb-4">
            <p className="text-xs font-bold text-accent mb-1">💡 記憶法</p>
            <p className="text-base font-extrabold text-foreground">{teaching.memoryTrick}</p>
          </div>

          {/* Play sound */}
          <Button
            onClick={() => playSound(teaching.familyWord)}
            className="w-full gap-2 h-12 rounded-2xl text-base font-extrabold game-btn"
            style={{ boxShadow: '0 4px 0 hsl(var(--primary-dark))' }}
          >
            <Volume2 className="h-5 w-5" />
            播放「{teaching.familyWord}」
          </Button>
        </div>

        {/* Common mistake */}
        {!showDetail ? (
          <button
            onClick={() => setShowDetail(true)}
            className="w-full text-center text-sm font-bold text-primary mb-4"
          >
            ⚠️ 查看常見錯誤
          </button>
        ) : (
          <div className="bg-destructive/5 border-2 border-destructive/20 rounded-2xl p-4 mb-4">
            <p className="text-xs font-bold text-destructive mb-1">⚠️ 常見錯誤</p>
            <p className="text-sm font-bold text-foreground mb-1">{teaching.commonMistake}</p>
            <p className="text-sm text-muted-foreground">{teaching.mistakeFix}</p>
          </div>
        )}

        {/* Next button */}
        <Button
          onClick={handleNext}
          className="w-full h-14 text-lg font-extrabold rounded-2xl game-btn gap-2"
          style={{ boxShadow: '0 5px 0 hsl(var(--primary-dark))' }}
        >
          {currentIndex < station1Teachings.length - 1 ? '下一個音' : '開始練習'}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
