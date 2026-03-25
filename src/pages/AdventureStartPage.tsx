import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import { BrandHeader } from "@/components/BrandHeader";
import mascot from "@/assets/pipi-mascot.png";

function getUserNickname(): string {
  try {
    const raw = localStorage.getItem("speakable_user");
    if (!raw) return "朋友";
    const data = JSON.parse(raw);
    return data?.nickname || data?.name || data?.displayName || "朋友";
  } catch {
    return "朋友";
  }
}

const ISLANDS = [
  {
    name: "語音島",
    icon: "graphic_eq",
    gradient: "linear-gradient(160deg, #34d399 0%, #059669 55%, #047857 100%)",
    color: "#ecfdf5",
    delay: "",
  },
  {
    name: "語義島",
    icon: "auto_stories",
    gradient: "linear-gradient(160deg, #fbbf24 0%, #ea580c 50%, #c2410c 100%)",
    color: "#fffbeb",
    delay: "0.6s",
  },
] as const;

export default function AdventureStartPage() {
  const navigate = useNavigate();
  const nickname = useMemo(getUserNickname, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "linear-gradient(180deg, #b8e8f5 0%, #dff4fb 35%, #f3f7fb 70%, #ffffff 100%)" }}>
      {/* Blobs */}
      <div className="absolute w-72 h-72 rounded-full bg-cyan-300/60 -top-16 -left-20 blur-[48px] opacity-45 pointer-events-none" aria-hidden="true" />
      <div className="absolute w-96 h-96 rounded-full bg-sky-200/50 top-1/3 -right-24 blur-[48px] opacity-45 pointer-events-none" aria-hidden="true" />
      <div className="absolute w-64 h-64 rounded-full bg-teal-200/40 bottom-32 left-1/4 blur-[48px] opacity-45 pointer-events-none" aria-hidden="true" />
      <div className="absolute w-80 h-80 rounded-full bg-amber-200/35 bottom-10 right-10 blur-[48px] opacity-45 pointer-events-none" aria-hidden="true" />

      {/* Cloud layers */}
      <div className="cloud-layer-left" aria-hidden="true" />
      <div className="cloud-layer-right" aria-hidden="true" />

      <BrandHeader />

      {/* Main content (reveals after cloud animation) */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-36 pt-20 sm:px-6">
        <div className="reveal-stack flex w-full max-w-lg flex-col items-center text-center">
          {/* PiPi mascot */}
          <div className="relative mb-6">
            <img
              src={mascot}
              alt="皮皮鸚鵡"
              className="h-40 w-40 sm:h-48 sm:w-48 object-contain drop-shadow-2xl animate-pipi-bob"
            />
          </div>

          {/* Speech bubble */}
          <div className="font-body relative mb-8 max-w-md rounded-2xl border-2 border-primary bg-surface px-5 py-4 text-left text-[15px] leading-relaxed shadow-lg sm:text-base text-on-surface">
            <span className="absolute -left-1 top-6 h-4 w-4 rotate-45 border-b-2 border-l-2 border-primary bg-surface sm:-left-2" aria-hidden="true" />
            <p>
              歡迎你，<span className="font-bold text-primary">{nickname}</span>！我是皮皮，你的冒險夥伴！練習賺取的金幣可以幫我買食物和酷炫物品！
            </p>
          </div>

          {/* Island previews */}
          <div className="mb-10 grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {ISLANDS.map((island) => (
              <div
                key={island.name}
                className="flex flex-col items-center rounded-2xl p-5 text-center shadow-lg ring-1 ring-white/60 animate-float"
                style={{
                  background: island.gradient,
                  color: island.color,
                  animationDelay: island.delay,
                  animationDuration: "4.5s",
                }}
              >
                <MaterialIcon icon={island.icon} filled className="mb-2 text-4xl text-white/95" />
                <span className="font-headline text-sm font-semibold uppercase tracking-wide opacity-90">
                  {island.name}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("/explorer")}
            className="font-headline inline-flex min-w-[220px] items-center justify-center rounded-full px-10 py-4 text-lg font-semibold text-white shadow-xl transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 active:scale-95"
            style={{ background: "linear-gradient(180deg, #006479 0%, #004a5a 100%)" }}
          >
            開始冒險！
          </button>
        </div>
      </div>

      {/* Ocean wave SVG */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 text-primary/25" aria-hidden="true">
        <svg className="w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" fillOpacity="0.35" d="M0,64 C180,20 360,100 540,56 C720,12 900,92 1080,48 C1260,4 1380,84 1440,64 L1440,120 L0,120 Z" />
          <path fill="currentColor" fillOpacity="0.2" d="M0,88 C200,40 400,110 600,72 C800,34 1000,96 1200,58 C1320,34 1400,78 1440,72 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  );
}
