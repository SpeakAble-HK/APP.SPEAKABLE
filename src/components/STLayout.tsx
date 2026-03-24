import { ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Settings } from "lucide-react";
import { GlobalHeader } from "./GlobalHeader";

interface STLayoutProps {
  children?: ReactNode;
}

export function STLayout({ children }: STLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: "home", icon: Home, label: "首頁", path: "/st-dashboard" },
    { id: "accounts", icon: Users, label: "帳戶", path: "/st-accounts" },
    { id: "settings", icon: Settings, label: "設定", path: "/st-settings" },
  ];

  const isTabActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <GlobalHeader />
      <main className="flex-1 overflow-auto pb-20">
        {children || <Outlet />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const active = isTabActive(tab.path);
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[48px] rounded-2xl transition-all ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  active ? "bg-primary shadow-md" : ""
                }`}>
                  <tab.icon className={`h-5 w-5 ${active ? "text-primary-foreground" : ""}`} />
                </div>
                <span className={`text-[10px] font-bold ${active ? "text-primary" : ""}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
