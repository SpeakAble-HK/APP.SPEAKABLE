import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, Flame, Medal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLeaderboard, LeaderboardEntry } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import mascot from "@/assets/pipi-mascot.png";

const MEDALS = ["🥇", "🥈", "🥉"];

const LeaderboardPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { entries, loading, userRank } = useLeaderboard();
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
          {userRank && (
            <p className="text-sm font-bold text-primary">
              {isEn ? `Your rank: #${userRank}` : `你的排名：第 ${userRank} 名`}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-bold">
              {isEn ? "No rankings yet. Complete some lessons to get on the board!" : isTW ? "暫無排名。完成課程即可上榜！" : "暂无排名。完成课程即可上榜！"}
            </p>
          </div>
        ) : (
          <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
            {entries.map((entry: LeaderboardEntry, idx: number) => {
              const isCurrentUser = user?.id === entry.user_id;
              const rank = idx + 1;

              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    idx < entries.length - 1 ? "border-b border-border" : ""
                  } ${isCurrentUser ? "bg-primary/5" : ""}`}
                >
                  {/* Rank */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-extrabold ${
                    rank <= 3 ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                  }`}>
                    {rank <= 3 ? MEDALS[rank - 1] : rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">
                        {entry.display_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                      {entry.display_name}
                      {isCurrentUser && <span className="text-xs text-primary ml-1">({isEn ? "You" : "你"})</span>}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{entry.lessons_completed} {isEn ? "lessons" : "課"}</span>
                      {entry.streak_days > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Flame className="h-3 w-3 text-destructive" />
                          {entry.streak_days}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* XP */}
                  <div className="flex items-center gap-1 text-sm font-extrabold text-muted-foreground">
                    <Trophy className="h-3.5 w-3.5 text-accent" />
                    {entry.total_xp.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
