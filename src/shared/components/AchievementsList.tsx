import { Flame, Trophy, Lock } from "lucide-react";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { AchievementDef } from "@/data/achievements";

interface Props {
  allAchievements: AchievementDef[];
  unlockedIds: Set<string>;
  onClose: () => void;
}

export function AchievementsList({ allAchievements, unlockedIds, onClose }: Props) {
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const getTitle = (a: AchievementDef) => isEn ? a.titleEn : isTW ? a.titleTW : a.titleCN;
  const getDesc = (a: AchievementDef) => isEn ? a.descEn : isTW ? a.descTW : a.descCN;

  const unlocked = allAchievements.filter(a => unlockedIds.has(a.id));
  const locked = allAchievements.filter(a => !unlockedIds.has(a.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          {isEn ? "Achievements" : isTW ? "成就" : "成就"}
        </h2>
        <button onClick={onClose} className="text-sm font-bold text-muted-foreground hover:text-foreground">
          ← {isEn ? "Back" : "返回"}
        </button>
      </div>

      <p className="text-sm text-muted-foreground font-bold">
        {unlocked.length}/{allAchievements.length} {isEn ? "unlocked" : isTW ? "已解鎖" : "已解锁"}
      </p>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="space-y-2">
          {unlocked.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl border-2 border-accent/30 bg-accent/5">
              <span className="text-2xl">{a.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-foreground">{getTitle(a)}</p>
                <p className="text-xs text-muted-foreground">{getDesc(a)}</p>
              </div>
              <Flame className="h-4 w-4 text-accent shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase mt-4">
            {isEn ? "Locked" : isTW ? "未解鎖" : "未解锁"}
          </p>
          {locked.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl border-2 border-border bg-muted/20">
              <span className="text-2xl">🔒</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-foreground">{getTitle(a)}</p>
                <p className="text-xs text-muted-foreground">{getDesc(a)}</p>
              </div>
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
