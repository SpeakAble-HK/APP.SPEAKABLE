import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import mascot from "@/assets/pipi-mascot.png";

export function CTAFooter() {
  const navigate = useNavigate();

  return (
    <footer className="relative bg-primary overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/5 rounded-full blur-[60px]" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-dim/30 rounded-full blur-[60px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-14 pb-10 flex flex-col items-center text-center">
        <img
          src={mascot}
          alt=""
          role="presentation"
          className="w-24 h-24 object-contain drop-shadow-xl mb-6 animate-pipi-bob"
        />

        <h2 className="font-headline font-extrabold text-2xl sm:text-3xl md:text-4xl text-on-primary leading-tight mb-3">
          加入 SpeakAble HK
        </h2>
        <p className="font-headline font-extrabold text-xl sm:text-2xl text-on-primary/80 mb-8">
          開啟快樂學習之旅！
        </p>

        <button
          onClick={() => navigate("/role-select")}
          className="group bg-white text-primary font-headline font-bold text-lg px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.97] flex items-center gap-3 mb-8"
        >
          免費開始
          <MaterialIcon
            icon="arrow_forward"
            className="text-xl group-hover:translate-x-1 transition-transform"
          />
        </button>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-on-primary/60 text-sm font-medium mb-8">
          <a href="#" className="hover:text-on-primary transition-colors">關於我們</a>
          <a href="#" className="hover:text-on-primary transition-colors">使用條款</a>
          <a href="#" className="hover:text-on-primary transition-colors">私隱政策</a>
          <a href="#" className="hover:text-on-primary transition-colors">聯絡我們</a>
        </nav>

        <p className="text-on-primary/40 text-xs">
          &copy; 2026 SpeakAble HK. 保留一切權利。
        </p>
      </div>
    </footer>
  );
}
