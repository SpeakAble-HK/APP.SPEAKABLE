import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import mascot from "@/assets/pipi-island.png";

const PERKS = [
  { icon: "auto_fix_high", text: "無限次語音練習" },
  { icon: "mic", text: "個人聲音模型" },
  { icon: "bar_chart", text: "詳細進度分析" },
  { icon: "family_restroom", text: "家長監督面板" },
] as const;

export function PremiumBanner() {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-[#0B1A2A] via-[#0D2238] to-[#162D4A] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 sm:py-24 flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <div className="flex-1 flex justify-center">
          <img
            src={mascot}
            alt=""
            role="presentation"
            className="w-48 sm:w-60 h-auto object-contain drop-shadow-2xl animate-float"
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <p className="font-headline font-extrabold text-tertiary-container text-sm uppercase tracking-widest mb-3">
            SpeakAble HK 專業版
          </p>
          <h2 className="font-headline font-extrabold text-2xl sm:text-3xl md:text-4xl text-white leading-tight mb-6">
            隨時隨地，想學就學
          </h2>

          <ul className="space-y-3.5 mb-8">
            {PERKS.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-white/90">
                <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <MaterialIcon icon={p.icon} filled className="text-tertiary-container text-lg" />
                </span>
                <span className="text-base font-medium">{p.text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => navigate("/role-select")}
            className="bg-tertiary-container hover:bg-tertiary-fixed-dim text-on-tertiary-container font-headline font-bold text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.97]"
          >
            免費體驗
          </button>
        </div>
      </div>
    </section>
  );
}
