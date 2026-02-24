import { AudioLines, Headphones, BookOpen, BarChart3, Sparkles, ArrowRight, Swords, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

const AboutPage = () => {
  const { language } = useLanguage();
  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';

  const features = [
    {
      icon: AudioLines,
      title: isEn ? "Real-time Feedback" : isTW ? "即時反饋" : "即时反馈",
      desc: isEn ? "Get instant pronunciation analysis with phoneme-level accuracy scoring." : isTW ? "獲得即時發音分析和音素級準確度評分。" : "获得即时发音分析和音素级准确度评分。",
    },
    {
      icon: Headphones,
      title: isEn ? "Echo Speech" : isTW ? "迴聲語音" : "回声语音",
      desc: isEn ? "Listen to AI-generated correct pronunciation and compare with yours." : isTW ? "聆聽 AI 生成的正確發音並與您的進行比較。" : "聆听 AI 生成的正确发音并与您的进行比较。",
    },
    {
      icon: Swords,
      title: isEn ? "Speech Quest" : isTW ? "語音冒險" : "语音冒险",
      desc: isEn ? "Gamified learning with progression maps, quests, and points." : isTW ? "遊戲化學習，包含進度地圖、任務和積分。" : "游戏化学习，包含进度地图、任务和积分。",
    },
    {
      icon: BookOpen,
      title: isEn ? "IPA Learning" : isTW ? "國際音標學習" : "国际音标学习",
      desc: isEn ? "Master the International Phonetic Alphabet with interactive guides." : isTW ? "透過互動指南掌握國際音標。" : "通过互动指南掌握国际音标。",
    },
    {
      icon: BarChart3,
      title: isEn ? "Progress Tracking" : isTW ? "進度追蹤" : "进度追踪",
      desc: isEn ? "Track your improvement over time with detailed analytics." : isTW ? "通過詳細分析追蹤您的進步。" : "通过详细分析追踪您的进步。",
    },
    {
      icon: Shield,
      title: isEn ? "Accessibility First" : isTW ? "無障礙優先" : "无障碍优先",
      desc: isEn ? "WCAG 2.1 AA compliant with text scaling, high contrast, and keyboard navigation." : isTW ? "符合 WCAG 2.1 AA 標準，支援文字縮放、高對比度和鍵盤導覽。" : "符合 WCAG 2.1 AA 标准，支持文字缩放、高对比度和键盘导航。",
    },
  ];

  return (
    <div className="min-h-full flex flex-col bg-background">
      {/* Hero */}
      <section className="py-16 md:py-24 px-4 text-center" aria-labelledby="about-heading">
        <div className="max-w-3xl mx-auto space-y-4">
          <img src={logo} alt="SpeakAble HK Logo" className="h-16 w-16 mx-auto object-contain mb-4" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
            {isEn ? "About Us" : isTW ? "關於我們" : "关于我们"}
          </div>
          <h1 id="about-heading" className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
            {isEn ? "About SpeakAble HK" : isTW ? "關於 SpeakAble HK" : "关于 SpeakAble HK"}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            {isEn
              ? "AI-Powered Cantonese Speech Articulation Application. Everyone has the right to speak."
              : isTW ? "AI 驅動的廣東話語音發音應用程式。每個人都有權利說話。"
              : "AI 驱动的广东话语音发音应用程序。每个人都有权利说话。"}
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pb-16 md:pb-24 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 px-2 sm:px-0">
          {features.map((feat, i) => (
            <article key={i} className="group relative bg-card border border-border rounded-2xl p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <feat.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-4 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {isEn ? "Try Echo Speech Now" : isTW ? "立即試用迴聲語音" : "立即试用回声语音"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
};

export default AboutPage;
