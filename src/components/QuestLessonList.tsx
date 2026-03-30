import { Lock, CheckCircle, Star, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { QuestWorldData, QuestLessonData, difficultyConfig } from "@/data/questLessons";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import parrot from "@/assets/pipi-mascot.png";

interface QuestLessonListProps {
  world: QuestWorldData;
  worldIndex: number;
  onSelectLesson: (lesson: QuestLessonData) => void;
  onBack: () => void;
  allLocked: boolean;
}

export function QuestLessonList({ world, worldIndex, onSelectLesson, onBack, allLocked }: QuestLessonListProps) {
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";
  const { getLessonStatus } = useQuestProgress();

  const getTitle = (item: { titleEn: string; titleTW: string; titleCN: string }) =>
    isEn ? item.titleEn : isTW ? item.titleTW : item.titleCN;

  const diff = difficultyConfig[world.difficulty];
  const getDiffLabel = () => isEn ? diff.labelEn : isTW ? diff.labelTW : diff.labelCN;

  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        ← {isEn ? "Back to Worlds" : "返回世界"}
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-primary/10">
          {world.emoji}
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase">
            {isEn ? `World ${worldIndex + 1}` : `世界 ${worldIndex + 1}`}
          </p>
          <h2 className="text-lg font-extrabold text-foreground">{getTitle(world)}</h2>
        </div>
      </div>
      <div className="mb-6">
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${diff.color}`}>
          {"⭐".repeat(diff.stars)} {getDiffLabel()}
        </span>
      </div>

      {/* Zigzag lesson nodes */}
      <div className="relative w-[90%] max-w-md mx-auto">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border rounded-full -translate-x-1/2" aria-hidden="true" />

        <div className="space-y-5 relative">
          {world.lessons.map((lesson, li) => {
            const isLeft = li % 2 === 0;
            const rawStatus = getLessonStatus(lesson.lesson_id);
            const status = allLocked ? "locked" : rawStatus;
            const lessonDone = status === "completed";
            const isCurrent = status === "unlocked";

            return (
              <div key={lesson.lesson_id} className={`flex items-center gap-3 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                {/* Card */}
                <div className={`flex-1 ${isLeft ? "text-right" : "text-left"}`}>
                  <button
                    onClick={() => (isCurrent || lessonDone) && onSelectLesson(lesson)}
                    disabled={status === "locked"}
                    className={`inline-block w-full max-w-[240px] text-left border-2 rounded-2xl p-3 transition-all ${
                      lessonDone
                        ? "border-success/30 bg-success/5 cursor-pointer hover:bg-success/10"
                        : isCurrent
                        ? "border-primary/40 bg-card hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                        : "border-border bg-muted/30 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <p className="text-sm font-extrabold text-foreground leading-tight">{lesson.sentence}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{lesson.english_translation}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Star className="h-3 w-3 text-accent" aria-hidden="true" />
                      {lesson.xp_reward} XP
                    </div>
                    {isCurrent && (
                      <div className="flex items-center gap-1 text-xs text-primary mt-1.5 font-extrabold">
                        <ChevronRight className="h-3 w-3" />
                        {isEn ? "Start" : isTW ? "開始" : "开始"}
                      </div>
                    )}
                    {lessonDone && (
                      <div className="flex items-center gap-1 text-xs text-success mt-1 font-bold">
                        <CheckCircle className="h-3 w-3" />
                        {isEn ? "Completed" : "已完成"}
                      </div>
                    )}
                  </button>
                </div>

                {/* Node circle */}
                <div className="relative">
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-full border-3 transition-all ${
                    lessonDone
                      ? "bg-success border-success"
                      : isCurrent
                      ? "bg-primary border-primary animate-pulse"
                      : "bg-muted border-border"
                  }`}>
                    {lessonDone ? (
                      <CheckCircle className="h-5 w-5 text-success-foreground" />
                    ) : isCurrent ? (
                      <img src={parrot} alt="" className="h-8 w-8 object-contain" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="flex-1" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
