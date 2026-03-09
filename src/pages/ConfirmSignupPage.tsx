import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function ConfirmSignupPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language === 'en-GB';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setStatus('success');
      }
    });

    // Check if already signed in from the confirmation link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus('success');
      else {
        // Wait a moment for the auth state to resolve
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            setStatus(s ? 'success' : 'error');
          });
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center gap-2.5 mb-8">
        <img src={logo} alt="SpeakAble HK" className="h-10 w-10 object-contain" />
        <span className="text-xl font-bold text-foreground">SpeakAble HK</span>
      </div>

      <Card className="w-full max-w-[420px] shadow-xl border-border/50 rounded-2xl">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground mb-2">{isEn ? 'Verifying your email...' : '正在驗證您的電郵...'}</h1>
              <p className="text-sm text-muted-foreground">{isEn ? 'Please wait a moment.' : '請稍候。'}</p>
            </div>
          )}
          {status === 'success' && (
            <div className="py-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{isEn ? 'Email confirmed!' : '電郵已確認！'}</h1>
              <p className="text-sm text-muted-foreground mb-6">{isEn ? 'Your account is now active. Welcome to SpeakAble HK.' : '您的帳號已啟動。歡迎加入 SpeakAble HK。'}</p>
              <Button className="w-full h-11 rounded-xl font-semibold" onClick={() => navigate('/')}>
                {isEn ? 'Go to Dashboard' : '前往儀表板'}
              </Button>
            </div>
          )}
          {status === 'error' && (
            <div className="py-4">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
                <XCircle className="h-7 w-7 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{isEn ? 'Verification failed' : '驗證失敗'}</h1>
              <p className="text-sm text-muted-foreground mb-6">{isEn ? 'The link may have expired. Please try signing up again.' : '連結可能已過期。請重新註冊。'}</p>
              <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => navigate('/auth')}>
                {isEn ? 'Back to sign in' : '返回登入'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
