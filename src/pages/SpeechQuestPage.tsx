import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, CheckCircle2, ChevronRight } from "lucide-react";
import { phonemeCategories, getLessonsByCategory } from "@/data/lessons";
import pipiIsland from "@/assets/pipi-island.png";
import islandBg from "@/assets/island-bg.jpg";

export default function SpeechQuestPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getProgress = () => {
    try { return JSON.parse(sessionStorage.getItem("lesson_progress") || "{}"); }
    catch { return {}; }
  };
  const progress = getProgress();

  // ─── Lesson Map (Vertical Nodes) ───
  if (selectedCategory) {
    const lessons = getLessonsByCategory(selectedCategory);
    const cat = phonemeCategories.find(c => c.id === selectedCategory);

    return (
      <div className="min-h-full bg-background">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>

          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">{cat?.emoji}</span>
            <div>
              <h1 className="text-xl font-extrabold text-foreground">{cat?.labelZh}</h1>
            </div>
          </div>

          {/* Vertical Path */}
          <div className="flex flex-col items-center">
            {lessons.map((lesson, i) => {
              const p = progress[lesson.id];
              const isCompleted = p?.completed;
              const prevCompleted = i === 0 || progress[lessons[i - 1]?.id]?.completed;
              const isLocked = i > 0 && !prevCompleted;

              return (
                <div key={lesson.id} className="flex flex-col items-center">
                  {i > 0 && (
                    <div className={`w-1 h-10 rounded-full ${
                      isCompleted ? "bg-success" : isLocked ? "bg-muted" : "bg-success/30"
                    }`} />
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
                    {isCompleted ? (
                      <CheckCircle2 className="h-8 w-8" />
                    ) : isLocked ? (
                      <Lock className="h-7 w-7" />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </button>
                  <p className={`mt-2 text-xs font-bold text-center max-w-[120px] ${
                    isLocked ? "text-muted-foreground" : "text-foreground"
                  }`}>
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

  // ─── Islands + Categories ───
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Mascot + Speech Bubble */}
        <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: 200 }}>
          <img src={islandBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative flex items-end p-4 gap-3">
            <img src={pipiIsland} alt="皮皮" className="h-28 w-28 object-contain drop-shadow-lg" loading="lazy" width={1024} height={1024} />
            <div className="bg-card/95 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm mb-4">
              <p className="text-sm font-bold text-foreground">
                發音小島用粵語中，<br />到簡啲存克跳錢！
              </p>
            </div>
          </div>
        </div>

        {/* Island Selection */}
        <div className="grid grid-cols-2 gap-3">
          {/* Phonetic Island */}
          <button
            onClick={() => {}}
            className="bg-card rounded-2xl p-4 border-2 border-primary shadow-sm text-center"
          >
            <span className="text-3xl block mb-2">🗣️</span>
            <p className="text-sm font-extrabold text-foreground">發音小島</p>
            <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full mt-1 inline-block">
              可進入
            </span>
          </button>
          {/* Semantic Island (locked) */}
          <div className="bg-card/60 rounded-2xl p-4 border-2 border-muted text-center opacity-60">
            <span className="text-3xl block mb-2">📖</span>
            <p className="text-sm font-extrabold text-muted-foreground">語義小島</p>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-1 inline-block">
              🔒 鎖定
            </span>
          </div>
        </div>

        {/* Section title */}
        <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
          🗣️ 發音小島
        </h2>

        {/* 4 Categories */}
        <div className="grid grid-cols-2 gap-3">
          {phonemeCategories.map((cat) => {
            const catLessons = getLessonsByCategory(cat.id);
            const completed = catLessons.filter(l => progress[l.id]?.completed).length;
            const allDone = completed === catLessons.length && catLessons.length > 0;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="bg-card rounded-2xl p-4 border-2 border-border hover:border-primary/30 shadow-sm text-center transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="text-3xl block mb-2">{cat.emoji}</span>
                <p className="text-sm font-extrabold text-foreground mb-1">{cat.labelZh}</p>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    allDone
                      ? "bg-success/10 text-success"
                      : "bg-accent/10 text-accent"
                  }`}>
                    {completed}/{catLessons.length}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-primary">
                  {allDone ? "已完成" : "開始"}
                  <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
