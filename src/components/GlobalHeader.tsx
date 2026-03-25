import { useNavigate, useLocation } from "react-router-dom";
import { MaterialIcon } from "./MaterialIcon";
import logo from "@/assets/logo.png";
import { useCurrency } from "@/hooks/useCurrency";

export function GlobalHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { coins, xp } = useCurrency();

  const isMapPage = location.pathname === "/explorer";
  const isHomePage = location.pathname === "/";
  const showBack = !isHomePage && !isMapPage;

  if (isMapPage) {
    return (
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-3xl rounded-b-[3rem] shadow-header">
        <div className="flex items-center justify-between px-6 sm:px-8 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity active:scale-95"
            aria-label="返回首頁"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img src={logo} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="font-headline font-semibold text-primary text-lg tracking-tight">
              SpeakAble HK
            </span>
          </button>
          <div className="bg-surface-container-low px-4 py-1.5 rounded-full flex items-center gap-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <MaterialIcon icon="star" filled className="text-amber-500 text-lg" />
              <span className="font-headline font-bold text-on-surface text-sm">{xp} XP</span>
            </div>
            <div className="w-px h-4 bg-outline-variant/30" />
            <div className="flex items-center gap-1.5">
              <MaterialIcon icon="savings" filled className="text-yellow-500 text-lg" />
              <span className="font-headline font-bold text-on-surface text-sm">{coins}</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 w-full z-50 h-14 bg-white/70 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,180,216,0.05)]">
      <div className="flex items-center justify-between px-4 sm:px-6 h-full">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
              aria-label="返回上一頁"
            >
              <MaterialIcon icon="arrow_back" className="text-on-surface" />
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95"
            aria-label="返回首頁"
          >
            <img src={logo} alt="" className="h-7 w-7 object-contain" />
            <span className="font-headline font-bold text-primary text-base tracking-tight">
              SpeakAble HK
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-tertiary-container/60 px-3 py-1 rounded-full">
            <MaterialIcon icon="paid" filled className="text-tertiary text-sm" />
            <span className="font-label font-bold text-on-tertiary-container text-sm">{coins}</span>
          </div>
          <div className="flex items-center gap-1 bg-primary-container/40 px-3 py-1 rounded-full">
            <MaterialIcon icon="star" filled className="text-primary text-sm" />
            <span className="font-label font-bold text-on-primary-container text-sm">{xp}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
