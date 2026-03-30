import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useLanguage } from "@/contexts/LanguageContext";

export function ProductCards() {
  const navigate = useNavigate();
  const { t3 } = useLanguage();

  const PRODUCTS = [
    {
      icon: "record_voice_over",
      iconBg: "bg-primary-container/50",
      iconColor: "text-primary",
      title: t3("Cantonese Pronunciation Practice", "粵語發音練習", "粤语发音练习"),
      description: t3(
        "Interactive game-based practice for Cantonese tones with real-time AI speech feedback, making home practice easy.",
        "針對粵語六聲九調的互動式遊戲練習，配合 AI 即時語音回饋，讓學習者在家輕鬆練習。",
        "针对粤语六声九调的互动式游戏练习，配合 AI 即时语音反馈，让学习者在家轻松练习。"
      ),
      path: "/explorer/onboarding",
    },
    {
      icon: "groups",
      iconBg: "bg-secondary-container/50",
      iconColor: "text-secondary",
      title: t3("Speech Therapist Portal", "語言治療師專區", "语言治疗师专区"),
      description: t3(
        "Professional dashboard for speech therapists with client management, progress tracking, and personalised practice settings.",
        "為言語治療師提供客戶管理、進度追蹤及個人化練習設定的專業儀表板。",
        "为言语治疗师提供客户管理、进度追踪及个人化练习设定的专业仪表板。"
      ),
      path: "/role-select",
    },
    {
      icon: "family_restroom",
      iconBg: "bg-tertiary-container/50",
      iconColor: "text-tertiary",
      title: t3("Speech Resources Centre", "言語資源中心", "言语资源中心"),
      description: t3(
        "Speech development milestones, red flag checklists, and a city-wide speech therapy service finder for parents and carers.",
        "言語發展里程碑、警示信號清單，以及全港言語治療服務搜尋引擎，幫助家長及照顧者。",
        "言语发展里程碑、警示信号清单，以及全港言语治疗服务搜索引擎，帮助家长及照顾者。"
      ),
      path: "/ngo",
    },
  ];

  return (
    <section className="bg-surface py-16 sm:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => (
            <button
              key={p.title}
              onClick={() => navigate(p.path)}
              className="group bg-white rounded-3xl p-7 shadow-card hover:shadow-card-hover border border-surface-variant/30 text-left transition-all hover:-translate-y-1 active:scale-[0.98]"
            >
              <div
                className={`w-14 h-14 ${p.iconBg} rounded-2xl flex items-center justify-center mb-5`}
              >
                <MaterialIcon icon={p.icon} filled className={`${p.iconColor} text-2xl`} />
              </div>
              <h3 className="font-headline font-extrabold text-on-surface text-lg mb-2">
                {p.title}
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{p.description}</p>
              <div className="mt-5 flex items-center gap-1 text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {t3("Learn more", "了解更多", "了解更多")}
                <MaterialIcon icon="arrow_forward" className="text-base" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
