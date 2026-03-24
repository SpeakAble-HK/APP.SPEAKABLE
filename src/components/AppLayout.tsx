import { ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Gamepad2, Bird, Settings } from "lucide-react";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: "home", icon: Home, label: "首頁", path: "/explorer" },
    { id: "quest", icon: Gamepad2, label: "語音冒險", path: "/speech-quest" },
    { id: "pipi", icon: Bird, label: "皮皮", path: "/pipi" },
    { id: "settings", icon: Settings, label: "設定", path: "/settings" },
  ];

  const isTabActive = (path: string, id: string) => {
    if (id === "home") return location.pathname === "/explorer";
    if (id === "quest") return location.pathname.startsWith("/speech-quest") || location.pathname.startsWith("/lesson");
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <main id="main-content" className="flex-1 overflow-auto pb-20">
        {children || <Outlet />}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border safe-area-bottom" aria-label="導航">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const active = isTabActive(tab.path, tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[48px] rounded-2xl transition-all ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
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
