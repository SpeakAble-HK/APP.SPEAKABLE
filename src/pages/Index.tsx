import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import mascot from "@/assets/mascot.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-2 px-6 py-4">
        <img src={mascot} alt="SpeakAble HK" className="h-8 w-8 object-contain" />
        <span className="text-base font-extrabold text-foreground">SpeakAble HK</span>
      </header>

      {/* Hero */}
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

      <div className="h-8" />
    </div>
  );
};

export default Index;
