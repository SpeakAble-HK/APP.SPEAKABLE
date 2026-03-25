import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";

const PRODUCTS = [
  {
    icon: "record_voice_over",
    iconBg: "bg-primary-container/50",
    iconColor: "text-primary",
    title: "粵語發音練習",
    description: "針對粵語六聲九調的互動式遊戲練習，配合 AI 即時語音回饋，讓學習者在家輕鬆練習。",
    path: "/explorer/onboarding",
  },
  {
    icon: "groups",
    iconBg: "bg-secondary-container/50",
    iconColor: "text-secondary",
    title: "語言治療師專區",
    description: "為言語治療師提供客戶管理、進度追蹤及個人化練習設定的專業儀表板。",
    path: "/role-select",
  },
  {
    icon: "library_books",
    iconBg: "bg-tertiary-container/50",
    iconColor: "text-tertiary",
    title: "IPA 學習中心",
    description: "全面的國際音標資源庫，配有互動式發音指南、舌位圖及真人示範音頻。",
    path: "/role-select",
  },
] as const;

export function ProductCards() {
  const navigate = useNavigate();

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
                了解更多
                <MaterialIcon icon="arrow_forward" className="text-base" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
