import { useState } from "react";
import { Star, Trophy, BookOpen, ShoppingBag, Flame, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useVoiceProfile } from "@/hooks/useVoiceProfile";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { useStreak } from "@/hooks/useStreak";
import { useAchievements } from "@/hooks/useAchievements";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { IPALibraryModal } from "@/components/IPALibraryModal";
import { RewardsShop } from "@/components/RewardsShop";
import { AchievementsList } from "@/components/AchievementsList";
import { DailyChallengesCard } from "@/components/DailyChallengesCard";
import { QuestSentenceExercise } from "@/components/QuestSentenceExercise";
import { QuestWorldList } from "@/components/QuestWorldList";
import { QuestLessonList } from "@/components/QuestLessonList";
import { VoiceCloneGateModal } from "@/components/VoiceCloneGateModal";
import { VoiceOnboarding } from "@/components/VoiceOnboarding";
import { QuestLessonData, QuestWorldData } from "@/data/questLessons";
import { toast } from "@/hooks/use-toast";
import parrot from "@/assets/quest-parrot.png";

type View = "hub" | "worlds" | "lessons" | "exercise" | "redeem" | "achievements";

const SpeechQuestPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { hasVoiceProfile, loading: vpLoading, markProfileCreated } = useVoiceProfile(user?.id);

  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const [view, setView] = useState<View>("hub");
  const [selectedWorld, setSelectedWorld] = useState<{ world: QuestWorldData; index: number } | null>(null);
  const [activeLesson, setActiveLesson] = useState<QuestLessonData | null>(null);
  const [ipaOpen, setIpaOpen] = useState(false);

  // Voice clone gate state
  const [showGate, setShowGate] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [skippedClone, setSkippedClone] = useState(false);

  const {
    progress,
    getLessonStatus,
    completeLesson,
    spendPoints,
    availablePoints,
    completedCount,
    totalLessons,
  } = useQuestProgress();

  const { streakDays, bestStreak, recordActivity } = useStreak();
  const { unlockedIds, unlockedCount, totalCount, allAchievements, checkAndUnlock } = useAchievements();
  const { challenges, completedIds: challengeCompletedIds, recordLessonCompleted, checkAndCompleteChallenges } = useDailyChallenges();


  const progressPct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
  const dailyTasks = Math.min(completedCount * 2, 10);
  const allLocked = !hasVoiceProfile && skippedClone;

  const handleStartPractice = () => {
    if (vpLoading) return;
    if (hasVoiceProfile) {
      setView("worlds");
    } else {
      setShowGate(true);
    }
  };

  const handleGateStartClone = () => {
    setShowGate(false);
    setShowOnboarding(true);
  };

  const handleGateSkip = () => {
    setShowGate(false);
    setSkippedClone(true);
    setView("worlds");
  };

  const handleOnboardingComplete = async () => {
    if (user?.id) await markProfileCreated(user.id);
    setShowOnboarding(false);
    setSkippedClone(false);
    setView("worlds");
  };

  const handleSelectWorld = (world: QuestWorldData, index: number) => {
    setSelectedWorld({ world, index });
    setView("lessons");
  };

  const handleSelectLesson = (lesson: QuestLessonData) => {
    setActiveLesson(lesson);
    setView("exercise");
  };

  const handleLessonComplete = async (xpEarned: number, accuracy: number) => {
    if (!activeLesson) return;
    const status = getLessonStatus(activeLesson.lesson_id);

    if (accuracy >= 70 && status !== "completed") {
      // Record streak & get bonus
      const { newStreak, bonusXp } = await recordActivity();
      const totalXpEarned = xpEarned + bonusXp;

      await completeLesson(activeLesson.lesson_id, totalXpEarned);

      // Check achievements
      const newCompleted = new Set([...progress.completedLessons, activeLesson.lesson_id]);
      await checkAndUnlock({
        completedLessons: newCompleted,
        totalXp: progress.totalXp + totalXpEarned,
        streakDays: newStreak,
      });

      const parts = [`+${xpEarned} XP (${accuracy}%)`];
      if (bonusXp > 0) parts.push(`🔥 +${bonusXp} streak bonus!`);
      if (newStreak > 1) parts.push(`${newStreak}-day streak!`);

      toast({
        title: isEn ? "🎉 Lesson Complete!" : isTW ? "🎉 課程完成！" : "🎉 课程完成！",
        description: parts.join(" • "),
      });
    } else if (accuracy < 70) {
      toast({
        title: isEn ? "Keep trying!" : isTW ? "繼續努力！" : "继续努力！",
        description: isEn ? `${accuracy}% — You need 70% to pass.` : `${accuracy}% — 需要 70% 才能通過。`,
      });
    }

    setActiveLesson(null);
    setView("lessons");
  };

  // ─── VOICE CLONE GATE MODAL ───
  if (showGate) {
    return <VoiceCloneGateModal onStartClone={handleGateStartClone} onSkip={handleGateSkip} />;
  }

  // ─── VOICE ONBOARDING ───
  if (showOnboarding) {
    return (
      <VoiceOnboarding
        onComplete={handleOnboardingComplete}
        onCancel={() => { setShowOnboarding(false); setSkippedClone(true); setView("worlds"); }}
      />
    );
  }

  // ─── EXERCISE MODE ───
  if (view === "exercise" && activeLesson) {
    return (
      <QuestSentenceExercise
        lesson={activeLesson}
        onComplete={handleLessonComplete}
        onExit={() => { setActiveLesson(null); setView("lessons"); }}
      />
    );
  }

  // ─── TOP BAR ───
  const topBar = (
    <div className="sticky top-0 z-20 bg-card border-b-2 border-border px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-extrabold text-foreground bg-accent/15 px-3 py-1 rounded-full">
          <Star className="h-4 w-4 text-accent" aria-hidden="true" />
          {availablePoints}
        </div>
        {/* Streak */}
        <div className={`flex items-center gap-1 text-sm font-extrabold px-3 py-1 rounded-full ${
          streakDays >= 3 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
        }`}>
          <Flame className="h-4 w-4" aria-hidden="true" />
          {streakDays}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-bold">
          <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
          {dailyTasks}/10
        </div>
        <div className="w-14">
          <Progress value={progressPct} className="h-2.5 rounded-full" />
        </div>
        <Button onClick={() => setIpaOpen(true)} size="sm" className="gap-1 font-extrabold min-h-[48px] game-btn" style={{ boxShadow: "0 3px 0 hsl(var(--primary-dark))" }}>
          <BookOpen className="h-4 w-4" />
          IPA
        </Button>
      </div>
    </div>
  );

  // ─── HUB VIEW ───
  if (view === "hub") {
    return (
      <div className="min-h-full bg-background">
        {topBar}
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center">
          <img src={parrot} alt="Speech Quest Parrot" className="h-48 w-48 md:h-56 md:w-56 mx-auto mb-6 mascot-bounce drop-shadow-lg" />

          <h1 className="text-3xl font-extrabold text-foreground mb-2 text-center">
            {isEn ? "Speech Quest" : isTW ? "語音冒險" : "语音冒险"} 🗺️
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            {isEn ? "Practice Cantonese and earn rewards!" : isTW ? "練習廣東話，賺取獎勵！" : "练习广东话，赚取奖励！"}
          </p>

          {/* Streak card */}
          <div className="w-full max-w-xs bg-card border-2 border-border rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                <Flame className={`h-4 w-4 ${streakDays >= 3 ? "text-destructive" : "text-muted-foreground"}`} />
                {isEn ? "Streak" : isTW ? "連續天數" : "连续天数"}
              </span>
              <span className={`text-sm font-extrabold ${streakDays >= 3 ? "text-destructive" : "text-primary"}`}>
                {streakDays} {isEn ? "days" : "天"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isEn ? `Best: ${bestStreak} days` : isTW ? `最佳：${bestStreak} 天` : `最佳：${bestStreak} 天`}
              {streakDays >= 3 && (isEn ? " • Bonus XP active! 🔥" : " • 額外 XP 已啟動！🔥")}
            </p>
          </div>

          {/* Daily progress */}
          <div className="w-full max-w-xs bg-card border-2 border-border rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-muted-foreground">
                {isEn ? "Daily Tasks" : isTW ? "每日任務" : "每日任务"}
              </span>
              <span className="text-sm font-extrabold text-primary">{dailyTasks}/10</span>
            </div>
            <Progress value={dailyTasks * 10} className="h-3 rounded-full" />
          </div>

          {/* Achievements preview */}
          <button
            onClick={() => setView("achievements")}
            className="w-full max-w-xs bg-card border-2 border-border rounded-2xl p-4 mb-8 flex items-center gap-3 hover:shadow-md transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
              <Award className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-foreground">
                {isEn ? "Achievements" : isTW ? "成就" : "成就"}
              </p>
              <p className="text-xs text-muted-foreground">
                {unlockedCount}/{totalCount} {isEn ? "unlocked" : isTW ? "已解鎖" : "已解锁"}
              </p>
            </div>
            <div className="flex -space-x-1">
              {allAchievements.filter(a => unlockedIds.has(a.id)).slice(0, 3).map(a => (
                <span key={a.id} className="text-lg">{a.emoji}</span>
              ))}
            </div>
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-4 w-full max-w-xs">
            <Button
              onClick={handleStartPractice}
              className="flex-1 h-16 text-lg font-extrabold rounded-full game-btn gap-2"
              style={{ boxShadow: "0 5px 0 hsl(var(--primary-dark))", background: "hsl(var(--success))" }}
            >
              {isEn ? "Start Practice" : isTW ? "開始練習" : "开始练习"}
            </Button>
            <Button
              onClick={() => setView("redeem")}
              variant="outline"
              className="h-16 w-16 rounded-full shrink-0 border-2 border-accent/50 hover:bg-accent/10"
              aria-label={isEn ? "Redeem" : "兌換"}
            >
              <ShoppingBag className="h-6 w-6 text-accent" />
            </Button>
          </div>
        </div>
        <IPALibraryModal open={ipaOpen} onOpenChange={setIpaOpen} />
      </div>
    );
  }

  // ─── ACHIEVEMENTS VIEW ───
  if (view === "achievements") {
    return (
      <div className="min-h-full bg-background">
        {topBar}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <AchievementsList
            allAchievements={allAchievements}
            unlockedIds={unlockedIds}
            onClose={() => setView("hub")}
          />
        </div>
        <IPALibraryModal open={ipaOpen} onOpenChange={setIpaOpen} />
      </div>
    );
  }

  // ─── REDEEM VIEW ───
  if (view === "redeem") {
    return (
      <div className="min-h-full bg-background">
        {topBar}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button onClick={() => setView("hub")} className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-4">
            ← {isEn ? "Back" : "返回"}
          </button>
          <RewardsShop totalPoints={availablePoints} onSpendPoints={spendPoints} />
        </div>
        <IPALibraryModal open={ipaOpen} onOpenChange={setIpaOpen} />
      </div>
    );
  }

  // ─── WORLDS VIEW ───
  if (view === "worlds") {
    return (
      <div className="min-h-full bg-background">
        {topBar}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <QuestWorldList onSelectWorld={handleSelectWorld} onBack={() => setView("hub")} allLocked={allLocked} />
        </div>
        <IPALibraryModal open={ipaOpen} onOpenChange={setIpaOpen} />
      </div>
    );
  }

  // ─── LESSONS VIEW ───
  if (view === "lessons" && selectedWorld) {
    return (
      <div className="min-h-full bg-background">
        {topBar}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <QuestLessonList
            world={selectedWorld.world}
            worldIndex={selectedWorld.index}
            onSelectLesson={handleSelectLesson}
            onBack={() => setView("worlds")}
            allLocked={allLocked}
          />
        </div>
        <IPALibraryModal open={ipaOpen} onOpenChange={setIpaOpen} />
      </div>
    );
  }

  return null;
};

export default SpeechQuestPage;
