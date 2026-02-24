import { AudioLines, Headphones, BookOpen, BarChart3, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

const FeaturesPage = () => {
  const { language } = useLanguage();
  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';

  const services = [
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
      icon: BookOpen,
      title: isEn ? "IPA Learning" : isTW ? "國際音標學習" : "国际音标学习",
      desc: isEn ? "Master the International Phonetic Alphabet with interactive guides." : isTW ? "透過互動指南掌握國際音標。" : "通过互动指南掌握国际音标。",
    },
    {
      icon: BarChart3,
      title: isEn ? "Progress Tracking" : isTW ? "進度追蹤" : "进度追踪",
      desc: isEn ? "Track your improvement over time with detailed analytics." : isTW ? "通過詳細分析追蹤您的進步。" : "通过详细分析追踪您的进步。",
    },
  ];

  return (
    <div className="min-h-full flex flex-col bg-background">
      {/* Hero */}
      <section className="py-16 md:py-24 px-4 text-center" aria-labelledby="features-heading">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-4">
            <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
            {isEn ? "Golden Theory" : isTW ? "黃金理論" : "黄金理论"}
          </div>
          <h1 id="features-heading" className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
            {isEn ? "Our Features" : isTW ? "我們的功能" : "我们的功能"}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            {isEn
              ? "Discover the tools that make SpeakAble HK the most accessible Cantonese speech therapy platform."
              : isTW ? "探索讓 SpeakAble HK 成為最無障礙廣東話語音治療平台的工具。"
              : "探索让 SpeakAble HK 成为最无障碍广东话语音治疗平台的工具。"}
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pb-16 md:pb-24 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {services.map((svc, i) => (
            <article key={i} className="group relative bg-card border border-border rounded-2xl p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <svc.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{svc.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{svc.desc}</p>
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

export default FeaturesPage;
