import { useNavigate, useLocation } from "react-router-dom";
import { MaterialIcon } from "./MaterialIcon";
import logo from "@/assets/logo.png";
import { useCurrency } from "@/hooks/useCurrency";

export function GlobalHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { coins, xp } = useCurrency();

  const isMapPage = location.pathname === "/explorer" || location.pathname === "/dashboard";
  const isHomePage = location.pathname === "/";
  const showBack = !isHomePage && !isMapPage;

  if (isMapPage) {
    return (
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b-[0.5px] border-mist">
        <div className="flex items-center justify-between px-6 sm:px-8 py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity active:scale-95"
            aria-label="返回首頁"
          >
            <div className="w-9 h-9 rounded-md overflow-hidden">
              <img src={logo} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-medium text-ink text-[17px]">SpeakAble HK</span>
          </button>

          {/* XP + Coins stat row */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-[#FFF6E0] border border-[#FFE9B5] px-3 py-1.5 rounded-pill">
              <MaterialIcon icon="star" filled className="text-sunshine text-base" />
              <span className="font-display font-medium text-ink text-small tabular-nums">{xp} XP</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-[#FFE8E0] border border-[#FFD4C5] px-3 py-1.5 rounded-pill">
              <MaterialIcon icon="savings" filled className="text-coral text-base" />
              <span className="font-display font-medium text-ink text-small tabular-nums">{coins}</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 w-full z-50 h-14 bg-white/90 backdrop-blur border-b-[0.5px] border-mist">
      <div className="flex items-center justify-between px-4 sm:px-6 h-full">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-cloud transition-colors"
              aria-label="返回上一頁"
            >
              <MaterialIcon icon="arrow_back" className="text-ink" />
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95"
            aria-label="返回首頁"
          >
            <img src={logo} alt="" className="h-7 w-7 object-contain rounded-md" />
            <span className="font-display font-medium text-ink text-[16px]">SpeakAble HK</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 bg-[#FFE8E0] px-3 py-1 rounded-pill">
            <MaterialIcon icon="paid" filled className="text-coral text-sm" />
            <span className="font-display font-medium text-ink text-small tabular-nums">{coins}</span>
          </div>
          <div className="inline-flex items-center gap-1 bg-[#FFF6E0] px-3 py-1 rounded-pill">
            <MaterialIcon icon="star" filled className="text-sunshine text-sm" />
            <span className="font-display font-medium text-ink text-small tabular-nums">{xp}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
