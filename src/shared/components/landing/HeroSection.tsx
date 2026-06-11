import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/shared/components/MaterialIcon";
import heroMascot from "@/assets/pipi-mascot.png";
import { useLanguage } from "@/shared/contexts/LanguageContext";

export function HeroSection() {
  const navigate = useNavigate();
  const { t3 } = useLanguage();

  const TAGS = [
    {
      icon: "psychology",
      label: t3("Smart helper", "聰明小幫手", "聪明小帮手"),
      bg: "bg-sky-soft text-sky-800",
    },
    {
      icon: "flag",
      label: t3("Pure Cantonese", "純粵語練習", "纯粤语练习"),
      bg: "bg-mint-soft text-emerald-800",
    },
    {
      icon: "star",
      label: t3("Fun quests", "趣味任務", "趣味任务"),
      bg: "bg-sunshine-soft text-amber-800",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-cream">
      {/* Floating clouds */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 left-6 w-40 h-24 bg-white/70 rounded-full blur-2xl" />
        <div className="absolute top-32 right-10 w-56 h-28 bg-white/60 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 left-1/3 w-72 h-32 bg-white/50 rounded-full blur-2xl" />
        {/* Soft pastel orbs */}
        <div className="absolute -top-16 -left-10 w-[360px] h-[360px] bg-sky-soft/70 rounded-full blur-[80px]" />
        <div className="absolute top-1/3 -right-16 w-80 h-80 bg-mint-soft/60 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-sunshine-soft/70 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-20 flex flex-col items-center text-center">
        {/* Sun halo + PiPi */}
        <div className="relative mb-8">
          <div
            className="absolute inset-0 -m-10 rounded-full bg-sunshine/40 blur-3xl animate-pulse"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 -m-2 rounded-full bg-gradient-to-br from-sunshine to-coral opacity-25"
            aria-hidden="true"
          />
          <div className="relative w-60 h-60 sm:w-72 sm:h-72">
            <img
              alt={t3("PiPi Parrot Mascot", "PiPi 鸚鵡吉祥物", "PiPi 鹦鹉吉祥物")}
              src={heroMascot}
              className="w-full h-full object-contain animate-pipi-bob"
              style={{
                filter: "drop-shadow(0 24px 36px rgba(255,138,92,0.35))",
              }}
            />
          </div>
        </div>

        {/* Greeting bubble */}
        <div className="relative mb-6 -mt-2 inline-block bg-white rounded-3xl px-5 py-2.5 shadow-soft border-2 border-sunshine/30">
          <span className="font-headline font-extrabold text-coral text-base sm:text-lg">
            {t3("Hi! I'm PiPi 👋", "嗨！我係皮皮 👋", "嗨！我是皮皮 👋")}
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-headline font-extrabold text-[2rem] sm:text-5xl md:text-[3.25rem] text-ink leading-[1.1] mb-5 tracking-tight">
          {t3("Let's play with sounds,", "一齊用聲音玩遊戲，", "一起用声音玩游戏，")}
          <br />
          <span className="text-coral">
            {t3("learn Cantonese together!", "一齊學粵語！", "一起学粤语！")}
          </span>
        </h1>

        <p className="text-slate text-lg sm:text-xl font-medium leading-relaxed mb-2 max-w-xl">
          {t3(
            "A warm, friendly practice playground for kids and families.",
            "一個溫暖、親切的練習小天地，畀小朋友同家庭。",
            "一个温暖、亲切的练习小天地，给小朋友和家庭。"
          )}
        </p>

        <p className="font-headline text-sky-800 font-bold text-base sm:text-lg mb-8">
          {t3(
            '"Learn from your own voice"',
            "「從你自己嘅聲音中學習」",
            "「从你自己的声音中学习」"
          )}
        </p>

        {/* Feature tags */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {TAGS.map((tag) => (
            <span
              key={tag.label}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 ${tag.bg} font-headline font-bold text-sm rounded-full shadow-sm`}
            >
              <MaterialIcon icon={tag.icon} filled className="text-base" />
              {tag.label}
            </span>
          ))}
        </div>

        {/* Giant CTA */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center mb-5">
          <button
            onClick={() => navigate("/role-select")}
            className="group relative bg-gradient-to-br from-sunshine via-coral to-coral-deep text-white font-headline font-extrabold text-xl sm:text-2xl px-12 py-5 sm:py-6 rounded-full shadow-playful hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <MaterialIcon icon="play_circle" filled className="text-3xl" />
            {t3("Let's Play!", "一齊玩！", "一起玩！")}
            <MaterialIcon
              icon="arrow_forward"
              className="text-2xl group-hover:translate-x-1 transition-transform"
            />
          </button>
          <button
            onClick={() => navigate("/explorer/onboarding")}
            className="bg-white border-2 border-sky-bright text-sky-800 font-headline font-extrabold text-base sm:text-lg px-8 py-4 rounded-full shadow-soft hover:shadow-md transition-all hover:scale-105 active:scale-95"
          >
            {t3("Meet PiPi", "識下皮皮", "认识皮皮")}
          </button>
        </div>

        <p className="text-slate/70 text-sm font-medium tracking-wide">
          {t3(
            "For all ages · Free to use",
            "適合所有年齡 · 免費使用",
            "适合所有年龄 · 免费使用"
          )}
        </p>
      </div>
    </section>
  );
}
