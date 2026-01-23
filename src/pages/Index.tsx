import { Link } from "react-router-dom";
import { Mic, BarChart3, Sparkles, Target, TrendingUp, Flame, Mic2, Cpu } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserStats } from "@/hooks/useUserStats";
import { usePronunciationResults } from "@/hooks/usePronunciationResults";

const Index = () => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const { stats, dailyGoalProgress } = useUserStats();
  const { results } = usePronunciationResults();

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Guest';

  // Calculate AI insight from real pronunciation data
  const getAiInsight = () => {
    if (!user || results.length === 0) {
      return {
        hasData: false,
        text: language === 'en-GB' 
          ? "Complete your first Voice Lab session to get personalized insights!"
          : language === 'zh-TW'
          ? "完成您的第一次語音實驗室練習以獲得個人化洞察！"
          : "完成您的第一次语音实验室练习以获得个性化洞察！"
      };
    }

    // Calculate average accuracies from recent results (last 5)
    const recentResults = results.slice(0, 5);
    const avgOverall = Math.round(recentResults.reduce((sum, r) => sum + r.overall_accuracy, 0) / recentResults.length);
    const avgVowel = Math.round(recentResults.reduce((sum, r) => sum + r.initial_accuracy, 0) / recentResults.length);
    const avgConsonant = Math.round(recentResults.reduce((sum, r) => sum + r.final_accuracy, 0) / recentResults.length);
    const avgTone = Math.round(recentResults.reduce((sum, r) => sum + r.tone_accuracy, 0) / recentResults.length);

    // Find weakest area
    const areas = [
      { name: language === 'en-GB' ? 'vowels' : '元音', score: avgVowel },
      { name: language === 'en-GB' ? 'consonants' : '辅音', score: avgConsonant },
      { name: language === 'en-GB' ? 'tones' : '声调', score: avgTone },
    ];
    const weakest = areas.reduce((min, area) => area.score < min.score ? area : min, areas[0]);
    const strongest = areas.reduce((max, area) => area.score > max.score ? area : max, areas[0]);

    // Calculate improvement if we have older results
    let improvement = 0;
    if (results.length >= 3) {
      const olderResults = results.slice(-3);
      const olderAvg = Math.round(olderResults.reduce((sum, r) => sum + r.overall_accuracy, 0) / olderResults.length);
      improvement = avgOverall - olderAvg;
    }

    if (language === 'en-GB') {
      if (improvement > 0) {
        return {
          hasData: true,
          text: `Your overall accuracy is ${avgOverall}% with a ${improvement}% improvement! Focus on ${weakest.name} (${weakest.score}%) to improve further.`
        };
      } else {
        return {
          hasData: true,
          text: `Your overall accuracy is ${avgOverall}%. Your ${strongest.name} are strong (${strongest.score}%), but ${weakest.name} (${weakest.score}%) need more practice.`
        };
      }
    } else {
      if (improvement > 0) {
        return {
          hasData: true,
          text: `您的整體準確度為 ${avgOverall}%，提升了 ${improvement}%！專注練習${weakest.name}（${weakest.score}%）以進一步提高。`
        };
      } else {
        return {
          hasData: true,
          text: `您的整體準確度為 ${avgOverall}%。您的${strongest.name}表現優秀（${strongest.score}%），但${weakest.name}（${weakest.score}%）需要更多練習。`
        };
      }
    }
  };

  const aiInsight = getAiInsight();

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
              {aiInsight.text}
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
                  {stats.daily_goal_minutes} <span className="text-lg font-normal text-muted-foreground">{t("dashboard.min")}</span>
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("dashboard.dailyGoal")}</p>
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Progress value={dailyGoalProgress} className="h-2" />
          </div>

          {/* Fluency Score Card */}
          <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {stats.fluency_score}<span className="text-lg font-normal text-muted-foreground">%</span>
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("dashboard.fluencyScore")}</p>
              </div>
              <div className="p-2 rounded-full bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
            <p className="text-sm text-primary font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{stats.fluency_change}% {t("dashboard.thisWeek")}
            </p>
          </div>

          {/* Streak Card */}
          <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {stats.streak_days} <span className="text-lg font-normal text-muted-foreground">{t("dashboard.days")}</span>
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("dashboard.streak")}</p>
              </div>
              <div className="p-2 rounded-full bg-destructive/10">
                <Flame className="h-5 w-5 text-destructive" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.best")}: {stats.best_streak} {t("dashboard.days")}
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
