import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  Home,
  KeyRound,
  Mail,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRole, type AppRole } from '@/shared/hooks/useRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

// ── Constants / mappings ────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|`~]).{6,}$/;
const PASSWORD_HELPER = '至少6個字符：大寫、小寫、數字和特殊字符。';

type Track = 'enhancement' | 'improvement';
type PlanChoice = 'free' | 'pro';

// localStorage keys
const TRACK_KEY = 'speakable_track';
const ROLE_KEY = 'speakable_role';
const PENDING_PLAN_KEY = 'speakable_pending_plan';

// AppRole (DB / user_roles) ↔ legacy localStorage 'speakable_role' ↔ portal path.
const ROLE_TO_LOCAL: Record<AppRole, string> = {
  explorer: 'student',
  parent: 'parent',
  therapist: 'professional',
};
const ROLE_TO_PORTAL: Record<AppRole, string> = {
  explorer: '/dashboard',
  parent: '/parent-dashboard',
  therapist: '/therapist-portal',
};

const authSchema = z.object({
  email: z
    .string()
    .min(1, '必須輸入電郵地址')
    .regex(EMAIL_REGEX, '請輸入有效電郵地址（例如：you@example.com）'),
  password: z.string().min(6, '密碼至少需要6個字符'),
});

type Stage =
  | 'track'
  | 'role'
  | 'signup'
  | 'subscribe'
  | 'verify-email'
  | 'signin'
  | 'forgot'
  | 'reset-sent';

interface AuthFlowPageProps {
  /** Stage to open on. Direct-URL routes pass 'signin' | 'signup' | 'forgot' | 'subscribe'. */
  initialStage?: Stage;
}

const RequiredMark = () => <span className="text-destructive ml-0.5">*</span>;

function validateField(schema: z.ZodTypeAny, value: unknown): string | null {
  const result = schema.safeParse(value);
  return result.success ? null : result.error.errors[0]?.message ?? null;
}

// ── Track cards (visuals adapted from RoleSelectionPage) ──────────────────────

interface TrackCardProps {
  theme: Track;
  Icon: typeof Users;
  title: string;
  subtitle: string;
  onClick: () => void;
}

function TrackCard({ theme, Icon, title, subtitle, onClick }: TrackCardProps) {
  const tokens =
    theme === 'enhancement'
      ? {
          card: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-400',
          icon: 'bg-gradient-to-br from-emerald-400 to-teal-500',
        }
      : {
          card: 'bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200 hover:border-violet-400',
          icon: 'bg-gradient-to-br from-violet-500 to-indigo-600',
        };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-center rounded-2xl border-2 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${tokens.card}`}
    >
      <div
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full shadow-lg ${tokens.icon}`}
        aria-hidden="true"
      >
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────--

