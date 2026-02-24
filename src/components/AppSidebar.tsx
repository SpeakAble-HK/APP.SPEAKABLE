import { Home, LogIn, LogOut, BarChart3, Info, Swords, X, Languages, Stethoscope, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

interface AppSidebarProps {
  user: any;
  profile?: { display_name?: string | null; first_name?: string | null; last_name?: string | null; avatar_url?: string | null } | null;
  onSignOut: () => void;
  onClose?: () => void;
}

export function AppSidebar({ user, profile, onSignOut, onClose }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { t, language } = useLanguage();
  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';

  const menuItems = [
    { title: t("nav.dashboard"), url: "/", icon: Home },
    { title: t("nav.results"), url: "/pronunciation/results", icon: BarChart3 },
    { title: isEn ? "Speech Quest" : isTW ? "語音冒險" : "语音冒险", url: "/speech-quest", icon: Swords },
    { title: isEn ? "IPA Transcription" : isTW ? "IPA 轉寫" : "IPA 转写", url: "/ipa-transcription", icon: Languages },
    { title: isEn ? "Diagnose Symptoms" : isTW ? "症狀診斷" : "症状诊断", url: "/diagnose-symptoms", icon: Stethoscope },
    { title: isEn ? "About SpeakAble HK" : isTW ? "關於 SpeakAble HK" : "关于 SpeakAble HK", url: "/about", icon: Info },
  ];

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const handleNav = (url: string) => {
    navigate(url);
    onClose?.();
  };

  return (
    <div className="w-72 h-full bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--sidebar-border))]">
        <button onClick={() => handleNav("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label="SpeakAble HK — Go to home page">
          <img src={logo} alt="" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold whitespace-nowrap">SpeakAble HK</span>
        </button>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--sidebar-accent))] transition-colors" aria-label={isEn ? "Close menu" : "關閉選單"}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Main navigation">
        {menuItems.map((item) => (
          <button
            key={item.url}
            onClick={() => handleNav(item.url)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              isActive(item.url)
                ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]'
                : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]'
            }`}
            aria-current={isActive(item.url) ? "page" : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span>{item.title}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[hsl(var(--sidebar-border))] space-y-2">
        {user ? (
          <>
            <button
              onClick={() => handleNav("/profile")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[hsl(var(--sidebar-accent))] text-sm"
              aria-label={isEn ? 'Profile settings' : '個人資料設定'}
            >
              <Avatar className="h-8 w-8">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Avatar" />}
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{profile?.display_name || user.email}</span>
            </button>
            <Button
              variant="ghost"
              onClick={() => { onSignOut(); onClose?.(); }}
              className="w-full justify-start gap-3 text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
              aria-label={t("nav.signOut")}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span>{t("nav.signOut")}</span>
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            onClick={() => handleNav("/auth")}
            className="w-full justify-start gap-3 text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
            aria-label={t("nav.signIn")}
          >
            <LogIn className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span>{t("nav.signIn")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
