import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/shared/components/MaterialIcon";
import { phonemeCategories, getLessonsByCategory } from "@/data/lessons";
import { BilabialStation1 } from "@/shared/components/BilabialStation1";
import { BilabialStation2 } from "@/shared/components/BilabialStation2";
import { BilabialStation3 } from "@/shared/components/BilabialStation3";

type QuestView =
  | "islands"
  | "phonetic-categories"
  | "bilabial-station-select"
  | "bilabial-s1"
  | "bilabial-s2"
  | "bilabial-s3"
  | "lesson-map";

/* ── shared back button ─────────────────────────────────────── */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-small font-medium text-slate hover:text-ink transition-colors min-h-tap"
    >
      <MaterialIcon icon="arrow_back" className="text-lg" />
      返回
    </button>
  );
}

/* ── shared page shell ──────────────────────────────────────── */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-cloud">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-sky-50 via-cloud to-white" />
      {children}
    </div>
  );
}

export default function SpeechQuestPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<QuestView>("islands");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getProgress = () => {
    try { return JSON.parse(sessionStorage.getItem("lesson_progress") || "{}"); }
    catch { return {}; }
  };
  const progress = getProgress();

  /* ── Sub-views ──────────────────────────────────────────────── */

  if (view === "bilabial-s1") {
    return (
      <BilabialStation1
        onComplete={() => setView("bilabial-station-select")}
        onBack={() => setView("bilabial-station-select")}
      />
    );
  }

  if (view === "bilabial-s2") {
    return (
      <BilabialStation2
        onComplete={() => setView("bilabial-station-select")}
        onBack={() => setView("bilabial-station-select")}
      />
    );
  }

  if (view === "bilabial-s3") {
    return (
      <BilabialStation3
        onComplete={() => setView("bilabial-station-select")}
        onBack={() => setView("bilabial-station-select")}
      />
    );
  }

  /* ── Bilabial station select ─────────────────────────────── */

  if (view === "bilabial-station-select") {
    return (
      <PageShell>
        <div className="max-w-lg mx-auto px-4 py-6 pt-4">
          <BackButton onClick={() => setView("phonetic-categories")} />

          <div className="text-center my-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-mint to-[#4CBEA0] flex items-center justify-center mb-4 shadow-lg">
              <MaterialIcon icon="graphic_eq" filled className="text-white text-4xl" />
            </div>
            <h1 className="font-display text-h3 font-medium text-ink">雙唇海灘</h1>
            <p className="text-small text-slate mt-1">學習 /b/、/p/、/m/ 發音</p>
          </div>

          <div className="space-y-4">
            {/* Station 1 */}
            <button
              type="button"
              onClick={() => setView("bilabial-s1")}
              className="w-full bg-white border border-sky-100 hover:border-sky-400 rounded-lg p-6 text-left transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                  <MaterialIcon icon="science" filled className="text-sky-600 text-2xl" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-sky-600 mb-1">站點 1</p>
                  <p className="font-display text-[17px] font-medium text-ink">噴氣實驗室</p>
                  <p className="text-small text-slate mt-0.5">隔離練習：/b/ /p/ /m/</p>
                </div>
                <MaterialIcon icon="chevron_right" className="text-slate text-2xl" />
              </div>
            </button>

            {/* Station 2 */}
            <button
              type="button"
              onClick={() => setView("bilabial-s2")}
              className="w-full bg-white border border-[#FFD4C5] hover:border-coral rounded-lg p-6 text-left transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-[#FFE8E0] flex items-center justify-center shrink-0">
                  <MaterialIcon icon="target" filled className="text-coral text-2xl" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-coral mb-1">站點 2</p>
                  <p className="font-display text-[17px] font-medium text-ink">單字配對大進擊</p>
                  <p className="text-small text-slate mt-0.5">聽 → 揀圖 → 讀（三級別）</p>
                </div>
                <MaterialIcon icon="chevron_right" className="text-slate text-2xl" />
              </div>
            </button>

            {/* Station 3 */}
            <button
              type="button"
              onClick={() => setView("bilabial-s3")}
              className="w-full bg-white border border-[#FFE9B5] hover:border-sunshine rounded-lg p-6 text-left transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-[#FFF6E0] flex items-center justify-center shrink-0">
                  <MaterialIcon icon="waves" filled className="text-ink text-2xl" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate mb-1">站點 3</p>
                  <p className="font-display text-[17px] font-medium text-ink">貝殼分類大賽</p>
                  <p className="text-small text-slate mt-0.5">聽音 → 分類 → 讀出</p>
                </div>
                <MaterialIcon icon="chevron_right" className="text-slate text-2xl" />
              </div>
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  /* ── Lesson map ─────────────────────────────────────────────── */

  if (view === "lesson-map" && selectedCategory) {
    const lessons = getLessonsByCategory(selectedCategory);
    const cat = phonemeCategories.find((c) => c.id === selectedCategory);
    return (
      <PageShell>
        <div className="max-w-lg mx-auto px-4 py-6">
          <BackButton
            onClick={() => { setView("phonetic-categories"); setSelectedCategory(null); }}
          />
          <div className="flex items-center gap-3 my-8">
            <span className="text-3xl">{cat?.emoji}</span>
            <h1 className="font-display text-h3 font-medium text-ink">{cat?.labelZh}</h1>
          </div>

          <div className="flex flex-col items-center">
            {lessons.map((lesson, i) => {
              const p = progress[lesson.id];
              const isCompleted = p?.completed;
              const prevCompleted = i === 0 || progress[lessons[i - 1]?.id]?.completed;
              const isLocked = i > 0 && !prevCompleted;
              return (
                <div key={lesson.id} className="flex flex-col items-center">
                  {i > 0 && (
                    <div
                      className={`w-1 h-10 rounded-full ${
                        isCompleted ? "bg-mint" : isLocked ? "bg-mist" : "bg-mint/40"
                      }`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => !isLocked && navigate(`/lesson/${lesson.id}`)}
                    disabled={isLocked}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-medium shadow-sm transition-all active:scale-95 ${
                      isCompleted
                        ? "bg-mint text-white shadow-mint/30"
                        : isLocked
                          ? "bg-mist text-slate cursor-not-allowed"
                          : "bg-sky-400 text-white shadow-sky-400/30 hover:bg-sky-600 hover:scale-105"
                    }`}
                  >
                    {isCompleted
                      ? <MaterialIcon icon="check_circle" filled className="text-3xl" />
                      : isLocked
                        ? <MaterialIcon icon="lock" className="text-2xl" />
                        : <span>{i + 1}</span>}
                  </button>
                  <p className={`mt-2 text-small text-center max-w-[120px] font-medium ${
                    isLocked ? "text-slate" : "text-ink"
                  }`}>
                    {lesson.titleZh}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </PageShell>
    );
  }

  /* ── Phonetic categories ────────────────────────────────────── */

  if (view === "phonetic-categories") {
    return (
      <PageShell>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          <BackButton onClick={() => setView("islands")} />

          <h2 className="font-display text-h3 font-medium text-ink flex items-center gap-2">
            <MaterialIcon icon="graphic_eq" className="text-mint text-2xl" />
            語音島
          </h2>

          <div className="space-y-3">
            {phonemeCategories.map((cat) => {
              const isBilabial = cat.id === "bilabial";
              if (isBilabial) {
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setView("bilabial-station-select")}
                    className="w-full bg-white rounded-lg p-5 border border-sky-100 hover:border-sky-400 shadow-sm text-left transition-all hover:shadow-md active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{cat.emoji}</span>
                      <div className="flex-1">
                        <p className="font-display text-[16px] font-medium text-ink">{cat.labelZh}</p>
                        <p className="text-small text-slate mt-0.5">雙唇海灘——三個學習站點</p>
                      </div>
                      <span className="text-xs font-medium text-[#34B475] bg-[#e6f7ef] px-3 py-1 rounded-pill">
                        開放
                      </span>
                    </div>
                  </button>
                );
              }
              return (
                <div
                  key={cat.id}
                  className="w-full bg-white/60 rounded-lg p-5 border border-mist text-left opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{cat.emoji}</span>
                    <div className="flex-1">
                      <p className="font-display text-[16px] font-medium text-slate">{cat.labelZh}</p>
                    </div>
                    <span className="text-xs font-medium text-slate bg-mist px-3 py-1 rounded-pill flex items-center gap-1">
                      <MaterialIcon icon="lock" className="text-sm" /> 鎖定
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageShell>
    );
  }

  /* ── Islands main view ──────────────────────────────────────── */

  return (
    <PageShell>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* PiPi speech bubble */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-sky-100 to-[#E8F7F3] flex items-center justify-center shadow-sm shrink-0">
            <MaterialIcon icon="smart_toy" filled className="text-2xl text-sky-600" />
          </div>
          <div className="bg-white rounded-lg rounded-bl-sm px-4 py-3 shadow-sm border-[0.5px] border-mist">
            <p className="text-small font-medium text-ink">
              練習時間！選一個島嶼開始你的語音冒險！
            </p>
          </div>
        </div>

        {/* Island cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Voice Island — Mint */}
          <button
            type="button"
            onClick={() => setView("phonetic-categories")}
            className="group relative flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-lg"
          >
            <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-mint to-[#4CBEA0] flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all overflow-hidden">
              <MaterialIcon icon="graphic_eq" filled className="text-white text-5xl" />
            </div>
            <div className="mt-3 bg-white px-4 py-2 rounded-pill shadow-sm border-[0.5px] border-mist">
              <span className="font-display font-medium text-ink text-small">語音島</span>
            </div>
            <span className="text-[10px] font-medium text-[#34B475] bg-[#e6f7ef] px-2 py-0.5 rounded-pill mt-1.5">
              開放
            </span>
          </button>

          {/* Meaning Island — Sunshine */}
          <button
            type="button"
            onClick={() => navigate("/semantic-island")}
            className="group relative flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-lg"
          >
            <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-sunshine to-[#FFB82E] flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all overflow-hidden">
              <MaterialIcon icon="auto_stories" filled className="text-white text-5xl" />
            </div>
            <div className="mt-3 bg-white px-4 py-2 rounded-pill shadow-sm border-[0.5px] border-mist">
              <span className="font-display font-medium text-ink text-small">語義島</span>
            </div>
            <span className="text-[10px] font-medium text-[#34B475] bg-[#e6f7ef] px-2 py-0.5 rounded-pill mt-1.5">
              開放
            </span>
          </button>
        </div>
      </div>
    </PageShell>
  );
}
