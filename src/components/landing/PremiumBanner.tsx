import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import mascot from "@/assets/pipi-island.png";
import { useLanguage } from "@/contexts/LanguageContext";

export function PremiumBanner() {
  const navigate = useNavigate();
  const { t3 } = useLanguage();

  const PERKS = [
    { icon: "auto_fix_high", text: t3("Unlimited voice practice", "無限次語音練習", "无限次语音练习") },
    { icon: "mic", text: t3("Personal voice model", "個人聲音模型", "个人声音模型") },
    { icon: "bar_chart", text: t3("Friendly progress charts", "親切進度圖表", "亲切进度图表") },
    { icon: "family_restroom", text: t3("Parent supervision panel", "家長監督面板", "家长监督面板") },
  ];

  return (
    <section className="relative bg-gradient-to-b from-sky-soft via-cream to-sunshine-soft overflow-hidden">
      {/* Sky decorations */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 left-10 w-40 h-20 bg-white/80 rounded-full blur-2xl" />
        <div className="absolute top-32 right-20 w-56 h-28 bg-white/70 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-1/4 w-48 h-24 bg-white/60 rounded-full blur-2xl" />
        {/* Sun */}
        <div className="absolute top-8 right-8 w-24 h-24 bg-sunshine rounded-full opacity-50 blur-md" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 sm:py-24 flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-soft border-4 border-white">
            <img
              src={mascot}
              alt=""
              role="presentation"
              className="w-48 sm:w-60 h-auto object-contain animate-pipi-bob"
              style={{ filter: "drop-shadow(0 16px 24px rgba(26,37,65,0.18))" }}
            />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <span className="inline-block font-headline font-extrabold text-coral bg-white px-4 py-1.5 rounded-full text-sm uppercase tracking-wider mb-4 shadow-sm border-2 border-coral/30">
            {t3("PiPi Pro Club", "皮皮專業會所", "皮皮专业会所")}
          </span>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl md:text-5xl text-ink leading-tight mb-6">
            {t3(
              "Practice anytime,\nanywhere with PiPi",
              "隨時隨地，\n同皮皮一齊練習",
              "随时随地，\n和皮皮一起练习"
            )
              .split("\n")
              .map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
          </h2>

          <ul className="space-y-3.5 mb-8">
            {PERKS.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-ink">
                <span className="w-10 h-10 rounded-full bg-mint flex items-center justify-center shrink-0 shadow-sm">
                  <MaterialIcon icon={p.icon} filled className="text-white text-lg" />
                </span>
                <span className="text-base sm:text-lg font-bold">{p.text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => navigate("/role-select")}
            className="bg-gradient-to-br from-sunshine to-coral text-white font-headline font-extrabold text-lg sm:text-xl px-10 py-4 rounded-full shadow-playful hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
          >
            {t3("Try for Free", "免費體驗", "免费体验")}
          </button>
        </div>
      </div>
    </section>
  );
}
