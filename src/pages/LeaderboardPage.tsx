import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, Medal, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import mascot from "@/assets/mascot.png";

const mockUsers = [
  { rank: 1, name: "Player 1", xp: 2450, medal: "🥇" },
  { rank: 2, name: "Player 2", xp: 2100, medal: "🥈" },
  { rank: 3, name: "Player 3", xp: 1850, medal: "🥉" },
  { rank: 4, name: "Player 4", xp: 1600, medal: "" },
  { rank: 5, name: "Player 5", xp: 1400, medal: "" },
  { rank: 6, name: "Player 6", xp: 1200, medal: "" },
  { rank: 7, name: "Player 7", xp: 950, medal: "" },
  { rank: 8, name: "Player 8", xp: 800, medal: "" },
];

const LeaderboardPage = () => {
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 font-bold">
            <ArrowLeft className="h-4 w-4" />
            {isEn ? "Back" : "返回"}
          </Button>
        </Link>

        <div className="text-center mb-8">
          <img src={mascot} alt="" className="h-16 w-16 mx-auto mb-3 mascot-bounce" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
            {isEn ? "Leaderboard" : isTW ? "排行榜" : "排行榜"}
          </h1>
          <div className="inline-flex items-center gap-2 bg-accent/10 border-2 border-accent/30 rounded-2xl px-4 py-2 mt-2">
            <Lock className="h-4 w-4 text-accent" />
            <p className="text-sm text-muted-foreground font-bold">
              {isEn
                ? "Community leaderboards and challenges are coming soon."
                : isTW ? "社群排行榜和挑戰即將推出。"
                : "社区排行榜和挑战即将推出。"}
            </p>
          </div>
        </div>

        {/* Mock leaderboard */}
        <div className="bg-card border-2 border-border rounded-2xl overflow-hidden opacity-60 pointer-events-none select-none">
          {mockUsers.map((u) => (
            <div
              key={u.rank}
              className={`flex items-center gap-3 px-4 py-3 ${u.rank < mockUsers.length ? 'border-b border-border' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-extrabold ${
                u.rank <= 3 ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
              }`}>
                {u.medal || u.rank}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{u.name}</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-extrabold text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 text-accent" />
                {u.xp} XP
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
