import { Lock, CheckCircle, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { questWorldsData, QuestWorldData, difficultyConfig } from "@/data/questLessons";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { isWorldUnlocked, worldProgressPercent } from "@/lib/worldProgression";

interface QuestWorldListProps {
  onSelectWorld: (world: QuestWorldData, worldIndex: number) => void;
  onBack: () => void;
  allLocked: boolean;
}

export function QuestWorldList({ onSelectWorld, onBack, allLocked }: QuestWorldListProps) {
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";
  const { getLessonStatus } = useQuestProgress();

  const getTitle = (item: { titleEn: string; titleTW: string; titleCN: string }) =>
    isEn ? item.titleEn : isTW ? item.titleTW : item.titleCN;

  const getDiffLabel = (d: typeof difficultyConfig[keyof typeof difficultyConfig]) =>
    isEn ? d.labelEn : isTW ? d.labelTW : d.labelCN;

  const worldUnlocked = (worldIndex: number): boolean => {
    if (allLocked) return false;
    return isWorldUnlocked(worldIndex, questWorldsData, getLessonStatus);
  };

  const getWorldProgress = (worldIndex: number): number => {
    const world = questWorldsData[worldIndex];
    return worldProgressPercent(world, getLessonStatus);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        ← {isEn ? "Back" : "返回"}
      </button>

      <h2 className="text-xl font-extrabold text-foreground mb-4">
        {isEn ? "Choose a World" : isTW ? "選擇世界" : "选择世界"}
      </h2>

      <div className="space-y-3">
        {questWorldsData.map((world, wi) => {
          const unlocked = worldUnlocked(wi);
          const prog = getWorldProgress(wi);
          const done = prog === 100;
          const diff = difficultyConfig[world.difficulty];

          return (
            <button
              key={world.id}
              onClick={() => unlocked && onSelectWorld(world, wi)}
              disabled={!unlocked}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                done
                  ? "border-success/30 bg-success/5"
                  : unlocked
                  ? "border-primary/30 bg-card hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                  : "border-border bg-muted/30 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                done ? "bg-success/15" : unlocked ? "bg-primary/10" : "bg-muted"
              }`}>
                {unlocked ? world.emoji : "🔒"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    {isEn ? `World ${wi + 1}` : `世界 ${wi + 1}`}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${diff.color}`}>
                    {"⭐".repeat(diff.stars)} {getDiffLabel(diff)}
                  </span>
                  {done && <CheckCircle className="h-3.5 w-3.5 text-success" />}
                </div>
                <p className="text-base font-extrabold text-foreground truncate">{getTitle(world)}</p>
                <Progress value={prog} className="h-1.5 mt-1.5" />
              </div>

              {unlocked && !done && (
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              {!unlocked && (
                <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
