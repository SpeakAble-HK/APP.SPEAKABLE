import { useState } from "react";
import { Lock, CheckCircle, Star, Trophy, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { IPALibraryModal } from "@/components/IPALibraryModal";
import { RewardsShop } from "@/components/RewardsShop";
import { QuestSentenceExercise } from "@/components/QuestSentenceExercise";
import { questWorldsData, QuestLessonData } from "@/data/questLessons";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { toast } from "@/hooks/use-toast";
import mascot from "@/assets/mascot.png";

const SpeechQuestPage = () => {
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const [ipaOpen, setIpaOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<QuestLessonData | null>(null);

  const {
    getLessonStatus,
    completeLesson,
    spendPoints,
    availablePoints,
    completedCount,
    totalLessons,
  } = useQuestProgress();

  const progressPct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const getTitle = (item: { titleEn: string; titleTW: string; titleCN: string }) =>
    isEn ? item.titleEn : isTW ? item.titleTW : item.titleCN;

  const isWorldUnlocked = (worldIndex: number): boolean => {
    if (worldIndex === 0) return true;
    const prevWorld = questWorldsData[worldIndex - 1];
    return prevWorld.lessons.every(l => getLessonStatus(l.lesson_id) === "completed");
  };

  const getWorldProgress = (worldIndex: number): number => {
    const world = questWorldsData[worldIndex];
    const done = world.lessons.filter(l => getLessonStatus(l.lesson_id) === "completed").length;
    return world.lessons.length > 0 ? (done / world.lessons.length) * 100 : 0;
  };

  const handleLessonTap = (lesson: QuestLessonData) => {
    const status = getLessonStatus(lesson.lesson_id);
    if (status === "locked") return;
    // Allow replaying completed lessons too
    setActiveLesson(lesson);
  };

  const handleLessonComplete = async (xpEarned: number, accuracy: number) => {
    if (!activeLesson) return;
    const status = getLessonStatus(activeLesson.lesson_id);

    if (accuracy >= 70 && status !== "completed") {
      await completeLesson(activeLesson.lesson_id, xpEarned);
      toast({
        title: isEn ? "🎉 Lesson Complete!" : isTW ? "🎉 課程完成！" : "🎉 课程完成！",
        description: `+${xpEarned} XP (${accuracy}%)`,
      });
    } else if (accuracy < 70) {
      toast({
        title: isEn ? "Keep trying!" : isTW ? "繼續努力！" : "继续努力！",
        description: isEn ? `${accuracy}% — You need 70% to pass.` : `${accuracy}% — 需要 70% 才能通過。`,
      });
    }

    setActiveLesson(null);
  };

  // ─── EXERCISE MODE ───
  if (activeLesson) {
    return (
      <QuestSentenceExercise
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
          {questWorldsData.map((world, wi) => {
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
                  <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border rounded-full -translate-x-1/2" aria-hidden="true" />

                  <div className="space-y-5 relative">
                    {world.lessons.map((lesson, li) => {
                      const isLeft = li % 2 === 0;
                      const status = getLessonStatus(lesson.lesson_id);
                      const lessonDone = status === "completed";
                      const isCurrent = status === "unlocked";

                      return (
                        <div key={lesson.lesson_id} className={`flex items-center gap-3 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                          {/* Card */}
                          <div className={`flex-1 ${isLeft ? "text-right" : "text-left"}`}>
                            <button
                              onClick={() => handleLessonTap(lesson)}
                              disabled={status === "locked"}
                              className={`inline-block w-full max-w-[240px] text-left border-2 rounded-2xl p-3 transition-all ${
                                lessonDone
                                  ? "border-success/30 bg-success/5 cursor-pointer hover:bg-success/10"
                                  : isCurrent
                                  ? "border-primary/40 bg-card hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                                  : "border-border bg-muted/30 cursor-not-allowed opacity-60"
                              }`}
                            >
                              <p className="text-sm font-extrabold text-foreground leading-tight">{lesson.sentence}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{lesson.english_translation}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Star className="h-3 w-3 text-accent" aria-hidden="true" />
                                {lesson.xp_reward} XP
                              </div>
                              {isCurrent && (
                                <div className="flex items-center gap-1 text-xs text-primary mt-1.5 font-extrabold">
                                  <ChevronRight className="h-3 w-3" />
                                  {isEn ? "Start" : "開始"}
                                </div>
                              )}
                              {lessonDone && (
                                <div className="flex items-center gap-1 text-xs text-success mt-1 font-bold">
                                  <CheckCircle className="h-3 w-3" />
                                  {isEn ? "Completed" : "已完成"}
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
        <RewardsShop totalPoints={availablePoints} onSpendPoints={spendPoints} />
      </div>

      <IPALibraryModal open={ipaOpen} onOpenChange={setIpaOpen} />
    </div>
  );
};

export default SpeechQuestPage;
