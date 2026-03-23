import { ReactNode } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Swords, AudioLines, Library } from "lucide-react";
import mascot from "@/assets/mascot.png";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: "resources", icon: Library, label: "資源", path: "/resources" },
    { id: "echo", icon: AudioLines, label: "迴聲語音", path: "/echo-speech" },
    { id: "home", icon: Home, label: "首頁", path: "/explorer" },
    { id: "quest", icon: Swords, label: "語音冒險", path: "/speech-quest" },
  ];

  const isTabActive = (path: string, id: string) => {
    if (id === "home") return location.pathname === "/explorer";
    if (id === "resources") return location.pathname.startsWith("/resources") || location.pathname.startsWith("/ipa");
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b-2 border-border bg-card">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={mascot} alt="" className="h-8 w-8 object-contain" />
          <span className="text-base font-extrabold text-foreground">SpeakAble HK</span>
        </Link>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 overflow-auto pb-20">
        {children || <Outlet />}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="bottom-tab-bar" aria-label="導航">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const active = isTabActive(tab.path, tab.id);
            const isHome = tab.id === "home";
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] rounded-xl transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isHome ? (
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center -mt-3 shadow-md ${active ? 'bg-primary' : 'bg-muted'}`}>
                    <tab.icon className={`h-6 w-6 ${active ? 'text-primary-foreground' : 'text-foreground'}`} />
                  </div>
                ) : (
                  <tab.icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
                )}
                <span className={`text-[10px] font-bold ${active ? 'text-primary' : ''}`}>{tab.label}</span>
                {active && !isHome && <div className="w-5 h-0.5 rounded-full bg-primary mt-0.5" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
