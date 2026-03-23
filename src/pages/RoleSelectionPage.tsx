import { useNavigate } from "react-router-dom";
import { Mic, Stethoscope } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { toast } from "sonner";
import mascot from "@/assets/mascot.png";

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setUserRole } = useRole();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSelect = async (role: 'explorer' | 'therapist') => {
    const result = await setUserRole(role);
    if (result?.error) {
      toast.error('Failed to set role');
      return;
    }
    if (role === 'explorer') {
      navigate('/explorer/onboarding');
    } else {
      navigate('/st-dashboard');
    }
  };

  return (
    <div className="min-h-full bg-background flex flex-col items-center justify-center px-4 py-12">
      <img src={mascot} alt="" className="h-24 w-24 object-contain mascot-bounce mb-6" />
      <h1 className="text-3xl font-extrabold text-foreground mb-2 text-center">你係邊個？</h1>
      <p className="text-muted-foreground mb-10 text-center">選擇你的角色開始</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
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

        {/* Therapist */}
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
      </div>
    </div>
  );
}
