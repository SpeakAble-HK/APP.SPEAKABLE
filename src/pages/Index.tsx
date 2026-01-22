import { Link } from "react-router-dom";
import { Mic, BarChart3, Sparkles, Target, TrendingUp, Flame, Mic2, Cpu } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  // Mock data - replace with real data when connected to backend
  const userStats = {
    dailyGoalMinutes: 15,
    dailyGoalProgress: 60,
    fluencyScore: 87,
    fluencyChange: 2,
    streakDays: 5,
    bestStreak: 12
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Guest';

  return (
    <div className="hero-gradient min-h-full">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
            {t("dashboard.hello")}, {displayName}
            <div className="wave-visualizer">
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
            </div>
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("dashboard.subtitle")}
          </p>
        </div>

        {/* AI Insight Banner */}
        <div className="bg-primary rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary-foreground/20">
            <Cpu className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-primary-foreground">{t("dashboard.aiInsight")}</p>
            <p className="text-sm text-primary-foreground/90">
              {t("dashboard.aiInsightText")}
            </p>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Daily Goal Card */}
          <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {userStats.dailyGoalMinutes} <span className="text-lg font-normal text-muted-foreground">{t("dashboard.min")}</span>
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("dashboard.dailyGoal")}</p>
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Progress value={userStats.dailyGoalProgress} className="h-2" />
          </div>

          {/* Fluency Score Card */}
          <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {userStats.fluencyScore}<span className="text-lg font-normal text-muted-foreground">%</span>
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("dashboard.fluencyScore")}</p>
              </div>
              <div className="p-2 rounded-full bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
            <p className="text-sm text-primary font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{userStats.fluencyChange}% {t("dashboard.thisWeek")}
            </p>
          </div>

          {/* Streak Card */}
          <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {userStats.streakDays} <span className="text-lg font-normal text-muted-foreground">{t("dashboard.days")}</span>
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("dashboard.streak")}</p>
              </div>
              <div className="p-2 rounded-full bg-destructive/10">
                <Flame className="h-5 w-5 text-destructive" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.best")}: {userStats.bestStreak} {t("dashboard.days")}
            </p>
          </div>
        </div>

        {/* Start Training Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{t("dashboard.startTraining")}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Voice Lab Card */}
            <Link to="/pronunciation" className="group">
              <div className="bg-card border border-border rounded-2xl p-6 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 hover:border-primary/30">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <Mic2 className="h-6 w-6 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("dashboard.voiceLabTitle")}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4">
                  {t("dashboard.voiceLabDesc")}
                </p>
                
                <div className="inline-flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all text-sm">
                  {t("dashboard.startNow")}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>

            {/* Learning & Progress Card */}
            <Link to="/learning" className="group">
              <div className="bg-card border border-border rounded-2xl p-6 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 hover:border-accent/30">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-4 group-hover:bg-accent/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("dashboard.learningProgress")}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4">
                  {t("dashboard.learningProgressDesc")}
                </p>
                
                <div className="inline-flex items-center text-accent font-medium group-hover:gap-3 gap-2 transition-all text-sm">
                  {t("dashboard.viewLearning")}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
