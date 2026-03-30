import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import heroMascot from "@/assets/pipi-mascot.png";
import { useLanguage } from "@/contexts/LanguageContext";

export function HeroSection() {
  const navigate = useNavigate();
  const { t3 } = useLanguage();

  const TAGS = [
    { icon: "psychology", label: t3("Adaptive AI", "自適應 AI", "自适应 AI"), bg: "bg-primary-container/40 text-on-primary-container" },
    { icon: "flag", label: t3("Pure Cantonese Practice", "純粵語練習", "纯粤语练习"), bg: "bg-tertiary-container/50 text-on-tertiary-container" },
    { icon: "star", label: t3("Fun Quests", "趣味任務", "趣味任务"), bg: "bg-secondary-container/40 text-on-secondary-container" },
  ];

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-primary-container/25 rounded-full blur-[100px]" />
        <div className="absolute top-48 -right-16 w-80 h-80 bg-tertiary-container/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 left-[20%] w-96 h-96 bg-secondary-container/15 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-14 flex flex-col items-center text-center">
        {/* 3D-effect mascot */}
        <div className="relative mb-8">
          <div className="relative w-52 h-52 sm:w-64 sm:h-64">
            <img
              alt={t3("PiPi Parrot Mascot", "PiPi 鸚鵡吉祥物", "PiPi 鹦鹉吉祥物")}
              src={heroMascot}
              className="w-full h-full object-contain drop-shadow-2xl animate-pipi-bob"
              style={{ filter: "drop-shadow(0 24px 48px rgba(0,100,121,0.18))" }}
            />
          </div>
          <div
            className="absolute inset-0 rounded-full bg-primary/10 blur-[60px] -z-10 scale-110"
            aria-hidden="true"
          />
        </div>

        {/* Headline */}
        <h1 className="font-headline font-extrabold text-[1.75rem] sm:text-4xl md:text-[2.75rem] text-on-surface leading-[1.2] mb-5 tracking-tight">
          {t3("Fun, Assisted", "趣味、輔助式的", "趣味、辅助式的")}
          <br />
          {t3("Cantonese Pronunciation Practice!", "粵語發音練習！", "粤语发音练习！")}
        </h1>

        <p className="text-on-surface-variant text-base sm:text-lg font-medium leading-relaxed mb-1">
          {t3("Your fun practice tool between therapy sessions.", "您的治療間歇趣味練習工具。", "您的治疗间歇趣味练习工具。")}
        </p>
        <p className="text-on-surface-variant text-base sm:text-lg font-medium leading-relaxed mb-5">
          {t3("Learn, speak, and play through sound.", "通過聲音，學習、說話、遊戲。", "通过声音，学习、说话、游戏。")}
        </p>

        <p className="font-headline text-primary font-bold text-lg sm:text-xl mb-8">
          {t3('"Learn from your own voice"', "「從你自己的聲音中學習」", "「从你自己的声音中学习」")}
        </p>

        {/* Feature tags */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-9">
          {TAGS.map((tag) => (
            <span
              key={tag.label}
              className={`inline-flex items-center gap-1.5 px-4 py-2 ${tag.bg} font-headline font-bold text-sm rounded-full`}
            >
              <MaterialIcon icon={tag.icon} filled className="text-base" />
              {tag.label}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto mb-6">
          <button
            onClick={() => navigate("/role-select")}
            className="group bg-primary hover:bg-primary-dim text-on-primary font-headline font-bold text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.97] flex items-center justify-center gap-2.5"
          >
            {t3("Get Started", "開始使用", "开始使用")}
            <MaterialIcon
              icon="arrow_forward"
              className="text-xl group-hover:translate-x-1 transition-transform"
            />
          </button>
          <button
            onClick={() => navigate("/explorer/onboarding")}
            className="bg-white hover:bg-surface-container border-2 border-primary text-primary font-headline font-bold text-lg px-10 py-4 rounded-2xl shadow-sm hover:shadow transition-all active:scale-[0.97]"
          >
            {t3("Practice Now", "現在練習", "现在练习")}
          </button>
        </div>

        <p className="text-on-surface-variant/60 text-sm font-medium tracking-wide">
          {t3("For all ages · Free to use", "適合所有年齡層 · 免費使用", "适合所有年龄层 · 免费使用")}
        </p>
      </div>
    </section>
  );
}
