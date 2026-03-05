import { Home, AudioLines, Swords, BookOpen, Info, X, User, CreditCard, LogIn, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { SecurityStatus } from "@/components/SecurityStatus";
import { SettingsModal } from "@/components/SettingsModal";
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

  const navItems = [
    { title: isEn ? "Dashboard" : isTW ? "儀表板" : "仪表板", url: "/", icon: Home },
    { title: isEn ? "Echo Speech" : "迴聲語音", url: "/#golden-speaker", icon: AudioLines },
    { title: isEn ? "Speech Quest" : isTW ? "語音冒險" : "语音冒险", url: "/speech-quest", icon: Swords },
    { title: "IPA", url: "/ipa", icon: BookOpen },
    { title: isEn ? "About" : isTW ? "關於" : "关于", url: "/about", icon: Info },
  ];

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    if (path.includes("#")) return false;
    return currentPath.startsWith(path);
  };

  const handleNav = (url: string) => {
    if (url.includes("#")) {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(url.split("#")[1]);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      navigate(url);
    }
    onClose?.();
  };

  const NavButton = ({ item }: { item: typeof navItems[0] }) => (
    <button
      onClick={() => handleNav(item.url)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[48px] rounded-2xl transition-all text-sm font-medium group ${
        isActive(item.url)
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] border border-transparent'
      }`}
      aria-current={isActive(item.url) ? "page" : undefined}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
        isActive(item.url) ? 'bg-primary/15' : 'bg-[hsl(var(--sidebar-accent))] group-hover:bg-[hsl(var(--sidebar-accent))]'
      }`}>
        <item.icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive(item.url) ? 'text-primary' : ''}`} aria-hidden="true" />
      </div>
      <span>{item.title}</span>
    </button>
  );

  return (
    <div className="w-72 h-full bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] flex flex-col shadow-2xl border-r border-[hsl(var(--sidebar-border))]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--sidebar-border))]">
        <button onClick={() => handleNav("/")} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label="SpeakAble HK — Go to home page">
          <img src={logo} alt="" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold whitespace-nowrap">SpeakAble HK</span>
        </button>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[hsl(var(--sidebar-accent))] transition-colors" aria-label={isEn ? "Close menu" : "關閉選單"}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Nav — fixed, no scroll */}
      <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => <NavButton key={item.url} item={item} />)}
      </nav>

      {/* Pricing CTA */}
      <div className="px-3 pb-2">
        <button
          onClick={() => handleNav("/pricing")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[48px] rounded-2xl transition-all text-sm font-bold ${
            isActive("/pricing")
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
          }`}
          aria-current={isActive("/pricing") ? "page" : undefined}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/15">
            <CreditCard className="h-4.5 w-4.5 flex-shrink-0" aria-hidden="true" />
          </div>
          <span>{isEn ? "Pricing" : isTW ? "定價方案" : "定价方案"}</span>
        </button>
      </div>

      {/* Security Status */}
      <div className="px-3 pb-2">
        <SecurityStatus isProcessing={false} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[hsl(var(--sidebar-border))] space-y-2">
        {/* Settings — always visible */}
        <SettingsModal
          trigger={
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[48px] rounded-2xl transition-all text-sm font-medium text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] border border-transparent"
              aria-label={isEn ? "Settings" : "設定"}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[hsl(var(--sidebar-accent))]">
                <Settings className="h-4.5 w-4.5 flex-shrink-0" aria-hidden="true" />
              </div>
              <span>{isEn ? "Settings" : isTW ? "設定" : "设置"}</span>
            </button>
          }
        />

        {user ? (
          <>
            <button
              onClick={() => handleNav("/profile")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors hover:bg-[hsl(var(--sidebar-accent))] text-sm"
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
              className="w-full justify-start gap-3 text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))] rounded-2xl"
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
            className="w-full justify-start gap-3 text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))] rounded-2xl"
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
