import { ReactNode, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, profile, loading, signOut, updateLanguage } = useAuth();

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
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  const handleLanguageChange = async (language: string) => {
    if (!user) {
      toast.info("Sign in to save your language preference");
      return;
    }
    const { error } = await updateLanguage(language);
    if (error) {
      toast.error("Failed to update language preference");
    } else {
      toast.success("Language preference updated");
    }
  };

  const currentLanguage = profile?.preferred_language || "en-GB";

  // Show loading spinner only briefly
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar user={user} onSignOut={handleSignOut} />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile/Tablet Header */}
          <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            <SidebarTrigger />
            <LanguageSwitcher value={currentLanguage} onChange={handleLanguageChange} />
          </header>

          {/* Desktop Header */}
          <header className="hidden md:flex sticky top-0 z-40 items-center justify-end h-14 px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <LanguageSwitcher value={currentLanguage} onChange={handleLanguageChange} />
          </header>

          {/* Guest Banner */}
          {!user && (
            <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-center text-sm">
              <span className="text-foreground">
                You're using SpeakRight as a guest. 
                <a href="/auth" className="text-primary font-medium ml-1 hover:underline">
                  Sign up
                </a>
                <span className="text-muted-foreground ml-1">to save your progress!</span>
              </span>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
