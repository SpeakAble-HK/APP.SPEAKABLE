import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import { phonemeCategories, getLessonsByCategory } from "@/data/lessons";
import { BilabialStation1 } from "@/components/BilabialStation1";
import { BilabialStation2 } from "@/components/BilabialStation2";

type QuestView = "islands" | "phonetic-categories" | "bilabial-station-select" | "bilabial-s1" | "bilabial-s2" | "lesson-map";

export default function SpeechQuestPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<QuestView>("islands");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getProgress = () => {
    try { return JSON.parse(sessionStorage.getItem("lesson_progress") || "{}"); }
    catch { return {}; }
  };
  const progress = getProgress();

  if (view === "bilabial-s1") {
    return (
      <BilabialStation1
        onComplete={() => setView("bilabial-station-select")}
        onBack={() => setView("bilabial-station-select")}
      />
    );
  }

  if (view === "bilabial-s2") {
    return (
      <BilabialStation2
        onComplete={() => setView("bilabial-station-select")}
        onBack={() => setView("bilabial-station-select")}
      />
    );
  }

  if (view === "bilabial-station-select") {
    return (
      <div className="min-h-full bg-surface">
        {/* Gradient background */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#c8e8f2] via-surface to-background" />
        <div className="fixed -top-20 -left-20 w-72 h-72 rounded-full bg-primary/20 blur-[80px] -z-10" aria-hidden="true" />
        <div className="fixed top-1/3 -right-16 w-64 h-64 rounded-full bg-tertiary-container/30 blur-[70px] -z-10" aria-hidden="true" />

        <div className="max-w-lg mx-auto px-4 py-6 pt-4">
          <button
            onClick={() => setView("phonetic-categories")}
            className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary mb-6 transition-colors"
          >
            <MaterialIcon icon="arrow_back" className="text-lg" /> 返回
          </button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 shadow-xl shadow-primary/20">
              <MaterialIcon icon="graphic_eq" filled className="text-white text-4xl" />
            </div>
            <h1 className="font-headline text-xl font-extrabold text-on-surface">雙唇海灘</h1>
            <p className="text-sm text-on-surface-variant">學習 /b/、/p/、/m/ 發音</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setView("bilabial-s1")}
              className="w-full glass-card border border-primary/20 rounded-xl p-6 text-left transition-all hover:scale-[1.02] active:scale-95 shadow-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-container/50 flex items-center justify-center shrink-0">
                  <MaterialIcon icon="science" filled className="text-primary text-2xl" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">站點 1</p>
                  <p className="font-headline text-lg font-bold text-on-surface">氣流實驗室</p>
                  <p className="text-xs text-on-surface-variant mt-1">視覺教學——嘴形及記憶法</p>
                </div>
                <MaterialIcon icon="chevron_right" className="text-on-surface-variant text-2xl" />
              </div>
            </button>

            <button
              onClick={() => setView("bilabial-s2")}
              className="w-full glass-card border border-secondary/20 rounded-xl p-6 text-left transition-all hover:scale-[1.02] active:scale-95 shadow-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary-container/50 flex items-center justify-center shrink-0">
                  <MaterialIcon icon="target" filled className="text-secondary text-2xl" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-secondary mb-1 uppercase tracking-wider">站點 2</p>
                  <p className="font-headline text-lg font-bold text-on-surface">詞語配對</p>
                  <p className="text-xs text-on-surface-variant mt-1">聆聽、配對及錄音——三個難度級別</p>
                </div>
                <MaterialIcon icon="chevron_right" className="text-on-surface-variant text-2xl" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "lesson-map" && selectedCategory) {
    const lessons = getLessonsByCategory(selectedCategory);
    const cat = phonemeCategories.find((c) => c.id === selectedCategory);
    return (
      <div className="min-h-full bg-surface">
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#c8e8f2] via-surface to-background" />
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={() => { setView("phonetic-categories"); setSelectedCategory(null); }}
            className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary mb-6 transition-colors"
          >
            <MaterialIcon icon="arrow_back" className="text-lg" /> 返回
          </button>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">{cat?.emoji}</span>
            <h1 className="font-headline text-xl font-extrabold text-on-surface">{cat?.labelZh}</h1>
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
                    <div className={`w-1 h-10 rounded-full ${isCompleted ? "bg-green-500" : isLocked ? "bg-surface-container" : "bg-green-500/30"}`} />
                  )}
                  <button
                    onClick={() => !isLocked && navigate(`/lesson/${lesson.id}`)}
                    disabled={isLocked}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-extrabold shadow-lg transition-all active:scale-95 ${
                      isCompleted
                        ? "bg-green-500 text-white shadow-green-500/30"
                        : isLocked
                          ? "bg-surface-container text-on-surface-variant cursor-not-allowed"
                          : "bg-primary text-on-primary shadow-primary/30 hover:scale-105"
                    }`}
                  >
                    {isCompleted ? <MaterialIcon icon="check_circle" filled className="text-3xl" /> : isLocked ? <MaterialIcon icon="lock" className="text-2xl" /> : <span>{i + 1}</span>}
                  </button>
                  <p className={`mt-2 text-xs font-bold text-center max-w-[120px] ${isLocked ? "text-on-surface-variant" : "text-on-surface"}`}>
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

  if (view === "phonetic-categories") {
    return (
      <div className="min-h-full bg-surface">
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#c8e8f2] via-surface to-background" />
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          <button
            onClick={() => setView("islands")}
            className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            <MaterialIcon icon="arrow_back" className="text-lg" /> 返回
          </button>
          <h2 className="font-headline text-lg font-extrabold text-on-surface flex items-center gap-2">
            <MaterialIcon icon="graphic_eq" className="text-primary" /> 語音島
          </h2>
          <div className="space-y-3">
            {phonemeCategories.map((cat) => {
              const isBilabial = cat.id === "bilabial";
              if (isBilabial) {
                return (
                  <button
                    key={cat.id}
                    onClick={() => setView("bilabial-station-select")}
                    className="w-full glass-card rounded-xl p-5 border border-primary/30 hover:border-primary shadow-card text-left transition-all hover:scale-[1.01] active:scale-95"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{cat.emoji}</span>
                      <div className="flex-1">
                        <p className="font-headline text-base font-bold text-on-surface">{cat.labelZh}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">雙唇海灘——兩個學習站點</p>
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">開放</span>
                    </div>
                  </button>
                );
              }
              return (
                <div key={cat.id} className="w-full glass-card/60 rounded-xl p-5 border border-outline-variant/30 text-left opacity-50">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{cat.emoji}</span>
                    <div className="flex-1">
                      <p className="font-headline text-base font-bold text-on-surface-variant">{cat.labelZh}</p>
                    </div>
                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                      <MaterialIcon icon="lock" className="text-sm" /> 鎖定
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

  // Islands main view
  return (
    <div className="min-h-full bg-surface">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#c8e8f2] via-surface to-background" />
      <div className="fixed -top-20 -left-20 w-72 h-72 rounded-full bg-primary/20 blur-[80px] -z-10" aria-hidden="true" />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* PiPi speech bubble */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shadow-lg shrink-0">
            <MaterialIcon icon="smart_toy" filled className="text-3xl text-primary" />
          </div>
          <div className="glass-card rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-white/40">
            <p className="text-sm font-medium text-on-surface">
              練習時間！選一個島嶼開始你的語音冒險！
            </p>
          </div>
        </div>

        {/* Island grid */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setView("phonetic-categories")}
            className="group relative flex flex-col items-center"
          >
            <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform overflow-hidden">
              <MaterialIcon icon="graphic_eq" filled className="text-white text-5xl" />
            </div>
            <div className="mt-3 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-primary/10">
              <span className="font-headline font-bold text-primary text-sm">語音島</span>
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-1">開放</span>
          </button>

          <button
            onClick={() => navigate("/semantic-island")}
            className="group relative flex flex-col items-center"
          >
            <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-orange-400 to-amber-300 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform overflow-hidden">
              <MaterialIcon icon="auto_stories" filled className="text-white text-5xl" />
            </div>
            <div className="mt-3 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-secondary/10">
              <span className="font-headline font-bold text-secondary text-sm">語義島</span>
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-1">開放</span>
          </button>
        </div>
      </div>
    </div>
  );
}
