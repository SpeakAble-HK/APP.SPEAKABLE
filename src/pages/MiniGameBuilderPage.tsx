import { useState, useCallback, useRef, useEffect, useMemo, lazy, Suspense } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { GameDirector } from "@/lib/miniGameBuilder/GameDirector";
import { useMiniGameBuilder } from "@/lib/miniGameBuilder/useMiniGameBuilder";
import { generateBlueprintFromDescription } from "@/lib/miniGameBuilder/blueprintGenerator";
import { useSTDashboard } from "@/hooks/useSTDashboard";
import { useNEPAWorldModel } from "@/hooks/useNEPAWorldModel";
import type { DifficultyLevel, MechanicType, MiniGameBlueprint, PatientContext, PatientPhonemeInfo } from "@/lib/miniGameBuilder/types";

const ScenePreview = lazy(() => import("@/lib/miniGameBuilder/ScenePreview"));

type BuilderStep = "input" | "thinking" | "preview" | "playing";

const THINKING_STEPS = [
  { icon: "psychology", label: "分析治療目標", desc: "識別語音難點及訓練範疇" },
  { icon: "landscape", label: "設計場景佈局", desc: "挑選合適的 3D 環境與物件" },
  { icon: "quiz", label: "生成語音挑戰", desc: "建立辨別題目與選項" },
  { icon: "auto_awesome", label: "整合遊戲藍圖", desc: "組合場景、題目與遊戲機制" },
];

const PRESET_DESCRIPTIONS = [
  "n l 鼻音混淆練習",
  "gw kw 圓唇音訓練",
  "韻尾 n ng 辨別",
  "聲調 1 3 6 訓練",
];

const DIFF_LABELS: Record<DifficultyLevel, string> = { easy: "簡單", medium: "中等", hard: "困難" };

const MECHANIC_LABELS: Record<MechanicType, string> = {
  "select-correct": "選擇正確",
  "drag-sort": "分類拖放",
  "tone-wheel": "聲調輪盤",
  "repeat-after": "跟讀模仿",
  "match-pair": "配對遊戲",
  "minimal-pair-dash": "快速反應",
};

const MECHANIC_ICONS: Record<MechanicType, string> = {
  "select-correct": "quiz",
  "drag-sort": "swap_driving_apps_wheel",
  "tone-wheel": "casino",
  "repeat-after": "mic",
  "match-pair": "palette",
  "minimal-pair-dash": "directions_run",
};

function buildPatientContext(
  patientId: string,
  name: string,
  profiles: PatientPhonemeInfo[],
  overallAccuracy: number,
  fatigueWarnings: string[],
  fatiguedAtMinute: number | null,
): PatientContext {
  return {
    patientId,
    name,
    phonemeProfiles: profiles,
    overallAccuracy,
    fatigueWarnings,
    fatiguedAtMinute,
  };
}

