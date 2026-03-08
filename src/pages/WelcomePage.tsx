import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, BookHeart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import mascot from "@/assets/mascot.png";

const WelcomePage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  // Staggered entrance animations
  const [showMascot, setShowMascot] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowMascot(true), 200);
    const t2 = setTimeout(() => setShowText(true), 700);
    const t3 = setTimeout(() => setShowButtons(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      {/* Soft decorative background circles */}
      <div className="absolute top-[-80px] right-[-60px] w-[240px] h-[240px] rounded-full bg-primary/8 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-[-60px] left-[-40px] w-[200px] h-[200px] rounded-full bg-accent/10 blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Mascot */}
      <div
        className={`transition-all duration-700 ease-out ${
          showMascot ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-90"
        }`}
      >
        <img
          src={mascot}
          alt={isEn ? "SpeakAble HK parrot mascot" : "SpeakAble HK 鸚鵡吉祥物"}
          className="h-40 w-40 md:h-48 md:w-48 object-contain mascot-bounce drop-shadow-lg"
        />
      </div>

      {/* Greeting Text */}
      <div
        className={`text-center mt-6 mb-10 max-w-sm transition-all duration-700 ease-out delay-100 ${
          showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-snug mb-3">
          {isEn ? "Welcome to" : isTW ? "歡迎來到" : "欢迎来到"}
          <br />
          <span className="text-primary">SpeakAble HK</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          {isEn
            ? "Let's practise Cantonese together."
            : isTW
            ? "一起練習廣東話吧。"
            : "一起练习广东话吧。"}
        </p>
      </div>

      {/* Two Main Buttons */}
      <div
        className={`w-full max-w-sm space-y-4 transition-all duration-700 ease-out delay-200 ${
          showButtons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Game Mode */}
        <button
          onClick={() => navigate("/")}
          className="w-full bg-primary text-primary-foreground rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-1 active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group"
          style={{ boxShadow: "0 6px 0 hsl(var(--primary-dark))" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 min-w-[56px] rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Gamepad2 className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <span className="text-xl font-extrabold block leading-tight">
                {isEn ? "Game Mode" : isTW ? "遊戲模式" : "游戏模式"}
              </span>
              <span className="text-sm font-medium text-primary-foreground/80 mt-0.5 block leading-snug">
                {isEn
                  ? "Interactive pronunciation practice through games."
                  : isTW
                  ? "通過遊戲進行互動發音練習。"
                  : "通过游戏进行互动发音练习。"}
              </span>
            </div>
          </div>
        </button>

        {/* Speech Therapy Information */}
        <button
          onClick={() => navigate("/about")}
          className="w-full bg-card text-foreground border-2 border-border rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group"
          style={{ boxShadow: "0 6px 0 hsl(var(--border))" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 min-w-[56px] rounded-xl bg-accent/15 flex items-center justify-center">
              <BookHeart className="h-7 w-7 text-accent" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <span className="text-xl font-extrabold block leading-tight">
                {isEn
                  ? "Speech Therapy Information"
                  : isTW
                  ? "言語治療資訊"
                  : "言语治疗资讯"}
              </span>
              <span className="text-sm font-medium text-muted-foreground mt-0.5 block leading-snug">
                {isEn
                  ? "Educational information about speech therapy and speech development."
                  : isTW
                  ? "關於言語治療和語言發展的教育資訊。"
                  : "关于言语治疗和语言发展的教育资讯。"}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Footer note */}
      <p
        className={`text-xs text-muted-foreground mt-10 text-center transition-all duration-700 delay-300 ${
          showButtons ? "opacity-100" : "opacity-0"
        }`}
      >
        © 2026 SpeakAble HK
      </p>
    </div>
  );
};

export default WelcomePage;
