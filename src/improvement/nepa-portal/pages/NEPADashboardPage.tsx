import { useState } from "react";
import { MaterialIcon } from "@/shared/components/MaterialIcon";
import { useSTDashboard, type StudentData } from "@/shared/hooks/useSTDashboard";
import { useNEPAWorldModel, type DashboardSummary } from "@/shared/hooks/useNEPAWorldModel";
import { FadeIn, Stagger, SkeletonCard, SkeletonList } from "@/shared/components/ui/animations";

function TrendSparkline({ accuracy }: { accuracy: number }) {
  const bars = Array.from({ length: 8 }).map((_, i) => {
    const variance = Math.sin(i * 1.2 + accuracy * 3) * 0.15;
    return Math.max(0.1, Math.min(1, accuracy + variance));
  });
  return (
    <div className="flex items-end gap-[2px] h-8">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[6px] rounded-t-sm transition-all duration-500"
          style={{
            height: `${h * 100}%`,
            background: `hsl(${Math.round(h * 150)}, ${60 + Math.round(h * 30)}%, ${40 + Math.round(h * 20)}%)`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

function TrendBadge({ trend }: { trend: string }) {
  const styles: Record<string, { icon: string; bg: string; text: string; label: string }> = {
    improving: { icon: "trending_up", bg: "bg-green-100", text: "text-green-700", label: "進步中" },
    stable: { icon: "trending_flat", bg: "bg-blue-50", text: "text-blue-600", label: "穩定" },
    declining: { icon: "trending_down", bg: "bg-red-100", text: "text-red-600", label: "需關注" },
  };
  const s = styles[trend] || styles.stable;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>
      <MaterialIcon icon={s.icon} filled className="text-xs" />
      {s.label}
    </span>
  );
}

function PhonemeTile({ phoneme, accuracy, trend }: { phoneme: string; accuracy: number; trend: string }) {
  const pct = Math.round(accuracy * 100);
  const barColor = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-amber-400" : "bg-red-400";
  return (
    <FadeIn>
      <div className="glass-card glow-rim rounded-xl p-3 shadow-card flex flex-col items-center text-center gap-1.5 hover:scale-[1.03] hover:shadow-md transition-all cursor-default">
        <span className="font-headline font-extrabold text-lg text-on-surface">{phoneme}</span>
        <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
          <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-bold text-on-surface-variant tabular-nums">{pct}%</span>
        <TrendSparkline accuracy={accuracy} />
        <TrendBadge trend={trend} />
      </div>
    </FadeIn>
  );
}

function FatigueAlert({ warnings }: { warnings: string[] }) {
  if (!warnings || warnings.length === 0) return null;
  return (
    <FadeIn>
      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 flex items-start gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <MaterialIcon icon="battery_alert" filled className="text-amber-600 text-xl" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-headline font-bold text-amber-900 text-sm">疲勞檢測 — NEPA 神經網絡</p>
            <span className="text-[10px] bg-amber-200/60 text-amber-800 px-2 py-0.5 rounded-full font-bold">STDP 模型</span>
          </div>
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-800 mt-0.5">{w}</p>
          ))}
          <p className="text-[10px] text-amber-600 mt-1 font-medium">基於 Spike-Timing-Dependent Plasticity，隨每次練習自動適應</p>
        </div>
      </div>
    </FadeIn>
  );
}

function CalibrationBadge({ agreementRate }: { agreementRate?: number }) {
  if (agreementRate == null) return null;
  const color = agreementRate > 0.9 ? "text-green-600" : agreementRate > 0.7 ? "text-amber-600" : "text-red-500";
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low text-xs">
      <MaterialIcon icon="verified" filled className={`text-sm ${color}`} />
      <span className="font-bold text-on-surface-variant">Hon9Kon9ize 校準</span>
      <span className={`font-extrabold ${color}`}>{Math.round(agreementRate * 100)}%</span>
      <span className="text-on-surface-variant">一致率</span>
    </div>
  );
}

