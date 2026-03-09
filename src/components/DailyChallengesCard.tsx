import { CheckCircle, Circle, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DailyChallengeDef } from "@/data/dailyChallenges";

interface Props {
  challenges: DailyChallengeDef[];
  completedIds: Set<string>;
}

export function DailyChallengesCard({ challenges, completedIds }: Props) {
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const getTitle = (c: DailyChallengeDef) => isEn ? c.titleEn : isTW ? c.titleTW : c.titleCN;
  const getDesc = (c: DailyChallengeDef) => isEn ? c.descEn : isTW ? c.descTW : c.descCN;

  const doneCount = challenges.filter(c => completedIds.has(c.id)).length;

  return (
    <div className="w-full max-w-xs bg-card border-2 border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-accent" />
          {isEn ? "Daily Challenges" : isTW ? "每日挑戰" : "每日挑战"}
        </span>
        <span className="text-xs font-bold text-muted-foreground">
          {doneCount}/{challenges.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {challenges.map(ch => {
          const done = completedIds.has(ch.id);
          return (
            <div key={ch.id} className={`flex items-start gap-2.5 ${done ? "opacity-60" : ""}`}>
              {done ? (
                <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-extrabold ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {ch.emoji} {getTitle(ch)}
                </p>
                <p className="text-[11px] text-muted-foreground">{getDesc(ch)}</p>
              </div>
              <span className={`text-[11px] font-extrabold shrink-0 ${done ? "text-success" : "text-accent"}`}>
                +{ch.bonusXp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
