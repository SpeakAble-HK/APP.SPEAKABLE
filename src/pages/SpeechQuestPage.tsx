import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Mic, Layers, Lock, CheckCircle, Star, Trophy, ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import logo from "@/assets/logo.png";
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
    // Unlock if previous node is completed
    return !completed.has(node.id - 1);
  };

  const handleCompleteQuest = useCallback((node: QuestNode) => {
    if (completed.has(node.id) || isLocked(node)) return;

    // Start animation
    setAnimatingNode(node.id);
    setShowConfetti(node.id);

    setTimeout(() => {
      const newCompleted = new Set([...completed, node.id]);
      const newProgress = { completed: newCompleted, spentPoints };
      setProgress(newProgress);
      saveProgress(newCompleted, spentPoints);

      const name = isEn ? node.titleEn : isTW ? node.titleTW : node.titleCN;
      toast({
        title: isEn ? "🎉 Quest Complete!" : isTW ? "🎉 任務完成！" : "🎉 任务完成！",
        description: `${name} — +${node.points} ${isEn ? 'pts' : '分'}`,
      });

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
      {/* Top Bar: Back + Points */}
      <div className="sticky top-14 z-20 bg-card/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {isEn ? 'Back to Home' : isTW ? '返回首頁' : '返回首页'}
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
              {availablePoints} {isEn ? 'pts' : '分'}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
              {completedCount}/{questNodesData.length}
            </div>
            <div className="max-w-[120px]">
              <Progress value={progressPct} className="h-2" />
            </div>
            <Button
              onClick={() => setIpaOpen(true)}
              size="sm"
              className="gap-1.5 font-bold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-lg transition-all duration-200"
            >
              <BookOpen className="h-4 w-4" />
              {isEn ? 'IPA Library' : isTW ? 'IPA 音標庫' : 'IPA 音标库'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {isEn ? 'Speech Quest' : isTW ? '語音冒險' : '语音冒险'}
          </h1>
          <p className="text-muted-foreground">
            {isEn ? 'Master Cantonese pronunciation one quest at a time.' : isTW ? '一步一步掌握廣東話發音。' : '一步一步掌握广东话发音。'}
          </p>
        </div>

        {/* Progression Path */}
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" aria-hidden="true" />

          <div className="space-y-6 relative">
            {questNodesData.map((node, index) => {
              const isLeft = index % 2 === 0;
              const nodeCompleted = completed.has(node.id);
              const nodeLocked = isLocked(node);
              const isAnimating = animatingNode === node.id;
              const hasConfetti = showConfetti === node.id;

              return (
                <div key={node.id} className={`flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Card */}
                  <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
                    <Card
                      className={`speech-quest-node inline-block max-w-[280px] w-full transition-all duration-300 ${
                        isAnimating
                          ? 'scale-105 border-primary ring-2 ring-primary/40 shadow-lg'
                          : nodeLocked
                            ? 'opacity-50 cursor-not-allowed'
                            : nodeCompleted
                              ? 'border-green-500/30 bg-green-500/5 hover:shadow-[var(--shadow-card-hover)]'
                              : 'border-primary/30 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 cursor-pointer'
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
                          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            {node.type === 'read-aloud'
                              ? (isEn ? 'Read Aloud' : isTW ? '朗讀' : '朗读')
                              : (isEn ? 'Card Match' : isTW ? '卡片配對' : '卡片配对')}
                          </span>
                        </div>
                        <p className="font-semibold text-foreground text-sm mb-1">{getTitle(node)}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 text-yellow-500" aria-hidden="true" />
                          {node.points} {isEn ? 'pts' : '分'}
                        </div>
                        {!nodeCompleted && !nodeLocked && (
                          <p className="text-[10px] text-primary mt-2 font-medium">
                            {isEn ? '▶ Tap to complete' : isTW ? '▶ 點擊完成' : '▶ 点击完成'}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Center Node */}
                  <div className="relative">
                    <div className={`speech-quest-circle relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 ${
                      isAnimating
                        ? 'bg-yellow-400 border-yellow-400 scale-125'
                        : nodeLocked
                          ? 'bg-muted border-border'
                          : nodeCompleted
                            ? 'bg-green-500 border-green-500'
                            : 'bg-primary border-primary animate-pulse'
                    }`}>
                      {isAnimating ? (
                        <Sparkles className="h-5 w-5 text-white animate-spin" aria-hidden="true" />
                      ) : nodeLocked ? (
                        <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      ) : nodeCompleted ? (
                        <CheckCircle className="h-5 w-5 text-white" aria-hidden="true" />
                      ) : (
                        <img src={logo} alt="" className="h-7 w-7 object-contain" />
                      )}
                    </div>
                    {/* Confetti burst */}
                    {hasConfetti && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {['🎉', '⭐', '✨', '🌟'].map((emoji, i) => (
                          <span
                            key={i}
                            className="absolute text-lg animate-ping"
                            style={{
                              animationDuration: `${0.6 + i * 0.15}s`,
                              transform: `translate(${(i % 2 === 0 ? -1 : 1) * (16 + i * 8)}px, ${(i < 2 ? -1 : 1) * (16 + i * 6)}px)`,
                            }}
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {isEn ? 'Read Aloud Articulation' : isTW ? '朗讀發音' : '朗读发音'}
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {isEn ? 'Card Matching' : isTW ? '卡片配對' : '卡片配对'}
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            {isEn ? 'Locked' : isTW ? '已鎖定' : '已锁定'}
          </div>
        </div>

        {/* Rewards Shop */}
        <RewardsShop totalPoints={availablePoints} onSpendPoints={handleSpendPoints} />
      </div>

      {/* IPA Library Modal */}
      <IPALibraryModal open={ipaOpen} onOpenChange={setIpaOpen} />
    </div>
  );
};

export default SpeechQuestPage;
