/**
 * ProgressPage — learner stats at /progress.
 * Desktop: 4-column stat grid, large numbers.
 * Mobile: 2-column grid, compact.
 */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star, Flame, Trophy, Target } from "lucide-react";
import { useCurrency } from "@/shared/hooks/useCurrency";

// ─── Exercise name lookup ─────────────────────────────────────────────────────

const EXERCISE_NAMES_ZH: Record<string, string> = {
  "bilabial-s1": "噴氣實驗室",
  "bilabial-s2": "單字配對大進擊",
  "bilabial-s3": "貝殼分類大賽",
  "alveolar-s1": "舌頭訓練營",
  "alveolar-s2": "聽音配對",
  "alveolar-s3": "速度挑戰",
  "nasal-s1": "鼻音探索",
  "nasal-s2": "共鳴配對",
  "nasal-s3": "鼻音大師",
  "velar-s1": "喉嚨練習",
  "velar-s2": "聲音分類",
  "velar-s3": "軟顎挑戰",
};

const EXERCISE_NAMES_EN: Record<string, string> = {
  "bilabial-s1": "Air Blast Lab",
  "bilabial-s2": "Word Match Attack",
  "bilabial-s3": "Shell Sort Battle",
  "alveolar-s1": "Tongue Camp",
  "alveolar-s2": "Sound Match",
  "alveolar-s3": "Speed Challenge",
  "nasal-s1": "Nasal Explorer",
  "nasal-s2": "Resonance Match",
  "nasal-s3": "Nasal Master",
  "velar-s1": "Throat Trainer",
  "velar-s2": "Sound Sort",
  "velar-s3": "Velar Challenge",
};

const CATEGORY_ZH: Record<string, string> = {
  bilabial: "雙唇音", alveolar: "齒齦音", nasal: "鼻音", velar: "軟顎音",
};

