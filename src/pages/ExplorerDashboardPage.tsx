import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Trophy, Star } from "lucide-react";
import pipiIsland from "@/assets/pipi-island.png";
import islandBg from "@/assets/island-bg.jpg";

export default function ExplorerDashboardPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("探險家");

  useEffect(() => {
    const stored = sessionStorage.getItem("explorer_nickname");
    if (stored) setNickname(stored);
  }, []);

  const getProgress = () => {
    try { return JSON.parse(sessionStorage.getItem("lesson_progress") || "{}"); }
    catch { return {}; }
  };

  const progress = getProgress();
  const completedCount = Object.values(progress).filter((p: any) => p.completed).length;
  const totalXp = Object.values(progress).reduce((sum: number, p: any) => sum + (p.xp_earned || 0), 0) as number;

  return (
    <div className="min-h-full bg-background">
      {/* Stats Bar */}
      <div className="bg-card px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">🦜</span>
          <span className="font-extrabold text-foreground">{nickname}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
              <Star className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
            <span className="text-sm font-extrabold text-foreground">{totalXp}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-destructive flex items-center justify-center">
              <Flame className="h-3.5 w-3.5 text-destructive-foreground" />
            </div>
            <span className="text-sm font-extrabold text-foreground">0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-success flex items-center justify-center">
              <Trophy className="h-3.5 w-3.5 text-success-foreground" />
            </div>
            <span className="text-sm font-extrabold text-foreground">{completedCount}</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Hero Card */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-lg"
          style={{ minHeight: 260 }}
        >
          <img src={islandBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="relative flex flex-col items-center justify-end h-full p-6 pt-4">
            <img src={pipiIsland} alt="皮皮" className="h-40 w-40 object-contain mascot-bounce drop-shadow-lg" width={1024} height={1024} />
            <button
              onClick={() => navigate("/speech-quest")}
              className="mt-4 w-full max-w-xs h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-extrabold shadow-[0_5px_0_hsl(var(--primary-dark))] hover:shadow-[0_3px_0_hsl(var(--primary-dark))] active:shadow-[0_1px_0_hsl(var(--primary-dark))] active:translate-y-[2px] transition-all"
            >
              開始今日練習
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-foreground">📊 整體進度</span>
            <span className="text-xs font-bold text-muted-foreground">{completedCount}/11 課</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(completedCount / 11) * 100}%` }}
            />
          </div>
        </div>

        {/* Recent Practice */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <h3 className="text-sm font-bold text-foreground mb-3">📝 最近練習</h3>
          {completedCount === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              仲未開始練習，快啲去語音冒險開始啦！
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(progress)
                .filter(([, v]: any) => v.completed)
                .slice(-3)
                .map(([id, v]: any) => (
                  <div key={id} className="flex items-center justify-between py-2 px-3 bg-success/10 rounded-xl">
                    <span className="text-sm font-bold text-foreground">✅ {id}</span>
                    <span className="text-xs font-bold text-success">{v.accuracy_score}%</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
