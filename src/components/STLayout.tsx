import { ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MaterialIcon } from "./MaterialIcon";
import logo from "@/assets/logo.png";

interface STLayoutProps {
  children?: ReactNode;
}

const TABS = [
  { id: "dashboard", icon: "dashboard", label: "儀表板", path: "/st-dashboard" },
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

      <main className="flex-1 overflow-auto pb-28 pt-14">
        {children || <Outlet />}
      </main>

      <nav
        className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-2xl border-t border-outline-variant/20 flex justify-around items-center px-2 pb-5 pt-2.5"
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
                  ? "bg-cyan-100 text-cyan-800"
                  : "text-slate-400 hover:text-cyan-500"
              }`}
            >
              <MaterialIcon icon={tab.icon} filled={active} className="text-xl" />
              <span className="font-body text-[10px] font-medium mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