export default function MiniGameBuilderPage() {
  const { blueprints, confirmDraft, remove, clear } = useMiniGameBuilder();
  const { students, loading: studentsLoading } = useSTDashboard();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { worldModel, dashboard, loading: nepaLoading } = useNEPAWorldModel(selectedPatientId);

  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [mechanicType, setMechanicType] = useState<MechanicType | "auto">("auto");
  const [step, setStep] = useState<BuilderStep>("input");
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const [pending, setPending] = useState<MiniGameBlueprint | null>(null);
  const [lastScore, setLastScore] = useState<{ c: number; t: number } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const abRef = useRef(false);

  const selectedStudent = useMemo(
    () => students.find((s) => s.student_id === selectedPatientId),
    [students, selectedPatientId],
  );

  const patientContext = useMemo<PatientContext | undefined>(() => {
    if (!selectedPatientId || !dashboard || !worldModel) return undefined;
    return buildPatientContext(
      selectedPatientId,
      dashboard.name || selectedStudent?.nickname || "學生",
      (worldModel.phoneme_profiles || []).map((p) => ({
        phoneme: p.phoneme,
        accuracy: p.accuracy,
        trend: p.trend,
        confusions: p.confusions,
        fatigueDelta: p.fatigue_delta,
      })),
      dashboard.overall_accuracy ?? 0,
      dashboard.fatigue_warnings ?? [],
      worldModel.session_context?.fatigued_at_minute ?? null,
    );
  }, [selectedPatientId, dashboard, worldModel, selectedStudent]);

  const weakPhonemes = useMemo(() => {
    if (!patientContext) return [];
    return [...patientContext.phonemeProfiles]
      .filter((p) => p.accuracy < 0.75)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 4);
  }, [patientContext]);

  useEffect(() => {
    if (step !== "thinking") return;
    abRef.current = false;
    setThinkingIdx(0);
    const durations = [700, 900, 800, 600];
    const total = durations.reduce((a, b) => a + b, 0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (let i = 1; i < THINKING_STEPS.length; i++) {
      elapsed += durations[i - 1];
      timers.push(setTimeout(() => {
        if (!abRef.current) setThinkingIdx(i);
      }, elapsed));
    }
    timers.push(setTimeout(() => {
      if (abRef.current) return;
      const bp = generateBlueprintFromDescription(description, difficulty, patientContext, mechanicType !== "auto" ? mechanicType : undefined);
      setPending(bp);
      setConfirmed(false);
      setStep("preview");
    }, total));
    return () => {
      abRef.current = true;
      timers.forEach(clearTimeout);
    };
  }, [step === "thinking"]);

  const handleGenerate = useCallback(() => {
    if (!description.trim()) return;
    setStep("thinking");
    setLastScore(null);
  }, [description]);

  const handleConfirm = useCallback(() => {
    if (!pending) return;
    confirmDraft(pending);
    setConfirmed(true);
    setTimeout(() => {
      setStep("input");
      setPending(null);
    }, 1200);
  }, [pending, confirmDraft]);

  const handleRegenerate = useCallback(() => {
    setStep("thinking");
    setConfirmed(false);
  }, []);

  const safeBlueprints = Array.isArray(blueprints) ? blueprints : [];

  const currentPatientLabel = patientContext
    ? `${patientContext.name} (${Math.round(patientContext.overallAccuracy * 100)}%)`
    : selectedStudent?.nickname || null;

  return (
    <div className="min-h-screen bg-surface p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MaterialIcon icon="auto_awesome" className="text-3xl text-primary" filled />
        <div>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">AI 遊戲工坊</h1>
          <p className="text-sm text-on-surface-variant">治療師是總指揮，NEPA 是你的遊戲設計團隊</p>
        </div>
      </div>

      {/* ── Playing ── */}
      {step === "playing" && pending && (
        <div className="rounded-2xl bg-white shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low border-b border-outline-variant/30">
            <span className="font-bold text-on-surface">{pending.name}</span>
            <button onClick={() => setStep("preview")} className="p-1 rounded-lg hover:bg-surface-container-high">
              <MaterialIcon icon="close" className="text-xl" />
            </button>
          </div>
          <div className="h-[500px]">
            <GameDirector
              blueprint={pending}
              onScore={(c, t) => { setLastScore({ c, t }); setStep("preview"); }}
              onExit={() => setStep("preview")}
            />
          </div>
        </div>
      )}

      {/* ── Agent Thinking ── */}
      {step === "thinking" && (
        <div className="rounded-2xl bg-white shadow-card p-8 mb-4">
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <MaterialIcon icon="auto_awesome" filled className="absolute inset-0 flex items-center justify-center text-2xl text-primary" />
            </div>
            <p className="font-headline text-lg font-extrabold text-on-surface">
              {patientContext
                ? `正在為 ${patientContext.name} 設計遊戲...`
                : "AI 遊戲設計師正在工作中..."}
            </p>
            <div className="w-full max-w-sm space-y-3">
              {THINKING_STEPS.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                    i === thinkingIdx
                      ? "bg-primary/10 ring-1 ring-primary/30"
                      : i < thinkingIdx
                        ? "bg-green-50"
                        : "bg-surface-container-low opacity-40"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    i === thinkingIdx
                      ? "bg-primary text-on-primary"
                      : i < thinkingIdx
                        ? "bg-green-500 text-white"
                        : "bg-surface-container-high text-on-surface-variant"
                  }`}>
                    {i < thinkingIdx ? (
                      <MaterialIcon icon="check" className="text-sm" />
                    ) : i === thinkingIdx ? (
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    ) : (
                      <MaterialIcon icon={s.icon as any} className="text-sm" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold ${i === thinkingIdx ? "text-primary" : i < thinkingIdx ? "text-green-700" : "text-on-surface-variant"}`}>
                      {s.label}
                    </p>
                    <p className="text-xs text-on-surface-variant/70">{s.desc}</p>
                  </div>
                  {i === thinkingIdx && (
                    <div className="ml-auto flex gap-0.5">
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Preview & Confirm ── */}
      {step === "preview" && pending && (
        <>
          <div className="rounded-2xl bg-white shadow-card p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {confirmed ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <MaterialIcon icon="check" className="text-green-600 text-lg" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <MaterialIcon icon="preview" className="text-amber-600 text-lg" />
                  </div>
                )}
                <div>
                  <h2 className="font-headline font-extrabold text-on-surface">
                    {confirmed ? "已確認儲存" : "預覽遊戲藍圖"}
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    {confirmed
                      ? "遊戲已加入森林冒險"
                      : patientContext
                        ? `針對 ${patientContext.name} 的語音弱點設計`
                        : "請確認 AI 生成的內容是否符合治療需要"}
                  </p>
                </div>
              </div>
              {!confirmed && (
                <button onClick={() => { setStep("playing"); setLastScore(null); }} className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center gap-1">
                  <MaterialIcon icon="play_arrow" className="text-lg" />
                  試玩
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs mb-3">
              <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-mono font-bold">{pending.mechanic.type}</span>
              <span className="px-2 py-1 rounded-md bg-secondary/10 text-secondary font-mono font-bold">{pending.challenges.length} 題</span>
              <span className="px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant font-mono">{pending.scene.environment}</span>
              <span className="px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant font-mono">{DIFF_LABELS[difficulty]}</span>
              {patientContext && (
                <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-bold">
                  {patientContext.name} · {Math.round(patientContext.overallAccuracy * 100)}%
                </span>
              )}
              {lastScore && (
                <span className="px-2 py-1 rounded-md bg-green-50 text-green-700 font-bold">
                  成績: {lastScore.c}/{lastScore.t}
                </span>
              )}
            </div>

            {pending.sceneConfig && (
              <div className="mb-3">
                <Suspense fallback={<div className="h-36 rounded-xl bg-surface-container-low animate-pulse" />}>
                  <ScenePreview config={pending.sceneConfig} />
                </Suspense>
              </div>
            )}

            <details className="mt-3">
              <summary className="text-xs text-on-surface-variant cursor-pointer font-bold">
                預覽題目 ({pending.challenges.length} 題)
              </summary>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {pending.challenges.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-2 text-xs py-1 px-2 rounded-md bg-surface-container-low">
                    <span className="font-mono text-on-surface-variant w-5">{i + 1}.</span>
                    <span className="font-bold text-on-surface">{c.text}</span>
                    <span className="font-mono text-on-surface-variant">({c.jyutping})</span>
                    <span className="text-primary font-bold">→ {c.correctAnswer}</span>
                  </div>
                ))}
              </div>
            </details>

            {!confirmed && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-outline-variant/30">
                <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2">
                  <MaterialIcon icon="check" className="text-lg" />
                  確認並儲存
                </button>
                <button onClick={handleRegenerate} className="px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface-variant font-bold text-sm">
                  重新生成
                </button>
              </div>
            )}
          </div>

          {safeBlueprints.length > 0 && (
            <div className="rounded-2xl bg-white shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">已儲存遊戲 ({safeBlueprints.length})</p>
                <button onClick={clear} className="text-xs text-red-500 font-bold">清除全部</button>
              </div>
              <div className="space-y-2">
                {safeBlueprints.map((bp) => (
                  <div key={bp.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                    <div className="flex items-center gap-3">
                      <MaterialIcon icon={MECHANIC_ICONS[bp.mechanic.type] || "casino"} className="text-lg text-primary" />
                      <div>
                        <p className="font-bold text-sm text-on-surface">{bp.name}</p>
                        <p className="text-xs text-on-surface-variant">{bp.phonemeTargets.map(t => t.phonemes.join("/")).join(", ")} · {bp.challenges.length} 題</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); remove(bp.id); }} className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant">
                      <MaterialIcon icon="delete" className="text-lg" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Input ── */}
      {step === "input" && (
        <>
          {/* Patient selector */}
          <div className="rounded-2xl bg-white shadow-card p-4 mb-4">
            <label className="block text-sm font-bold text-on-surface-variant mb-2">
              選擇學生（可選）
            </label>
            {studentsLoading ? (
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                載入學生列表...
              </div>
            ) : students.length === 0 ? (
              <p className="text-sm text-on-surface-variant/60">尚未連結學生</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedPatientId(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    !selectedPatientId
                      ? "bg-surface-container-high text-on-surface-variant"
                      : "bg-surface-container-low text-on-surface-variant/50 hover:bg-surface-container-high"
                  }`}
                >
                  不使用
                </button>
                {students.map((s) => (
                  <button
                    key={s.student_id}
                    onClick={() => { setSelectedPatientId(s.student_id); setDescription(""); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedPatientId === s.student_id
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                      {s.nickname.charAt(0)}
                    </span>
                    {s.nickname}
                  </button>
                ))}
              </div>
            )}

            {/* Patient context summary */}
            {patientContext && (
              <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-blue-800">
                    {patientContext.name} 的語音概況
                  </p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    patientContext.overallAccuracy > 0.7
                      ? "bg-green-100 text-green-700"
                      : patientContext.overallAccuracy > 0.45
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}>
                    整體 {(patientContext.overallAccuracy * 100).toFixed(0)}%
                  </span>
                </div>

                {weakPhonemes.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-blue-600/70 font-bold">需要加強的語音</p>
                    <div className="flex flex-wrap gap-1.5">
                      {weakPhonemes.map((p) => (
                        <span
                          key={p.phoneme}
                          className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
                            p.trend === "declining"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          /{p.phoneme}/ {(p.accuracy * 100).toFixed(0)}%
                          {p.trend === "declining" && " ↓"}
                          {p.confusions.length > 0 && (
                            <span className="text-on-surface-variant/50"> ⇄ {p.confusions.join("/")}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {patientContext.fatigueWarnings.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
                    <MaterialIcon icon="bolt" className="text-sm" />
                    <span>疲勞警報: {patientContext.fatigueWarnings[0]}</span>
                  </div>
                )}

                {nepaLoading && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-500">
                    <span className="inline-block w-3 h-3 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin" />
                    正在載入 NEPA 語音數據...
                  </div>
                )}
              </div>
            )}

            {!selectedPatientId && !patientContext && (
              <p className="mt-2 text-xs text-on-surface-variant/50">
                選擇學生後，NEPA 會自動分析其語音弱點，生成針對性訓練
              </p>
            )}
          </div>

          {/* Description input */}
          <div className="rounded-2xl bg-white shadow-card p-4 mb-4">
            <label className="block text-sm font-bold text-on-surface-variant mb-2">
              描述治療目標
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={patientContext
                ? `已偵測到 ${weakPhonemes.map(p => p.phoneme).join("/")} 為弱點，可直接生成或輸入額外指示`
                : "例如：小朋友 n 同 l 聲母混淆，需要加強辨別"}
              className="w-full rounded-xl border border-outline-variant bg-surface p-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 resize-none h-20"
            />

            <div className="flex items-center gap-3 mt-3">
              {(["easy", "medium", "hard"] as DifficultyLevel[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    difficulty === d
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {DIFF_LABELS[d]}
                </button>
              ))}
              {patientContext && difficulty !== patientAdjustedDifficulty(difficulty, patientContext) && (
                <span className="text-xs text-blue-500 font-bold ml-auto">
                  根據患者狀態調整
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs font-bold text-on-surface-variant">遊戲機制:</span>
              {(["auto", "select-correct", "drag-sort", "tone-wheel", "repeat-after", "match-pair", "minimal-pair-dash"] as const).map((mt) => (
                <button
                  key={mt}
                  onClick={() => setMechanicType(mt)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    mechanicType === mt
                      ? "bg-secondary text-on-secondary shadow-sm"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {mt === "auto" ? "自動" : MECHANIC_LABELS[mt]}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!description.trim()}
              className="mt-3 w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <MaterialIcon icon="auto_awesome" className="text-lg" />
              {patientContext ? `為 ${patientContext.name} 設計遊戲` : "交給 AI 設計遊戲"}
            </button>
          </div>

          <div className="rounded-2xl bg-white shadow-card p-4 mb-4">
            <p className="text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wide">快速生成</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_DESCRIPTIONS.map((desc) => (
                <button
                  key={desc}
                  onClick={() => {
                    setDescription(desc);
                    setStep("thinking");
                    setLastScore(null);
                  }}
                  className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold hover:bg-secondary/20 transition-colors"
                >
                  {desc}
                </button>
              ))}
            </div>
          </div>

          {safeBlueprints.length > 0 && (
            <div className="rounded-2xl bg-white shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">已儲存遊戲 ({safeBlueprints.length})</p>
                <button onClick={clear} className="text-xs text-red-500 font-bold">清除全部</button>
              </div>
              <div className="space-y-2">
                {safeBlueprints.map((bp) => (
                  <div key={bp.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                    <div className="flex items-center gap-3">
                      <MaterialIcon icon={MECHANIC_ICONS[bp.mechanic.type] || "casino"} className="text-lg text-primary" />
                      <div>
                        <p className="font-bold text-sm text-on-surface">{bp.name}</p>
                        <p className="text-xs text-on-surface-variant">{bp.phonemeTargets.map(t => t.phonemes.join("/")).join(", ")} · {bp.challenges.length} 題</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); remove(bp.id); }} className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant">
                      <MaterialIcon icon="delete" className="text-lg" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function patientAdjustedDifficulty(preferred: DifficultyLevel, ctx: PatientContext): DifficultyLevel {
  if (ctx.overallAccuracy < 0.45) return "easy" as DifficultyLevel;
  if (ctx.overallAccuracy > 0.85) return "hard" as DifficultyLevel;
  return preferred;
}
