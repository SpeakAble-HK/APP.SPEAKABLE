import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Mic, Layers, Lock, CheckCircle, Star, Trophy, ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import mascot from "@/assets/mascot.png";
import { IPALibraryModal } from "@/components/IPALibraryModal";
import { RewardsShop } from "@/components/RewardsShop";
import { toast } from "@/hooks/use-toast";

interface QuestNode {
  id: number;
  type: 'read-aloud' | 'card-match';
  titleEn: string;
  titleTW: string;
  titleCN: string;
  points: number;
}

const questNodesData: QuestNode[] = [
  { id: 1, type: 'read-aloud', titleEn: 'Hello World', titleTW: '你好世界', titleCN: '你好世界', points: 50 },
  { id: 2, type: 'card-match', titleEn: 'Tone Pairs', titleTW: '聲調配對', titleCN: '声调配对', points: 75 },
  { id: 3, type: 'read-aloud', titleEn: 'Daily Greetings', titleTW: '日常問候', titleCN: '日常问候', points: 100 },
  { id: 4, type: 'card-match', titleEn: 'Initial Sounds', titleTW: '聲母', titleCN: '声母', points: 100 },
  { id: 5, type: 'read-aloud', titleEn: 'Food & Drinks', titleTW: '飲食', titleCN: '饮食', points: 125 },
  { id: 6, type: 'card-match', titleEn: 'Final Sounds', titleTW: '韻母', titleCN: '韵母', points: 125 },
  { id: 7, type: 'read-aloud', titleEn: 'Numbers & Counting', titleTW: '數字', titleCN: '数字', points: 150 },
  { id: 8, type: 'card-match', titleEn: 'Tone Challenge', titleTW: '聲調挑戰', titleCN: '声调挑战', points: 200 },
];

const QUEST_STORAGE_KEY = "speakable-quest-progress";

function loadProgress(): { completed: Set<number>; spentPoints: number } {
  try {
    const saved = localStorage.getItem(QUEST_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return { completed: new Set(data.completed || []), spentPoints: data.spentPoints || 0 };
    }
  } catch {}
  return { completed: new Set([1, 2]), spentPoints: 0 };
}

function saveProgress(completed: Set<number>, spentPoints: number) {
  localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify({ completed: [...completed], spentPoints }));
}

const SpeechQuestPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { stats } = useUserStats();
  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';

  const [ipaOpen, setIpaOpen] = useState(false);
  const [progress, setProgress] = useState(loadProgress);
  const [animatingNode, setAnimatingNode] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState<number | null>(null);

  const { completed, spentPoints } = progress;
  const totalEarned = questNodesData.filter(n => completed.has(n.id)).reduce((s, n) => s + n.points, 0);
  const availablePoints = totalEarned - spentPoints;
  const completedCount = completed.size;
  const progressPct = (completedCount / questNodesData.length) * 100;

  const isLocked = (node: QuestNode): boolean => {
    if (node.id <= 2) return false;
    return !completed.has(node.id - 1);
  };

  const handleCompleteQuest = useCallback((node: QuestNode) => {
    if (completed.has(node.id) || isLocked(node)) return;
    setAnimatingNode(node.id);
    setShowConfetti(node.id);
    setTimeout(() => {
      const newCompleted = new Set([...completed, node.id]);
      const newProgress = { completed: newCompleted, spentPoints };
      setProgress(newProgress);
      saveProgress(newCompleted, spentPoints);
      const name = isEn ? node.titleEn : isTW ? node.titleTW : node.titleCN;
      toast({ title: isEn ? "🎉 Quest Complete!" : isTW ? "🎉 任務完成！" : "🎉 任务完成！", description: `${name} — +${node.points} ${isEn ? 'pts' : '分'}` });
      setAnimatingNode(null);
      setTimeout(() => setShowConfetti(null), 1500);
    }, 600);
  }, [completed, spentPoints, isEn, isTW]);

  const handleSpendPoints = useCallback((amount: number) => {
    const newSpent = spentPoints + amount;
    const newProgress = { completed, spentPoints: newSpent };
    setProgress(newProgress);
    saveProgress(completed, newSpent);
  }, [completed, spentPoints]);

  const getTitle = (node: QuestNode) => isEn ? node.titleEn : isTW ? node.titleTW : node.titleCN;

  return (
    <div className="min-h-full bg-background">
      {/* Top Bar */}
      <div className="sticky top-14 z-20 bg-card border-b-2 border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <Link to="/home">
            <Button variant="ghost" size="sm" className="gap-2 min-h-[48px] font-bold">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{isEn ? 'Back' : isTW ? '返回' : '返回'}</span>
            </Button>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-extrabold text-foreground bg-accent/15 px-3 py-1 rounded-full">
              <Star className="h-4 w-4 text-accent" aria-hidden="true" />
              {availablePoints} {isEn ? 'pts' : '分'}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-bold">
              <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
              {completedCount}/{questNodesData.length}
            </div>
            <div className="w-16 sm:w-[100px]">
              <Progress value={progressPct} className="h-2.5 rounded-full" />
            </div>
            <Button onClick={() => setIpaOpen(true)} size="sm" className="gap-1.5 font-extrabold min-h-[48px] game-btn" style={{ boxShadow: '0 3px 0 hsl(var(--primary-dark))' }}>
              <BookOpen className="h-4 w-4" />
              IPA
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <img src={mascot} alt="" className="h-16 w-16 mx-auto mb-3 mascot-bounce" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
            {isEn ? 'Speech Quest' : isTW ? '語音冒險' : '语音冒险'} 🗺️
          </h1>
          <p className="text-muted-foreground">
            {isEn ? 'Complete quests to earn points and unlock rewards!' : isTW ? '完成任務賺取積分並解鎖獎勵！' : '完成任务赚取积分并解锁奖励！'}
          </p>
        </div>

        {/* Progression Path */}
        <div className="relative w-[90%] max-w-md mx-auto">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border rounded-full -translate-x-1/2" aria-hidden="true" />
          <div className="space-y-6 relative">
            {questNodesData.map((node, index) => {
              const isLeft = index % 2 === 0;
              const nodeCompleted = completed.has(node.id);
              const nodeLocked = isLocked(node);
              const isAnimating = animatingNode === node.id;
              const hasConfetti = showConfetti === node.id;

              return (
                <div key={node.id} className={`flex items-center gap-3 sm:gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
                    <Card
                      className={`speech-quest-node inline-block w-full max-w-[280px] transition-all duration-300 border-2 rounded-2xl ${
                        isAnimating ? 'scale-105 border-accent ring-2 ring-accent/40 shadow-lg'
                          : nodeLocked ? 'opacity-50 cursor-not-allowed border-border'
                          : nodeCompleted ? 'border-success/40 bg-success/5'
                          : 'border-primary/30 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                      }`}
                      onClick={() => !nodeCompleted && !nodeLocked && handleCompleteQuest(node)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {node.type === 'read-aloud' ? (
                            <Mic className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                          ) : (
                            <Layers className="h-4 w-4 text-accent flex-shrink-0" aria-hidden="true" />
                          )}
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                            {node.type === 'read-aloud' ? (isEn ? 'Read Aloud' : isTW ? '朗讀' : '朗读') : (isEn ? 'Card Match' : isTW ? '卡片配對' : '卡片配对')}
                          </span>
                        </div>
                        <p className="font-extrabold text-foreground text-sm mb-1">{getTitle(node)}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 text-accent" aria-hidden="true" />
                          {node.points} {isEn ? 'pts' : '分'}
                        </div>
                        {!nodeCompleted && !nodeLocked && (
                          <p className="text-[10px] text-primary mt-2 font-extrabold">
                            {isEn ? '▶ Tap to complete' : isTW ? '▶ 點擊完成' : '▶ 点击完成'}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Center Node */}
                  <div className="relative">
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-full border-3 transition-all duration-500 ${
                      isAnimating ? 'bg-accent border-accent scale-125'
                        : nodeLocked ? 'bg-muted border-border'
                        : nodeCompleted ? 'bg-success border-success'
                        : 'bg-primary border-primary animate-pulse'
                    }`}>
                      {isAnimating ? <Sparkles className="h-5 w-5 text-white animate-spin" />
                        : nodeLocked ? <Lock className="h-4 w-4 text-muted-foreground" />
                        : nodeCompleted ? <CheckCircle className="h-5 w-5 text-white" />
                        : <img src={mascot} alt="" className="h-8 w-8 object-contain" />}
                    </div>
                    {hasConfetti && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {['🎉', '⭐', '✨', '🌟'].map((emoji, i) => (
                          <span key={i} className="absolute text-lg animate-ping" style={{ animationDuration: `${0.6 + i * 0.15}s`, transform: `translate(${(i % 2 === 0 ? -1 : 1) * (16 + i * 8)}px, ${(i < 2 ? -1 : 1) * (16 + i * 6)}px)` }}>
                            {emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground font-bold">
          <div className="flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {isEn ? 'Read Aloud' : isTW ? '朗讀' : '朗读'}
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {isEn ? 'Card Match' : isTW ? '卡片配對' : '卡片配对'}
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            {isEn ? 'Locked' : isTW ? '已鎖定' : '已锁定'}
          </div>
        </div>

        <RewardsShop totalPoints={availablePoints} onSpendPoints={handleSpendPoints} />
      </div>

      <IPALibraryModal open={ipaOpen} onOpenChange={setIpaOpen} />
    </div>
  );
};

export default SpeechQuestPage;