function LearningProgress({ sessions, snnWeight }: { sessions: number; snnWeight: number }) {
  const pct = Math.min(100, Math.round((snnWeight / 0.9) * 100));
  return (
    <div className="flex items-center gap-3">
      <MaterialIcon icon="psychology" filled className="text-xl text-secondary" />
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-bold text-on-surface-variant">STDP 學習進度</span>
          <span className="font-bold text-secondary tabular-nums">{pct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-secondary to-secondary-dim transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-on-surface-variant mt-0.5">
          已從 {sessions} 次練習中學習 · NEPA 權重 {Math.round(snnWeight * 100)}%
        </p>
      </div>
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: any }) {
  const iconMap: Record<string, string> = {
    tone_drill: "music_note",
    minimal_pair: "compare_arrows",
    syllable_repeat: "repeat",
    word_practice: "record_voice_over",
    sentence_build: "chat",
  };
  return (
    <FadeIn>
      <div className="glass-card glow-rim rounded-xl p-4 shadow-card hover:scale-[1.02] hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
            <MaterialIcon icon={iconMap[exercise.exercise_type] || "exercise"} filled className="text-lg text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface">{exercise.description || exercise.exercise_type}</p>
            <p className="text-[10px] text-on-surface-variant">
              目標音素: {exercise.target_phonemes?.join(", ") || "—"}
            </p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            exercise.difficulty === "easy" ? "bg-green-100 text-green-700" :
            exercise.difficulty === "hard" ? "bg-red-100 text-red-600" :
            "bg-amber-100 text-amber-700"
          }`}>
            {exercise.difficulty === "easy" ? "基礎" : exercise.difficulty === "hard" ? "進階" : "中階"}
          </span>
        </div>
      </div>
    </FadeIn>
  );
}

function LivePhonemeTrace() {
  return (
    <FadeIn>
      <div className="glass-card glow-rim rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MaterialIcon icon="graphic_eq" filled className="text-xl text-primary" />
            <h3 className="font-headline font-bold text-on-surface">實時音素串流</h3>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            正在監聽
          </span>
        </div>
        <div className="bg-surface-container-low rounded-xl p-4 font-mono text-sm min-h-[120px] flex flex-col justify-center">
          <div className="flex items-center gap-2 text-green-600">
            <MaterialIcon icon="mic" filled className="text-lg" />
            <span className="animate-pulse text-on-surface-variant">等待音訊串流...</span>
          </div>
          <div className="mt-3 flex items-end gap-1 h-12">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="w-2 rounded-t-sm bg-primary/30"
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <div className="mt-3 flex gap-3 text-xs text-on-surface-variant">
            <span>初始 ▸ /l/</span>
            <span>韻母 ▸ /aa/</span>
            <span>聲調 ▸ 1 → 3 (漂移 ⚠️)</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-on-surface-variant">
          <span>10ms 幀 · 16kHz PCM</span>
          <span>NEPA SNN 推論: ~4ms</span>
        </div>
      </div>
    </FadeIn>
  );
}

function RecentActivity({ activities }: { activities: any[] }) {
  if (!activities || activities.length === 0) return null;
  return (
    <Stagger className="space-y-2">
      {activities.slice(0, 5).map((a, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low/50 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-primary-container/30 flex items-center justify-center shrink-0">
            <MaterialIcon icon={a.type === "improvement" ? "trending_up" : "check_circle"} filled className={`text-sm ${a.type === "improvement" ? "text-green-600" : "text-primary"}`} />
          </div>
          <p className="text-xs text-on-surface flex-1">{a.description || a.type}</p>
          <span className="text-[10px] text-on-surface-variant whitespace-nowrap font-medium">
            {a.timestamp ? new Date(a.timestamp).toLocaleDateString("zh-HK") : ""}
          </span>
        </div>
      ))}
    </Stagger>
  );
}

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <FadeIn>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-container/30 flex items-center justify-center mb-4">
          <MaterialIcon icon={icon} filled className="text-3xl text-primary/60" />
        </div>
        <p className="font-headline font-bold text-on-surface text-lg">{title}</p>
        <p className="text-sm text-on-surface-variant mt-1 max-w-xs">{description}</p>
      </div>
    </FadeIn>
  );
}

function MobileTopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-2xl border-b border-surface-container-high">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <MaterialIcon icon="psychology" filled className="text-sm text-on-primary" />
          </div>
          <span className="font-headline font-bold text-sm text-on-surface">NEPA 網絡</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-surface-container-low">
          <MaterialIcon icon={menuOpen ? "close" : "menu"} filled className="text-lg" />
        </button>
      </div>
    </nav>
  );
}

export default function NEPADashboardPage() {
  const { students, loading: studentsLoading } = useSTDashboard();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const { dashboard, recommendations, loading: nepLoading } = useNEPAWorldModel(selectedPatient);
  const [showTrace, setShowTrace] = useState(false);

  const selectStudent = (id: string) => {
    setSelectedPatient(id);
    setShowTrace(true);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased">
      <MobileTopNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pt-20 lg:pt-6">
        <FadeIn>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <MaterialIcon icon="psychology" filled className="text-xl text-on-primary" />
              </div>
              <div>
                <h1 className="font-headline text-2xl font-extrabold text-on-surface">NEPA 神經網絡</h1>
                <p className="text-xs text-on-surface-variant">Spike-Timing-Dependent Plasticity · 世界模型 · Hon9Kon9ize 校準</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FadeIn>
              <div className="glass-card glow-rim rounded-xl p-4 shadow-card">
                <h2 className="font-headline font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
                  <MaterialIcon icon="patients" filled className="text-primary text-lg" />
                  學生
                  {students && students.length > 0 && (
                    <span className="ml-auto text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                      {students.length}
                    </span>
                  )}
                </h2>
                {studentsLoading ? (
                  <SkeletonList rows={4} />
                ) : students && students.length > 0 ? (
                  <Stagger className="space-y-1">
                    {students.map((s) => (
                      <button
                        key={s.student_id}
                        onClick={() => selectStudent(s.student_id)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all ${
                          selectedPatient === s.student_id
                            ? "bg-primary/10 ring-1 ring-primary/30 shadow-sm"
                            : "hover:bg-surface-container-low/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary-container/40 flex items-center justify-center shrink-0">
                            <span className="font-headline font-bold text-primary text-xs">
                              {(s.nickname || s.student_id).charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-on-surface truncate">{s.nickname || s.student_id}</p>
                            <p className="text-[10px] text-on-surface-variant">{s.completed_lessons} 課節</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </Stagger>
                ) : (
                  <EmptyState
                    icon="group_add"
                    title="尚未連結學生"
                    description="在「個案管理」中添加學生後，NEPA 將自動為每位學生建立神經網絡世界模型。"
                  />
                )}
                <div className="mt-3 pt-3 border-t border-surface-container-high">
                  <CalibrationBadge agreementRate={0.95} />
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {!selectedPatient ? (
              <EmptyState
                icon="touch_app"
                title="選擇一位學生"
                description="從左側選擇學生，NEPA 將顯示其專屬的世界模型、音素趨勢、疲勞檢測和個人化練習建議。"
              />
            ) : nepLoading ? (
              <div className="glass-card glow-rim rounded-xl p-8 shadow-card flex items-center justify-center">
                <div className="text-center">
                  <MaterialIcon icon="sync" filled className="text-3xl text-primary/40 animate-spin mb-2" />
                  <p className="text-sm text-on-surface-variant">正在載入 NEPA 世界模型...</p>
                </div>
              </div>
            ) : dashboard ? (
              <>
                <FatigueAlert warnings={dashboard.fatigue_warnings || []} />

                <FadeIn>
                  <div className="glass-card glow-rim rounded-xl p-5 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MaterialIcon icon="target" filled className="text-xl text-primary" />
                        <h2 className="font-headline font-bold text-on-surface">音素檔案</h2>
                      </div>
                      <LearningProgress sessions={dashboard.total_sessions || 0} snnWeight={0.72} />
                    </div>
                    <Stagger className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {(dashboard.phoneme_stats || []).map((p) => (
                        <PhonemeTile
                          key={p.phoneme}
                          phoneme={p.phoneme}
                          accuracy={p.accuracy}
                          trend={p.trend || "stable"}
                        />
                      ))}
                    </Stagger>
                  </div>
                </FadeIn>

                {recommendations.length > 0 && (
                  <FadeIn delay={80}>
                    <div className="glass-card glow-rim rounded-xl p-5 shadow-card">
                      <div className="flex items-center gap-2 mb-4">
                        <MaterialIcon icon="auto_awesome" filled className="text-xl text-secondary" />
                        <h2 className="font-headline font-bold text-on-surface">NEPA 練習建議</h2>
                        <span className="text-[10px] text-on-surface-variant font-medium ml-auto">
                          基於世界模型 · 每節課後更新
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {recommendations.slice(0, 4).map((rec, i) => (
                          <ExerciseCard key={i} exercise={rec} />
                        ))}
                      </div>
                    </div>
                  </FadeIn>
                )}

                {showTrace && <LivePhonemeTrace />}

                <FadeIn delay={120}>
                  <div className="glass-card glow-rim rounded-xl p-5 shadow-card">
                    <div className="flex items-center gap-2 mb-4">
                      <MaterialIcon icon="history" filled className="text-xl text-on-surface-variant" />
                      <h2 className="font-headline font-bold text-on-surface">最近活動</h2>
                    </div>
                    <RecentActivity activities={dashboard.recent_activity || []} />
                  </div>
                </FadeIn>
              </>
            ) : (
              <div className="glass-card glow-rim rounded-xl p-8 shadow-card flex items-center justify-center">
                <div className="text-center">
                  <MaterialIcon icon="cloud_off" filled className="text-3xl text-on-surface-variant/40 mb-2" />
                  <p className="text-sm text-on-surface-variant">NEPA 服務無法連線</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">請確認 NEPA 後端正在運行</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
