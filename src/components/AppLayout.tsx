import { ReactNode, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AccessibilityToolbar } from "@/components/AccessibilityToolbar";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, profile, loading, signOut, updateLanguage } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Sync language from profile when user logs in
  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguage(profile.preferred_language as Language);
    }
  }, [profile?.preferred_language, setLanguage]);

  // Warn guests before leaving that their data will be lost
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
    <SidebarProvider>
      {/* Skip to main content — keyboard accessibility */}
      <a href="#main-content" className="skip-to-content">
        {language === 'en-GB' ? 'Skip to main content' : '跳至主要內容'}
      </a>

      <div className="min-h-screen flex w-full">
        <AppSidebar user={user} onSignOut={handleSignOut} />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile/Tablet Header */}
          <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            <SidebarTrigger aria-label={language === 'en-GB' ? 'Toggle navigation' : '切換導航'} />
            <div className="flex items-center gap-2">
              <AccessibilityToolbar />
              <LanguageSwitcher value={language} onChange={handleLanguageChange} />
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden md:flex sticky top-0 z-40 items-center justify-end h-14 px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-3">
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

          {/* Footer with Accessibility Statement */}
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
      </div>
    </SidebarProvider>
  );
}
