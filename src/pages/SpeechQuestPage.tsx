import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, CheckCircle2, ChevronRight } from "lucide-react";
import { phonemeCategories, getLessonsByCategory } from "@/data/lessons";
import pipiParrot from "@/assets/pipi-parrot-only.png";
import islandPhonetic from "@/assets/island-phonetic.png";
import islandSemantic from "@/assets/island-semantic.png";
import islandBg from "@/assets/island-bg.jpg";
import { BilabialStation1 } from "@/components/BilabialStation1";
import { BilabialStation2 } from "@/components/BilabialStation2";

type QuestView = 'islands' | 'phonetic-categories' | 'bilabial-station-select' | 'bilabial-s1' | 'bilabial-s2' | 'lesson-map';

export default function SpeechQuestPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<QuestView>('islands');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getProgress = () => {
    try {
      return JSON.parse(sessionStorage.getItem("lesson_progress") || "{}");
    } catch {
      return {};
    }
  };
  const progress = getProgress();

  // ── Bilabial Station 1 ──
  if (view === 'bilabial-s1') {
    return (
      <BilabialStation1
        onComplete={() => setView('bilabial-station-select')}
        onBack={() => setView('bilabial-station-select')}
      />
    );
  }

  // ── Bilabial Station 2 ──
  if (view === 'bilabial-s2') {
    return (
      <BilabialStation2
        onComplete={() => setView('bilabial-station-select')}
        onBack={() => setView('bilabial-station-select')}
      />
    );
  }

  // ── Bilabial Station Select ──
  if (view === 'bilabial-station-select') {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={() => setView('phonetic-categories')}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-4xl block mb-2">🏝️</span>
            <h1 className="text-xl font-extrabold text-foreground">雙唇海灘</h1>
            <p className="text-sm text-muted-foreground">學習 /b/、/ph/、/m/ 嘅發音</p>
          </div>

          {/* Station cards */}
          <div className="space-y-4">
            <button
              onClick={() => setView('bilabial-s1')}
              className="w-full bg-card border-2 border-primary/20 rounded-3xl p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0">
                  🧪
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-primary mb-1">第一站</p>
                  <p className="text-lg font-extrabold text-foreground">噴氣實驗室</p>
                  <p className="text-xs text-muted-foreground mt-1">視覺教學 — 學習每個音嘅嘴型同記憶法</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
            </button>

            <button
              onClick={() => setView('bilabial-s2')}
              className="w-full bg-card border-2 border-accent/20 rounded-3xl p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-3xl shrink-0">
                  🎯
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-accent mb-1">第二站</p>
                  <p className="text-lg font-extrabold text-foreground">單字配對大進擊</p>
                  <p className="text-xs text-muted-foreground mt-1">聽音配對 + 錄音練習 — 三個級別</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Lesson Map (Vertical Nodes) for non-bilabial categories ──
  if (view === 'lesson-map' && selectedCategory) {
    const lessons = getLessonsByCategory(selectedCategory);
    const cat = phonemeCategories.find((c) => c.id === selectedCategory);

    return (
      <div className="min-h-full bg-background">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={() => { setView('phonetic-categories'); setSelectedCategory(null); }}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>

          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">{cat?.emoji}</span>
            <h1 className="text-xl font-extrabold text-foreground">{cat?.labelZh}</h1>
          </div>

          <div className="flex flex-col items-center">
            {lessons.map((lesson, i) => {
              const p = progress[lesson.id];
              const isCompleted = p?.completed;
              const prevCompleted = i === 0 || progress[lessons[i - 1]?.id]?.completed;
              const isLocked = i > 0 && !prevCompleted;

              return (
                <div key={lesson.id} className="flex flex-col items-center">
                  {i > 0 && (
                    <div className={`w-1 h-10 rounded-full ${isCompleted ? "bg-success" : isLocked ? "bg-muted" : "bg-success/30"}`} />
                  )}
                  <button
                    onClick={() => !isLocked && navigate(`/lesson/${lesson.id}`)}
                    disabled={isLocked}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-extrabold shadow-lg transition-all ${
                      isCompleted
                        ? "bg-success text-success-foreground shadow-[0_4px_0_hsl(var(--success)/0.7)]"
                        : isLocked
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-accent text-accent-foreground shadow-[0_4px_0_hsl(var(--accent)/0.7)] hover:shadow-[0_2px_0_hsl(var(--accent)/0.7)] active:translate-y-[2px]"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-8 w-8" /> : isLocked ? <Lock className="h-7 w-7" /> : <span>{i + 1}</span>}
                  </button>
                  <p className={`mt-2 text-xs font-bold text-center max-w-[120px] ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                    {lesson.titleZh}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Phonetic Categories ──
  if (view === 'phonetic-categories') {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          <button
            onClick={() => setView('islands')}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>

          <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">🗣️ 發音小島</h2>

          <div className="space-y-3">
            {phonemeCategories.map((cat) => {
              const isBilabial = cat.id === 'bilabial';
              const isLocked = !isBilabial;

              if (isBilabial) {
                return (
                  <button
                    key={cat.id}
                    onClick={() => setView('bilabial-station-select')}
                    className="w-full bg-card rounded-2xl p-5 border-2 border-primary/30 hover:border-primary shadow-sm text-left transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{cat.emoji}</span>
                      <div className="flex-1">
                        <p className="text-base font-extrabold text-foreground">{cat.labelZh}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">雙唇海灘 — 兩個學習站</p>
                      </div>
                      <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                        可進入
                      </span>
                    </div>
                  </button>
                );
              }

              return (
                <div
                  key={cat.id}
                  className="w-full bg-card/60 rounded-2xl p-5 border-2 border-muted text-left opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{cat.emoji}</span>
                    <div className="flex-1">
                      <p className="text-base font-extrabold text-muted-foreground">{cat.labelZh}</p>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      🔒 鎖定
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Islands (Main View) ──
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Mascot + Speech Bubble */}
        <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: 200 }}>
          <img src={islandBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative flex items-end p-4 gap-3">
            <img
              src={pipiParrot}
              alt="皮皮"
              className="h-28 w-28 object-contain drop-shadow-lg"
              loading="lazy"
              width={512}
              height={512}
            />
            <div className="bg-card/95 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm mb-4">
              <p className="text-sm font-bold text-foreground">
                練習加油！
              </p>
            </div>
          </div>
        </div>

        {/* Island Selection — buttons on top of islands */}
        <div className="grid grid-cols-2 gap-4">
          {/* Phonetic Island */}
          <button
            onClick={() => setView('phonetic-categories')}
            className="relative flex flex-col items-center group"
          >
            <div className="relative">
              <img
                src={islandPhonetic}
                alt=""
                className="w-40 h-40 object-contain drop-shadow-lg group-hover:scale-105 transition-transform"
                loading="lazy"
                width={512}
                height={512}
              />
              {/* Label overlay on top of island */}
              <div className="absolute inset-0 flex flex-col items-center justify-center -mt-4">
                <span className="text-2xl mb-1">🗣️</span>
                <p className="text-sm font-extrabold text-foreground bg-card/90 px-3 py-1 rounded-xl shadow-sm">
                  發音小島
                </p>
                <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full mt-1">
                  可進入
                </span>
              </div>
            </div>
          </button>

          {/* Semantic Island (locked) */}
          <div className="relative flex flex-col items-center opacity-60">
            <div className="relative">
              <img
                src={islandSemantic}
                alt=""
                className="w-40 h-40 object-contain drop-shadow-lg grayscale"
                loading="lazy"
                width={512}
                height={512}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center -mt-4">
                <span className="text-2xl mb-1">📖</span>
                <p className="text-sm font-extrabold text-muted-foreground bg-card/90 px-3 py-1 rounded-xl shadow-sm">
                  語義小島
                </p>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-1">
                  🔒 鎖定
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
