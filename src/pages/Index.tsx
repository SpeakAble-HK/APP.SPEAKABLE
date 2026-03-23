import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mic, Stethoscope, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import mascot from "@/assets/mascot.png";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useRole();

  // Redirect logged-in users with a role to their dashboard
  if (user && role === 'explorer') {
    navigate('/explorer', { replace: true });
    return null;
  }
  if (user && role === 'therapist') {
    navigate('/st-dashboard', { replace: true });
    return null;
  }

  return (
    <div className="min-h-full bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-12 pb-8">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <img src={mascot} alt="SpeakAble mascot" className="h-28 w-28 object-contain mascot-bounce mb-6" />
          <h1 className="text-4xl font-extrabold text-foreground leading-tight mb-3">
            用你嘅聲音學習
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mb-8">
            個人化言語治療居家訓練
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mb-12">
            <Button
              onClick={() => navigate(user ? '/role-select' : '/auth?tab=signup')}
              className="flex-1 h-14 text-lg font-extrabold rounded-2xl game-btn gap-2"
              style={{ boxShadow: '0 5px 0 hsl(var(--primary-dark))' }}
            >
              開始使用
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate(user ? '/role-select' : '/auth?tab=signup')}
              variant="outline"
              className="flex-1 h-14 text-lg font-bold rounded-2xl border-2 border-primary/30 hover:bg-primary/5 gap-2"
            >
              <Stethoscope className="h-5 w-5 text-primary" />
              我是言語治療師
            </Button>
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="px-4 pb-12">
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Therapist Card */}
          <button
            onClick={() => navigate(user ? '/role-select' : '/auth?tab=signup')}
            className="bg-card border-2 border-border rounded-2xl p-6 text-center hover:-translate-y-1 transition-all hover:shadow-lg hover:border-primary/30 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-1">言語治療師</h3>
            <p className="text-sm text-muted-foreground">管理學生進度及指定練習</p>
          </button>

          {/* Explorer Card */}
          <button
            onClick={() => navigate(user ? '/role-select' : '/auth?tab=signup')}
            className="bg-card border-2 border-border rounded-2xl p-6 text-center hover:-translate-y-1 transition-all hover:shadow-lg hover:border-accent/30 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Mic className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-1">語音探險家</h3>
            <p className="text-sm text-muted-foreground">透過遊戲練習發音</p>
          </button>

          {/* Public Resources Card */}
          <button
            onClick={() => navigate('/resources')}
            className="bg-card border-2 border-border rounded-2xl p-6 text-center hover:-translate-y-1 transition-all hover:shadow-lg hover:border-success/30 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-1">公眾資訊</h3>
            <p className="text-sm text-muted-foreground">言語治療介紹及資源</p>
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-primary/5 border-2 border-primary/15 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-extrabold text-foreground mb-2">
              為兒童設計的語音訓練平台
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              結合 AI 語音分析和遊戲化學習，讓每個孩子都能快樂地練習發音。
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              {[
                { icon: '🎮', label: '遊戲化練習' },
                { icon: '🤖', label: 'AI 即時反饋' },
                { icon: '📊', label: '進度追蹤' },
              ].map((f, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-3">
                  <span className="text-2xl block mb-1">{f.icon}</span>
                  <span className="text-xs font-bold text-foreground">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
