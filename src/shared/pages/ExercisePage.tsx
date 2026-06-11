/**
 * ExercisePage — wraps individual practice exercises at /practice/:exerciseId.
 *
 * Bilabial stations (s1/s2/s3) render their own full UI; this component
 * intercepts the onComplete callback to award XP/coins, update the daily goal,
 * mark the exercise as done in localStorage, then shows a branded completion
 * modal before returning to /explorer.
 *
 * Unknown or coming-soon exercise IDs show a placeholder screen.
 */
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Star } from "lucide-react";
import { BilabialStation1 } from "@/shared/components/BilabialStation1";
import { BilabialStation2 } from "@/shared/components/BilabialStation2";
import { BilabialStation3 } from "@/shared/components/BilabialStation3";
import { useCurrency } from "@/shared/hooks/useCurrency";

// ─── Exercise metadata (mirrors ExplorerDashboardPage catalogue) ──────────────

interface ExerciseMeta {
  nameZh: string;
  nameEn: string;
  categoryZh: string;
  categoryEn: string;
  xp: number;
  coins: number;
  type: "bilabial-s1" | "bilabial-s2" | "bilabial-s3" | "coming-soon";
}

const EXERCISE_META: Record<string, ExerciseMeta> = {
  "bilabial-s1": {
    nameZh: "噴氣實驗室",
    nameEn: "Air Blast Lab",
    categoryZh: "雙唇音",
    categoryEn: "Bilabial",
    xp: 30,
    coins: 10,
    type: "bilabial-s1",
  },
  "bilabial-s2": {
    nameZh: "單字配對大進擊",
    nameEn: "Word Match Attack",
    categoryZh: "雙唇音",
    categoryEn: "Bilabial",
    xp: 50,
    coins: 15,
    type: "bilabial-s2",
  },
  "bilabial-s3": {
    nameZh: "貝殼分類大賽",
    nameEn: "Shell Sort Battle",
    categoryZh: "雙唇音",
    categoryEn: "Bilabial",
    xp: 80,
    coins: 25,
    type: "bilabial-s3",
  },
};

// ─── Daily goal helpers ───────────────────────────────────────────────────────

function todayKey() {
  return `daily_completions_${new Date().toISOString().split("T")[0]}`;
}

function incrementDailyCount() {
  const key = todayKey();
  const count = parseInt(localStorage.getItem(key) || "0", 10);
  localStorage.setItem(key, String(count + 1));
}

function markExerciseCompleted(exerciseId: string) {
  try {
    const raw = localStorage.getItem("completed_exercises");
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(exerciseId)) {
      ids.push(exerciseId);
      localStorage.setItem("completed_exercises", JSON.stringify(ids));
    }
  } catch {
    // ignore storage errors
  }
}

// ─── Completion modal ─────────────────────────────────────────────────────────

interface CompletionModalProps {
  meta: ExerciseMeta;
  xpEarned: number;
  coinsEarned: number;
  onBack: () => void;
  isZh: boolean;
}

function CompletionModal({ meta, xpEarned, coinsEarned, onBack, isZh }: CompletionModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
    >
      <div className="w-full max-w-sm bg-white rounded-lg border-[0.5px] border-mist shadow-[0_8px_32px_rgba(26,37,65,0.12)] p-6 flex flex-col items-center text-center">
        {/* Celebration */}
        <div className="text-5xl mb-3" aria-hidden="true">
          🎉
        </div>
        <h2
          id="completion-title"
          className="font-display text-xl text-ink mb-1"
        >
          {isZh ? "完成練習！" : "Exercise complete!"}
        </h2>
        <p className="font-body text-sm text-slate mb-5">
          {isZh
            ? `${meta.categoryZh} · ${meta.nameZh}`
            : `${meta.categoryEn} · ${meta.nameEn}`}
        </p>

        {/* Rewards */}
        <div className="flex gap-4 mb-6">
          <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-md bg-[#FFF6E0] border border-sunshine/40">
            <Star className="w-5 h-5 fill-sunshine text-sunshine" aria-hidden="true" />
            <span className="font-display text-lg text-ink">+{xpEarned}</span>
            <span className="font-body text-[11px] text-slate">XP</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-md bg-[#FFF0EB] border border-coral/30">
            <span className="text-xl" aria-hidden="true">🪙</span>
            <span className="font-display text-lg text-ink">+{coinsEarned}</span>
            <span className="font-body text-[11px] text-slate">
              {isZh ? "金幣" : "coins"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-pill bg-sky-400 text-white font-body font-medium py-3 min-h-[48px] hover:bg-sky-600 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          {isZh ? "返回練習" : "Back to practice"}
        </button>
      </div>
    </div>
  );
}

// ─── Coming-soon placeholder ──────────────────────────────────────────────────

function ComingSoonScreen({ onBack, isZh }: { onBack: () => void; isZh: boolean }) {
  return (
    <div className="min-h-screen bg-cloud flex flex-col">
      <header className="h-14 bg-white border-b-[0.5px] border-mist flex items-center px-4 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-slate hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          aria-label={isZh ? "返回" : "Back"}
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <span className="font-display text-sm text-ink">
          {isZh ? "練習" : "Practice"}
        </span>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="text-5xl" aria-hidden="true">🔒</span>
        <h1 className="font-display text-xl text-ink">
          {isZh ? "即將推出" : "Coming soon"}
        </h1>
        <p className="font-body text-sm text-slate max-w-xs">
          {isZh
            ? "呢個練習即將上線，敬請期待！請先完成雙唇音練習。"
            : "This exercise is on its way — check back soon! Try the Bilabial exercises first."}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-2 rounded-pill bg-sky-400 text-white font-body font-medium px-8 py-3 min-h-[48px] hover:bg-sky-600 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          {isZh ? "返回練習" : "Back to practice"}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExercisePage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { addXP, addCoins } = useCurrency();
  const lang = i18n.language || "zh-HK";
  const isZh = lang !== "en";

  const [completed, setCompleted] = useState(false);

  const meta = exerciseId ? EXERCISE_META[exerciseId] : undefined;

  const handleBack = useCallback(() => {
    navigate("/explorer");
  }, [navigate]);

  const handleComplete = useCallback(() => {
    if (!meta || !exerciseId) return;
    addXP(meta.xp);
    addCoins(meta.coins);
    incrementDailyCount();
    markExerciseCompleted(exerciseId);
    setCompleted(true);
  }, [meta, exerciseId, addXP, addCoins]);

  // Unknown or coming-soon
  if (!meta || meta.type === "coming-soon") {
    return <ComingSoonScreen onBack={handleBack} isZh={isZh} />;
  }

  const renderStation = () => {
    switch (meta.type) {
      case "bilabial-s1":
        return (
          <BilabialStation1 onComplete={handleComplete} onBack={handleBack} />
        );
      case "bilabial-s2":
        return (
          <BilabialStation2 onComplete={handleComplete} onBack={handleBack} />
        );
      case "bilabial-s3":
        return (
          <BilabialStation3 onComplete={handleComplete} onBack={handleBack} />
        );
      default:
        return <ComingSoonScreen onBack={handleBack} isZh={isZh} />;
    }
  };

  return (
    <div className="relative">
      {renderStation()}
      {completed && (
        <CompletionModal
          meta={meta}
          xpEarned={meta.xp}
          coinsEarned={meta.coins}
          onBack={handleBack}
          isZh={isZh}
        />
      )}
    </div>
  );
}
