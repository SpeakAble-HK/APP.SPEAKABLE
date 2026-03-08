import { ReactNode, useEffect, useState, useRef, useCallback } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, AudioLines, Swords, BookOpen, Menu, X, Settings } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SettingsModal } from "@/components/SettingsModal";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import mascot from "@/assets/mascot.png";
import { toast } from "sonner";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, profile, loading, signOut, updateLanguage } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { focusMode, toggleFocusMode } = useAccessibility();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';

  // Sync language from profile when user logs in
  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguage(profile.preferred_language as Language);
    }
  }, [profile?.preferred_language, setLanguage]);

  // Warn guests before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!user) {
        e.preventDefault();
        e.returnValue = 'You have unsaved data. If you leave without signing up, your progress will be lost.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  // SEN Focus Mode: Esc key to exit (desktop)
  const handleEscKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && focusMode) toggleFocusMode();
  }, [focusMode, toggleFocusMode]);

  useEffect(() => {
    if (focusMode && !isMobile) {
      window.addEventListener('keydown', handleEscKey);
      return () => window.removeEventListener('keydown', handleEscKey);
    }
  }, [focusMode, isMobile, handleEscKey]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) toast.error(t("toast.signOutError"));
    else toast.success(t("toast.signOutSuccess"));
  };

  // Bottom tab items for mobile — 5 tabs
  const tabs = [
    { id: "home", icon: Home, label: isEn ? "Home" : "首頁", path: "/" },
    { id: "quest", icon: Swords, label: isEn ? "Practice" : "練習", path: "/speech-quest" },
    { id: "progress", icon: BarChart3, label: isEn ? "Progress" : "進度", path: "/learning/progress" },
    { id: "learn", icon: BookOpen, label: isEn ? "Learn" : "學習", path: "/ipa" },
    { id: "profile", icon: User, label: isEn ? "Profile" : "個人", path: "/profile" },
  ];

  const isTabActive = (path: string, id: string) => {
    if (id === "echo" || id === "settings") return false;
    if (id === "home") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4" role="status" aria-label="Loading">
        <img src={mascot} alt="" className="h-16 w-16 mascot-bounce" />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Skip to main content */}
      <a href="#main-content" className="skip-to-content">
        {isEn ? 'Skip to main content' : '跳至主要內容'}
      </a>

      {/* Focus Mode Overlay */}
      {focusMode && (
        <>
          {isMobile && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in duration-300">
              <Button
                onClick={toggleFocusMode}
                variant="default"
                size="lg"
                className="rounded-2xl shadow-2xl gap-2 h-12 px-6 font-semibold text-base"
                aria-label={isEn ? 'Exit Focus Mode' : '退出專注模式'}
              >
                <X className="h-5 w-5" />
                {isEn ? 'Exit Focus Mode' : '退出專注模式'}
              </Button>
            </div>
          )}
          {!isMobile && (
            <div className="fixed top-4 right-4 z-50 animate-in fade-in duration-300">
              <p className="text-xs text-muted-foreground bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-border">
                {isEn ? 'Press Esc to exit Focus Mode' : '按 Esc 退出專注模式'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Drawer overlay */}
      {!focusMode && drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      {!focusMode && (
        <div
          className={`fixed left-0 top-0 h-full z-50 transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
          role="navigation"
          aria-label="Main navigation"
        >
          <AppSidebar user={user} profile={profile} onSignOut={handleSignOut} onClose={() => setDrawerOpen(false)} />
        </div>
      )}

      {/* Header — friendly, minimal, no language switcher */}
      {!focusMode && (
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b-2 border-border bg-card transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-xl hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={isEn ? 'Open navigation menu' : '打開導航選單'}
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" aria-label="SpeakAble HK — Home">
              <img src={mascot} alt="" className="h-8 w-8 object-contain" />
              <span className="text-base font-extrabold text-foreground hidden sm:inline">SpeakAble HK</span>
            </Link>
          </div>
        </header>
      )}

      {/* Guest Banner — friendly tone */}
      {!focusMode && !user && (
        <div className="bg-accent/15 border-b-2 border-accent/20 px-4 py-2.5 text-center text-sm" role="alert">
          <span className="text-foreground">
            🦜 {isEn ? "You're exploring as a guest!" : isTW ? "你正以訪客身份探索！" : "你正以访客身份探索！"}
            <a href="/auth" className="text-primary font-bold ml-1 hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded">
              {t("guest.signUp")}
            </a>
            <span className="text-muted-foreground ml-1">{t("guest.saveProgress")}</span>
          </span>
        </div>
      )}

      {/* Main Content */}
      <main id="main-content" className={`flex-1 overflow-auto transition-all duration-300 ${isMobile && !focusMode ? 'pb-20' : ''}`} role="main">
        {children || <Outlet />}
      </main>

      {/* Mobile Bottom Tab Bar — 5 tabs */}
      {isMobile && !focusMode && (
        <nav className="bottom-tab-bar" aria-label="Quick navigation">
          <div className="flex items-center justify-around h-16">
            {tabs.map((tab) => {
              const active = isTabActive(tab.path, tab.id);
              const isHome = tab.id === "home";
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "settings") {
                      setSettingsOpen(true);
                    } else if (tab.id === "echo") {
                      navigate("/");
                      setTimeout(() => {
                        document.getElementById("golden-speaker")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    } else {
                      navigate(tab.path);
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] rounded-xl transition-colors ${
                    isHome && active
                      ? 'text-primary'
                      : active
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {isHome ? (
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center -mt-3 shadow-md ${active ? 'bg-primary' : 'bg-muted'}`}>
                      <tab.icon className={`h-6 w-6 ${active ? 'text-primary-foreground' : 'text-foreground'}`} />
                    </div>
                  ) : (
                    <tab.icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
                  )}
                  <span className={`text-[10px] font-bold ${isHome && active ? 'text-primary' : active ? 'text-primary' : ''}`}>{tab.label}</span>
                  {active && !isHome && <div className="w-5 h-0.5 rounded-full bg-primary mt-0.5" />}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Settings Modal (triggered from bottom tab) */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Footer — hidden in focus mode, hidden on mobile (bottom tabs replace it) */}
      {!focusMode && !isMobile && (
        <footer className="bg-muted/30 border-t-2 border-border py-4 text-center" role="contentinfo">
          <p className="text-xs text-muted-foreground">
            © 2026 SpeakAble HK. All rights reserved.
          </p>
        </footer>
      )}
    </div>
  );
}
