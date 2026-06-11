import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]).{6,}$/;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('密碼不一致');
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      toast.error('密碼不符合要求');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
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
              <h1 className="text-2xl font-bold text-foreground mb-2">密碼已更新</h1>
              <p className="text-sm text-muted-foreground">正在為你跳轉...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">設定新密碼</h1>
                <p className="text-sm text-muted-foreground mt-1">為你的帳號設定一個高強度密碼。</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-xs font-medium">新密碼</Label>
                  <div className="relative">
                    <Input id="new-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl pr-10" placeholder="••••••••" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password" className="text-xs font-medium">確認密碼</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 rounded-xl" placeholder="••••••••" />
                </div>
                <p className="text-[11px] text-muted-foreground">至少6個字符：大寫、小寫、數字和特殊字符。</p>
                <Button type="submit" className="w-full h-11 rounded-xl font-semibold text-base" disabled={isSubmitting || !password || !confirmPassword}>
                  {isSubmitting ? '更新中...' : '更新密碼'}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
