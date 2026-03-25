import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import { PiPiWidget } from "@/components/PiPiWidget";

const MOCK_CLIENTS = [
  { name: "Wing Yan", status: "active", phonemes: 12, accuracy: 82, lastActive: "今天" },
  { name: "Hei Lam", status: "active", phonemes: 8, accuracy: 74, lastActive: "昨天" },
  { name: "Tsz Hin", status: "inactive", phonemes: 5, accuracy: 68, lastActive: "3 天前" },
  { name: "Ka Man", status: "active", phonemes: 15, accuracy: 91, lastActive: "今天" },
];

const STATS = [
  { icon: "group", label: "個案總數", value: "12", color: "text-primary" },
  { icon: "check_circle", label: "本週課節", value: "24", color: "text-green-600" },
  { icon: "trending_up", label: "平均準確度", value: "76%", color: "text-tertiary" },
  { icon: "schedule", label: "平均課節時間", value: "18 分鐘", color: "text-secondary" },
];

const SIDEBAR_NAV = [
  { icon: "dashboard", label: "儀表板", active: true, path: "/st-dashboard" },
  { icon: "monitoring", label: "個案進度", active: false, path: "/st-accounts" },
  { icon: "groups", label: "社區", active: false, path: "/ngo" },
  { icon: "analytics", label: "數據分析", active: false, path: "/st-dashboard" },
];

const PIPI_TIPS = [
  "定期查看個案進度！",
  "每次會面後添加課節筆記。",
  "使用 IPA 工具進行評估。",
];

export default function STDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased">
      {/* Sidebar (desktop) */}
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
          {SIDEBAR_NAV.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full rounded-full mx-1 p-3 flex items-center gap-3.5 transition-all hover:scale-[1.02] active:scale-95 ${
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high/60"
              }`}
            >
              <MaterialIcon icon={item.icon} filled={item.active} />
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

      {/* Main content */}
      <main className="lg:ml-80 max-w-6xl mx-auto px-4 sm:px-6 py-6 pt-4 md:pt-20">
        <div className="mb-8">
          <h1 className="font-headline text-2xl font-bold text-on-surface">早安，治療師</h1>
          <p className="text-on-surface-variant text-sm mt-1">以下是您的業務概覽</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => (
            <div key={s.label} className="glass-card glow-rim rounded-xl p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon icon={s.icon} filled className={`text-lg ${s.color}`} />
                <span className="text-xs font-bold text-on-surface-variant">{s.label}</span>
              </div>
              <span className="font-headline text-2xl font-extrabold text-on-surface">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Client list */}
        <div className="glass-card rounded-xl p-5 shadow-card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-lg font-bold text-on-surface">活躍個案</h2>
            <button
              onClick={() => navigate("/st-accounts")}
              className="text-sm text-primary font-bold hover:text-primary-dim transition-colors"
            >
              查看全部
            </button>
          </div>
          <div className="space-y-3">
            {MOCK_CLIENTS.map((client) => (
              <button
                key={client.name}
                onClick={() => navigate("/st-accounts")}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low/60 transition-colors active:scale-[0.99] text-left"
              >
                <div className="w-11 h-11 rounded-full bg-primary-container/40 flex items-center justify-center shrink-0">
                  <span className="font-headline font-bold text-primary text-sm">
                    {client.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-bold text-on-surface text-sm">{client.name}</span>
                    <span className={`w-2 h-2 rounded-full ${client.status === "active" ? "bg-green-500 animate-pulse-dot" : "bg-outline-variant"}`} />
                  </div>
                  <p className="text-xs text-on-surface-variant">{client.phonemes} 個音素 · {client.accuracy}% 準確度</p>
                </div>
                <span className="text-xs text-on-surface-variant whitespace-nowrap">{client.lastActive}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Activity log */}
        <div className="glass-card rounded-xl p-5 shadow-card">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">最近活動</h2>
          <div className="space-y-3">
            {[
              { text: "Wing Yan 完成了雙唇音 /b/ 第 2 級", time: "2 小時前", icon: "check_circle", color: "text-green-500" },
              { text: "Hei Lam 開始了語義島探索", time: "5 小時前", icon: "play_circle", color: "text-primary" },
              { text: "Ka Man 在 /m/ 音素達到 95%", time: "昨天", icon: "emoji_events", color: "text-amber-500" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <MaterialIcon icon={a.icon} filled className={`text-xl ${a.color}`} />
                <p className="text-sm text-on-surface flex-1">{a.text}</p>
                <span className="text-xs text-on-surface-variant whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <PiPiWidget tips={PIPI_TIPS} className="hidden xl:block" />
    </div>
  );
}
