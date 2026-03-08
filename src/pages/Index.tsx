import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, BookOpen, ArrowRight, AudioLines, Headphones, Swords, Shield, Target, Star, Trophy, BookHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceOnboarding } from "@/components/VoiceOnboarding";
import { useVoiceProfile } from "@/hooks/useVoiceProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useUserStats } from "@/hooks/useUserStats";
import mascot from "@/assets/mascot.png";

const Index = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { stats } = useUserStats();
  const { hasVoiceProfile, markProfileCreated } = useVoiceProfile(user?.id);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const scrollRef = useScrollReveal();

  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';

  return (
    <div className="min-h-full bg-background" ref={scrollRef}>
      {/* Hero — mascot greeting + mode selection */}
      <section className="relative overflow-hidden px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="scroll-reveal flex flex-col items-center text-center gap-4 mb-8">
            <img src={mascot} alt="SpeakAble mascot" className="h-24 w-24 object-contain mascot-bounce" />
            <div>
              <h1 className="text-3xl font-extrabold text-foreground leading-tight">
                {isEn ? "Welcome to" : isTW ? "歡迎來到" : "欢迎来到"}
                {" "}
                <span className="text-primary">SpeakAble HK</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-base max-w-md mx-auto">
                {isEn
                  ? "Let's practise Cantonese together."
                  : isTW ? "一起練習廣東話吧。"
                  : "一起练习广东话吧。"}
              </p>
            </div>
          </div>

          {/* Two Mode Buttons — side by side */}
          <div className="scroll-reveal grid grid-cols-1 gap-4">
            {/* Speech Quest */}
            <button
              onClick={() => {
                if (!hasVoiceProfile) {
                  setShowOnboarding(true);
                } else {
                  navigate('/speech-quest');
                }
              }}
              className="bg-primary text-primary-foreground rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-1 active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group"
              style={{ boxShadow: "0 6px 0 hsl(var(--primary-dark))" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 min-w-[56px] rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <Swords className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <span className="text-xl font-extrabold block leading-tight">
                    {isEn ? "Speech Quest" : isTW ? "語音冒險" : "语音冒险"}
                  </span>
                  <span className="text-sm font-medium text-primary-foreground/80 mt-0.5 block leading-snug">
                    {isEn
                      ? "Interactive pronunciation practice through games."
                      : isTW ? "通過遊戲進行互動發音練習。"
                      : "通过游戏进行互动发音练习。"}
                  </span>
                </div>
              </div>
            </button>

            {/* Speech Therapy Information */}
            <button
              onClick={() => navigate("/resources")}
              className="bg-card text-foreground border-2 border-border rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group"
              style={{ boxShadow: "0 6px 0 hsl(var(--border))" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 min-w-[56px] rounded-xl bg-accent/15 flex items-center justify-center">
                  <BookHeart className="h-7 w-7 text-accent" aria-hidden="true" />
                </div>
                <div className="flex-1">
                    <span className="text-xl font-extrabold block leading-tight">
                      {isEn ? "Resources" : isTW ? "資源" : "资源"}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground mt-0.5 block leading-snug">
                    {isEn
                      ? "Educational information about speech therapy."
                      : isTW ? "關於言語治療和語言發展的教育資訊。"
                      : "关于言语治疗和语言发展的教育资讯。"}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar (if logged in) */}
      {user && stats && (
        <section className="px-4 pb-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-6 bg-card border-2 border-border rounded-2xl py-3 px-4">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-accent" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{isEn ? "Streak" : "連續"}</p>
                  <p className="text-sm font-extrabold text-foreground">{stats.streak_days}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{isEn ? "Score" : "分數"}</p>
                  <p className="text-sm font-extrabold text-foreground">{stats.fluency_score}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center">
                  <Target className="h-4 w-4 text-success" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{isEn ? "Goal" : "目標"}</p>
                  <p className="text-sm font-extrabold text-foreground">{stats.daily_progress_minutes}/{stats.daily_goal_minutes}m</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions — game-style cards */}
      <section className="px-4 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: Swords,
                title: isEn ? "Speech Quest" : isTW ? "語音冒險" : "语音冒险",
                desc: isEn ? "Game-based learning path" : isTW ? "遊戲化學習路線" : "游戏化学习路线",
                link: "/speech-quest",
                color: "bg-primary/10 text-primary border-primary/20",
                iconBg: "bg-primary/15",
              },
              {
                icon: BookOpen,
                title: "IPA",
                desc: isEn ? "Learn phonetic symbols" : isTW ? "學習音標符號" : "学习音标符号",
                link: "/ipa",
                color: "bg-accent/10 text-accent-foreground border-accent/20",
                iconBg: "bg-accent/15",
              },
              {
                icon: AudioLines,
                title: isEn ? "Echo Speech" : "迴聲語音",
                desc: isEn ? "Test your pronunciation" : isTW ? "測試你的發音" : "测试你的发音",
                link: "/echo-speech",
                color: "bg-success/10 text-foreground border-success/20",
                iconBg: "bg-success/15",
              },
            ].map((action, i) => (
              <Link key={i} to={action.link} className="scroll-reveal group">
                <div className={`bg-card border-2 ${action.color} rounded-2xl p-3 text-center hover:shadow-md transition-all hover:-translate-y-1`}>
                  <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center mx-auto mb-2`}>
                    <action.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-extrabold text-foreground leading-tight">{action.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid — game cards */}
      <section className="px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-extrabold text-foreground mb-4 text-center">
            {isEn ? "What you can do" : isTW ? "你可以做什麼" : "你可以做什么"} 🎯
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: AudioLines, title: isEn ? "AI Feedback" : isTW ? "AI 反饋" : "AI 反馈", desc: isEn ? "Instant pronunciation scoring" : isTW ? "即時發音評分" : "即时发音评分", color: "border-primary/20" },
              { icon: Headphones, title: isEn ? "Echo Speech" : "迴聲語音", desc: isEn ? "Hear the correct way" : isTW ? "聽正確發音" : "听正确发音", color: "border-accent/20" },
              { icon: Swords, title: isEn ? "Speech Quest" : isTW ? "語音冒險" : "语音冒险", desc: isEn ? "Learn through games" : isTW ? "透過遊戲學習" : "通过游戏学习", color: "border-success/20" },
              { icon: Shield, title: isEn ? "Accessible" : isTW ? "無障礙" : "无障碍", desc: isEn ? "WCAG 2.1 AA ready" : "WCAG 2.1 AA", color: "border-border" },
            ].map((feat, i) => (
              <div key={i} className={`scroll-reveal bg-card border-2 ${feat.color} rounded-2xl p-4 hover:shadow-md transition-all`}>
                <feat.icon className="h-6 w-6 text-primary mb-2" aria-hidden="true" />
                <p className="text-sm font-extrabold text-foreground">{feat.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — sign in or pricing */}
      <section className="px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {!user ? (
            <div className="scroll-reveal bg-primary/5 border-2 border-primary/20 rounded-2xl p-6 text-center">
              <img src={mascot} alt="" className="h-14 w-14 mx-auto mb-3" />
              <h3 className="text-lg font-extrabold text-foreground mb-1">
                {isEn ? "Ready to start learning?" : isTW ? "準備好開始學習了嗎？" : "准备好开始学习了吗？"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isEn ? "Create a free account to track your progress!" : isTW ? "建立免費帳戶來追蹤你的進度！" : "创建免费账户来追踪你的进度！"}
              </p>
              <Link to="/auth">
                <Button className="game-btn gap-2 px-8 h-12 font-extrabold text-base" style={{ boxShadow: '0 4px 0 hsl(var(--primary-dark))' }}>
                  {isEn ? "Sign Up Free" : isTW ? "免費註冊" : "免费注册"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/pricing" className="scroll-reveal block">
              <div className="bg-accent/10 border-2 border-accent/20 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all">
                <p className="text-sm font-bold text-foreground">
                  {isEn ? "Need more credits? 🚀" : isTW ? "需要更多額度？🚀" : "需要更多额度？🚀"}
                </p>
                <span className="text-sm font-extrabold text-accent flex items-center gap-1">
                  {isEn ? "See Plans" : isTW ? "查看方案" : "查看方案"} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {showOnboarding && (
        <VoiceOnboarding
          onComplete={async () => {
            if (user?.id) await markProfileCreated(user.id);
            setShowOnboarding(false);
            navigate('/speech-quest');
          }}
          onCancel={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
};

export default Index;
