import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, Play, X, Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCurrency } from "@/hooks/useCurrency";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExerciseDef {
  id: string;
  nameZh: string;
  nameEn: string;
  difficulty: "basic" | "intermediate" | "challenge";
  icon: string;
  xp: number;
  coins: number;
  requires?: string;
}

interface CategoryDef {
  id: string;
  labelZh: string;
  labelEn: string;
  phonemes: string;
  exercises: ExerciseDef[];
  comingSoon?: boolean;
}

// ─── Exercise catalogue ───────────────────────────────────────────────────────

const CATEGORIES: CategoryDef[] = [
  {
    id: "bilabial",
    labelZh: "雙唇音",
    labelEn: "Bilabial",
    phonemes: "/b/ /p/ /m/",
    exercises: [
      { id: "bilabial-s1", nameZh: "噴氣實驗室", nameEn: "Air Blast Lab", difficulty: "basic", icon: "🔬", xp: 30, coins: 10 },
      { id: "bilabial-s2", nameZh: "單字配對大進擊", nameEn: "Word Match Attack", difficulty: "intermediate", icon: "🎯", xp: 50, coins: 15, requires: "bilabial-s1" },
      { id: "bilabial-s3", nameZh: "貝殼分類大賽", nameEn: "Shell Sort Battle", difficulty: "challenge", icon: "🐚", xp: 80, coins: 25, requires: "bilabial-s2" },
    ],
  },
  {
    id: "alveolar",
    labelZh: "齒齦音",
    labelEn: "Alveolar",
    phonemes: "/d/ /t/ /n/",
    comingSoon: true,
    exercises: [
      { id: "alveolar-s1", nameZh: "舌頭訓練營", nameEn: "Tongue Camp", difficulty: "basic", icon: "🏋️", xp: 30, coins: 10 },
      { id: "alveolar-s2", nameZh: "聽音配對", nameEn: "Sound Match", difficulty: "intermediate", icon: "👂", xp: 50, coins: 15, requires: "alveolar-s1" },
      { id: "alveolar-s3", nameZh: "速度挑戰", nameEn: "Speed Challenge", difficulty: "challenge", icon: "⚡", xp: 80, coins: 25, requires: "alveolar-s2" },
    ],
  },
  {
    id: "nasal",
    labelZh: "鼻音",
    labelEn: "Nasal",
    phonemes: "/m/ /n/ /ng/",
    comingSoon: true,
    exercises: [
      { id: "nasal-s1", nameZh: "鼻音探索", nameEn: "Nasal Explorer", difficulty: "basic", icon: "👃", xp: 30, coins: 10 },
      { id: "nasal-s2", nameZh: "共鳴配對", nameEn: "Resonance Match", difficulty: "intermediate", icon: "🎵", xp: 50, coins: 15, requires: "nasal-s1" },
      { id: "nasal-s3", nameZh: "鼻音大師", nameEn: "Nasal Master", difficulty: "challenge", icon: "🏆", xp: 80, coins: 25, requires: "nasal-s2" },
    ],
  },
  {
    id: "velar",
    labelZh: "軟顎音",
    labelEn: "Velar",
    phonemes: "/g/ /k/ /ng/",
    comingSoon: true,
    exercises: [
      { id: "velar-s1", nameZh: "喉嚨練習", nameEn: "Throat Trainer", difficulty: "basic", icon: "🗣️", xp: 30, coins: 10 },
      { id: "velar-s2", nameZh: "聲音分類", nameEn: "Sound Sort", difficulty: "intermediate", icon: "📊", xp: 50, coins: 15, requires: "velar-s1" },
      { id: "velar-s3", nameZh: "軟顎挑戰", nameEn: "Velar Challenge", difficulty: "challenge", icon: "💪", xp: 80, coins: 25, requires: "velar-s2" },
    ],
  },
];

// ─── Daily goal helpers ───────────────────────────────────────────────────────

const DAILY_GOAL = 3;

