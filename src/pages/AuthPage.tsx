import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ArrowLeft, ShieldCheck, Chrome } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = authSchema.extend({
  displayName: z.string().min(1, 'Please enter your name'),
});

// Mock reCAPTCHA widget
function MockRecaptcha({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30 cursor-pointer select-none transition-colors hover:bg-muted/50"
      onClick={() => onChange(!checked)}
      role="checkbox"
      aria-checked={checked}
      aria-label="reCAPTCHA verification"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
    >
      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
        {checked && <ShieldCheck className="h-4 w-4 text-primary-foreground" />}
      </div>
      <span className="text-sm text-foreground">I'm not a robot</span>
      <div className="ml-auto flex flex-col items-end">
        <span className="text-[10px] text-muted-foreground italic">reCAPTCHA</span>
        <span className="text-[8px] text-muted-foreground">Privacy - Terms</span>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ email: '', password: '', displayName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate('/');
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = authSchema.safeParse(loginForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
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
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    const { error } = await signUp(signUpForm.email, signUpForm.password, signUpForm.displayName);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message.includes('already registered') ? (isEn ? 'This email is already registered.' : '此電郵已被註冊。') : error.message);
    } else {
      toast.success(isEn ? 'Account created successfully!' : '帳號創建成功！');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col hero-gradient p-4">
      <div className="container mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("nav.backToHome")}
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md card-shadow">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logo} alt="SpeakAble HK Logo" className="h-12 w-12 object-contain" />
              <span className="text-2xl font-bold text-primary">SpeakAble HK</span>
            </div>
            <CardTitle className="text-2xl">{isEn ? 'Welcome' : isTW ? '歡迎' : '欢迎'}</CardTitle>
            <CardDescription>{isEn ? 'Sign in or create an account to save your records' : isTW ? '登入或創建帳號以保存您的記錄' : '登录或创建账号以保存您的记录'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">{isEn ? 'Sign In' : isTW ? '登入' : '登录'}</TabsTrigger>
                <TabsTrigger value="signup">{isEn ? 'Sign Up' : isTW ? '註冊' : '注册'}</TabsTrigger>
              </TabsList>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full mb-4 gap-2"
                onClick={async () => {
                  const { error } = await lovable.auth.signInWithOAuth('google', {
                    redirect_uri: window.location.origin,
                  });
                  if (error) toast.error(error.message || (isEn ? 'Google sign-in failed' : '使用 Google 登入失敗'));
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                {isEn ? 'Continue with Google' : '使用 Google 繼續'}
              </Button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">{isEn ? 'or' : '或'}</span></div>
              </div>

              {/* Sign In */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{isEn ? 'Email' : '電郵'}</Label>
                    <Input id="login-email" type="email" placeholder="you@example.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{isEn ? 'Password' : '密碼'}</Label>
                    <Input id="login-password" type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (isEn ? 'Signing in...' : '登入中...') : (isEn ? 'Sign In' : isTW ? '登入' : '登录')}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{isEn ? 'Name' : '姓名'}</Label>
                    <Input id="signup-name" type="text" placeholder={isEn ? 'Your name' : '您的姓名'} value={signUpForm.displayName} onChange={(e) => setSignUpForm({ ...signUpForm, displayName: e.target.value })} />
                    {errors.displayName && <p className="text-sm text-destructive">{errors.displayName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{isEn ? 'Email' : '電郵'}</Label>
                    <Input id="signup-email" type="email" placeholder="you@example.com" value={signUpForm.email} onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{isEn ? 'Password' : '密碼'}</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" value={signUpForm.password} onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })} />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  {/* Mock reCAPTCHA */}
                  <MockRecaptcha checked={captchaChecked} onChange={setCaptchaChecked} />

                  {/* Terms & Conditions */}
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={agreedTerms}
                      onCheckedChange={(v) => setAgreedTerms(v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                      {isEn
                        ? 'I agree to the Terms and Conditions and Privacy Policy of SpeakAble HK.'
                        : isTW ? '我同意 SpeakAble HK 的條款與條件及私隱政策。'
                        : '我同意 SpeakAble HK 的条款与条件及隐私政策。'}
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !agreedTerms || !captchaChecked}
                  >
                    {isSubmitting ? (isEn ? 'Creating account...' : '創建帳號中...') : (isEn ? 'Create Account' : isTW ? '創建帳號' : '创建账号')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
