import { useNavigate } from "react-router-dom";
import { Mic, Stethoscope, Users } from "lucide-react";
import mascot from "@/assets/mascot.png";
import { GlobalHeader } from "@/components/GlobalHeader";

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GlobalHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <img src={mascot} alt="" className="h-24 w-24 object-contain mascot-bounce mb-6" />
      <h1 className="text-3xl font-extrabold text-foreground mb-2 text-center">你係邊個？</h1>
      <p className="text-muted-foreground mb-10 text-center">選擇你的角色開始</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
        {/* 言語治療師 */}
        <button
          onClick={() => navigate('/st-dashboard')}
          className="bg-card border-2 border-border rounded-2xl p-8 text-center hover:-translate-y-2 transition-all hover:shadow-xl hover:border-primary/40 active:translate-y-0 group"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
            <Stethoscope className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2">言語治療師</h2>
          <p className="text-sm text-muted-foreground">我想管理學生</p>
        </button>

        {/* 語音探險家 */}
        <button
          onClick={() => navigate('/explorer/onboarding')}
          className="bg-card border-2 border-border rounded-2xl p-8 text-center hover:-translate-y-2 transition-all hover:shadow-xl hover:border-accent/40 active:translate-y-0 group"
        >
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
            <Mic className="h-10 w-10 text-accent" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2">語音探險家</h2>
          <p className="text-sm text-muted-foreground">我想練習發音！</p>
        </button>

        {/* 公眾人士 */}
        <button
          onClick={() => navigate('/resources')}
          className="bg-card border-2 border-border rounded-2xl p-8 text-center hover:-translate-y-2 transition-all hover:shadow-xl hover:border-success/40 active:translate-y-0 group"
        >
          <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-success/20 transition-colors">
            <Users className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2">公眾人士</h2>
          <p className="text-sm text-muted-foreground">瀏覽言語訓練資訊</p>
        </button>
      </div>
      </div>
    </div>
  );
}
