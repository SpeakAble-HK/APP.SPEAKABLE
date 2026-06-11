import { ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/shared/components/MaterialIcon";
import logo from "@/assets/logo.png";

interface STLayoutProps {
  children?: ReactNode;
}

const TABS = [
  { id: "dashboard", icon: "dashboard", label: "儀表板", path: "/st-dashboard" },
  { id: "nepa", icon: "psychology", label: "NEPA", path: "/st-nepa" },
  { id: "game-builder", icon: "auto_awesome", label: "遊戲工坊", path: "/st-game-builder" },
  { id: "accounts", icon: "folder_shared", label: "個案管理", path: "/st-accounts" },
  { id: "settings", icon: "settings", label: "設定", path: "/st-settings" },
] as const;

export function STLayout({ children }: STLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col w-full bg-surface">
      <header className="fixed top-0 w-full z-50 h-14 bg-white/70 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,180,216,0.05)] flex items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity active:scale-95"
          aria-label="返回首頁"
        >
          <img src={logo} alt="" className="h-8 w-8 object-contain" />
          <span className="font-headline font-bold text-primary text-lg tracking-tight">
            SpeakAble HK
          </span>
        </button>
      </header>

      {/* Shared desktop sidebar — single source of truth for every
          therapist page so they all align identically at lg+. Pages set
          sidebarOffsetLg={72} on their PortalShell to clear it. */}
      <aside className="fixed left-0 top-14 bottom-0 w-72 flex-col p-6 z-40 bg-slate-50/80 backdrop-blur-2xl border-r border-outline-variant/15 hidden lg:flex">
        <nav className="flex-1 space-y-1.5 mt-2">
          {TABS.map((tab) => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`w-full rounded-full p-3 flex items-center gap-3.5 transition-all hover:scale-[1.02] active:scale-95 ${
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high/60"
                }`}
              >
                <MaterialIcon icon={tab.icon} filled={active} />
                <span className="font-semibold text-sm font-label">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto pb-28 lg:pb-6 pt-14">
        {children || <Outlet />}
      </main>

      {/* Bottom nav — phones / tablets only; the desktop sidebar replaces it at lg+ */}
      <nav
        className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-2xl border-t border-outline-variant/20 flex lg:hidden justify-around items-center px-2 pb-5 pt-2.5"
        aria-label="Therapist navigation"
      >
        {TABS.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-150 active:scale-90 rounded-lg ${
                active
                    ? "bg-cyan-100 text-cyan-950"
                    : "text-slate-600 hover:text-cyan-700"
              }`}
            >
              <MaterialIcon icon={tab.icon} filled={active} className="text-xl" />
                <span className="font-body text-[10px] font-semibold mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
