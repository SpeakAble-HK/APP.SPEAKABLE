import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import mascot from "@/assets/mascot.png";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useRole();

  // Redirect logged-in users with a role to their dashboard
  if (user && role === 'explorer') {
    navigate('/explorer', { replace: true });
    return null;
  }
  if (user && role === 'therapist') {
    navigate('/st-dashboard', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar - login only */}
      <header className="flex items-center justify-between px-6 py-4">
        <div /> {/* spacer */}
        <Button
          variant="ghost"
          onClick={() => navigate('/auth')}
          className="text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          登入
        </Button>
      </header>

      {/* Hero - centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-14">
        <img src={mascot} alt="SpeakAble mascot" className="h-32 w-32 object-contain mascot-bounce mb-8" />

        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight text-center mb-3">
          用你嘅聲音學習
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-10">
          個人化言語訓練
        </p>

        <Button
          onClick={() => navigate('/role-select')}
          className="h-16 px-12 text-xl font-extrabold rounded-2xl game-btn gap-3"
          style={{ boxShadow: '0 6px 0 hsl(var(--primary-dark))' }}
        >
          開始使用
          <ArrowRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Bottom spacer */}
      <div className="h-8" />
    </div>
  );
};

export default Index;
