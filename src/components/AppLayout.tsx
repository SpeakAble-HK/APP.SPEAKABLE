import { ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { GlobalHeader } from "./GlobalHeader";
import { MaterialIcon } from "./MaterialIcon";

interface AppLayoutProps {
  children?: ReactNode;
}

const TABS = [
  { id: "map", icon: "map", label: "地圖", path: "/explorer" },
  { id: "practice", icon: "exercise", label: "練習", path: "/speech-quest" },
  { id: "nest", icon: "home_max", label: "小窩", path: "/pipi" },
  { id: "profile", icon: "person", label: "我的", path: "/settings" },
] as const;

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMapPage = location.pathname === "/explorer";

  const isActive = (id: string) => {
    if (id === "map") return location.pathname === "/explorer";
    if (id === "practice")
      return (
        location.pathname.startsWith("/speech-quest") ||
        location.pathname.startsWith("/lesson") ||
        location.pathname.startsWith("/phonology") ||
        location.pathname.startsWith("/semantic-island")
      );
    if (id === "nest") return location.pathname === "/pipi";
    if (id === "profile")
      return (
        location.pathname === "/settings" ||
        location.pathname.startsWith("/resources")
      );
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-surface">
      <GlobalHeader />
      <main
        id="main-content"
        className={`flex-1 overflow-auto ${isMapPage ? "" : "pt-14"} pb-28`}
      >
        {children || <Outlet />}
      </main>

      <nav
        className="fixed bottom-0 left-0 w-full z-50 bg-white/70 backdrop-blur-3xl rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] flex justify-around items-center px-4 pb-6 pt-2"
        aria-label="Main navigation"
      >
        {TABS.map((tab) => {
          const active = isActive(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center transition-all duration-150 active:scale-90 ${
                active
                  ? "bg-amber-100 text-amber-700 rounded-[2rem] px-6 py-2 scale-110"
                  : "text-slate-400 px-4 py-2 hover:bg-cyan-50 rounded-lg"
              }`}
            >
              <MaterialIcon
                icon={tab.icon}
                filled={active}
                className="mb-0.5 text-xl"
              />
              <span className="font-body text-[10px] font-bold uppercase tracking-wider">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
