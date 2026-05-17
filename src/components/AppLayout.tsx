import { ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { GlobalHeader } from "./GlobalHeader";
import { MaterialIcon } from "./MaterialIcon";

interface AppLayoutProps {
  children?: ReactNode;
}

const TABS = [
  { id: "practice", icon: "target", label: "練習", path: "/explorer" },
  { id: "nest", icon: "home_max", label: "小窩", path: "/pipi" },
  { id: "progress", icon: "bar_chart", label: "記錄", path: "/progress" },
  { id: "profile", icon: "person", label: "我的", path: "/settings" },
] as const;

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMapPage = false;

  const isActive = (id: string) => {
    if (id === "practice")
      return (
        location.pathname === "/explorer" ||
        location.pathname.startsWith("/practice/") ||
        location.pathname.startsWith("/speech-quest") ||
        location.pathname.startsWith("/lesson") ||
        location.pathname.startsWith("/semantic-island")
      );
    if (id === "nest") return location.pathname === "/pipi";
    if (id === "progress") return location.pathname === "/progress";
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
        className="flex-1 overflow-auto pt-14 pb-28"
      >
        {children || <Outlet />}
      </main>

      <nav
        className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur border-t-[0.5px] border-mist flex justify-around items-center px-4 pb-safe pt-1"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
        aria-label="Main navigation"
      >
        {TABS.map((tab) => {
          const active = isActive(tab.id);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[56px] px-4 py-2 rounded-lg transition-all duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                active
                  ? "bg-sky-50 text-sky-600"
                  : "text-slate hover:bg-cloud hover:text-ink"
              }`}
            >
              <MaterialIcon
                icon={tab.icon}
                filled={active}
                className="text-[22px]"
              />
              <span className="font-body text-[10px] font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
