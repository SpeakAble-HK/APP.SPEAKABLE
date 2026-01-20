import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, profile, signOut, updateLanguage } = useAuth();

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
      toast.error("Please sign in to change language");
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

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
