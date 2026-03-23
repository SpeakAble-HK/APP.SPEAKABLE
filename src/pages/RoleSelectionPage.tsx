import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Stethoscope, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { toast } from "sonner";
import mascot from "@/assets/mascot.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type PendingRole = 'explorer' | 'therapist' | 'public' | null;

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setUserRole } = useRole();
  const [pendingRole, setPendingRole] = useState<PendingRole>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleSelect = async (role: PendingRole) => {
    if (!user) {
      setPendingRole(role);
      setShowLoginDialog(true);
      return;
    }

    if (role === 'public') {
      navigate('/resources');
      return;
    }

    if (role === 'explorer' || role === 'therapist') {
      const result = await setUserRole(role);
      if (result?.error) {
        toast.error('設定角色失敗');
        return;
      }
      if (role === 'explorer') {
        navigate('/explorer/onboarding');
      } else {
        navigate('/st-dashboard');
      }
    }
  };

  const handleGoToAuth = () => {
    setShowLoginDialog(false);
    // Pass pending role so we can redirect after login
    const tab = 'signup';
    navigate(`/auth?tab=${tab}&role=${pendingRole || ''}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <img src={mascot} alt="" className="h-24 w-24 object-contain mascot-bounce mb-6" />
      <h1 className="text-3xl font-extrabold text-foreground mb-2 text-center">你係邊個？</h1>
      <p className="text-muted-foreground mb-10 text-center">選擇你的角色開始</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
        {/* ST */}
        <button
          onClick={() => handleSelect('therapist')}
          className="bg-card border-2 border-border rounded-2xl p-8 text-center hover:-translate-y-2 transition-all hover:shadow-xl hover:border-primary/40 active:translate-y-0 group"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
            <Stethoscope className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2">言語治療師</h2>
          <p className="text-sm text-muted-foreground">我想管理學生</p>
        </button>

        {/* Explorer */}
        <button
          onClick={() => handleSelect('explorer')}
          className="bg-card border-2 border-border rounded-2xl p-8 text-center hover:-translate-y-2 transition-all hover:shadow-xl hover:border-accent/40 active:translate-y-0 group"
        >
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
            <Mic className="h-10 w-10 text-accent" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2">語音探險家</h2>
          <p className="text-sm text-muted-foreground">我想練習發音！</p>
        </button>

        {/* Public */}
        <button
          onClick={() => handleSelect('public')}
          className="bg-card border-2 border-border rounded-2xl p-8 text-center hover:-translate-y-2 transition-all hover:shadow-xl hover:border-success/40 active:translate-y-0 group"
        >
          <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-success/20 transition-colors">
            <Users className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2">公眾人士</h2>
          <p className="text-sm text-muted-foreground">瀏覽言語訓練資訊</p>
        </button>
      </div>

      {/* Login Required Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-center">需要登入</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              請先登入或註冊帳號才能繼續
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={handleGoToAuth}
              className="h-12 text-base font-extrabold rounded-xl game-btn"
              style={{ boxShadow: '0 4px 0 hsl(var(--primary-dark))' }}
            >
              登入 / 註冊
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
              className="h-12 text-base font-bold rounded-xl"
            >
              返回
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
