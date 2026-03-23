import { useNavigate } from "react-router-dom";
import { Star, Flame, MapPin, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useExplorerProfile } from "@/hooks/useExplorerProfile";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useStreak } from "@/hooks/useStreak";
import mascot from "@/assets/mascot.png";

export default function ExplorerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { explorerProfile } = useExplorerProfile();
  const { totalXp, completedCount } = useLessonProgress();
  const { streakDays } = useStreak();

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-full bg-background">
      {/* Header greeting */}
      <section className="px-4 pt-8 pb-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <img src={mascot} alt="" className="h-16 w-16 object-contain mascot-bounce" />
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">
              你好，{explorerProfile?.nickname || '探險家'}！👋
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
              <p className="text-2xl font-extrabold text-foreground">{streakDays}</p>
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

      {/* Weekly Activity Chart Placeholder */}
      <section className="px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border-2 border-border rounded-2xl p-5">
            <h2 className="text-sm font-extrabold text-foreground mb-3">本週活動</h2>
            <div className="flex items-end justify-between gap-2 h-24">
              {['一', '二', '三', '四', '五', '六', '日'].map((day, i) => {
                const height = Math.random() * 80 + 10;
                const isToday = i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0);
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-lg transition-all ${isToday ? 'bg-primary' : 'bg-primary/20'}`}
                      style={{ height: `${height}%` }}
                    />
                    <span className={`text-[10px] font-bold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Island Buttons */}
      <section className="px-4 pb-8">
        <div className="max-w-2xl mx-auto grid grid-cols-1 gap-4">
          {/* Phonetic Island */}
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

          {/* Semantic Island */}
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
