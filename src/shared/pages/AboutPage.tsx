import { AudioLines, Headphones, BookOpen, BarChart3, Sparkles, ArrowRight, Swords, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import mascot from "@/assets/pipi-mascot.png";

const AboutPage = () => {
  const { language } = useLanguage();
  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';
  const scrollRef = useScrollReveal();

  const features = [
    { icon: AudioLines, title: isEn ? "Real-time Feedback" : isTW ? "即時反饋" : "即时反馈", desc: isEn ? "Get instant pronunciation analysis with phoneme-level accuracy scoring." : isTW ? "獲得即時發音分析和音素級準確度評分。" : "获得即时发音分析和音素级准确度评分。", color: "border-primary/20" },
    { icon: Headphones, title: isEn ? "Echo Speech" : isTW ? "迴聲語音" : "回声语音", desc: isEn ? "Listen to AI-generated correct pronunciation and compare with yours." : isTW ? "聆聽 AI 生成的正確發音並與您的進行比較。" : "聆听 AI 生成的正确发音并与您的进行比较。", color: "border-accent/20" },
    { icon: Swords, title: isEn ? "Speech Quest" : isTW ? "語音冒險" : "语音冒险", desc: isEn ? "Gamified learning with progression maps, quests, and points." : isTW ? "遊戲化學習，包含進度地圖、任務和積分。" : "游戏化学习，包含进度地图、任务和积分。", color: "border-success/20" },
    { icon: BookOpen, title: isEn ? "IPA Learning" : isTW ? "國際音標學習" : "国际音标学习", desc: isEn ? "Master the International Phonetic Alphabet with interactive guides." : isTW ? "透過互動指南掌握國際音標。" : "通过互动指南掌握国际音标。", color: "border-primary/20" },
    { icon: BarChart3, title: isEn ? "Progress Tracking" : isTW ? "進度追蹤" : "进度追踪", desc: isEn ? "Track your improvement over time with detailed analytics." : isTW ? "通過詳細分析追蹤您的進步。" : "通过详细分析追踪您的进步。", color: "border-accent/20" },
    { icon: Shield, title: isEn ? "Accessibility First" : isTW ? "無障礙優先" : "无障碍优先", desc: isEn ? "WCAG 2.1 AA compliant with text scaling, high contrast, and keyboard navigation." : isTW ? "符合 WCAG 2.1 AA 標準，支援文字縮放、高對比度和鍵盤導覽。" : "符合 WCAG 2.1 AA 标准，支持文字缩放、高对比度和键盘导航。", color: "border-border" },
  ];

  return (
    <div className="min-h-full flex flex-col bg-background" ref={scrollRef}>
      {/* Hero */}
      <section className="relative py-12 md:py-16 px-4 text-center" aria-labelledby="about-heading">
        <div className="max-w-2xl mx-auto space-y-4 scroll-reveal">
          <img src={mascot} alt="SpeakAble mascot" className="h-20 w-20 mx-auto object-contain mb-4 mascot-bounce" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-border bg-card text-xs font-extrabold text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
            {isEn ? "About Us" : isTW ? "關於我們" : "关于我们"}
          </div>
          <h1 id="about-heading" className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
            {isEn ? "About SpeakAble HK" : isTW ? "關於 SpeakAble HK" : "关于 SpeakAble HK"}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
            {isEn
              ? "AI-Powered Cantonese pronunciation practice. Everyone has the right to speak! 🦜"
              : isTW ? "AI 驅動的廣東話發音練習。每個人都有權利說話！🦜"
              : "AI 驱动的广东话发音练习。每个人都有权利说话！🦜"}
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pb-12 md:pb-16 px-4">
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feat, i) => (
            <article key={i} className={`scroll-reveal bg-card border-2 ${feat.color} rounded-2xl p-5 hover:shadow-md transition-all`}>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4">
                <feat.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-base font-extrabold text-foreground mb-1">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 px-4 text-center scroll-reveal">
        <Link to="/">
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-extrabold text-base game-btn" style={{ boxShadow: '0 4px 0 hsl(var(--primary-dark))' }}>
            {isEn ? "Try Echo Speech Now" : isTW ? "立即試用迴聲語音" : "立即试用回声语音"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </Link>
      </section>
    </div>
  );
};

export default AboutPage;
