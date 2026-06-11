import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/shared/components/MaterialIcon";
import { phonemeCategories } from "@/data/lessons";
import { toast } from "sonner";

interface MockAccount {
  userId: string;
  username: string;
  chineseName: string;
  phone: string;
  usageMinutes: number;
  accuracy: number;
  completions: number;
  totalPoints: number;
  status: "active" | "inactive";
}

const MOCK_ACCOUNTS: MockAccount[] = [
  { userId: "SHK-001", username: "leo_chan", chineseName: "陳小明", phone: "9123-4567", usageMinutes: 90, accuracy: 85, completions: 12, totalPoints: 450, status: "active" },
  { userId: "SHK-002", username: "mei_wong", chineseName: "黃美芳", phone: "9234-5678", usageMinutes: 45, accuracy: 72, completions: 6, totalPoints: 200, status: "active" },
  { userId: "SHK-003", username: "jun_li", chineseName: "李俊傑", phone: "9345-6789", usageMinutes: 120, accuracy: 91, completions: 18, totalPoints: 680, status: "active" },
  { userId: "SHK-004", username: "ying_lam", chineseName: "林嘉瑩", phone: "9456-7890", usageMinutes: 30, accuracy: 58, completions: 3, totalPoints: 90, status: "inactive" },
  { userId: "SHK-005", username: "hei_cheung", chineseName: "張曉希", phone: "9567-8901", usageMinutes: 60, accuracy: 79, completions: 8, totalPoints: 310, status: "active" },
];

const SKILL_LABELS = ["雙唇音", "齒齦音", "軟顎音", "擦音", "鼻音"];

