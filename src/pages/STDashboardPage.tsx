import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import { PiPiWidget } from "@/components/PiPiWidget";
import { useSTDashboard, type StudentData } from "@/hooks/useSTDashboard";
import { useNEPAWorldModel, type DashboardSummary, type ExerciseRecommendation } from "@/hooks/useNEPAWorldModel";
import { FadeIn, Stagger, SkeletonCard, SkeletonList } from "@/components/ui/animations";

const PIPI_TIPS = [
  "定期查看個案進度！",
  "每次會面後添加課節筆記。",
  "使用 IPA 工具進行評估。",
];

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

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <FadeIn>
      <div className="glass-card glow-rim rounded-xl p-4 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <MaterialIcon icon={icon} filled className={`text-lg ${color}`} />
          <span className="text-xs font-bold text-on-surface-variant">{label}</span>
        </div>
        <span className="font-headline text-2xl font-extrabold text-on-surface">{value}</span>
      </div>
    </FadeIn>
  );
}

function ClientRow({ client, onClick, selected }: { client: StudentData; onClick: () => void; selected?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 active:scale-[0.99] text-left ${
        selected
          ? "bg-primary/10 ring-1 ring-primary/30 shadow-sm"
          : "hover:bg-surface-container-low/60 hover:shadow-sm"
      }`}
    >
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
        <span className="font-headline font-bold text-primary text-sm">
          {(client.nickname || client.student_id).charAt(0)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-headline font-bold text-on-surface text-sm">{client.nickname || client.student_id}</span>
          <span className={`w-2 h-2 rounded-full ${client.last_active ? "bg-green-500 animate-pulse-dot" : "bg-outline-variant"}`} />
        </div>
        <p className="text-xs text-on-surface-variant">
          {client.completed_lessons} 課節 · {client.accuracy_avg}% 準確度
        </p>
      </div>
      <span className="text-xs text-on-surface-variant whitespace-nowrap">
        {client.last_active ? new Date(client.last_active).toLocaleDateString("zh-HK") : "暫無"}
      </span>
    </button>
  );
}

function ActivityRow({ activity, index }: { activity: any; index: number }) {
  return (
    <FadeIn delay={index * 40}>
      <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-container-low/50 transition-colors">
        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
          <MaterialIcon icon="check_circle" filled className="text-lg text-green-500" />
        </div>
        <p className="text-sm text-on-surface flex-1">{activity.description}</p>
        <span className="text-xs text-on-surface-variant whitespace-nowrap font-medium">
          {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString("zh-HK") : ""}
        </span>
      </div>
    </FadeIn>
  );
}

function RecommendationCard({ rec, index }: { rec: ExerciseRecommendation; index: number }) {
  const iconMap: Record<string, string> = {
    tone_drill: "music_note",
    minimal_pair: "compare_arrows",
    syllable_repeat: "repeat",
    word_practice: "record_voice_over",
    sentence_build: "chat",
  };
  return (
    <FadeIn delay={index * 60}>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-container/20 border border-secondary-container/30 hover:bg-secondary-container/30 transition-all hover:scale-[1.01]">
        <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
          <MaterialIcon icon={iconMap[rec.exercise_type] || "exercise"} filled className="text-lg text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-on-surface">{rec.description || rec.exercise_type}</p>
          <p className="text-xs text-on-surface-variant">
            目標: {rec.target_phonemes.join(", ")} · {rec.difficulty === "easy" ? "基礎" : rec.difficulty === "hard" ? "進階" : "中階"}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

function PhonemeCard({ phoneme, accuracy, trend }: { phoneme: string; accuracy: number; trend: string }) {
  const pct = Math.round(accuracy * 100);
  const colorMap = {
    improving: { bg: "bg-green-50 border-green-200", icon: "trending_up", iconColor: "text-green-600" },
    declining: { bg: "bg-red-50 border-red-200", icon: "trending_down", iconColor: "text-red-500" },
    stable: { bg: "bg-surface-container-low border-surface-container-high", icon: "trending_flat", iconColor: "text-on-surface-variant" },
  };
  const cs = colorMap[trend as keyof typeof colorMap] || colorMap.stable;
  return (
    <FadeIn>
      <div className={`rounded-xl p-3 border transition-all hover:scale-[1.03] hover:shadow-md ${cs.bg} cursor-default`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-headline font-bold text-lg text-on-surface">{phoneme}</span>
          <MaterialIcon icon={cs.icon} filled className={`text-sm ${cs.iconColor}`} />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-2 rounded-full bg-white/60 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 80 ? "hsl(142, 60%, 45%)" : pct >= 60 ? "hsl(38, 92%, 50%)" : "hsl(0, 74%, 40%)",
              }}
            />
          </div>
          <span className="text-xs font-bold text-on-surface-variant tabular-nums">{pct}%</span>
        </div>
        <TrendSparkline accuracy={accuracy} />
      </div>
    </FadeIn>
  );
}

function FatigueBanner({ warnings }: { warnings: string[] }) {
  if (!warnings || warnings.length === 0) return null;
  return (
    <FadeIn>
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-start gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <MaterialIcon icon="warning" filled className="text-amber-500" />
        </div>
        <div>
          <p className="font-bold text-amber-800 text-sm flex items-center gap-2">
            疲勞檢測警告
            <span className="text-[10px] font-normal text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">NEPA 神經網絡</span>
          </p>
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-700 mt-0.5">{w}</p>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <FadeIn>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-container/30 flex items-center justify-center mb-4">
          <MaterialIcon icon={icon} filled className="text-3xl text-primary/60" />
        </div>
        <p className="font-headline font-bold text-on-surface text-lg">{title}</p>
        <p className="text-sm text-on-surface-variant mt-1 max-w-xs">{description}</p>
      </div>
    </FadeIn>
  );
}

function TopNav() {
  const navigate = useNavigate();
  return (
    <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-2xl border-b border-surface-container-high">
      <div className="flex items-center justify-between px-4 h-14">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <MaterialIcon icon="smart_toy" filled className="text-sm text-on-primary" />
          </div>
          <span className="font-headline font-bold text-sm text-primary">SpeakAble</span>
        </button>
        <div className="flex items-center gap-1">
          {[
            { icon: "dashboard", label: "儀表板", path: "/st-dashboard" },
            { icon: "monitoring", label: "個案", path: "/st-accounts" },
            { icon: "analytics", label: "NEPA", path: "/st-nepa" },
            { icon: "sports_esports", label: "遊戲", path: "/st-game-builder" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                item.path === "/st-dashboard" ? "bg-primary/10 text-primary" : "text-on-surface-variant"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default function STDashboardPage() {
  const navigate = useNavigate();
  const { students, loading: studentsLoading } = useSTDashboard();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const { dashboard, recommendations, loading: nepLoading } = useNEPAWorldModel(selectedPatient);

  const safeStudents = students || [];

  const stats = dashboard
    ? [
        { icon: "group", label: "個案總數", value: String(safeStudents.length), color: "text-primary" },
        { icon: "check_circle", label: "總課節", value: String(dashboard.total_sessions || 0), color: "text-green-600" },
        { icon: "trending_up", label: "整體準確度", value: dashboard.overall_accuracy != null ? `${Math.round(dashboard.overall_accuracy)}%` : "N/A", color: "text-tertiary" },
        { icon: "schedule", label: "疲勞警告", value: String(dashboard.fatigue_warnings?.length || 0), color: dashboard.fatigue_warnings?.length ? "text-amber-500" : "text-secondary" },
      ]
    : [
        { icon: "group", label: "個案總數", value: String(safeStudents.length), color: "text-primary" },
        { icon: "check_circle", label: "本週課節", value: "—", color: "text-green-600" },
        { icon: "trending_up", label: "平均準確度", value: safeStudents.length ? `${Math.round(safeStudents.reduce((a, s) => a + s.accuracy_avg, 0) / safeStudents.length)}%` : "—", color: "text-tertiary" },
        { icon: "schedule", label: "活躍學生", value: String(safeStudents.filter(s => s.last_active).length), color: "text-secondary" },
      ];

  const activity = dashboard?.recent_activity || [];
  const hasRecs = recommendations.length > 0;
  const fatigueWarnings = dashboard?.fatigue_warnings || [];

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased">
      <TopNav />

      <aside className="fixed left-0 top-0 h-full w-72 flex-col p-6 z-40 bg-slate-50/80 backdrop-blur-2xl rounded-r-[3rem] my-4 ml-4 shadow-xl shadow-primary/5 hidden lg:flex">
        <button onClick={() => navigate("/")} className="mb-10 flex items-center gap-3 hover:opacity-80 transition-opacity active:scale-95">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
            <MaterialIcon icon="smart_toy" filled className="text-2xl" />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-extrabold text-primary font-headline leading-tight tracking-tight">SpeakAble HK</h1>
            <p className="text-[11px] text-on-surface-variant font-medium">治療師平台</p>
          </div>
        </button>
        <nav className="flex-1 space-y-1.5">
          {[
            { icon: "dashboard", label: "儀表板", path: "/st-dashboard" },
            { icon: "monitoring", label: "個案進度", path: "/st-accounts" },
            { icon: "analytics", label: "神經數據", path: "/st-nepa" },
            { icon: "sports_esports", label: "AI 遊戲工坊", path: "/st-game-builder" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full rounded-full mx-1 p-3 flex items-center gap-3.5 transition-all hover:scale-[1.02] active:scale-95 ${
                item.path === "/st-dashboard"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high/60"
              }`}
            >
              <MaterialIcon icon={item.icon} filled={item.path === "/st-dashboard"} />
              <span className="font-semibold text-sm font-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-4">
          <button className="w-full bg-primary text-on-primary rounded-xl py-3.5 font-bold font-label flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm">
            <MaterialIcon icon="person_add" /> 新增個案
          </button>
        </div>
      </aside>

      <main className="lg:ml-80 max-w-6xl mx-auto px-4 sm:px-6 py-6 pt-20 md:pt-20 lg:pt-6">
        <FadeIn>
          <div className="mb-8">
            <h1 className="font-headline text-2xl font-bold text-on-surface">早安，治療師</h1>
            <p className="text-on-surface-variant text-sm mt-1">以下是 NEPA 神經網絡分析的業務概覽</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {studentsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            stats.map((s) => <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />)
          )}
        </div>

        <FatigueBanner warnings={fatigueWarnings} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <FadeIn>
            <div className="glass-card glow-rim rounded-xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
                  <MaterialIcon icon="patients" filled className="text-primary text-lg" />
                  學生選擇
                </h2>
                {safeStudents.length > 0 && (
                  <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">
                    {safeStudents.length} 位
                  </span>
                )}
              </div>
              {studentsLoading ? (
                <SkeletonList rows={4} />
              ) : safeStudents.length === 0 ? (
                <EmptyState icon="group_add" title="尚未添加學生" description="在「個案管理」中添加學生以開始追蹤進度。" />
              ) : (
                <Stagger className="space-y-1 max-h-64 overflow-y-auto">
                  {safeStudents.map((client) => (
                    <ClientRow
                      key={client.student_id}
                      client={client}
                      selected={selectedPatient === client.student_id}
                      onClick={() => setSelectedPatient(client.student_id)}
                    />
                  ))}
                </Stagger>
              )}
            </div>
          </FadeIn>

          <FadeIn delay={80}>
            <div className="glass-card glow-rim rounded-xl p-5 shadow-card min-h-[200px]">
              <h2 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                <MaterialIcon icon="auto_awesome" filled className="text-secondary text-lg" />
                NEPA 建議
              </h2>
              {!selectedPatient ? (
                <EmptyState icon="touch_app" title="選擇學生" description="選取一位學生以查看個人化練習建議。" />
              ) : nepLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="shimmer-skeleton h-16 rounded-xl" />
                  ))}
                </div>
              ) : hasRecs ? (
                <div className="space-y-2">
                  {recommendations.slice(0, 4).map((rec, i) => (
                    <RecommendationCard key={i} rec={rec} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState icon="search" title="暫無建議" description="已選擇學生但尚未生成練習建議。" />
              )}
            </div>
          </FadeIn>
        </div>

        {selectedPatient && dashboard && (
          <FadeIn>
            <div className="glass-card glow-rim rounded-xl p-5 shadow-card mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
                  <MaterialIcon icon="target" filled className="text-primary text-lg" />
                  音素表現
                </h2>
                {dashboard.total_sessions != null && (
                  <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">
                    {dashboard.total_sessions} 課節
                  </span>
                )}
              </div>
              <Stagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {(dashboard.phoneme_stats || []).map((p) => (
                  <PhonemeCard key={p.phoneme} phoneme={p.phoneme} accuracy={p.accuracy} trend={p.trend || "stable"} />
                ))}
              </Stagger>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={40}>
          <div className="glass-card glow-rim rounded-xl p-5 shadow-card">
            <h2 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <MaterialIcon icon={selectedPatient ? "history" : "group"} filled className="text-on-surface-variant text-lg" />
              {selectedPatient ? "最近活動" : "活躍個案"}
            </h2>
            {studentsLoading ? (
              <SkeletonList rows={4} />
            ) : selectedPatient && activity.length > 0 ? (
              <div className="space-y-1">
                {activity.slice(0, 5).map((a, i) => (
                  <ActivityRow key={i} activity={a} index={i} />
                ))}
              </div>
            ) : !selectedPatient ? (
              <div className="space-y-1">
                {safeStudents.slice(0, 5).map((client) => (
                  <ClientRow
                    key={client.student_id}
                    client={client}
                    selected={false}
                    onClick={() => setSelectedPatient(client.student_id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon="event_busy" title="暫無活動" description="該學生尚未有活動記錄。" />
            )}
          </div>
        </FadeIn>
      </main>

      <PiPiWidget tips={PIPI_TIPS} className="hidden xl:block" />
    </div>
  );
}
