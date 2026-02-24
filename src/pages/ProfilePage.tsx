import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, User, Eye, EyeOff, Save } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

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
      if (profile.date_of_birth) {
        setDateOfBirth(new Date(profile.date_of_birth + 'T00:00:00'));
      }
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          display_name: `${firstName} ${lastName}`.trim(),
          date_of_birth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : null,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
      }

      // Update password if provided
      if (newPassword.length > 0) {
        if (newPassword.length < 6) {
          toast.error(isEn ? 'Password must be at least 6 characters' : '密碼必須至少6個字符');
          setSaving(false);
          return;
        }
        const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwError) throw pwError;
        setNewPassword('');
      }

      toast.success(isEn ? 'Profile updated!' : '個人資料已更新！');
    } catch (err: any) {
      toast.error(err.message || (isEn ? 'Failed to update profile' : '更新失敗'));
    } finally {
      setSaving(false);
    }
  };

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg py-8 px-4">
      <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" />
        {isEn ? 'Back' : '返回'}
      </Button>

      <Card className="card-shadow">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{isEn ? 'Profile Settings' : isTW ? '個人資料設定' : '个人资料设置'}</CardTitle>
          <CardDescription>{isEn ? 'Manage your account information' : isTW ? '管理您的帳號資料' : '管理您的账号资料'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {/* First & Last Name */}
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

            {/* Username (disabled) */}
            <div className="space-y-2">
              <Label htmlFor="profile-username">{isEn ? 'Username' : '用戶名'}</Label>
              <Input id="profile-username" type="text" value={username} disabled readOnly className="opacity-60 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">{isEn ? 'Username cannot be changed after registration.' : '用戶名在註冊後無法更改。'}</p>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label>{isEn ? 'Date of Birth' : '出生日期'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dateOfBirth && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(dateOfBirth, "PPP") : (isEn ? 'Pick a date' : '選擇日期')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={setDateOfBirth}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="profile-email">{isEn ? 'Email' : '電郵'}</Label>
              <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="profile-password">{isEn ? 'New Password' : '新密碼'}</Label>
              <div className="relative">
                <Input
                  id="profile-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isEn ? 'Leave blank to keep current' : '留空則不更改'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? (isEn ? 'Saving...' : '儲存中...') : (isEn ? 'Save Changes' : isTW ? '儲存變更' : '保存更改')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
