import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Eye, EyeOff, Save, Camera, CalendarIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]).{6,}$/;
const PASSWORD_HELPER_EN = 'Password must be at least 6 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.';
const PASSWORD_HELPER_ZH = '密碼必須至少6個字符，並包含一個大寫字母、一個小寫字母、一個數字和一個特殊字符。';

export default function ProfileEditPage() {
  const { user, profile, loading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || null);
      if (profile.date_of_birth) {
        setDateOfBirth(new Date(profile.date_of_birth + 'T00:00:00'));
      }
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast.error(isEn ? 'Please select an image file' : '請選擇圖片檔案');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isEn ? 'Image must be under 5MB' : '圖片必須小於 5MB');
      return;
    }
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const freshUrl = `${publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: freshUrl }).eq('user_id', user.id);
      if (updateError) throw updateError;
      setAvatarUrl(freshUrl);
      toast.success(isEn ? 'Avatar updated!' : '頭像已更新！');
    } catch (err: any) {
      toast.error(err.message || (isEn ? 'Failed to upload avatar' : '上傳頭像失敗'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length > 0 || confirmPassword.length > 0) {
      if (newPassword !== confirmPassword) { toast.error(isEn ? 'New passwords do not match' : '新密碼不匹配'); return; }
      if (!PASSWORD_REGEX.test(newPassword)) { toast.error(isEn ? 'Password does not meet requirements' : '密碼不符合要求'); return; }
      if (!currentPassword) { toast.error(isEn ? 'Please enter your current password' : '請輸入目前密碼'); return; }
    }
    setSaving(true);
    try {
      const { error: profileError } = await supabase.from('profiles').update({
        first_name: firstName, last_name: lastName,
        display_name: `${firstName} ${lastName}`.trim(),
        date_of_birth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : null,
      }).eq('user_id', user.id);
      if (profileError) throw profileError;
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        toast.info(isEn ? 'A confirmation email has been sent to your new address. Please verify it.' : '確認電郵已發送至新地址，請驗證。');
      }
      if (newPassword.length > 0 && newPassword === confirmPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email!, password: currentPassword });
        if (signInError) { toast.error(isEn ? 'Current password is incorrect' : '目前密碼不正確'); setSaving(false); return; }
        const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwError) throw pwError;
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      }
      toast.success(isEn ? 'Profile updated!' : '個人資料已更新！');
    } catch (err: any) {
      toast.error(err.message || (isEn ? 'Failed to update profile' : '更新失敗'));
    } finally {
      setSaving(false);
    }
  };

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  const passwordsMatch = newPassword.length === 0 || newPassword === confirmPassword;
  const passwordValid = newPassword.length === 0 || PASSWORD_REGEX.test(newPassword);
  const canSubmitPassword = newPassword.length === 0 || (passwordValid && passwordsMatch && currentPassword.length > 0);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="container mx-auto max-w-lg py-8 px-4">
      <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate('/profile')}>
        <ArrowLeft className="h-4 w-4" />
        {isEn ? 'Back' : '返回'}
      </Button>
      <Card className="card-shadow">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-20 w-20">
                {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
          </div>
          <CardTitle className="text-2xl">{isEn ? 'Edit Profile' : isTW ? '編輯個人資料' : '编辑个人资料'}</CardTitle>
          <CardDescription>{isEn ? 'Update your account information' : isTW ? '更新您的帳號資料' : '更新您的账号资料'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="profile-firstname">{isEn ? 'First Name' : '名'}</Label>
                <Input id="profile-firstname" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-lastname">{isEn ? 'Last Name' : '姓'}</Label>
                <Input id="profile-lastname" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-username">{isEn ? 'Username' : '用戶名'}</Label>
              <Input id="profile-username" type="text" value={username} disabled readOnly className="opacity-60 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">{isEn ? 'Username cannot be changed after registration.' : '用戶名在註冊後無法更改。'}</p>
            </div>
            <div className="space-y-2">
              <Label>{isEn ? 'Date of Birth' : '出生日期'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateOfBirth && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(dateOfBirth, "PPP") : (isEn ? 'Pick a date' : '選擇日期')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateOfBirth} onSelect={setDateOfBirth} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">{isEn ? 'Email' : '電郵'}</Label>
              <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-sm font-medium text-foreground pt-2">{isEn ? 'Change Password' : '更改密碼'}</p>
              <div className="space-y-2">
                <Label htmlFor="profile-current-password">{isEn ? 'Current Password' : '目前密碼'}</Label>
                <div className="relative">
                  <Input id="profile-current-password" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={isEn ? 'Enter current password' : '輸入目前密碼'} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-new-password">{isEn ? 'New Password' : '新密碼'}</Label>
                <div className="relative">
                  <Input id="profile-new-password" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={isEn ? 'Enter new password' : '輸入新密碼'} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{isEn ? PASSWORD_HELPER_EN : PASSWORD_HELPER_ZH}</p>
                {newPassword.length > 0 && !passwordValid && <p className="text-xs text-destructive">{isEn ? 'Password does not meet requirements' : '密碼不符合要求'}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-confirm-password">{isEn ? 'Confirm New Password' : '確認新密碼'}</Label>
                <div className="relative">
                  <Input id="profile-confirm-password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={isEn ? 'Confirm new password' : '確認新密碼'} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && <p className="text-xs text-destructive">{isEn ? 'Passwords do not match' : '密碼不匹配'}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={saving || !canSubmitPassword}>
              <Save className="h-4 w-4" />
              {saving ? (isEn ? 'Saving...' : '儲存中...') : (isEn ? 'Save Changes' : isTW ? '儲存變更' : '保存更改')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
