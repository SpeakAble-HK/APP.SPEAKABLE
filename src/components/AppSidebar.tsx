import { Home, AudioLines, Swords, BookOpen, Info, X, User, CreditCard, LogIn, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { SecurityStatus } from "@/components/SecurityStatus";
import { SettingsModal } from "@/components/SettingsModal";
import mascot from "@/assets/mascot.png";

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
      className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[48px] rounded-2xl transition-all text-sm font-bold group ${
        isActive(item.url)
          ? 'bg-primary/10 text-primary border-2 border-primary/20'
          : 'text-sidebar-foreground hover:bg-sidebar-accent border-2 border-transparent'
      }`}
      aria-current={isActive(item.url) ? "page" : undefined}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
        isActive(item.url) ? 'bg-primary/15' : 'bg-sidebar-accent'
      }`}>
        <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive(item.url) ? 'text-primary' : ''}`} aria-hidden="true" />
      </div>
      <span>{item.title}</span>
    </button>
  );

  return (
    <div className="w-72 h-full bg-sidebar text-sidebar-foreground flex flex-col shadow-2xl border-r-2 border-sidebar-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-sidebar-border">
        <button onClick={() => handleNav("/")} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label="SpeakAble HK — Go to home page">
          <img src={mascot} alt="" className="h-9 w-9 object-contain" />
          <span className="text-lg font-extrabold whitespace-nowrap">SpeakAble HK</span>
        </button>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-sidebar-accent transition-colors" aria-label={isEn ? "Close menu" : "關閉選單"}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => <NavButton key={item.url} item={item} />)}
      </nav>

      {/* Pricing CTA */}
      <div className="px-3 pb-2">
        <button
          onClick={() => handleNav("/pricing")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[48px] rounded-2xl transition-all text-sm font-bold ${
            isActive("/pricing")
              ? 'bg-accent text-accent-foreground'
              : 'bg-accent/15 text-accent-foreground hover:bg-accent/25 border-2 border-accent/20'
          }`}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent/20">
            <CreditCard className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          </div>
          <span>{isEn ? "Pricing" : isTW ? "定價方案" : "定价方案"}</span>
        </button>
      </div>

      {/* Security Status */}
      <div className="px-3 pb-2">
        <SecurityStatus isProcessing={false} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t-2 border-sidebar-border space-y-2">
        <SettingsModal
          trigger={
            <button className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[48px] rounded-2xl transition-all text-sm font-bold text-sidebar-foreground hover:bg-sidebar-accent border-2 border-transparent">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-sidebar-accent">
                <Settings className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              </div>
              <span>{isEn ? "Settings" : isTW ? "設定" : "设置"}</span>
            </button>
          }
        />

        {user ? (
          <>
            <button
              onClick={() => handleNav("/profile")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors hover:bg-sidebar-accent text-sm"
            >
              <Avatar className="h-8 w-8">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Avatar" />}
                <AvatarFallback className="text-xs bg-primary text-primary-foreground font-bold">
                  {`${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="truncate font-bold">{profile?.display_name || user.email}</span>
            </button>
            <Button
              variant="ghost"
              onClick={() => { onSignOut(); onClose?.(); }}
              className="w-full justify-start gap-3 rounded-2xl"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span>{t("nav.signOut")}</span>
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            onClick={() => handleNav("/auth")}
            className="w-full justify-start gap-3 rounded-2xl"
          >
            <LogIn className="h-5 w-5" aria-hidden="true" />
            <span>{t("nav.signIn")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
