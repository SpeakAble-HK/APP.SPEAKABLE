import { Link } from "react-router-dom";
import { Mic, BarChart3, Sparkles, Target, TrendingUp, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import logo from "@/assets/logo.png";
const Index = () => {
  // Mock data - replace with real data when connected to backend
  const userStats = {
    dailyGoalMinutes: 15,
    dailyGoalProgress: 60,
    // percentage
    fluencyScore: 87,
    fluencyChange: 2,
    streakDays: 5,
    bestStreak: 12
  };
  return <div className="min-h-screen hero-gradient">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header with Logo */}
        <div className="flex items-center gap-3 mb-12">
          <img src={logo} alt="SpeakRight Logo" className="h-12 w-12 object-contain" />
          <span className="text-2xl font-bold text-[#5048e5]">SpeakRight</span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Learning
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Master Your
            <span className="text-primary"> Pronunciation</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Improve your speaking skills with real-time feedback and track your progress with beautiful visualizations.
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
          {/* Daily Goal Card */}
          <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {userStats.dailyGoalMinutes} <span className="text-lg font-normal text-muted-foreground">min</span>
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Daily Goal</p>
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Progress value={userStats.dailyGoalProgress} className="h-2" />
          </div>

          {/* Fluency Score Card */}
          <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {userStats.fluencyScore}<span className="text-lg font-normal text-muted-foreground">%</span>
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fluency Score</p>
              </div>
              <div className="p-2 rounded-full bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          <p className="text-sm text-primary font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{userStats.fluencyChange}% this week
            </p>
          </div>

          {/* Streak Card */}
          <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {userStats.streakDays} <span className="text-lg font-normal text-muted-foreground">days</span>
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Streak</p>
              </div>
              <div className="p-2 rounded-full bg-destructive/10">
                <Flame className="h-5 w-5 text-destructive" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Best: {userStats.bestStreak} days
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Pronunciation Card */}
          <Link to="/pronunciation" className="group">
            <div className="bg-card border border-border rounded-2xl p-8 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 hover:border-primary/30">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                <Mic className="h-7 w-7 text-primary" />
              </div>
              
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Pronunciation Correction
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Get instant feedback on your pronunciation with AI-powered speech analysis.
              </p>
              
              <div className="inline-flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                Start practicing
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>

          {/* Visualization Card */}
          <Link to="/visualization" className="group">
            <div className="bg-card border border-border rounded-2xl p-8 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 hover:border-accent/30">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 mb-6 group-hover:bg-accent/20 transition-colors">
                <BarChart3 className="h-7 w-7 text-accent" />
              </div>
              
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Visualization
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Track your learning journey with detailed analytics and progress charts.
              </p>
              
              <div className="inline-flex items-center text-accent font-medium group-hover:gap-3 gap-2 transition-all">
                View progress
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>;
};
export default Index;