function todayKey() {
  return `daily_completions_${new Date().toISOString().split("T")[0]}`;
}

function getDailyCount(): number {
  return parseInt(localStorage.getItem(todayKey()) || "0", 10);
}

function getCompletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem("completed_exercises");
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

// ─── Difficulty config ────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<string, string> = {
  basic:        "bg-[#E8F7F3] text-[#1F9A7A] border border-[#A8E6CA]",
  intermediate: "bg-[#FFF6E0] text-[#8B6914] border border-sunshine",
  challenge:    "bg-[#FFE8E0] text-[#C14825] border border-coral/40",
};

const DIFFICULTY_ZH: Record<string, string> = { basic: "基礎", intermediate: "進階", challenge: "挑戰" };
const DIFFICULTY_EN: Record<string, string> = { basic: "Basic", intermediate: "Intermediate", challenge: "Challenge" };

// ─── ExerciseCard ─────────────────────────────────────────────────────────────

interface ExerciseCardProps {
  exercise: ExerciseDef;
  unlocked: boolean;
  unlockedAfter?: string;   // name of the prerequisite
  onStart: (id: string) => void;
  isZh: boolean;
}

function ExerciseCard({ exercise, unlocked, unlockedAfter, onStart, isZh }: ExerciseCardProps) {
  const name = isZh ? exercise.nameZh : exercise.nameEn;
  const diffLabel = isZh ? DIFFICULTY_ZH[exercise.difficulty] : DIFFICULTY_EN[exercise.difficulty];

  const startBtn = (
    <button
      type="button"
      disabled={!unlocked}
      onClick={() => unlocked && onStart(exercise.id)}
      className={`
        shrink-0 flex items-center justify-center gap-2 rounded-pill font-body font-medium
        min-h-[48px] min-w-[120px] px-7 text-base
        transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600
        ${unlocked
          ? "bg-sky-400 text-white hover:bg-sky-600 hover:shadow-[0_4px_12px_rgba(79,180,232,0.35)] active:scale-95"
          : "bg-cloud text-slate border border-dashed border-mist cursor-not-allowed"
        }
      `}
      aria-label={unlocked ? `開始 ${name}` : `${name} 鎖定`}
    >
      {unlocked ? (
        <>
          <Play className="w-4 h-4 fill-current" aria-hidden="true" />
          <span>{isZh ? "開始" : "Start"}</span>
        </>
      ) : (
        <>
          <Lock className="w-4 h-4" aria-hidden="true" />
          <span>{isZh ? "完成上一關" : "Locked"}</span>
        </>
      )}
    </button>
  );

  return (
    <div
      className={`
        group flex items-center gap-5 rounded-md bg-white
        border border-mist px-5 py-5 md:px-6 md:py-5
        transition-all duration-200
        ${unlocked
          ? "hover:border-sky-400 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(79,180,232,0.12)]"
          : "opacity-85"
        }
      `}
    >
      {/* Icon */}
      <div
        className={`
          w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 text-3xl md:text-4xl
          transition-transform duration-200 group-hover:scale-110
          ${unlocked ? "bg-sky-50" : "bg-mist grayscale"}
        `}
        aria-hidden="true"
      >
        {exercise.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-display text-[17px] md:text-lg text-ink leading-snug mb-1.5">
          {name}
        </p>
        <span className={`inline-block text-[12px] md:text-[13px] font-medium px-3 py-1 rounded-full ${DIFFICULTY_STYLES[exercise.difficulty]}`}>
          {diffLabel}
        </span>
        <p className="font-body text-[12px] text-slate mt-1.5">
          +{exercise.xp} XP &nbsp;·&nbsp; +{exercise.coins} 🪙
        </p>
      </div>

      {/* Button — wrap locked in tooltip */}
      {!unlocked && unlockedAfter ? (
        <Tooltip>
          <TooltipTrigger asChild>{startBtn}</TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-[13px]">
              {isZh ? `完成「${unlockedAfter}」後解鎖` : `Complete "${unlockedAfter}" to unlock`}
            </p>
          </TooltipContent>
        </Tooltip>
      ) : (
        startBtn
      )}
    </div>
  );
}

// ─── CategoryHeader ───────────────────────────────────────────────────────────

interface CategoryHeaderProps {
  category: CategoryDef;
  completedCount: number;
  isZh: boolean;
}

function CategoryHeader({ category, completedCount, isZh }: CategoryHeaderProps) {
  const label = isZh ? category.labelZh : category.labelEn;
  const total = category.exercises.length;

  return (
    <div className="flex items-center gap-4 flex-1 min-w-0 pr-2 py-1">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-display text-[17px] md:text-lg font-medium text-ink">{label}</span>
          <span className="font-body text-sm text-slate">{category.phonemes}</span>
          {category.comingSoon && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-mist text-slate border border-mist/80">
              {isZh ? "即將推出" : "Coming soon"}
            </span>
          )}
        </div>
      </div>
      <div
        className="flex items-center gap-1.5 shrink-0"
        aria-label={`${completedCount} of ${total} completed`}
      >
        {Array.from({ length: total }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 md:w-5 md:h-5 ${
              i < completedCount
                ? "fill-sunshine text-sunshine"
                : "fill-transparent text-mist stroke-mist"
            }`}
            aria-hidden="true"
          />
        ))}
        <span className="text-sm text-slate font-body ml-1 tabular-nums">
          {completedCount}/{total}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExplorerDashboardPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language || "zh-HK";
  const isZh = lang !== "en";

  const [completedIds] = useState<Set<string>>(getCompletedIds);
  const [dailyCount]   = useState(getDailyCount);

  const [showTip] = useState(() => {
    if (sessionStorage.getItem("pipi_tip_dismissed")) return false;
    return Math.random() < 0.3;
  });
  const [tipVisible, setTipVisible] = useState(showTip);

  const dismissTip = useCallback(() => {
    sessionStorage.setItem("pipi_tip_dismissed", "1");
    setTipVisible(false);
  }, []);

  const handleStart = useCallback(
    (exerciseId: string) => navigate(`/practice/${exerciseId}`),
    [navigate]
  );

  const dailyProgress = Math.min(dailyCount, DAILY_GOAL);
  const dailyDone = dailyProgress >= DAILY_GOAL;

  // All categories open by default so users can see what's available
  const allCategoryIds = CATEGORIES.map((c) => c.id);

  return (
    <div className="min-h-screen bg-cloud">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-5">

        {/* ─── Daily Goal Card ───────────────────────────────────────── */}
        <div className="rounded-lg border-2 border-sky-400 bg-gradient-to-br from-[#E8F7F3] to-[#EBF6FD] px-6 py-5 md:px-8 md:py-7">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-display text-[17px] md:text-[20px] text-sky-800">
                {isZh
                  ? `今日目標：完成 ${DAILY_GOAL} 次練習`
                  : `Today's goal: ${DAILY_GOAL} sessions`}
              </p>
              <p className="font-body text-sm text-sky-600 mt-1">
                {dailyDone
                  ? (isZh ? "已完成！做得好！" : "All done! Well done!")
                  : (isZh ? `還差 ${DAILY_GOAL - dailyProgress} 次` : `${DAILY_GOAL - dailyProgress} more to go`)}
              </p>
            </div>
            {dailyDone && (
              <span className="shrink-0 text-[13px] font-medium text-success bg-[#e8f8f1] border border-[#a8e6ca] px-3 py-1 rounded-full">
                ✓ {isZh ? "完成" : "Done"}
              </span>
            )}
          </div>

          {/* Progress bar — 20px tall on desktop */}
          <div
            className="relative h-4 md:h-5 rounded-full bg-sky-100 overflow-hidden mb-4"
            role="progressbar"
            aria-valuenow={dailyProgress}
            aria-valuemax={DAILY_GOAL}
            aria-label={isZh ? "今日目標進度" : "Daily goal progress"}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-mint transition-[width] duration-700 ease-out"
              style={{ width: `${(dailyProgress / DAILY_GOAL) * 100}%` }}
            />
          </div>

          {/* Stars */}
          <div className="flex items-center gap-3 md:gap-4 justify-center" aria-hidden="true">
            {Array.from({ length: DAILY_GOAL }).map((_, i) => (
              <Star
                key={i}
                className={`w-7 h-7 md:w-9 md:h-9 transition-all duration-300 ${
                  i < dailyProgress
                    ? "fill-sunshine text-sunshine drop-shadow-sm"
                    : "fill-transparent text-sky-200 stroke-sky-200"
                }`}
              />
            ))}
            <span className="font-display text-base text-sky-700 ml-1 tabular-nums">
              {dailyProgress} / {DAILY_GOAL}
            </span>
          </div>
        </div>

        {/* ─── PiPi Tip ──────────────────────────────────────────────── */}
        {tipVisible && (
          <div className="rounded-lg bg-[#FFF6E0] border border-sunshine/50 px-5 py-4 flex items-start gap-3">
            <span className="text-3xl shrink-0 mt-0.5" aria-hidden="true">🦜</span>
            <p className="font-body text-[14px] md:text-[15px] text-ink flex-1">
              {isZh
                ? "皮皮話你知：試下練「雙唇音」啦！雙唇音係廣東話嘅基礎，先搞好佢！"
                : "PiPi says: try practising Bilabial sounds today! They're the foundation of Cantonese."}
            </p>
            <button
              type="button"
              onClick={dismissTip}
              className="shrink-0 text-slate hover:text-ink transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
              aria-label={isZh ? "關閉皮皮提示" : "Dismiss tip"}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* ─── Practice Categories ───────────────────────────────────── */}
        <Accordion
          type="multiple"
          defaultValue={allCategoryIds}
          className="space-y-3 md:space-y-4"
        >
          {CATEGORIES.map((category) => {
            const categoryCompletedCount = category.exercises.filter((e) =>
              completedIds.has(e.id)
            ).length;

            return (
              <AccordionItem
                key={category.id}
                value={category.id}
                className="rounded-lg border border-mist bg-white overflow-hidden !border-b"
              >
                <AccordionTrigger
                  className="
                    px-5 py-4 md:px-6 md:py-5
                    hover:no-underline hover:bg-sky-50/50
                    transition-colors duration-150
                    [&[data-state=open]]:border-b [&[data-state=open]]:border-mist
                  "
                >
                  <CategoryHeader
                    category={category}
                    completedCount={categoryCompletedCount}
                    isZh={isZh}
                  />
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4 pt-2 md:px-5 md:pb-5">
                  {category.comingSoon ? (
                    <div className="text-center py-10 md:py-14 text-slate font-body">
                      <span className="text-5xl block mb-3" aria-hidden="true">🔒</span>
                      <p className="text-base md:text-lg font-medium text-ink mb-1">
                        {isZh ? "即將推出" : "Coming soon"}
                      </p>
                      <p className="text-sm text-slate max-w-xs mx-auto">
                        {isZh
                          ? "先完成雙唇音所有練習，更多聲母就會解鎖！"
                          : "Complete all Bilabial exercises to unlock more sounds!"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {category.exercises.map((exercise) => {
                        const unlocked = !exercise.requires || completedIds.has(exercise.requires);
                        const prereqName = exercise.requires
                          ? (isZh
                              ? (CATEGORIES.flatMap((c) => c.exercises).find((e) => e.id === exercise.requires)?.nameZh ?? exercise.requires)
                              : (CATEGORIES.flatMap((c) => c.exercises).find((e) => e.id === exercise.requires)?.nameEn ?? exercise.requires))
                          : undefined;

                        return (
                          <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            unlocked={unlocked}
                            unlockedAfter={prereqName}
                            onStart={handleStart}
                            isZh={isZh}
                          />
                        );
                      })}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