const CATEGORY_EN: Record<string, string> = {
  bilabial: "Bilabial", alveolar: "Alveolar", nasal: "Nasal", velar: "Velar",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAILY_GOAL = 3;

function getCompletedIds(): string[] {
  try {
    const raw = localStorage.getItem("completed_exercises");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getDailyCount(): number {
  const key = `daily_completions_${new Date().toISOString().split("T")[0]}`;
  return parseInt(localStorage.getItem(key) || "0", 10);
}

function getStreakDays(): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `daily_completions_${d.toISOString().split("T")[0]}`;
    if (parseInt(localStorage.getItem(key) || "0", 10) > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  iconBg: string;
}

function StatCard({ icon, value, label, iconBg }: StatCardProps) {
  return (
    <div className="flex flex-col items-center text-center gap-2 bg-white rounded-lg border border-mist py-6 md:py-8 px-4">
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-1 ${iconBg}`}>
        {icon}
      </div>
      <span className="font-display text-3xl md:text-4xl text-ink tabular-nums leading-none">
        {value}
      </span>
      <span className="font-body text-[13px] md:text-[14px] text-slate leading-tight">
        {label}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProgressPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { xp, coins } = useCurrency();
  const isZh = (i18n.language || "zh-HK") !== "en";

  const completedIds = useMemo(getCompletedIds, []);
  const dailyCount   = useMemo(getDailyCount, []);
  const streakDays   = useMemo(getStreakDays, []);
  const dailyProgress = Math.min(dailyCount, DAILY_GOAL);

  return (
    <div className="min-h-screen bg-cloud">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">

        {/* ─── Page heading ────────────────────────────────────────── */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-ink">
            {isZh ? "練習記錄" : "Progress"}
          </h1>
          <p className="font-body text-sm md:text-base text-slate mt-1">
            {isZh ? "繼續加油！每日練習是進步的關鍵。" : "Keep it up! Daily practice is the key to progress."}
          </p>
        </div>

        {/* ─── Stat grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={<Flame className="w-6 h-6 md:w-7 md:h-7 text-coral" aria-hidden="true" />}
            value={streakDays}
            label={isZh ? "連續練習（日）" : "Day streak"}
            iconBg="bg-[#FFF0EB]"
          />
          <StatCard
            icon={<Star className="w-6 h-6 md:w-7 md:h-7 fill-sunshine text-sunshine" aria-hidden="true" />}
            value={xp}
            label={isZh ? "累積 XP" : "Total XP"}
            iconBg="bg-[#FFF6E0]"
          />
          <StatCard
            icon={<span className="text-2xl md:text-3xl" aria-hidden="true">🪙</span>}
            value={coins}
            label={isZh ? "累積金幣" : "Total coins"}
            iconBg="bg-[#FFF0EB]"
          />
          <StatCard
            icon={<Trophy className="w-6 h-6 md:w-7 md:h-7 text-mint" aria-hidden="true" />}
            value={completedIds.length}
            label={isZh ? "完成練習" : "Exercises done"}
            iconBg="bg-[#EBF9F5]"
          />
        </div>

        {/* ─── Today's goal ────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-mist p-5 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-400" aria-hidden="true" />
              <h2 className="font-display text-[15px] md:text-base text-ink">
                {isZh ? "今日目標" : "Today's goal"}
              </h2>
            </div>
            <span className="font-body text-sm text-slate tabular-nums">
              {dailyProgress}/{DAILY_GOAL}
            </span>
          </div>
          <div
            className="h-4 md:h-5 rounded-full bg-mist overflow-hidden mb-3"
            role="progressbar"
            aria-valuenow={dailyProgress}
            aria-valuemax={DAILY_GOAL}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-mint transition-[width] duration-700"
              style={{ width: `${(dailyProgress / DAILY_GOAL) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-3 justify-center" aria-hidden="true">
            {Array.from({ length: DAILY_GOAL }).map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 md:w-7 md:h-7 ${
                  i < dailyProgress
                    ? "fill-sunshine text-sunshine"
                    : "fill-transparent text-mist stroke-mist"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ─── Completed exercises ─────────────────────────────────── */}
        <div>
          <h2 className="font-display text-[15px] md:text-base text-ink mb-3">
            {isZh ? "已完成練習" : "Completed exercises"}
          </h2>

          {completedIds.length === 0 ? (
            /* Empty state */
            <div className="text-center bg-white rounded-lg border-2 border-dashed border-mist py-16 md:py-20 px-6">
              <span className="text-6xl md:text-7xl block mb-4" aria-hidden="true">🦜</span>
              <h3 className="font-display text-xl md:text-2xl text-ink mb-2">
                {isZh ? "尚未完成任何練習" : "No exercises yet"}
              </h3>
              <p className="font-body text-[14px] md:text-base text-slate max-w-sm mx-auto mb-6 leading-relaxed">
                {isZh
                  ? "去練習頁面開始你的第一個練習吧！皮皮在等你！"
                  : "Head to Practice and start your first exercise. PiPi is waiting for you!"}
              </p>
              <button
                type="button"
                onClick={() => navigate("/explorer")}
                className="
                  inline-flex items-center justify-center gap-2
                  rounded-pill bg-sky-400 text-white font-body font-medium
                  px-8 py-3 min-h-[48px] text-base
                  hover:bg-sky-600 hover:shadow-[0_4px_12px_rgba(79,180,232,0.3)]
                  active:scale-95 transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600
                "
              >
                {isZh ? "去練習" : "Go practise"}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-mist overflow-hidden">
              <ul>
                {completedIds.map((id, idx) => {
                  const [categoryId] = id.split("-");
                  const name = isZh ? (EXERCISE_NAMES_ZH[id] || id) : (EXERCISE_NAMES_EN[id] || id);
                  const category = isZh ? (CATEGORY_ZH[categoryId] || categoryId) : (CATEGORY_EN[categoryId] || categoryId);
                  return (
                    <li
                      key={id}
                      className={`flex items-center gap-4 px-5 py-4 md:px-6 md:py-4 hover:bg-cloud transition-colors duration-150 ${
                        idx < completedIds.length - 1 ? "border-b border-mist" : ""
                      }`}
                    >
                      <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#FFF6E0] flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 fill-sunshine text-sunshine" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-[14px] md:text-[15px] text-ink truncate">{name}</p>
                        <p className="font-body text-[12px] md:text-[13px] text-slate">{category}</p>
                      </div>
                      <span className="shrink-0 text-[12px] text-success font-medium bg-[#e8f8f1] px-3 py-1 rounded-full border border-[#a8e6ca]">
                        ✓ {isZh ? "完成" : "Done"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