export default function STAccountsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = MOCK_ACCOUNTS.filter(
    (a) =>
      a.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.chineseName.includes(searchQuery)
  );

  const handleAssign = (userId: string, categoryLabel: string) => {
    toast.success(`已為 ${userId} 指派「${categoryLabel}」練習`);
  };

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
          <button onClick={() => navigate("/st-dashboard")} className="w-full text-on-surface-variant hover:bg-surface-container-high/60 mx-1 rounded-full p-3 flex items-center gap-3.5 transition-all">
            <MaterialIcon icon="dashboard" /> <span className="font-semibold text-sm">儀表板</span>
          </button>
          <button className="w-full bg-primary/10 text-primary mx-1 rounded-full p-3 flex items-center gap-3.5">
            <MaterialIcon icon="monitoring" filled /> <span className="font-semibold text-sm">個案進度</span>
          </button>
        </nav>
      </aside>

      <main className="lg:ml-80 max-w-6xl mx-auto px-4 sm:px-6 py-6 pt-4 md:pt-20">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: client list (lg:col-span-8) */}
          <div className="flex-1 lg:max-w-[66%]">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-headline text-2xl font-bold text-on-surface">個案詳情</h1>
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <MaterialIcon icon="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋個案…"
                className="w-full pl-10 pr-4 h-12 rounded-xl border border-outline-variant/40 bg-surface-container-lowest/80 font-body text-on-surface focus:border-primary focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Client cards */}
            <div className="space-y-4">
              {filtered.map((acc) => (
                <div
                  key={acc.userId}
                  className="glass-card rounded-xl border border-white/40 shadow-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === acc.userId ? null : acc.userId)}
                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-surface-container-low/40 transition-colors active:scale-[0.99]"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary-container/40 flex items-center justify-center shrink-0">
                      <span className="font-headline font-bold text-primary">{acc.chineseName.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-bold text-on-surface">{acc.chineseName}</span>
                        <span className={`w-2 h-2 rounded-full ${acc.status === "active" ? "bg-green-500" : "bg-outline-variant"}`} />
                      </div>
                      <p className="text-xs text-on-surface-variant">{acc.userId} · @{acc.username}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-headline font-bold text-on-surface">{acc.accuracy}%</span>
                      <p className="text-xs text-on-surface-variant">準確度</p>
                    </div>
                    <MaterialIcon icon={expandedId === acc.userId ? "expand_less" : "expand_more"} className="text-on-surface-variant" />
                  </button>

                  {expandedId === acc.userId && (
                    <div className="px-4 pb-4 pt-2 border-t border-outline-variant/20 space-y-4" style={{ animation: "fadeUp .3s ease-out" }}>
                      {/* Stats row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-surface-container-low/60 rounded-lg p-3 text-center">
                          <MaterialIcon icon="schedule" className="text-secondary text-lg" />
                          <p className="font-headline font-bold text-on-surface">{acc.usageMinutes}m</p>
                          <p className="text-[10px] text-on-surface-variant">使用量</p>
                        </div>
                        <div className="bg-surface-container-low/60 rounded-lg p-3 text-center">
                          <MaterialIcon icon="check_circle" className="text-green-600 text-lg" />
                          <p className="font-headline font-bold text-on-surface">{acc.completions}</p>
                          <p className="text-[10px] text-on-surface-variant">完成次數</p>
                        </div>
                        <div className="bg-surface-container-low/60 rounded-lg p-3 text-center">
                          <MaterialIcon icon="star" filled className="text-amber-500 text-lg" />
                          <p className="font-headline font-bold text-on-surface">{acc.totalPoints}</p>
                          <p className="text-[10px] text-on-surface-variant">積分</p>
                        </div>
                        <div className="bg-surface-container-low/60 rounded-lg p-3 text-center">
                          <MaterialIcon icon="phone" className="text-primary text-lg" />
                          <p className="font-headline font-bold text-on-surface text-xs">{acc.phone}</p>
                          <p className="text-[10px] text-on-surface-variant">電話</p>
                        </div>
                      </div>

                      {/* Radar chart mock */}
                      <div className="bg-surface-container-low/40 rounded-xl p-4">
                        <h3 className="font-headline text-sm font-bold text-on-surface mb-3">技能概覽</h3>
                        <div className="flex items-end gap-2 h-24">
                          {SKILL_LABELS.map((label, i) => {
                            const val = 30 + Math.floor(Math.random() * 60);
                            return (
                              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                  className="w-full max-w-[28px] rounded bg-primary/60"
                                  style={{ height: `${val}%` }}
                                />
                                <span className="text-[9px] text-on-surface-variant">{label.slice(0, 3)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Assign practice */}
                      <div>
                        <h3 className="font-headline text-sm font-bold text-on-surface mb-2">指派練習</h3>
                        <div className="flex flex-wrap gap-2">
                          {phonemeCategories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => handleAssign(acc.userId, cat.labelZh)}
                              className="px-3 py-1.5 rounded-full bg-primary-container/30 text-primary text-xs font-bold hover:bg-primary-container/60 transition-colors active:scale-95"
                            >
                              {cat.emoji} {cat.labelZh}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar: session notes (lg:col-span-4) */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="glass-card rounded-xl p-5 shadow-card sticky top-20">
              <h2 className="font-headline text-lg font-bold text-on-surface mb-4">課節筆記</h2>
              <textarea
                rows={6}
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest/80 px-3 py-2 font-body text-sm text-on-surface focus:border-primary focus:ring-primary focus:outline-none resize-y"
                placeholder="在此添加課節筆記…"
              />
              <button className="mt-3 w-full bg-primary text-on-primary font-bold py-2.5 rounded-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform text-sm">
                儲存筆記
              </button>

              <div className="mt-6">
                <h3 className="font-headline text-sm font-bold text-on-surface mb-2">最近筆記</h3>
                <div className="space-y-2 text-xs text-on-surface-variant">
                  <div className="bg-surface-container-low/60 rounded-lg p-2">
                    <p className="font-medium text-on-surface">Wing Yan — 雙唇音進度</p>
                    <p>/b/ 有良好進步，/p/ 送氣音需要更多練習。</p>
                  </div>
                  <div className="bg-surface-container-low/60 rounded-lg p-2">
                    <p className="font-medium text-on-surface">Hei Lam — 語義複習</p>
                    <p>食物分類有困難；建議使用更多視覺輔助。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
