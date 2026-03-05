import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ShieldCheck, Eye, EyeOff, Mail, KeyRound, Wand2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]).{6,}$/;
const PASSWORD_HELPER_EN = 'Min 6 chars: uppercase, lowercase, number, special character.';
const PASSWORD_HELPER_ZH = '至少6個字符：大寫、小寫、數字和特殊字符。';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').regex(PASSWORD_REGEX, 'Password does not meet requirements'),
});

const signUpSchema = authSchema.extend({
  firstName: z.string().min(1, 'Please enter your first name'),
  lastName: z.string().min(1, 'Please enter your last name'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  dateOfBirth: z.date({ required_error: 'Please select your date of birth' }),
});

type AuthView = 'login' | 'signup' | 'forgot' | 'magic-link' | 'verify-email' | 'reset-sent' | 'magic-sent';

function MockRecaptcha({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className="flex items-center gap-3 p-3 border border-border/60 rounded-xl bg-muted/20 cursor-pointer select-none transition-colors hover:bg-muted/40"
      onClick={() => onChange(!checked)}
      role="checkbox"
      aria-checked={checked}
      aria-label="reCAPTCHA verification"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
        {checked && <ShieldCheck className="h-3.5 w-3.5 text-primary-foreground" />}
      </div>
      <span className="text-sm text-foreground">I'm not a robot</span>
      <div className="ml-auto flex flex-col items-end">
        <span className="text-[9px] text-muted-foreground italic">reCAPTCHA</span>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ email: '', password: '', firstName: '', lastName: '', username: '', dateOfBirth: undefined as Date | undefined });
  const [forgotEmail, setForgotEmail] = useState('');
  const [magicEmail, setMagicEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate('/');
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = authSchema.safeParse(loginForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message.includes('Invalid login credentials') ? (isEn ? 'Invalid email or password' : '電郵或密碼無效') : error.message);
    } else {
      toast.success(isEn ? 'Welcome back!' : '歡迎回來！');
      navigate('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = signUpSchema.safeParse(signUpForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await signUp(signUpForm.email, signUpForm.password, {
        firstName: signUpForm.firstName,
        lastName: signUpForm.lastName,
        username: signUpForm.username,
        dateOfBirth: signUpForm.dateOfBirth ? format(signUpForm.dateOfBirth, 'yyyy-MM-dd') : undefined,
      });
      setIsSubmitting(false);
      if (error) {
        toast.error(error.message.includes('already registered') ? (isEn ? 'This email is already registered.' : '此電郵已被註冊。') : error.message);
      } else {
        setView('verify-email');
      }
    } catch {
      setIsSubmitting(false);
      toast.error(isEn ? 'An unexpected error occurred.' : '發生意外錯誤。');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      setView('reset-sent');
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicEmail.trim()) return;
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: { emailRedirectTo: window.location.origin },
    });
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      setView('magic-sent');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const renderBackLink = (targetView: AuthView, label: string) => (
    <button onClick={() => setView(targetView)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <img src={logo} alt="SpeakAble HK" className="h-10 w-10 object-contain" />
        <span className="text-xl font-bold text-foreground">SpeakAble HK</span>
      </div>

      <Card className="w-full max-w-[420px] shadow-xl border-border/50 rounded-2xl">
        <CardContent className="p-8">

          {/* Sign In View */}
          {view === 'login' && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground">{isEn ? 'Sign in' : isTW ? '登入' : '登录'}</h1>
                <p className="text-sm text-muted-foreground mt-1">{isEn ? 'Welcome back to SpeakAble HK' : isTW ? '歡迎回到 SpeakAble HK' : '欢迎回到 SpeakAble HK'}</p>
              </div>

              {/* Social */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button variant="outline" className="gap-2 h-11 rounded-xl" onClick={async () => {
                  const { error } = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
                  if (error) toast.error(error.message || 'Google sign-in failed');
                }}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </Button>
                <Button variant="outline" className="gap-2 h-11 rounded-xl" onClick={async () => {
                  const { error } = await lovable.auth.signInWithOAuth('apple', { redirect_uri: window.location.origin });
                  if (error) toast.error(error.message || 'Apple sign-in failed');
                }}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  Apple
                </Button>
              </div>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/60" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">{isEn ? 'or' : '或'}</span></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs font-medium">{isEn ? 'Email address' : '電郵地址'}</Label>
                  <Input id="login-email" type="email" placeholder="you@example.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="h-11 rounded-xl" />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-xs font-medium">{isEn ? 'Password' : '密碼'}</Label>
                    <button type="button" onClick={() => setView('forgot')} className="text-xs text-primary hover:underline">{isEn ? 'Forgot password?' : '忘記密碼？'}</button>
                  </div>
                  <div className="relative">
                    <Input id="login-password" type={showLoginPassword ? "text" : "password"} placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="h-11 rounded-xl pr-10" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl font-semibold text-base" disabled={isSubmitting}>
                  {isSubmitting ? (isEn ? 'Signing in...' : '登入中...') : (isEn ? 'Sign in' : isTW ? '登入' : '登录')}
                </Button>
              </form>

              <button onClick={() => setView('magic-link')} className="w-full flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Wand2 className="h-3.5 w-3.5" />
                {isEn ? 'Sign in with magic link' : '使用魔法連結登入'}
              </button>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {isEn ? "Don't have an account?" : '還沒有帳號？'}{' '}
                <button onClick={() => setView('signup')} className="text-primary font-medium hover:underline">{isEn ? 'Sign up' : isTW ? '註冊' : '注册'}</button>
              </p>
            </>
          )}

          {/* Sign Up View */}
          {view === 'signup' && (
            <>
              {renderBackLink('login', isEn ? 'Back to sign in' : '返回登入')}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground">{isEn ? 'Create account' : isTW ? '創建帳號' : '创建账号'}</h1>
                <p className="text-sm text-muted-foreground mt-1">{isEn ? 'Join SpeakAble HK today' : isTW ? '立即加入 SpeakAble HK' : '立即加入 SpeakAble HK'}</p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-firstname" className="text-xs font-medium">{isEn ? 'First Name' : '名'}</Label>
                    <Input id="signup-firstname" type="text" placeholder={isEn ? 'First name' : '名'} value={signUpForm.firstName} onChange={(e) => setSignUpForm({ ...signUpForm, firstName: e.target.value })} className="h-11 rounded-xl" />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-lastname" className="text-xs font-medium">{isEn ? 'Last Name' : '姓'}</Label>
                    <Input id="signup-lastname" type="text" placeholder={isEn ? 'Last name' : '姓'} value={signUpForm.lastName} onChange={(e) => setSignUpForm({ ...signUpForm, lastName: e.target.value })} className="h-11 rounded-xl" />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-username" className="text-xs font-medium">{isEn ? 'Username' : '用戶名'}</Label>
                  <Input id="signup-username" type="text" placeholder={isEn ? 'username' : '用戶名'} value={signUpForm.username} onChange={(e) => setSignUpForm({ ...signUpForm, username: e.target.value })} className="h-11 rounded-xl" />
                  {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">{isEn ? 'Date of Birth' : '出生日期'}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 rounded-xl", !signUpForm.dateOfBirth && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {signUpForm.dateOfBirth ? format(signUpForm.dateOfBirth, "PPP") : (isEn ? 'Pick a date' : '選擇日期')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={signUpForm.dateOfBirth} onSelect={(date) => setSignUpForm({ ...signUpForm, dateOfBirth: date })} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                  {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs font-medium">{isEn ? 'Email' : '電郵'}</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" value={signUpForm.email} onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })} className="h-11 rounded-xl" />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs font-medium">{isEn ? 'Password' : '密碼'}</Label>
                  <div className="relative">
                    <Input id="signup-password" type={showSignUpPassword ? "text" : "password"} placeholder="••••••••" value={signUpForm.password} onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })} className="h-11 rounded-xl pr-10" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowSignUpPassword(!showSignUpPassword)}>
                      {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  <p className="text-[11px] text-muted-foreground">{isEn ? PASSWORD_HELPER_EN : PASSWORD_HELPER_ZH}</p>
                </div>

                <MockRecaptcha checked={captchaChecked} onChange={setCaptchaChecked} />

                <div className="flex items-start gap-2">
                  <Checkbox id="terms" checked={agreedTerms} onCheckedChange={(v) => setAgreedTerms(v === true)} className="mt-0.5" />
                  <Label htmlFor="terms" className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer">
                    {isEn ? 'I agree to the Terms and Conditions and Privacy Policy.' : isTW ? '我同意條款與條件及私隱政策。' : '我同意条款与条件及隐私政策。'}
                  </Label>
                </div>

                <Button type="submit" className="w-full h-11 rounded-xl font-semibold text-base" disabled={isSubmitting || !agreedTerms || !captchaChecked || !PASSWORD_REGEX.test(signUpForm.password)}>
                  {isSubmitting ? (isEn ? 'Creating account...' : '創建帳號中...') : (isEn ? 'Create account' : isTW ? '創建帳號' : '创建账号')}
                </Button>
              </form>
            </>
          )}

          {/* Forgot Password */}
          {view === 'forgot' && (
            <>
              {renderBackLink('login', isEn ? 'Back to sign in' : '返回登入')}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">{isEn ? 'Reset password' : isTW ? '重設密碼' : '重设密码'}</h1>
                <p className="text-sm text-muted-foreground mt-1">{isEn ? "Enter your email and we'll send a reset link" : '輸入您的電郵，我們會發送重設連結'}</p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="forgot-email" className="text-xs font-medium">{isEn ? 'Email address' : '電郵地址'}</Label>
                  <Input id="forgot-email" type="email" placeholder="you@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="h-11 rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl font-semibold text-base" disabled={isSubmitting || !forgotEmail.trim()}>
                  {isSubmitting ? (isEn ? 'Sending...' : '發送中...') : (isEn ? 'Send reset link' : '發送重設連結')}
                </Button>
              </form>
            </>
          )}

          {/* Magic Link */}
          {view === 'magic-link' && (
            <>
              {renderBackLink('login', isEn ? 'Back to sign in' : '返回登入')}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">{isEn ? 'Magic link' : '魔法連結'}</h1>
                <p className="text-sm text-muted-foreground mt-1">{isEn ? "We'll email you a passwordless login link" : '我們會發送無密碼登入連結到您的電郵'}</p>
              </div>
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="magic-email" className="text-xs font-medium">{isEn ? 'Email address' : '電郵地址'}</Label>
                  <Input id="magic-email" type="email" placeholder="you@example.com" value={magicEmail} onChange={(e) => setMagicEmail(e.target.value)} className="h-11 rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl font-semibold text-base" disabled={isSubmitting || !magicEmail.trim()}>
                  {isSubmitting ? (isEn ? 'Sending...' : '發送中...') : (isEn ? 'Send magic link' : '發送魔法連結')}
                </Button>
              </form>
            </>
          )}

          {/* Email Verification Sent */}
          {view === 'verify-email' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{isEn ? 'Check your email' : isTW ? '檢查您的電郵' : '检查您的邮箱'}</h1>
              <p className="text-sm text-muted-foreground mb-6">{isEn ? 'We sent a verification link to your email. Click it to activate your account.' : '我們已發送驗證連結到您的電郵。請點擊以啟動帳號。'}</p>
              <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => setView('login')}>
                {isEn ? 'Back to sign in' : '返回登入'}
              </Button>
            </div>
          )}

          {/* Password Reset Sent */}
          {view === 'reset-sent' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <KeyRound className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{isEn ? 'Reset link sent' : '重設連結已發送'}</h1>
              <p className="text-sm text-muted-foreground mb-6">{isEn ? 'Check your email for a password reset link.' : '請檢查您的電郵中的密碼重設連結。'}</p>
              <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => setView('login')}>
                {isEn ? 'Back to sign in' : '返回登入'}
              </Button>
            </div>
          )}

          {/* Magic Link Sent */}
          {view === 'magic-sent' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Wand2 className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{isEn ? 'Magic link sent' : '魔法連結已發送'}</h1>
              <p className="text-sm text-muted-foreground mb-6">{isEn ? 'Check your email for a one-click login link.' : '請檢查您的電郵中的一鍵登入連結。'}</p>
              <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => setView('login')}>
                {isEn ? 'Back to sign in' : '返回登入'}
              </Button>
            </div>
          )}

        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-6">
        © 2026 SpeakAble HK
      </p>
    </div>
  );
}
