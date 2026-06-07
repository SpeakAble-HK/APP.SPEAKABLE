import { useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";

export default function AuraStoryPage() {
  const navigate = useNavigate();
  const handleOpen = () => navigate("/enchanted-forest");

  return (
    <div className="min-h-screen bg-slate-950 px-3 py-6 md:px-6 md:py-10">
      <section
        aria-labelledby="aura-story-title"
        className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border-2 border-cyan-400/70 shadow-[0_0_60px_-10px_rgba(34,211,238,0.6)] ring-1 ring-cyan-300/30"
      >
        <div className="relative aspect-[16/10] w-full">
          <svg
            viewBox="0 0 1280 800"
            className="absolute inset-0 block h-full w-full"
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label="靈光故事：森林故事任務已解鎖"
          >
            <defs>
              <radialGradient id="as-sky" cx="50%" cy="40%" r="80%">
                <stop offset="0%" stopColor="#0c1b3a" />
                <stop offset="60%" stopColor="#050a1a" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              <radialGradient id="as-portal" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#7dd3fc" stopOpacity="1" />
                <stop offset="40%" stopColor="#22d3ee" stopOpacity="0.85" />
                <stop offset="80%" stopColor="#1e40af" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="as-orb" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="60%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </radialGradient>
              <linearGradient id="as-stream" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="as-stone" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="as-vine" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <filter id="as-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="14" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="as-glow-sm" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Night sky */}
            <rect width="1280" height="800" fill="url(#as-sky)" />

            {/* Stars */}
            {Array.from({ length: 60 }).map((_, i) => {
              const x = (i * 137) % 1280;
              const y = (i * 73) % 380;
              const r = (i % 3) * 0.7 + 0.4;
              return <circle key={`s-${i}`} cx={x} cy={y} r={r} fill="#bae6fd" opacity={0.4 + (i % 5) * 0.12} />;
            })}

            {/* Distant tree silhouettes */}
            <path
              d="M 0 540 L 0 380 L 60 360 L 90 300 L 130 360 L 180 320 L 230 380 L 280 330 L 340 380 L 420 310 L 500 380 L 580 340 L 660 380 L 720 320 L 800 380 L 880 340 L 960 380 L 1040 320 L 1120 380 L 1200 340 L 1280 380 L 1280 540 Z"
              fill="#020617"
              opacity="0.9"
            />

            {/* Portal arch (stone frame) */}
            <g transform="translate(640 470)">
              <path
                d="M -180 200 L -180 -40 C -180 -180, 180 -180, 180 -40 L 180 200 Z"
                fill="url(#as-stone)"
                stroke="#0f172a"
                strokeWidth="3"
              />
              {/* Stone block highlights */}
              {Array.from({ length: 8 }).map((_, i) => {
                const a = -Math.PI / 2 + (i - 3.5) * 0.22;
                const x = Math.cos(a) * 195;
                const y = Math.sin(a) * 195 + 60;
                return (
                  <rect
                    key={`stone-${i}`}
                    x={x - 18}
                    y={y - 14}
                    width="36"
                    height="28"
                    rx="4"
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="1.5"
                    opacity="0.9"
                  />
                );
              })}
              {/* Vines */}
              <path
                d="M -170 -20 C -160 -60, -120 -90, -80 -110 C -40 -130, 0 -120, 20 -150"
                stroke="#1e293b"
                strokeWidth="6"
                fill="none"
              />
              <path
                d="M 170 -20 C 160 -60, 120 -90, 80 -110 C 40 -130, 0 -120, -20 -150"
                stroke="#1e293b"
                strokeWidth="6"
                fill="none"
              />

              {/* Portal interior swirl */}
              <ellipse cx="0" cy="40" rx="155" ry="200" fill="url(#as-portal)" filter="url(#as-glow)" />
              <ellipse cx="0" cy="40" rx="110" ry="160" fill="#22d3ee" opacity="0.25" />
              <ellipse cx="0" cy="40" rx="60" ry="100" fill="#bae6fd" opacity="0.35" />
              {/* Swirling lines */}
              {Array.from({ length: 8 }).map((_, i) => (
                <ellipse
                  key={`sw-${i}`}
                  cx="0"
                  cy="40"
                  rx={140 - i * 14}
                  ry={180 - i * 18}
                  fill="none"
                  stroke="#67e8f9"
                  strokeWidth="1"
                  opacity={0.15 + i * 0.04}
                />
              ))}
            </g>

            {/* Glow ground around portal */}
            <ellipse cx="640" cy="680" rx="260" ry="40" fill="#22d3ee" opacity="0.25" filter="url(#as-glow)" />

            {/* Stream path */}
            <path
              d="M 640 700 C 560 720, 480 730, 380 760 L 420 800 L 860 800 L 900 760 C 800 730, 720 720, 640 700 Z"
              fill="url(#as-stream)"
              opacity="0.85"
            />
            <path
              d="M 640 700 C 580 720, 520 730, 440 760"
              stroke="#bae6fd"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />

            {/* Foreground dark trees */}
            <g>
              {/* Left big tree */}
              <path d="M 90 800 L 90 460 C 60 440, 50 400, 80 360 C 60 320, 100 280, 140 300 C 170 250, 230 270, 230 320 C 280 320, 290 380, 250 410 C 270 450, 240 480, 200 470 L 200 800 Z" fill="#020617" />
              {/* Right big tree */}
              <path d="M 1190 800 L 1190 460 C 1220 440, 1230 400, 1200 360 C 1220 320, 1180 280, 1140 300 C 1110 250, 1050 270, 1050 320 C 1000 320, 990 380, 1030 410 C 1010 450, 1040 480, 1080 470 L 1080 800 Z" fill="#020617" />
              {/* Smaller mid trees */}
              <path d="M 280 800 L 280 600 L 260 600 L 300 540 L 280 540 L 320 480 L 360 540 L 340 540 L 380 600 L 360 600 L 360 800 Z" fill="#020617" />
              <path d="M 920 800 L 920 600 L 900 600 L 940 540 L 920 540 L 960 480 L 1000 540 L 980 540 L 1020 600 L 1000 600 L 1000 800 Z" fill="#020617" />
            </g>

            {/* Glowing flowers / mushrooms */}
            {[
              { x: 250, y: 720, c: "#22d3ee" },
              { x: 330, y: 760, c: "#a78bfa" },
              { x: 980, y: 720, c: "#22d3ee" },
              { x: 1040, y: 760, c: "#a78bfa" },
              { x: 460, y: 770, c: "#67e8f9" },
              { x: 820, y: 770, c: "#67e8f9" },
            ].map((f, i) => (
              <g key={`f-${i}`} transform={`translate(${f.x} ${f.y})`} filter="url(#as-glow-sm)">
                <circle r="5" fill={f.c} />
                <circle r="10" fill={f.c} opacity="0.35" />
              </g>
            ))}

            {/* Fireflies */}
            {Array.from({ length: 14 }).map((_, i) => {
              const x = 200 + ((i * 89) % 880);
              const y = 380 + ((i * 53) % 240);
              return (
                <g key={`fly-${i}`} filter="url(#as-glow-sm)">
                  <circle cx={x} cy={y} r="2.5" fill="#67e8f9" />
                  <circle cx={x} cy={y} r="6" fill="#67e8f9" opacity="0.3" />
                </g>
              );
            })}
          </svg>

          {/* Title block */}
          <div className="pointer-events-none absolute left-5 top-5 md:left-10 md:top-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)]" aria-hidden="true" />
              <h1
                id="aura-story-title"
                className="font-display text-4xl font-black tracking-wide text-transparent md:text-6xl"
                style={{
                  backgroundImage: "linear-gradient(180deg, #fef3c7 0%, #fbbf24 50%, #b45309 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextStroke: "1px rgba(120, 53, 15, 0.9)",
                  filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.6)) drop-shadow(0 0 16px rgba(252,211,77,0.4))",
                }}
              >
                靈光故事
              </h1>
              <Sparkles className="h-5 w-5 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)]" aria-hidden="true" />
            </div>
            <p className="mt-2 text-sm font-bold tracking-wide text-cyan-100/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-base">
              森林故事任務已解鎖
            </p>
          </div>

          {/* Unlocked badge */}
          <div className="absolute bottom-5 left-5 md:bottom-8 md:left-10">
            <div className="flex items-center gap-2 rounded-full border-2 border-amber-300/80 bg-slate-900/70 px-4 py-2 shadow-[0_0_20px_rgba(252,211,77,0.4)] backdrop-blur">
              <Lock className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <span className="text-sm font-extrabold tracking-wide text-amber-200">已解鎖</span>
            </div>
          </div>

          {/* Open button */}
          <div className="absolute bottom-5 right-5 md:bottom-8 md:right-10">
            <button
              type="button"
              onClick={handleOpen}
              aria-label="開啟靈光故事互動森林"
              className="group relative inline-flex h-32 w-32 items-center justify-center rounded-full focus-visible:outline-none md:h-40 md:w-40"
            >
              {/* Gold ring */}
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full border-[6px] border-amber-300/90 shadow-[0_0_30px_rgba(252,211,77,0.55)] ring-2 ring-amber-200/40"
                style={{
                  background:
                    "conic-gradient(from 0deg, #fbbf24, #fde68a, #b45309, #fbbf24)",
                }}
              />
              {/* Inner orb */}
              <span
                aria-hidden="true"
                className="absolute inset-2 rounded-full"
                style={{
                  background: "radial-gradient(circle at 40% 35%, #bae6fd 0%, #0ea5e9 55%, #1e3a8a 100%)",
                  boxShadow:
                    "inset 0 0 30px rgba(255,255,255,0.4), 0 0 40px rgba(34,211,238,0.5)",
                }}
              />
              <span className="relative z-10 inline-flex items-center gap-1 text-2xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] md:text-3xl">
                Open
                <Sparkles className="h-4 w-4 text-cyan-100" aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
