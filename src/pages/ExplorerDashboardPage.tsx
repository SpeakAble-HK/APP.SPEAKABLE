import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Flame, MapPin, BookOpen } from "lucide-react";
import mascot from "@/assets/mascot.png";

export default function ExplorerDashboardPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('探險家');

  useEffect(() => {
    const stored = sessionStorage.getItem('explorer_nickname');
    if (stored) setNickname(stored);
  }, []);

  // Local progress from sessionStorage
  const getLocalProgress = () => {
    try {
      return JSON.parse(sessionStorage.getItem('lesson_progress') || '{}');
    } catch { return {}; }
  };

  const progress = getLocalProgress();
  const completedCount = Object.values(progress).filter((p: any) => p.completed).length;
  const totalXp = Object.values(progress).reduce((sum: number, p: any) => sum + (p.xp_earned || 0), 0) as number;

  return (
    <div className="min-h-full bg-background">
      {/* Header greeting */}
      <section className="px-4 pt-8 pb-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <img src={mascot} alt="" className="h-16 w-16 object-contain mascot-bounce" />
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">
              你好，{nickname}！👋
            </h1>
            <p className="text-sm text-muted-foreground">今日想練習咩？</p>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-2">
                <Star className="h-5 w-5 text-accent" />
              </div>
              <p className="text-2xl font-extrabold text-foreground">{totalXp}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">XP</p>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center mx-auto mb-2">
                <Flame className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-2xl font-extrabold text-foreground">0</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">連續天數</p>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center mx-auto mb-2">
                <BookOpen className="h-5 w-5 text-success" />
              </div>
              <p className="text-2xl font-extrabold text-foreground">{completedCount}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">已完成</p>
            </div>
          </div>
        </div>
      </section>

      {/* Island Buttons */}
      <section className="px-4 pb-8">
        <div className="max-w-2xl mx-auto grid grid-cols-1 gap-4">
          <button
            onClick={() => navigate('/speech-quest?island=phonetic')}
            className="bg-primary text-primary-foreground rounded-2xl p-6 text-left hover:-translate-y-1 transition-all active:translate-y-0.5"
            style={{ boxShadow: '0 6px 0 hsl(var(--primary-dark))' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 min-w-[64px] rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <span className="text-2xl font-extrabold block">發音小島</span>
                <span className="text-sm font-medium text-primary-foreground/80">練習聲母和韻母發音</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/speech-quest?island=semantic')}
            className="bg-accent text-accent-foreground rounded-2xl p-6 text-left hover:-translate-y-1 transition-all active:translate-y-0.5"
            style={{ boxShadow: '0 6px 0 hsl(38 95% 48%)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 min-w-[64px] rounded-2xl bg-accent-foreground/10 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-accent-foreground" />
              </div>
              <div>
                <span className="text-2xl font-extrabold block">語義小島</span>
                <span className="text-sm font-medium text-accent-foreground/80">學習詞彙和句子</span>
              </div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
