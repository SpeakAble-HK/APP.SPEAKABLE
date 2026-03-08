import { useState, useCallback } from "react";
import { Lock, CheckCircle, Star, Trophy, BookOpen, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { IPALibraryModal } from "@/components/IPALibraryModal";
import { RewardsShop } from "@/components/RewardsShop";
import { QuestExercise } from "@/components/QuestExercise";
import { questWorlds, QuestLesson } from "@/data/questWorlds";
import { toast } from "@/hooks/use-toast";
import mascot from "@/assets/mascot.png";

const QUEST_STORAGE_KEY = "speakable-quest-progress";

interface QuestProgress {
  completed: Set<string>;
  spentPoints: number;
  totalXp: number;
}

function loadProgress(): QuestProgress {
  try {
    const saved = localStorage.getItem(QUEST_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return {
        completed: new Set(data.completed || []),
        spentPoints: data.spentPoints || 0,
        totalXp: data.totalXp || 0,
      };
    }
  } catch {}
  return { completed: new Set(), spentPoints: 0, totalXp: 0 };
}

function saveProgress(progress: QuestProgress) {
  localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify({
    completed: [...progress.completed],
    spentPoints: progress.spentPoints,
    totalXp: progress.totalXp,
  }));
}

const SpeechQuestPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const [ipaOpen, setIpaOpen] = useState(false);
  const [progress, setProgress] = useState<QuestProgress>(loadProgress);
  const [activeLesson, setActiveLesson] = useState<QuestLesson | null>(null);

  const { completed, spentPoints, totalXp } = progress;
  const availablePoints = totalXp - spentPoints;

  const allLessons = questWorlds.flatMap((w) => w.lessons);
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) => completed.has(l.id)).length;
  const progressPct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const getTitle = (item: { titleEn: string; titleTW: string; titleCN: string }) =>
    isEn ? item.titleEn : isTW ? item.titleTW : item.titleCN;

  // A lesson is unlocked if it's the first in its world, or the previous lesson (within or across worlds) is completed
  const isLessonUnlocked = (lessonId: string): boolean => {
    const idx = allLessons.findIndex((l) => l.id === lessonId);
    if (idx === 0) return true;
    return completed.has(allLessons[idx - 1].id);
  };

  const isWorldUnlocked = (worldIndex: number): boolean => {
    if (worldIndex === 0) return true;
    const prevWorld = questWorlds[worldIndex - 1];
    return prevWorld.lessons.every((l) => completed.has(l.id));
  };

  const getWorldProgress = (worldIndex: number): number => {
    const world = questWorlds[worldIndex];
    const done = world.lessons.filter((l) => completed.has(l.id)).length;
    return world.lessons.length > 0 ? (done / world.lessons.length) * 100 : 0;
  };

  const handleLessonTap = (lesson: QuestLesson) => {
    if (completed.has(lesson.id) || !isLessonUnlocked(lesson.id)) return;
    setActiveLesson(lesson);
  };

  const handleLessonComplete = useCallback((xpEarned: number, avgAccuracy: number) => {
    if (!activeLesson) return;
    const newCompleted = new Set([...completed, activeLesson.id]);
    const newTotalXp = totalXp + xpEarned;
    const newProgress: QuestProgress = { completed: newCompleted, spentPoints, totalXp: newTotalXp };
    setProgress(newProgress);
    saveProgress(newProgress);
    setActiveLesson(null);

    const name = getTitle(activeLesson);
    toast({
      title: isEn ? "🎉 Lesson Complete!" : isTW ? "🎉 課程完成！" : "🎉 课程完成！",
      description: `${name} — +${xpEarned} XP (${avgAccuracy}%)`,
    });
  }, [activeLesson, completed, spentPoints, totalXp, isEn, isTW]);

  const handleSpendPoints = useCallback((amount: number) => {
    const newProgress: QuestProgress = { completed, spentPoints: spentPoints + amount, totalXp };
    setProgress(newProgress);
    saveProgress(newProgress);
  }, [completed, spentPoints, totalXp]);

  // ─── EXERCISE MODE ───
  if (activeLesson) {
    return (
      <QuestExercise
        lesson={activeLesson}
        onComplete={handleLessonComplete}
        onExit={() => setActiveLesson(null)}
      />
    );
  }

  // ─── WORLD MAP ───
  return (
    <div className="min-h-full bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-card border-b-2 border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-sm font-extrabold text-foreground bg-accent/15 px-3 py-1 rounded-full">
            <Star className="h-4 w-4 text-accent" aria-hidden="true" />
            {availablePoints} XP
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-bold">
            <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
            {completedCount}/{totalLessons}
          </div>
          <div className="w-16">
            <Progress value={progressPct} className="h-2.5 rounded-full" />
          </div>
          <Button onClick={() => setIpaOpen(true)} size="sm" className="gap-1.5 font-extrabold min-h-[48px] game-btn" style={{ boxShadow: "0 3px 0 hsl(var(--primary-dark))" }}>
            <BookOpen className="h-4 w-4" />
            IPA
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <img src={mascot} alt="" className="h-16 w-16 mx-auto mb-3 mascot-bounce" />
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            {isEn ? "Speech Quest" : isTW ? "語音冒險" : "语音冒险"} 🗺️
          </h1>
          <p className="text-muted-foreground">
            {isEn ? "Complete lessons to earn XP and unlock new worlds!" : isTW ? "完成課程賺取 XP 並解鎖新世界！" : "完成课程赚取 XP 并解锁新世界！"}
          </p>
        </div>

        {/* World Map */}
        <div className="space-y-10">
          {questWorlds.map((world, wi) => {
            const worldUnlocked = isWorldUnlocked(wi);
            const worldProg = getWorldProgress(wi);
            const worldDone = worldProg === 100;

            return (
              <div key={world.id} className={!worldUnlocked ? "opacity-50" : ""}>
                {/* World Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    worldDone ? "bg-success/15" : worldUnlocked ? "bg-primary/10" : "bg-muted"
                  }`}>
                    {worldUnlocked ? world.emoji : "🔒"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-foreground truncate">
                        {isEn ? `World ${wi + 1}` : `世界 ${wi + 1}`}
                      </h2>
                      {worldDone && <CheckCircle className="h-4 w-4 text-success shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground font-bold">{getTitle(world)}</p>
                  </div>
                  <div className="w-16 shrink-0">
                    <Progress value={worldProg} className="h-2" />
                  </div>
                </div>

                {/* Lesson Nodes — zigzag */}
                <div className="relative w-[90%] max-w-md mx-auto">
                  {/* Vertical line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border rounded-full -translate-x-1/2" aria-hidden="true" />

                  <div className="space-y-5 relative">
                    {world.lessons.map((lesson, li) => {
                      const isLeft = li % 2 === 0;
                      const lessonDone = completed.has(lesson.id);
                      const unlocked = isLessonUnlocked(lesson.id);
                      const isCurrent = unlocked && !lessonDone;

                      return (
                        <div key={lesson.id} className={`flex items-center gap-3 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                          {/* Card */}
                          <div className={`flex-1 ${isLeft ? "text-right" : "text-left"}`}>
                            <button
                              onClick={() => handleLessonTap(lesson)}
                              disabled={lessonDone || !unlocked}
                              className={`inline-block w-full max-w-[240px] text-left border-2 rounded-2xl p-3 transition-all ${
                                lessonDone
                                  ? "border-success/30 bg-success/5 cursor-default"
                                  : isCurrent
                                  ? "border-primary/40 bg-card hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                                  : "border-border bg-muted/30 cursor-not-allowed opacity-60"
                              }`}
                            >
                              <p className="text-sm font-extrabold text-foreground leading-tight">{getTitle(lesson)}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Star className="h-3 w-3 text-accent" aria-hidden="true" />
                                {lesson.xp} XP
                              </div>
                              {isCurrent && (
                                <div className="flex items-center gap-1 text-xs text-primary mt-1.5 font-extrabold">
                                  <ChevronRight className="h-3 w-3" />
                                  {isEn ? "Start" : "開始"}
                                </div>
                              )}
                            </button>
                          </div>

                          {/* Node circle */}
                          <div className="relative">
                            <div className={`relative z-10 flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-full border-3 transition-all ${
                              lessonDone
                                ? "bg-success border-success"
                                : isCurrent
                                ? "bg-primary border-primary animate-pulse"
                                : "bg-muted border-border"
                            }`}>
                              {lessonDone ? (
                                <CheckCircle className="h-5 w-5 text-success-foreground" />
                              ) : isCurrent ? (
                                <img src={mascot} alt="" className="h-8 w-8 object-contain" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rewards Shop */}
        <RewardsShop totalPoints={availablePoints} onSpendPoints={handleSpendPoints} />
      </div>

      <IPALibraryModal open={ipaOpen} onOpenChange={setIpaOpen} />
    </div>
  );
};

export default SpeechQuestPage;
