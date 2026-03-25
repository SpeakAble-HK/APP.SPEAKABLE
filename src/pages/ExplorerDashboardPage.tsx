import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import pipiIsland from "@/assets/pipi-island.png";

export default function ExplorerDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-surface overflow-hidden">
      <main className="relative h-[calc(100vh-160px)] w-full overflow-hidden ocean-gradient">
        {/* Cloud textures */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/40 blur-[80px] rounded-full" aria-hidden="true" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-container/20 blur-[100px] rounded-full" aria-hidden="true" />

        {/* Golden shimmer path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" fill="none" viewBox="0 0 1200 800" aria-hidden="true">
          <path
            d="M300 500C450 480 550 550 700 450C850 350 950 400 1050 350"
            stroke="#ffc300"
            strokeDasharray="2 20"
            strokeLinecap="round"
            strokeWidth="12"
            className="animate-shimmer"
          />
        </svg>

        <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center p-8">
          {/* Phonology Island */}
          <button
            onClick={() => navigate("/speech-quest")}
            className="absolute left-[15%] top-[50%] -translate-y-1/2 group cursor-pointer"
            style={{ filter: "drop-shadow(0 25px 25px rgba(0,100,121,0.15))" }}
          >
            <div className="relative">
              <div className="w-80 h-80 rounded-[4rem] bg-gradient-to-br from-green-500 to-green-300 p-2 -rotate-[5deg] group-hover:rotate-0 transition-transform duration-500 overflow-hidden shadow-2xl flex items-center justify-center">
                <MaterialIcon icon="graphic_eq" filled className="text-white text-7xl" />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl px-8 py-3 rounded-full shadow-xl border-2 border-primary/10">
                <span className="font-headline font-bold text-primary tracking-wide text-lg whitespace-nowrap">
                  語音島
                </span>
              </div>
            </div>
          </button>

          {/* PiPi on a boat */}
          <div className="absolute left-[48%] top-[55%] z-20 hover:scale-110 transition-transform duration-300">
            <div className="relative w-24 h-24">
              <div className="absolute -top-4 -right-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                PiPi
              </div>
              <img
                src={pipiIsland}
                alt="皮皮在船上"
                className="w-full h-full object-contain drop-shadow-2xl animate-float"
              />
            </div>
          </div>

          {/* Semantic Island */}
          <button
            onClick={() => navigate("/semantic-island")}
            className="absolute right-[10%] top-[30%] group cursor-pointer"
            style={{ filter: "drop-shadow(0 25px 25px rgba(0,100,121,0.15))" }}
          >
            <div className="relative">
              <div className="w-96 h-72 rounded-[5rem] bg-gradient-to-tr from-orange-400 to-amber-300 p-2 rotate-[8deg] group-hover:rotate-0 transition-transform duration-500 overflow-hidden shadow-2xl flex items-center justify-center">
                <MaterialIcon icon="auto_stories" filled className="text-white text-7xl" />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl px-8 py-3 rounded-full shadow-xl border-2 border-secondary/10">
                <span className="font-headline font-bold text-secondary tracking-wide text-lg whitespace-nowrap">
                  語義島
                </span>
              </div>
            </div>
          </button>

          {/* Decorative elements */}
          <div className="absolute top-20 right-[40%] text-amber-400/40" aria-hidden="true">
            <MaterialIcon icon="sunny" className="text-8xl" />
          </div>
          <div className="absolute bottom-40 left-[40%] text-primary/20" aria-hidden="true">
            <MaterialIcon icon="waves" className="text-6xl" />
          </div>
        </div>

        {/* Continue Adventure FAB */}
        <button
          onClick={() => navigate("/speech-quest")}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 bg-white/80 backdrop-blur-2xl px-10 py-5 rounded-full shadow-2xl flex items-center gap-4 hover:scale-105 transition-all border-t border-white/40 active:scale-95"
        >
          <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container">
            <MaterialIcon icon="play_arrow" filled />
          </div>
          <div className="text-left">
            <p className="font-headline font-bold text-on-surface text-lg">繼續冒險</p>
            <p className="text-sm text-on-surface-variant font-medium">前往語音島</p>
          </div>
        </button>
      </main>
    </div>
  );
}