export default function AuthFlowPage({ initialStage = 'track' }: AuthFlowPageProps) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { setUserRole } = useRole();

  const [stage, setStage] = useState<Stage>(initialStage);
  const [track, setTrack] = useState<Track | null>(null);
  const [pendingRole, setPendingRole] = useState<AppRole | null>(null);
  const [plan, setPlan] = useState<PlanChoice>('free');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Restore any previously chosen track so refreshes mid-flow keep context.
  useEffect(() => {
    const saved = localStorage.getItem(TRACK_KEY);
    if (saved === 'enhancement' || saved === 'improvement') setTrack(saved);
  }, []);

  const portalForRole = (role: AppRole) => ROLE_TO_PORTAL[role];

  // Map the user's chosen role to the DB role + localStorage and apply the
  // pending plan choice once a session exists, then route to the portal.
  const completeSignIn = async () => {
    const { data } = await supabase.auth.getUser();
    const authedUser = data.user;
    if (!authedUser) {
      toast.error('登入失敗，請重試');
      return;
    }

    // Resolve which role to use: the one chosen this session, or the existing DB role.
    let role = pendingRole;
    if (!role) {
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authedUser.id)
        .maybeSingle();
      role = (roleRow?.role as AppRole) ?? null;
    }

    if (role) {
      // Insert the DB role if it isn't already present.
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authedUser.id)
        .maybeSingle();
      if (!existingRole) {
        await setUserRole(role);
      }
      localStorage.setItem(ROLE_KEY, ROLE_TO_LOCAL[role]);
    }

    // Apply a deferred plan choice captured before email confirmation.
    const pendingPlan = localStorage.getItem(PENDING_PLAN_KEY);
    if (pendingPlan === 'free' || pendingPlan === 'pro') {
      await supabase
        .from('subscriptions')
        .update({ plan_id: pendingPlan })
        .eq('user_id', authedUser.id);
      localStorage.removeItem(PENDING_PLAN_KEY);
    }

    navigate(role ? portalForRole(role) : '/dashboard');
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const chooseTrack = (t: Track) => {
    setTrack(t);
    localStorage.setItem(TRACK_KEY, t);
    if (t === 'improvement') {
      // Improvement has a single role — auto-select therapist and skip role step.
      setPendingRole('therapist');
      localStorage.setItem(ROLE_KEY, ROLE_TO_LOCAL.therapist);
      setStage('signup');
    } else {
      setStage('role');
    }
  };

  const chooseRole = (role: AppRole) => {
    setPendingRole(role);
    localStorage.setItem(ROLE_KEY, ROLE_TO_LOCAL[role]);
    setStage('signup');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const emailError = validateField(authSchema.shape.email, signUpForm.email);
    if (emailError) newErrors.email = emailError;
    if (!PASSWORD_REGEX.test(signUpForm.password)) newErrors.password = '密碼不符合要求';
    if (!signUpForm.firstName.trim()) newErrors.firstName = '必須輸入名字';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    const { error } = await signUp(signUpForm.email, signUpForm.password, {
      firstName: signUpForm.firstName,
      lastName: signUpForm.lastName,
    });
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message || '註冊失敗');
      return;
    }
    toast.success('帳號已建立，請選擇方案。');
    setStage('subscribe');
  };

  const handleConfirmPlan = async () => {
    setIsSubmitting(true);
    // If a session already exists (e.g. confirmation disabled), record immediately;
    // otherwise stash the choice and apply it on first sign-in.
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase
        .from('subscriptions')
        .update({ plan_id: plan })
        .eq('user_id', data.user.id);
    } else {
      localStorage.setItem(PENDING_PLAN_KEY, plan);
    }
    setIsSubmitting(false);
    // TODO(stripe): For paid plans, redirect to Stripe Checkout here before
    // marking the subscription active. Payment is deferred for now.
    setStage('verify-email');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const emailError = validateField(authSchema.shape.email, loginForm.email);
    const passwordError = validateField(authSchema.shape.password, loginForm.password);
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    if (error) {
      setIsSubmitting(false);
      let msg = '登入失敗';
      if (error.message?.includes('Invalid login credentials')) msg = '電郵或密碼不正確';
      else if (error.message?.includes('Email not confirmed')) msg = '電郵尚未確認';
      toast.error(msg);
      return;
    }
    toast.success('登入成功！');
    await completeSignIn();
    setIsSubmitting(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setIsSubmitting(false);
    if (error) toast.error(error.message);
    else setStage('reset-sent');
  };

  const roleOptions = useMemo(
    () => [
      {
        role: 'explorer' as AppRole,
        Icon: Users,
        title: '學生入口',
        desc: '每日練習廣東話發音、互動故事',
      },
      {
        role: 'parent' as AppRole,
        Icon: Heart,
        title: '家長入口',
        desc: '睇小朋友練習報告、AI 洞察建議',
      },
    ],
    []
  );

  // ── Layout helpers ───────────────────────────────────────────────────────--

  const Shell = ({ children, wide }: { children: React.ReactNode; wide?: boolean }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className={`w-full ${wide ? 'max-w-3xl' : 'max-w-[440px]'} mb-4`}>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          返回首頁
        </Link>
      </div>
      <div className="flex items-center gap-2.5 mb-6">
        <img src={logo} alt="SpeakAble HK" className="h-9 w-9 object-contain" />
        <span className="text-lg font-bold text-foreground">SpeakAble HK</span>
      </div>
      {children}
    </div>
  );

  const backButton = (target: Stage, label: string) => (
    <button
      type="button"
      onClick={() => setStage(target)}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </button>
  );

  // ── Stages ─────────────────────────────────────────────────────────────────

  if (stage === 'track') {
    return (
      <Shell wide>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-foreground">選擇你的版本</h1>
          <p className="text-sm text-muted-foreground mt-2">
            SpeakAble HK 分為 Enhancement 同 Improvement 兩大版本
          </p>
        </div>
        <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
          <TrackCard
            theme="enhancement"
            Icon={Sparkles}
            title="Speakable Enhancement"
            subtitle="學生 + 家長體驗：練習、互動故事、進度追蹤"
            onClick={() => chooseTrack('enhancement')}
          />
          <TrackCard
            theme="improvement"
            Icon={Wrench}
            title="Speakable Improvement"
            subtitle="治療師工具 + NEPA 後台：學生管理、校準、分析"
            onClick={() => chooseTrack('improvement')}
          />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
          已有帳號？{' '}
          <button
            onClick={() => setStage('signin')}
            className="text-primary font-medium hover:underline"
          >
            登入
          </button>
        </p>
      </Shell>
    );
  }

  if (stage === 'role') {
    return (
      <Shell wide>
        {backButton('track', '返回版本選擇')}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-foreground">選擇你的身份</h1>
          <p className="text-sm text-muted-foreground mt-2">Speakable Enhancement</p>
        </div>
        <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
          {roleOptions.map(({ role, Icon, title, desc }) => (
            <TrackCard
              key={role}
              theme="enhancement"
              Icon={Icon}
              title={title}
              subtitle={desc}
              onClick={() => chooseRole(role)}
            />
          ))}
        </div>
      </Shell>
    );
  }

  if (stage === 'subscribe') {
    return (
      <Shell>
        <Card className="w-full max-w-[440px] shadow-xl border-border/50 rounded-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">選擇方案</h1>
              <p className="text-sm text-muted-foreground mt-1">隨時可以升級或取消。</p>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPlan('free')}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  plan === 'free'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">免費 Free</span>
                  <span className="text-sm text-muted-foreground">HK$0 / 月</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">基本練習、3 個互動故事、6 款迷你遊戲。</p>
              </button>

              <button
                type="button"
                onClick={() => setPlan('pro')}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  plan === 'pro'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">專業 Pro</span>
                  <span className="text-sm text-muted-foreground">HK$199 / 月</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  無限練習、AI 聲線克隆、家長洞察。
                </p>
                {plan === 'pro' && (
                  <p className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                    付款即將推出 · payment coming soon
                  </p>
                )}
              </button>
            </div>

            <Button
              className="w-full h-11 rounded-xl font-semibold text-base mt-6"
              disabled={isSubmitting}
              onClick={handleConfirmPlan}
            >
              {isSubmitting ? '處理中...' : '確認方案'}
            </Button>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  if (stage === 'verify-email') {
    return (
      <Shell>
        <Card className="w-full max-w-[440px] shadow-xl border-border/50 rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">檢查你的電郵</h1>
            <p className="text-sm text-muted-foreground mb-6">
              我哋已發送確認連結到{' '}
              <span className="font-medium text-foreground">{signUpForm.email || '你的電郵'}</span>
              。確認後即可登入。
            </p>
            <Button className="w-full h-11 rounded-xl" onClick={() => setStage('signin')}>
              前往登入
            </Button>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  if (stage === 'reset-sent') {
    return (
      <Shell>
        <Card className="w-full max-w-[440px] shadow-xl border-border/50 rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">重設連結已發送</h1>
            <p className="text-sm text-muted-foreground mb-6">請檢查你的電郵內密碼重設連結。</p>
            <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => setStage('signin')}>
              返回登入
            </Button>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  if (stage === 'forgot') {
    return (
      <Shell>
        <Card className="w-full max-w-[440px] shadow-xl border-border/50 rounded-2xl">
          <CardContent className="p-8">
            {backButton('signin', '返回登入')}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">重設密碼</h1>
              <p className="text-sm text-muted-foreground mt-1">輸入你的電郵，我哋會發送重設連結。</p>
            </div>
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-xs font-medium">
                  電郵地址
                  <RequiredMark />
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold text-base"
                disabled={isSubmitting || !forgotEmail.trim()}
              >
                {isSubmitting ? '發送中...' : '發送重設連結'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  if (stage === 'signin') {
    return (
      <Shell>
        <Card className="w-full max-w-[440px] shadow-xl border-border/50 rounded-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">登入</h1>
              <p className="text-sm text-muted-foreground mt-1">歡迎回到 SpeakAble HK</p>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-medium">
                  電郵地址
                  <RequiredMark />
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="h-11 rounded-xl"
                  required
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-medium">
                    密碼
                    <RequiredMark />
                  </Label>
                  <button
                    type="button"
                    onClick={() => setStage('forgot')}
                    className="text-xs text-primary hover:underline"
                  >
                    忘記密碼？
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="h-11 rounded-xl pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? '登入中...' : '登入'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              還沒有帳號？{' '}
              <button
                onClick={() => {
                  setErrors({});
                  setStage('track');
                }}
                className="text-primary font-medium hover:underline"
              >
                註冊
              </button>
            </p>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  // stage === 'signup'
  return (
    <Shell>
      <Card className="w-full max-w-[440px] shadow-xl border-border/50 rounded-2xl">
        <CardContent className="p-8">
          {backButton(track === 'improvement' ? 'track' : 'role', '返回')}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">創建帳號</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {track === 'improvement' ? 'Speakable Improvement · 治療師' : 'Speakable Enhancement'}
            </p>
          </div>
          <form onSubmit={handleSignUp} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="signup-firstname" className="text-xs font-medium">
                  名
                  <RequiredMark />
                </Label>
                <Input
                  id="signup-firstname"
                  type="text"
                  placeholder="名"
                  value={signUpForm.firstName}
                  onChange={(e) => setSignUpForm({ ...signUpForm, firstName: e.target.value })}
                  className="h-11 rounded-xl"
                  required
                />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-lastname" className="text-xs font-medium">
                  姓
                </Label>
                <Input
                  id="signup-lastname"
                  type="text"
                  placeholder="姓"
                  value={signUpForm.lastName}
                  onChange={(e) => setSignUpForm({ ...signUpForm, lastName: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-email" className="text-xs font-medium">
                電郵
                <RequiredMark />
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={signUpForm.email}
                onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                className="h-11 rounded-xl"
                required
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-password" className="text-xs font-medium">
                密碼
                <RequiredMark />
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                  className="h-11 rounded-xl pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              <p className="text-[11px] text-muted-foreground">{PASSWORD_HELPER}</p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold text-base"
              disabled={isSubmitting || !PASSWORD_REGEX.test(signUpForm.password)}
            >
              {isSubmitting ? '創建帳號中...' : '創建帳號'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            已有帳號？{' '}
            <button
              onClick={() => {
                setErrors({});
                setStage('signin');
              }}
              className="text-primary font-medium hover:underline"
            >
              登入
            </button>
          </p>
        </CardContent>
      </Card>
    </Shell>
  );
}
