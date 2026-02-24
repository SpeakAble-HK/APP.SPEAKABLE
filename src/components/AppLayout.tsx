import { ReactNode, useEffect, useState, useRef } from "react";
import { Outlet, Link } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AccessibilityToolbar } from "@/components/AccessibilityToolbar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";
import { toast } from "sonner";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, profile, loading, signOut, updateLanguage } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hoverZoneRef = useRef<HTMLDivElement>(null);

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

  // Close drawer when clicking outside
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!drawerOpen && e.clientX <= 8) {
        setDrawerOpen(true);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [drawerOpen]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error(t("toast.signOutError"));
    } else {
      toast.success(t("toast.signOutSuccess"));
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage as Language);
    if (user) {
      const { error } = await updateLanguage(newLanguage);
      if (error) {
        toast.error(t("toast.languageError"));
      } else {
        toast.success(t("toast.languageUpdated"));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient" role="status" aria-label="Loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Skip to main content */}
      <a href="#main-content" className="skip-to-content">
        {language === 'en-GB' ? 'Skip to main content' : '跳至主要內容'}
      </a>

      {/* Hover zone — invisible strip on left edge */}
      <div
        ref={hoverZoneRef}
        className="fixed left-0 top-0 w-2 h-full z-50"
        onMouseEnter={() => setDrawerOpen(true)}
        aria-hidden="true"
      />

      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      <div
        ref={drawerRef}
        className={`fixed left-0 top-0 h-full z-50 transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        onMouseLeave={() => setDrawerOpen(false)}
        role="navigation"
        aria-label="Main navigation"
      >
        <AppSidebar user={user} profile={profile} onSignOut={handleSignOut} onClose={() => setDrawerOpen(false)} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={language === 'en-GB' ? 'Open navigation menu' : '打開導航選單'}
          >
            <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" aria-label="SpeakAble HK — Home">
            <img src={logo} alt="" className="h-7 w-7 object-contain" />
            <span className="text-sm font-bold text-foreground hidden sm:inline">SpeakAble HK</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <AccessibilityToolbar />
          <LanguageSwitcher value={language} onChange={handleLanguageChange} />
        </div>
      </header>

      {/* Guest Banner */}
      {!user && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-center text-sm" role="alert">
          <span className="text-foreground">
            {t("guest.banner")}
            <a href="/auth" className="text-primary font-medium ml-1 hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded">
              {t("guest.signUp")}
            </a>
            <span className="text-muted-foreground ml-1">{t("guest.saveProgress")}</span>
          </span>
        </div>
      )}

      {/* Main Content */}
      <main id="main-content" className="flex-1 overflow-auto" role="main">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 text-center" role="contentinfo">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            © 2026 SpeakAble HK. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            {language === 'en-GB'
              ? 'We are committed to digital accessibility. This website is designed to meet WCAG 2.1 Level AA standards.'
              : '我們致力於數位無障礙。本網站按照 WCAG 2.1 AA 級標準設計。'}
          </p>
        </div>
      </footer>
    </div>
  );
}
