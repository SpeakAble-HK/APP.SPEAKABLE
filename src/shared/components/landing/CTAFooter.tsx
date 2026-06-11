import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/shared/components/MaterialIcon";
import mascot from "@/assets/pipi-mascot.png";
import { useLanguage } from "@/shared/contexts/LanguageContext";

export function CTAFooter() {
  const navigate = useNavigate();
  const { t3 } = useLanguage();

  return (
    <footer className="relative bg-gradient-to-br from-sunshine via-coral to-coral-deep overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/15 rounded-full blur-2xl" />
        <div className="absolute top-1/3 left-1/3 w-40 h-20 bg-white/30 rounded-full blur-xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-14 pb-10 flex flex-col items-center text-center">
        <div className="bg-white rounded-full p-3 shadow-soft mb-6">
          <img
            src={mascot}
            alt=""
            role="presentation"
            className="w-24 h-24 object-contain animate-pipi-bob"
          />
        </div>

        <h2 className="font-headline font-extrabold text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-3 drop-shadow-sm">
          {t3("Come play with PiPi", "嚟同皮皮玩", "来和皮皮玩")}
        </h2>
        <p className="font-headline font-extrabold text-xl sm:text-2xl text-white/90 mb-8">
          {t3(
            "Start your joyful learning journey",
            "開啟快樂學習之旅",
            "开启快乐学习之旅"
          )}
        </p>

        <button
          onClick={() => navigate("/role-select")}
          className="group bg-white text-coral font-headline font-extrabold text-xl sm:text-2xl px-12 py-5 rounded-full shadow-2xl hover:shadow-playful transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mb-8"
        >
          <MaterialIcon icon="play_circle" filled className="text-3xl" />
          {t3("Start for free", "免費開始", "免费开始")}
          <MaterialIcon
            icon="arrow_forward"
            className="text-2xl group-hover:translate-x-1 transition-transform"
          />
        </button>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-white/80 text-sm font-bold mb-8">
          <a href="#" className="hover:text-white transition-colors">
            {t3("About us", "關於我們", "关于我们")}
          </a>
          <a href="#" className="hover:text-white transition-colors">
            {t3("Terms of use", "使用條款", "使用条款")}
          </a>
          <a href="#" className="hover:text-white transition-colors">
            {t3("Privacy policy", "私隱政策", "隐私政策")}
          </a>
          <a href="#" className="hover:text-white transition-colors">
            {t3("Contact us", "聯絡我們", "联络我们")}
          </a>
        </nav>

        <p className="text-white/70 text-xs">
          &copy; 2026 SpeakAble HK.{" "}
          {t3("All rights reserved.", "保留一切權利。", "保留一切权利。")}
        </p>
      </div>
    </footer>
  );
}
