import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, ChevronRight, Globe, Moon, Sun, Type, LogIn, LogOut, HelpCircle, AlertTriangle, AtSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import React from 'react';

const languages = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-GB', label: 'English (UK)' },
];

export default function ProfilePage() {
  const { user, profile, loading, signOut, updateLanguage } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, textSize, toggleTheme, setTextSize } = useAccessibility();
  const navigate = useNavigate();
  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) toast.error(isEn ? 'Sign out failed' : '登出失敗');
    else toast.success(isEn ? 'Signed out' : '已登出');
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage as Language);
    if (user) {
      const { error } = await updateLanguage(newLanguage);
      if (error) toast.error(isEn ? 'Failed to update language' : '更新語言失敗');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const initials = user && profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  return (
    <div className="container mx-auto max-w-lg py-6 px-4 space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-extrabold text-center text-foreground">
        {isEn ? 'Profile' : isTW ? '個人檔案' : '个人档案'}
      </h1>

      {/* Account Section */}
      {user ? (
        <div className="flex flex-col items-center gap-2">
          <div className="relative cursor-pointer" onClick={() => navigate('/profile/edit')}>
            <Avatar className="h-20 w-20">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Avatar" />}
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <p className="text-lg font-bold text-foreground">
            {profile?.display_name || user.email}
          </p>
          {profile?.username && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <AtSign className="h-3.5 w-3.5" />{profile.username}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {isEn ? 'Sign in to save your progress and access all features.' : isTW ? '登入以保存進度並使用所有功能。' : '登录以保存进度并使用所有功能。'}
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity"
          >
            <LogIn className="h-5 w-5" />
            {isEn ? 'Sign In' : '登入'}
          </button>
        </div>
      )}

      {/* Menu Sections */}
      <div className="space-y-3">
        {/* Personal — only if signed in */}
        {user && (
          <MenuSection title={isEn ? 'Personal' : isTW ? '個人資料' : '个人资料'} icon={User}>
            <MenuRow
              label={isEn ? 'Edit Profile' : isTW ? '編輯個人資料' : '编辑个人资料'}
              onClick={() => navigate('/profile/edit')}
              chevron
            />
          </MenuSection>
        )}

        {/* Subscription */}
        <MenuSection title={isEn ? 'Subscription' : isTW ? '訂閱方案' : '订阅方案'} icon={CreditCard}>
          <MenuRow
            label={isEn ? 'View Plans' : isTW ? '查看方案' : '查看方案'}
            onClick={() => navigate('/pricing')}
            chevron
          />
        </MenuSection>

        {/* General / Settings */}
        <MenuSection title={isEn ? 'General' : isTW ? '一般設定' : '一般设置'} icon={Globe}>
          {/* Language */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-foreground">{isEn ? 'Language' : '語言'}</span>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[140px] h-9 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-[60]">
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
              <span className="text-sm font-medium text-foreground">{isEn ? 'Dark Mode' : '深色模式'}</span>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Type className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{isEn ? 'Text Size' : '文字大小'}</span>
            </div>
            <Select value={textSize} onValueChange={(v) => setTextSize(v as any)}>
              <SelectTrigger className="w-[140px] h-9 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-[60]">
                <SelectItem value="normal"><span style={{ fontSize: '14px' }}>{isEn ? 'Regular' : '標準'} ABC</span></SelectItem>
                <SelectItem value="large"><span style={{ fontSize: '18px' }}>{isEn ? 'Large' : '大'} ABC</span></SelectItem>
                <SelectItem value="extra-large"><span style={{ fontSize: '22px' }}>{isEn ? 'Super Large' : '超大'} ABC</span></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </MenuSection>

        {/* Help */}
        <MenuSection title={isEn ? 'Help' : isTW ? '幫助' : '帮助'} icon={HelpCircle}>
          <MenuRow
            label={isEn ? 'About' : isTW ? '關於' : '关于'}
            onClick={() => navigate('/about')}
            chevron
          />
          <MenuRow
            label={isEn ? 'Speech Therapy Info' : isTW ? '言語治療資訊' : '言语治疗资讯'}
            onClick={() => navigate('/speech-therapy-info')}
            chevron
          />
          <MenuRow
            label={isEn ? 'Terms of Service' : isTW ? '服務條款' : '服务条款'}
            onClick={() => navigate('/terms')}
            chevron
          />
          <MenuRow
            label={isEn ? 'Privacy Policy' : isTW ? '隱私權政策' : '隐私政策'}
            onClick={() => navigate('/privacy')}
            chevron
          />
        </MenuSection>

        {/* Sign Out — only if signed in */}
        {user && (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card border-2 border-border hover:bg-muted/50 transition-colors"
          >
            <LogOut className="h-5 w-5 text-destructive" />
            <span className="text-sm font-bold text-destructive">{isEn ? 'Sign Out' : '登出'}</span>
          </button>
        )}
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center pt-2">
        © 2026 SpeakAble HK
      </p>
    </div>
  );
}

/* ── Reusable sub-components ── */

function MenuSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border-2 border-border overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Icon className="h-5 w-5 text-primary" />
        <span className="text-sm font-bold text-foreground">{title}</span>
      </div>
      <div className="divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

const MenuRow = React.forwardRef<HTMLButtonElement, { label: string; onClick?: () => void; chevron?: boolean }>(
  ({ label, onClick, chevron }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      {chevron && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </button>
  )
);
MenuRow.displayName = 'MenuRow';
