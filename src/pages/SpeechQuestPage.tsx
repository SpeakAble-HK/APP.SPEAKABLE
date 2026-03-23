import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lock, CheckCircle2, Star } from "lucide-react";
import { phonemeCategories, semanticCategories, getLessonsByCategory } from "@/data/lessons";
import parrot from "@/assets/quest-parrot.png";

export default function SpeechQuestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const island = (searchParams.get('island') as 'phonetic' | 'semantic') || 'phonetic';
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Local progress from sessionStorage
  const getProgress = () => {
    try {
      return JSON.parse(sessionStorage.getItem('lesson_progress') || '{}');
    } catch { return {}; }
  };
  const progress = getProgress();

  // Only bilabial for phonetic in prototype
  const categories = island === 'phonetic'
    ? phonemeCategories.filter(c => c.id === 'bilabial')
    : semanticCategories;
  const islandTitle = island === 'phonetic' ? '發音小島' : '語義小島';
  const islandEmoji = island === 'phonetic' ? '🗣️' : '📖';

  if (selectedCategory) {
    const lessons = getLessonsByCategory(selectedCategory);
    const cat = (island === 'phonetic' ? phonemeCategories : semanticCategories).find(c => c.id === selectedCategory);

    return (
      <div className="min-h-full bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{cat?.emoji}</span>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">{cat?.labelZh}</h1>
              <p className="text-sm text-muted-foreground">{cat?.label}</p>
            </div>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson, i) => {
              const p = progress[lesson.id];
              const isCompleted = p?.completed;
              const prevLesson = lessons[i - 1];
              const prevCompleted = i === 0 || progress[prevLesson?.id]?.completed;
              const isLocked = i > 0 && !prevCompleted;

              return (
                <button
                  key={lesson.id}
                  onClick={() => !isLocked && navigate(`/lesson/${lesson.id}`)}
                  disabled={isLocked}
                  className={`w-full flex items-center gap-4 rounded-2xl p-4 border-2 transition-all text-left ${
                    isCompleted
                      ? 'bg-success/10 border-success/30'
                      : isLocked
                      ? 'bg-muted/50 border-border opacity-60 cursor-not-allowed'
                      : 'bg-card border-border hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isCompleted ? 'bg-success/20' : isLocked ? 'bg-muted' : 'bg-primary/10'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    ) : isLocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <span className="text-lg font-extrabold text-primary">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-foreground">{lesson.titleZh}</p>
                    <p className="text-xs text-muted-foreground">
                      目標: {lesson.targetPhoneme} · {lesson.exampleWord}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-accent">
                    <Star className="h-3.5 w-3.5" />
                    {p?.xp_earned || 0}/{lesson.xpReward}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/explorer')}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <img src={parrot} alt="" className="h-32 w-32 object-contain mascot-bounce mb-4" />
          <h1 className="text-3xl font-extrabold text-foreground mb-1">
            {islandEmoji} {islandTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            選擇一個類別開始練習
          </p>
        </div>

        {/* Island toggle */}
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          <button
            onClick={() => navigate('/speech-quest?island=phonetic')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              island === 'phonetic' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            🗣️ 發音小島
          </button>
          <button
            onClick={() => navigate('/speech-quest?island=semantic')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              island === 'semantic' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            📖 語義小島
          </button>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat) => {
            const catLessons = getLessonsByCategory(cat.id);
            const completed = catLessons.filter(l => progress[l.id]?.completed).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="bg-card border-2 border-border rounded-2xl p-5 text-center hover:-translate-y-1 transition-all hover:shadow-lg hover:border-primary/30 active:translate-y-0"
              >
                <span className="text-4xl block mb-3">{cat.emoji}</span>
                <h3 className="text-base font-extrabold text-foreground mb-1">{cat.labelZh}</h3>
                <p className="text-xs text-muted-foreground mb-2">{cat.label}</p>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: catLessons.length > 0 ? `${(completed / catLessons.length) * 100}%` : '0%' }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-bold">
                  {completed}/{catLessons.length}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
