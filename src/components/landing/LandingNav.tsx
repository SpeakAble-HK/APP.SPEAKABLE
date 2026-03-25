import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

export function LandingNav() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-variant/30">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-14">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="" className="h-8 w-8 object-contain" aria-hidden="true" />
          <span className="font-headline font-extrabold text-primary text-lg tracking-tight select-none">
            SpeakAble HK
          </span>
        </div>
        <button
          onClick={() => navigate("/role-select")}
          className="bg-primary hover:bg-primary-dim text-on-primary font-headline font-bold text-sm px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          開始使用
        </button>
      </div>
    </header>
  );
}
