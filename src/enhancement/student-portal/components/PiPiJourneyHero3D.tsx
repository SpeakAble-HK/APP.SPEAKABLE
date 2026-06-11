import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import mascot from "@/assets/pipi-mascot.png";

const TOTAL_CHAPTERS = 12;
const UNLOCKED_CHAPTERS = 8;
const PATH_D =
  "M 90 470 C 180 480, 240 430, 310 430 S 430 470, 500 440 S 640 360, 720 360 S 870 410, 940 360 S 1090 240, 1190 170";

type Stop = { n: number; x: number; y: number; kind?: "dots" | "crown" };

const STOPS: Stop[] = [
  { n: 1, x: 130, y: 480 },
  { n: 2, x: 360, y: 442 },
  { n: 3, x: 540, y: 430 },
  { n: 4, x: 720, y: 360 },
  { n: 5, x: 900, y: 320 },
  { n: 0, x: 1000, y: 280, kind: "dots" },
  { n: 12, x: 1180, y: 170, kind: "crown" },
];

const STAR_MARKS = [3, 6, 9, 12];

export default function PiPiJourneyHero3D() {
  const navigate = useNavigate();

  const stars = useMemo(
    () =>
      STAR_MARKS.map((mark) => ({
        mark,
        unlocked: mark <= UNLOCKED_CHAPTERS,
        left: `${(mark / TOTAL_CHAPTERS) * 100}%`,
      })),
    []
  );

  const handleChapterClick = (n: number) => {
    if (n <= 0) return;
    navigate(`/speech-quest?chapter=${n}`);
  };

  const handleOpen = () => navigate("/speech-quest");

  return (
    <section className="relative mx-auto w-full max-w-6xl px-3 pt-3 md:px-6 md:pt-6">
      <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-400/70 bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.45)]">
        {/* Wooden title bracket */}
        <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2 md:top-5">
          <div className="relative inline-flex items-center gap-2 rounded-2xl border-b-4 border-amber-900 bg-gradient-to-b from-amber-500 to-amber-700 px-5 py-2 shadow-lg md:px-7 md:py-2.5">
            <span className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-amber-900" />
            <span className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-amber-900" />
            <h2 className="font-display text-xl font-extrabold tracking-wide text-white drop-shadow md:text-2xl">
              <span className="text-yellow-300">皮皮</span>旅程
            </h2>
          </div>
        </div>

        {/* SVG cartoon map */}
        <div className="relative h-[360px] w-full md:h-[460px]">
          <svg
            viewBox="0 0 1280 560"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="皮皮旅程地圖"
          >
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </linearGradient>
              <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
              <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="path" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#fde68a" />
              </linearGradient>
              <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Sky */}
            <rect x="0" y="0" width="1280" height="560" fill="url(#sky)" />

            {/* Mountains */}
            <polygon points="0,260 180,140 320,260" fill="#a5b4fc" opacity="0.7" />
            <polygon points="220,260 380,120 540,260" fill="#818cf8" opacity="0.7" />
            <polygon points="900,260 1060,140 1220,260" fill="#a5b4fc" opacity="0.7" />

            {/* Clouds */}
            <g fill="#fff" opacity="0.95">
              <ellipse cx="180" cy="90" rx="40" ry="14" />
              <ellipse cx="210" cy="80" rx="28" ry="12" />
              <ellipse cx="780" cy="70" rx="44" ry="14" />
              <ellipse cx="810" cy="60" rx="30" ry="12" />
              <ellipse cx="1080" cy="100" rx="36" ry="12" />
            </g>

            {/* Far hills */}
            <path d="M0,330 C 200,280 380,360 620,310 S 1000,260 1280,320 L 1280,560 L 0,560 Z" fill="url(#hill)" />
            <path
              d="M0,400 C 220,360 460,440 720,400 S 1080,360 1280,400 L 1280,560 L 0,560 Z"
              fill="#22c55e"
              opacity="0.9"
            />

            {/* River */}
            <path
              d="M 1100,560 C 1080,460 980,420 900,440 S 760,520 700,560 Z"
              fill="url(#river)"
              opacity="0.85"
            />
            {/* Bridge */}
            <rect x="820" y="430" width="80" height="10" rx="4" fill="#92400e" />
            <rect x="820" y="430" width="80" height="3" fill="#fde68a" />

            {/* Trees scattered */}
            {[
              [60, 470],
              [240, 500],
              [430, 490],
              [600, 470],
              [780, 490],
              [990, 500],
              [1150, 490],
            ].map(([x, y], i) => (
              <g key={`tree-${i}`} filter="url(#ds)">
                <rect x={x - 4} y={y} width="8" height="20" fill="#92400e" />
                <circle cx={x} cy={y - 4} r="22" fill="#16a34a" />
                <circle cx={x - 10} cy={y - 12} r="14" fill="#22c55e" />
                <circle cx={x + 12} cy={y - 14} r="14" fill="#22c55e" />
              </g>
            ))}

            {/* Cottages */}
            <g filter="url(#ds)">
              <rect x="430" y="380" width="60" height="44" fill="#fde68a" stroke="#92400e" strokeWidth="2" />
              <polygon points="425,380 460,348 495,380" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />
              <rect x="450" y="400" width="20" height="24" fill="#92400e" />
            </g>
            <g filter="url(#ds)">
              <rect x="640" y="320" width="60" height="44" fill="#fef3c7" stroke="#92400e" strokeWidth="2" />
              <polygon points="635,320 670,288 705,320" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />
              <rect x="660" y="340" width="20" height="24" fill="#92400e" />
            </g>

            {/* Windmill */}
            <g filter="url(#ds)" transform="translate(960,260)">
              <polygon points="-22,90 22,90 16,0 -16,0" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
              <circle cx="0" cy="0" r="6" fill="#475569" />
              <g>
                <rect x="-3" y="-50" width="6" height="50" fill="#dc2626" />
                <rect x="0" y="-3" width="50" height="6" fill="#dc2626" />
                <rect x="-3" y="0" width="6" height="50" fill="#dc2626" />
                <rect x="-50" y="-3" width="50" height="6" fill="#dc2626" />
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite" />
              </g>
            </g>

            {/* Journey path */}
            <path d={PATH_D} fill="none" stroke="#fde68a" strokeWidth="20" strokeLinecap="round" opacity="0.95" />
            <path d={PATH_D} fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="8 10" strokeLinecap="round" opacity="0.8" />

            {/* Chapter stops */}
            {STOPS.map((s) => {
              const unlocked = s.n > 0 && s.n <= UNLOCKED_CHAPTERS;
              if (s.kind === "dots") {
                return (
                  <g key="dots">
                    <circle cx={s.x - 14} cy={s.y} r="4" fill="#94a3b8" />
                    <circle cx={s.x} cy={s.y} r="4" fill="#94a3b8" />
                    <circle cx={s.x + 14} cy={s.y} r="4" fill="#94a3b8" />
                  </g>
                );
              }
              if (s.kind === "crown") {
                return (
                  <g
                    key={`stop-${s.n}`}
                    transform={`translate(${s.x},${s.y})`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleChapterClick(s.n)}
                  >
                    <circle r="26" fill="#fbbf24" stroke="#b45309" strokeWidth="3" filter="url(#ds)" />
                    <polygon points="-14,-4 -7,-14 0,-4 7,-14 14,-4 10,8 -10,8" fill="#fde68a" stroke="#b45309" strokeWidth="2" />
                  </g>
                );
              }
              return (
                <g
                  key={`stop-${s.n}`}
                  transform={`translate(${s.x},${s.y})`}
                  style={{ cursor: unlocked ? "pointer" : "not-allowed" }}
                  onClick={() => unlocked && handleChapterClick(s.n)}
                >
                  <circle
                    r="22"
                    fill={unlocked ? "#10b981" : "#cbd5e1"}
                    stroke={unlocked ? "#047857" : "#94a3b8"}
                    strokeWidth="3"
                    filter="url(#ds)"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="18"
                    fontWeight="800"
                    fill="#fff"
                  >
                    {s.n}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Pipi mascot floating on the path */}
          <img
            src={mascot}
            alt="皮皮"
            className="pointer-events-none absolute select-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]"
            style={{
              left: "18%",
              bottom: "20%",
              height: 96,
              transform: "translateX(-50%)",
              animation: "pipi-float 3.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Progress bar with star marks */}
        <div className="relative mx-4 mb-4 mt-2 md:mx-6 md:mb-6">
          <div className="relative h-3 w-full overflow-visible rounded-full bg-emerald-200/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              style={{ width: `${(UNLOCKED_CHAPTERS / TOTAL_CHAPTERS) * 100}%` }}
            />
            {stars.map((s) => (
              <div
                key={s.mark}
                className="absolute -top-2.5 -translate-x-1/2"
                style={{ left: s.left }}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 shadow ${
                    s.unlocked
                      ? "border-amber-500 bg-amber-300 text-amber-900"
                      : "border-slate-400 bg-slate-200 text-slate-500"
                  }`}
                >
                  <Star className="h-3.5 w-3.5" fill="currentColor" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-900 md:text-sm">
              已解鎖 {UNLOCKED_CHAPTERS} / {TOTAL_CHAPTERS} 章節
            </p>
            <button
              type="button"
              onClick={handleOpen}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_4px_0_#047857] transition hover:bg-emerald-600 active:translate-y-[2px] active:shadow-[0_2px_0_#047857] md:text-base"
            >
              Open
              <span className="text-lg leading-none">›</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pipi-float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-14px); }
        }
      `}</style>
    </section>
  );
}
