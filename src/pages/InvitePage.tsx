import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]).{6,}$/;

export default function InvitePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language === 'en-GB';
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PASSWORD_REGEX.test(password)) {
      toast.error(isEn ? 'Password does not meet requirements' : '密碼不符合要求');
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="flex items-center gap-2.5 mb-8">
        <img src={logo} alt="SpeakAble HK" className="h-10 w-10 object-contain" />
        <span className="text-xl font-bold text-foreground">SpeakAble HK</span>
      </div>

      <Card className="w-full max-w-[420px] shadow-xl border-border/50 rounded-2xl">
        <CardContent className="p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{isEn ? 'Welcome aboard!' : '歡迎加入！'}</h1>
              <p className="text-sm text-muted-foreground">{isEn ? 'Redirecting you to the app...' : '正在為您跳轉...'}</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">{isEn ? "You've been invited" : '您已被邀請'}</h1>
                <p className="text-sm text-muted-foreground mt-1">{isEn ? 'Set a password to complete your account setup' : '設定密碼以完成帳號設定'}</p>
              </div>
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="invite-password" className="text-xs font-medium">{isEn ? 'Password' : '密碼'}</Label>
                  <div className="relative">
                    <Input id="invite-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl pr-10" placeholder="••••••••" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{isEn ? 'Min 6 chars: uppercase, lowercase, number, special character.' : '至少6個字符：大寫、小寫、數字和特殊字符。'}</p>
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl font-semibold text-base" disabled={isSubmitting || !password}>
                  {isSubmitting ? (isEn ? 'Setting up...' : '設定中...') : (isEn ? 'Complete setup' : '完成設定')}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
