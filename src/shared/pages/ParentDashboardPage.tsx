import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/shared/hooks/useAuth";
import { MaterialIcon } from "@/shared/components/MaterialIcon";
import { useNEPAWorldModel, type DashboardSummary } from "@/shared/hooks/useNEPAWorldModel";
import { usePhonemeAnalytics } from "@/shared/hooks/usePhonemeAnalytics";
import { useTrendData } from "@/shared/hooks/useTrendData";
import { CreditCard, Settings, User, LayoutDashboard, LogOut, Sparkles, Gamepad2, BookOpen, Volume2, Type, Ruler, Music } from "lucide-react";

interface LinkedStudent {
  student_id: string;
  relationship: string;
  profile: { nickname: string; age: number | null } | null;
}

interface InsightData {
  overview: string;
  strengths: string[];
  improvements: string[];
  tips: string[];
}

interface StudentProgress {
  totalLessons: number;
  completedLessons: number;
  avgAccuracy: number;
  totalXp: number;
}

const PRIVACY_CONSENT_KEY = "speakable-parent-consent-v2";
const PARENT_SETTINGS_KEY = "speakable-parent-settings-v1";

interface ParentSettings {
  dyslexicFont: boolean;
  fontSize: "small" | "medium" | "large";
  spacing: "compact" | "normal" | "wide";
  storyAudioSeed: string;
  audioSpeed: number;
}

const DEFAULT_SETTINGS: ParentSettings = {
  dyslexicFont: false,
  fontSize: "medium",
  spacing: "normal",
  storyAudioSeed: "default",
  audioSpeed: 1,
};

function getParentSettings(): ParentSettings {
  try {
    const raw = localStorage.getItem(PARENT_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveParentSettings(settings: ParentSettings) {
  localStorage.setItem(PARENT_SETTINGS_KEY, JSON.stringify(settings));
}

const STORY_AUDIO_SEEDS = [
  { id: "default", label: "預設聲線", icon: "️" },
  { id: "warm", label: "溫暖女聲", icon: "👩" },
  { id: "gentle", label: "溫柔男聲", icon: "👨" },
  { id: "child", label: "兒童聲線", icon: "🧒" },
  { id: "grandma", label: "婆婆聲線", icon: "👵" },
  { id: "animated", label: "動畫角色", icon: "🦸" },
];

function getPrivacyConsent(): boolean {
  try {
    const raw = localStorage.getItem(PRIVACY_CONSENT_KEY);
    if (!raw) return false;
    const record = JSON.parse(raw);
    const agreed = new Date(record.agreedAt).getTime();
    return (Date.now() - agreed) < 365 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function setPrivacyConsent() {
  localStorage.setItem(PRIVACY_CONSENT_KEY, JSON.stringify({
    agreedAt: new Date().toISOString(),
    version: "2024-v1",
  }));
}

function getFriendlyLabel(phoneme: string): string {
  const map: Record<string, string> = {
    '/b/': 'b', '/p/': 'p', '/m/': 'm',
    '/d/': 'd', '/t/': 't', '/n/': 'n', '/l/': 'l',
    '/g/': 'g', '/k/': 'k', '/ng/': 'ng',
    '/f/': 'f', '/s/': 's', '/z/': 'z', '/c/': 'c',
    '/h/': 'h', '/w/': 'w', '/j/': 'j',
    '/gw/': 'gw', '/kw/': 'kw',
    'tone_1': '第一聲', 'tone_2': '第二聲', 'tone_3': '第三聲',
    'tone_4': '第四聲', 'tone_5': '第五聲', 'tone_6': '第六聲',
  };
  return map[phoneme] || phoneme;
}

function getSmileyForAccuracy(acc: number): string {
  if (acc >= 80) return '😊';
  if (acc >= 60) return '🙂';
  if (acc >= 40) return '😐';
  return '😟';
}

function getColorForAccuracy(acc: number): string {
  if (acc >= 80) return 'text-emerald-400';
  if (acc >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function getBgForAccuracy(acc: number): string {
  if (acc >= 80) return 'bg-emerald-500/10 border-emerald-500/30';
  if (acc >= 60) return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-red-500/10 border-red-500/30';
}

function getFriendlyTip(phoneme: string, accuracy: number, trend: string): string {
  const accPct = Math.round(accuracy * 100);
  if (accPct >= 80) return '做得好好！繼續保持！';
  if (trend === 'improving') return '進步緊！再多啲練習就更好！';
  if (phoneme.includes('tone')) return '試下用手勢幫手：第一聲手平放，第六聲手向下。';
  if (phoneme === '/n/' || phoneme === '/l/') return '用鏡子觀察舌頭位置：/n/ 舌尖頂上齒齦，/l/ 舌尖放平。';
  return '每日練習 5 分鐘，慢慢就會進步！';
}

function ProgressSnapshot({ dashboard, trend }: { dashboard: DashboardSummary | null; trend: any[] }) {
  if (!dashboard) return null;
  const thisWeekCount = trend.filter(t => {
    const d = new Date(t.date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo && t.accuracy > 0;
  }).length;
  const lastSessionAcc = trend.length > 0 ? trend[trend.length - 1].accuracy : 0;
  const newSoundsLearned = dashboard.phoneme_stats.filter(p => p.trend === 'improving').length;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="stat-card text-center">
        <p className="text-small mb-1">本週練習</p>
        <div className="flex justify-center gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i < thisWeekCount ? 'bg-success' : 'bg-muted'}`} />
          ))}
        </div>
        <p className="stat-value stat-value-primary mt-1">{thisWeekCount}</p>
      </div>
      <div className="stat-card text-center">
        <p className="text-small mb-1">新學音素</p>
        <p className="stat-value text-success">{newSoundsLearned}</p>
      </div>
      <div className="stat-card text-center">
        <p className="text-small mb-1">上次練習</p>
        <p className="text-2xl">{getSmileyForAccuracy(lastSessionAcc)}</p>
      </div>
    </div>
  );
}

function SoundStrengthCards({ phonemeStats }: { phonemeStats: { phoneme: string; accuracy: number; trend: string }[] }) {
  if (!phonemeStats || phonemeStats.length === 0) return null;
  const sorted = [...phonemeStats].sort((a, b) => b.accuracy - a.accuracy);
  const initials = sorted.filter(p => !p.phoneme.includes('tone') && p.phoneme.startsWith('/'));
  const tones = sorted.filter(p => p.phoneme.includes('tone'));
  const finals = sorted.filter(p => !p.phoneme.includes('tone') && !p.phoneme.startsWith('/'));

  return (
    <div className="space-y-4">
      <h3 className="text-section-title flex items-center gap-2">
        <MaterialIcon icon="graphic_eq" className="text-lg text-primary" filled />
        聲音強項卡
      </h3>
      {initials.length > 0 && (
        <div>
          <p className="text-small mb-2">聲母（開頭音）</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {initials.slice(0, 6).map((p) => {
              const acc = Math.round(p.accuracy * 100);
              return (
                <div key={p.phoneme} className={`card-flat p-3 ${getBgForAccuracy(acc)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-card-title text-lg">{getFriendlyLabel(p.phoneme)}</span>
                    <span className="text-xl">{getSmileyForAccuracy(acc)}</span>
                  </div>
                  <p className={`text-xs font-bold ${getColorForAccuracy(acc)}`}>
                    {acc >= 80 ? '完美' : acc >= 60 ? '差啲啲' : '需要練習'}
                  </p>
                  <p className="text-small mt-1">{getFriendlyTip(p.phoneme, p.accuracy, p.trend)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tones.length > 0 && (
        <div>
          <p className="text-small mb-2">聲調</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tones.map((p) => {
              const acc = Math.round(p.accuracy * 100);
              return (
                <div key={p.phoneme} className={`card-flat p-3 ${getBgForAccuracy(acc)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-card-title">{getFriendlyLabel(p.phoneme)}</span>
                    <span className="text-xl">{getSmileyForAccuracy(acc)}</span>
                  </div>
                  <p className={`text-xs font-bold ${getColorForAccuracy(acc)}`}>
                    {acc >= 80 ? '完美' : acc >= 60 ? '差啲啲' : '需要練習'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {finals.length > 0 && (
        <div>
          <p className="text-small mb-2">韻母（結尾音）</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {finals.slice(0, 6).map((p) => {
              const acc = Math.round(p.accuracy * 100);
              return (
                <div key={p.phoneme} className={`card-flat p-3 ${getBgForAccuracy(acc)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-card-title text-lg">{getFriendlyLabel(p.phoneme)}</span>
                    <span className="text-xl">{getSmileyForAccuracy(acc)}</span>
                  </div>
                  <p className={`text-xs font-bold ${getColorForAccuracy(acc)}`}>
                    {acc >= 80 ? '完美' : acc >= 60 ? '差啲啲' : '需要練習'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklyHeatmap({ trend }: { trend: any[] }) {
  if (!trend || trend.length === 0) return null;
  const last28Days = trend.slice(-28);

  return (
    <div className="card-flat">
      <h3 className="text-card-title text-sm mb-3 flex items-center gap-2">
        <MaterialIcon icon="calendar_month" className="text-lg text-warning" filled />
        本週進度
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {['一', '二', '三', '四', '五', '六', '日'].map(d => (
          <div key={d} className="text-small text-center">{d}</div>
        ))}
        {last28Days.map((day, i) => {
          const acc = day?.accuracy || 0;
          const color = acc >= 80 ? 'bg-success' : acc >= 60 ? 'bg-warning' : acc > 0 ? 'bg-error' : 'bg-muted';
          return (
            <div key={i} className={`aspect-square rounded ${color} flex items-center justify-center`} title={day ? `${day.date}: ${acc}%` : ''}>
              {acc > 0 && <span className="text-[8px] font-bold text-white">{acc}</span>}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-3 mt-3 text-small">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-success" /> 掌握</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-warning" /> 進步中</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-error" /> 需練習</span>
      </div>
    </div>
  );
}

function ToneShapeCard({ phonemeStats }: { phonemeStats: { phoneme: string; accuracy: number; trend: string }[] }) {
  const tones = phonemeStats.filter(p => p.phoneme.includes('tone'));
  if (tones.length === 0) return null;
  const weakest = tones.reduce((a, b) => a.accuracy < b.accuracy ? a : b);
  const acc = Math.round(weakest.accuracy * 100);

  return (
    <div className="card-flat">
      <h3 className="text-card-title text-sm mb-2 flex items-center gap-2">
        <MaterialIcon icon="music_note" className="text-lg" style={{ color: "#8b5cf6" }} filled />
        聲調形狀
      </h3>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-small mb-1">最需要關注</p>
          <p className="text-card-title text-lg">{getFriendlyLabel(weakest.phoneme)}</p>
          <p className={`text-sm font-bold ${getColorForAccuracy(acc)}`}>
            {acc >= 80 ? '掌握良好' : acc >= 60 ? '差啲啲' : '需要練習'}
          </p>
        </div>
        <div className="w-20 h-12 flex items-end gap-0.5">
          {tones.map((t, i) => {
            const h = Math.max(10, Math.round(t.accuracy * 100));
            const color = t.phoneme === weakest.phoneme ? 'bg-primary' : 'bg-muted';
            return <div key={i} className={`flex-1 rounded-t ${color}`} style={{ height: `${h}%` }} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default function ParentDashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "billing" | "settings" | "account">("dashboard");
  const [settings, setSettings] = useState<ParentSettings>(getParentSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);
  const { dashboard: nepaDashboard, loading: nepaLoading } = useNEPAWorldModel(selectedStudent);
  const { phonemeStats } = usePhonemeAnalytics(selectedStudent || '');
  const { trend } = useTrendData(selectedStudent || '');

  useEffect(() => {
    if (!getPrivacyConsent()) {
      setShowConsent(true);
    }
    fetchStudents();
  }, []);

  const handleSaveSettings = () => {
    saveParentSettings(settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const sidebarNav = [
    { icon: LayoutDashboard, label: "控制台", tab: "dashboard" as const },
    { icon: CreditCard, label: "訂閱計劃", tab: "billing" as const },
    { icon: Settings, label: "設定", tab: "settings" as const },
    { icon: User, label: "帳戶設定", tab: "account" as const },
  ];

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('parent_students' as any)
      .select('student_id, relationship')
      .eq('parent_id', user?.id);

    if (error) {
      console.error('Failed to fetch students:', error);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }

    const ids = data.map((s: any) => s.student_id);
    const { data: profiles } = await supabase
      .from('explorer_profiles')
      .select('user_id, nickname, age')
      .in('user_id', ids);

    const enriched = data.map((s: any) => ({
      ...s,
      profile: profiles?.find((p: any) => p.user_id === s.student_id) || null,
    }));

    setStudents(enriched);
    setLoading(false);
  };

  const fetchInsight = async (studentId: string) => {
    setSelectedStudent(studentId);
    setInsightLoading(true);
    setInsightData(null);

    const { data, error } = await supabase.functions.invoke('openrouter-insight', {
      body: { student_id: studentId },
    });

    if (error) {
      console.error('Insight error:', error);
      setInsightLoading(false);
      return;
    }

    if (data?.insights) {
      setInsightData(data.insights);
    }
    if (data?.stats) {
      setProgress(data.stats);
    }
    setInsightLoading(false);
  };

  const handleAddStudent = async () => {
    if (!newStudentEmail.trim()) return;
    setAddingStudent(true);

    const { data: userData } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('username', newStudentEmail.trim())
      .maybeSingle();

    if (!userData) {
      alert("找不到此學生。請確認電郵地址正確，或由治療師先建立帳戶。");
      setAddingStudent(false);
      return;
    }

    const { error } = await supabase
      .from('parent_students' as any)
      .insert({ parent_id: user?.id, student_id: userData.user_id });

    if (error) {
      alert("無法連結學生。可能已經連結。");
    } else {
      setNewStudentEmail("");
      fetchStudents();
    }
    setAddingStudent(false);
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("確定要解除同這位學生嘅連結？")) return;
    await supabase
      .from('parent_students' as any)
      .delete()
      .eq('parent_id', user?.id)
      .eq('student_id', studentId);
    fetchStudents();
  };

  const handleConsentAccept = () => {
    setPrivacyConsent();
    setShowConsent(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  if (showConsent) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full rounded-2xl border border-amber-200/40 bg-slate-800/80 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MaterialIcon icon="verified" className="text-2xl text-amber-400" filled />
            <h1 className="font-headline text-xl font-extrabold">私隱同意書</h1>
          </div>
          <div className="text-sm space-y-3 leading-relaxed mb-4 max-h-64 overflow-y-auto bg-slate-900/60 rounded-xl p-3 border border-white/10">
            <p><strong>香港《兒童權利公約》及《個人資料（私隱）條例》</strong></p>
            <p>SpeakAble HK 致力保護兒童及青少年嘅個人資料。根據香港法例，收集 18 歲以下人士嘅個人資料須獲得家長或監護人同意。</p>
            <p><strong>收集嘅資料：</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>小朋友嘅語音錄音（只用於語音分析及改善發音表現）</li>
              <li>練習進度數據（題目準確率、使用時間）</li>
              <li>帳戶基本資料（姓名、年齡範圍）</li>
            </ul>
            <p><strong>資料用途：</strong>提供個人化語音治療練習、追蹤進度、改善 AI 語音辨識。</p>
            <p><strong>資料保安：</strong>所有錄音同數據經加密傳輸，唔會分享俾第三方。</p>
            <p className="text-amber-400 font-bold">此同意書有效期為一年，每年將提示續期。</p>
          </div>
          <button
            onClick={handleConsentAccept}
            className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition"
          >
            同意並繼續
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="page-layout portal-unified">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <User size={20} color="#fff" />
          </div>
          <div>
            <div className="sidebar-brand-name">SpeakAble</div>
            <div className="sidebar-brand-sub">家長平台</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`sidebar-nav-item ${activeTab === item.tab ? "sidebar-nav-item-active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-nav-item"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <LogOut size={18} />
            <span>登出</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="page-main">
        <div className="page-content">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Student list */}
              <section className="section">
                <h2 className="text-section-title mb-4 flex items-center gap-2">
                  <MaterialIcon icon="people" className="text-lg text-primary" filled />
                  已連結嘅小朋友
                </h2>

                {loading ? (
                  <div className="flex items-center gap-3 text-muted text-sm">
                    <MaterialIcon icon="hourglass_top" className="animate-spin" filled />
                    載入中...
                  </div>
                ) : students.length === 0 ? (
                  <div className="card-flat text-center" style={{ borderStyle: "dashed" }}>
                    <MaterialIcon icon="child_care" className="text-5xl text-muted mb-3" filled />
                    <p className="text-body mb-4">尚未連結任何小朋友</p>
                    <p className="text-small mb-6">請輸入小朋友嘅 SpeakAble 帳戶 username 來連結</p>
                    <div className="mx-auto max-w-sm flex gap-2">
                      <input
                        type="text"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        placeholder="小朋友嘅 username"
                        className="input flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleAddStudent()}
                      />
                      <button
                        onClick={handleAddStudent}
                        disabled={addingStudent}
                        className="btn btn-primary"
                      >
                        {addingStudent ? "連結中..." : "連結"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                      {students.map((s) => (
                        <button
                          key={s.student_id}
                          onClick={() => fetchInsight(s.student_id)}
                          className={`card-flat text-left ${
                            selectedStudent === s.student_id
                              ? "border-primary shadow-md"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MaterialIcon icon="child_care" className="text-xl text-primary" filled />
                              <span className="text-body-bold">
                                {s.profile?.nickname || "未命名"}
                              </span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveStudent(s.student_id); }}
                              className="text-muted hover:text-error transition text-sm"
                              title="解除連結"
                            >
                              <MaterialIcon icon="close" className="text-lg" />
                            </button>
                          </div>
                          {s.profile?.age && (
                            <p className="text-small">{s.profile.age} 歲</p>
                          )}
                          {s.relationship && (
                            <p className="text-small mt-1">{s.relationship}</p>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Add student input */}
                    <div className="flex gap-2 max-w-sm">
                      <input
                        type="text"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        placeholder="輸入小朋友嘅 username 連結"
                        className="input flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleAddStudent()}
                      />
                      <button
                        onClick={handleAddStudent}
                        disabled={addingStudent}
                        className="btn btn-primary"
                      >
                        連結
                      </button>
                    </div>
                  </>
                )}
              </section>

              {/* AI Insights */}
              {selectedStudent && (
                <section className="section">
                  <h2 className="text-section-title mb-4 flex items-center gap-2">
                    <MaterialIcon icon="lightbulb" className="text-lg text-warning" filled />
                    AI 家長洞察
                    <span className="text-badge badge-primary">由 OpenRouter 驅動</span>
                  </h2>

                  {insightLoading ? (
                    <div className="card-flat text-center">
                      <MaterialIcon icon="hourglass_top" className="text-3xl text-warning animate-spin mb-3" filled />
                      <p className="text-body text-sm">AI 正在分析練習數據...</p>
                    </div>
                  ) : insightData ? (
                    <div className="space-y-4">
                      {/* Stats */}
                      {progress && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="stat-card text-center">
                            <p className="stat-value stat-value-primary">{progress.totalLessons}</p>
                            <p className="text-small">總練習</p>
                          </div>
                          <div className="stat-card text-center">
                            <p className="stat-value text-success">{progress.completedLessons}</p>
                            <p className="text-small">已完成</p>
                          </div>
                          <div className="stat-card text-center">
                            <p className="stat-value text-warning">{progress.avgAccuracy}%</p>
                            <p className="text-small">平均準確度</p>
                          </div>
                          <div className="stat-card text-center">
                            <p className="stat-value" style={{ color: "#8b5cf6" }}>{progress.totalXp}</p>
                            <p className="text-small">經驗值</p>
                          </div>
                        </div>
                      )}

                      {/* Overview */}
                      <div className="card-flat" style={{ background: "linear-gradient(135deg, #fffbeb 0%, transparent 100%)", borderColor: "#fde68a" }}>
                        <p className="text-body">{insightData.overview}</p>
                      </div>

                      {/* Strengths */}
                      {insightData.strengths.length > 0 && (
                        <div className="card-flat" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, transparent 100%)", borderColor: "#bbf7d0" }}>
                          <h3 className="text-card-title text-success mb-3 flex items-center gap-2">
                            <MaterialIcon icon="check_circle" className="text-lg" filled />
                            做得好嘅地方
                          </h3>
                          <ul className="space-y-2">
                            {insightData.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-body">
                                <MaterialIcon icon="star" className="text-success shrink-0 mt-0.5 text-sm" filled />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improvements */}
                      {insightData.improvements.length > 0 && (
                        <div className="card-flat" style={{ background: "linear-gradient(135deg, #fffbeb 0%, transparent 100%)", borderColor: "#fde68a" }}>
                          <h3 className="text-card-title text-warning mb-3 flex items-center gap-2">
                            <MaterialIcon icon="trending_up" className="text-lg" filled />
                            可以改善嘅地方
                          </h3>
                          <ul className="space-y-2">
                            {insightData.improvements.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-body">
                                <MaterialIcon icon="arrow_upward" className="text-warning shrink-0 mt-0.5 text-sm" filled />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tips */}
                      {insightData.tips.length > 0 && (
                        <div className="card-flat" style={{ background: "linear-gradient(135deg, #eff6ff 0%, transparent 100%)", borderColor: "#bfdbfe" }}>
                          <h3 className="text-card-title text-primary mb-3 flex items-center gap-2">
                            <MaterialIcon icon="tips_and_updates" className="text-lg" filled />
                            家長小貼士
                          </h3>
                          <ul className="space-y-2">
                            {insightData.tips.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-body">
                                <MaterialIcon icon="lightbulb" className="text-primary shrink-0 mt-0.5 text-sm" filled />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}
                </section>
              )}

              {/* NEPA Parent Summary */}
              {selectedStudent && !nepaLoading && nepaDashboard && (
                <section className="section space-y-6">
                  <div className="border-t pt-8" style={{ borderColor: "var(--color-border-default)" }}>
                    <h2 className="text-section-title mb-4 flex items-center gap-2">
                      <MaterialIcon icon="summarize" className="text-lg" style={{ color: "#8b5cf6" }} filled />
                      今日練習總結
                    </h2>
                    <ProgressSnapshot dashboard={nepaDashboard} trend={trend} />
                    <SoundStrengthCards phonemeStats={nepaDashboard.phoneme_stats.map(p => ({
                      phoneme: p.phoneme,
                      accuracy: p.accuracy,
                      trend: p.trend,
                    }))} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <ToneShapeCard phonemeStats={nepaDashboard.phoneme_stats.map(p => ({
                        phoneme: p.phoneme,
                        accuracy: p.accuracy,
                        trend: p.trend,
                      }))} />
                      <WeeklyHeatmap trend={trend} />
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => alert('分享功能即將推出')}
                        className="btn btn-secondary flex-1"
                      >
                        <MaterialIcon icon="share" className="text-sm mr-1" filled />
                        分享俾治療師
                      </button>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="btn btn-primary flex-1"
                      >
                        繼續練習
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <section className="section">
              <h2 className="text-page-title mb-6 flex items-center gap-2">
                <CreditCard className="text-primary" size={24} />
                訂閱計劃
              </h2>
              <div className="card">
                <p className="text-body mb-8">
                  選擇最適合你家庭嘅計劃。所有計劃包括 7 日免費試用。
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Family Plan */}
                  <div className="card" style={{ borderColor: "var(--color-primary-border)", borderWidth: "2px" }}>
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-section-title">家庭計劃</h4>
                        <span className="text-badge badge-primary">熱門</span>
                      </div>
                      <p className="text-body">適合一般家庭使用</p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-3xl font-bold text-primary">HK$129</span>
                          <span className="text-body">/月</span>
                        </div>
                        <span className="text-small">月費</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-3xl font-bold text-success">HK$99</span>
                          <span className="text-body">/月</span>
                        </div>
                        <span className="text-small text-success">年費慳 23%</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {[
                        "無限語音練習",
                        "3 個互動故事",
                        "12 個迷你遊戲",
                        "基本進度報告",
                        "家長洞察分析",
                        "最多 3 個小朋友帳戶",
                        "有限度 AI 聲線克隆",
                      ].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-body">
                          <MaterialIcon icon="check" className="text-sm text-primary" filled />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => alert("Stripe checkout 將在後端 webhook 就緒後啟用。")}
                      className="btn btn-primary w-full"
                    >
                      選擇家庭計劃
                    </button>
                  </div>

                  {/* Pro Plan */}
                  <div className="card relative" style={{ borderColor: "#c4b5fd", borderWidth: "2px" }}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-badge" style={{ background: "#8b5cf6", color: "#fff" }}>專業版</span>
                    </div>

                    <div className="mb-6 mt-2">
                      <h4 className="text-section-title mb-2">專業計劃</h4>
                      <p className="text-body">適合需要深度分析嘅家庭</p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-3xl font-bold" style={{ color: "#8b5cf6" }}>HK$199</span>
                          <span className="text-body">/月</span>
                        </div>
                        <span className="text-small" style={{ color: "#8b5cf6" }}>年費</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {[
                        "無限互動故事",
                        "無限迷你遊戲",
                        "無限 AI 語音檢測",
                        "無限 AI 聲線克隆",
                        "NEPA 神經網絡分析",
                        "詳細音素追蹤報告",
                        "治療師協作功能",
                        "所有匯出功能",
                        "可執行洞察建議",
                        "優先技術支援",
                        "無限小朋友帳戶",
                      ].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-body">
                          <MaterialIcon icon="check" className="text-sm" style={{ color: "#8b5cf6" }} filled />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => alert("Stripe checkout 將在後端 webhook 就緒後啟用。")}
                      className="btn w-full"
                      style={{ background: "#8b5cf6", color: "#fff" }}
                    >
                      選擇專業計劃
                    </button>
                  </div>
                </div>

                <p className="text-small mt-6 text-center">
                  所有價格均以港幣 (HKD) 計算。隨時取消，無隱藏費用。
                </p>
              </div>
            </section>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <section className="section space-y-6">
              <h2 className="text-page-title mb-6 flex items-center gap-2">
                <Settings className="text-primary" size={24} />
                設定
              </h2>

              {/* Accessibility Settings */}
              <div className="card">
                <h3 className="text-section-title mb-4 flex items-center gap-2">
                  <Type size={20} className="text-primary" />
                  無障礙設定
                </h3>
                <div className="space-y-4">
                  {/* Dyslexic Font */}
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--color-bg-subtle)" }}>
                    <div>
                      <p className="text-body-bold">閱讀障礙字體</p>
                      <p className="text-small">使用 OpenDyslexic 字體，幫助閱讀障礙兒童</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.dyslexicFont}
                        onChange={(e) => setSettings({ ...settings, dyslexicFont: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Font Size */}
                  <div className="p-4 rounded-xl" style={{ background: "var(--color-bg-subtle)" }}>
                    <p className="text-body-bold mb-3">字體大小</p>
                    <div className="flex gap-2">
                      {(["small", "medium", "large"] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setSettings({ ...settings, fontSize: size })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                            settings.fontSize === size
                              ? "btn-primary"
                              : "btn-ghost"
                          }`}
                          style={settings.fontSize === size ? {} : { background: "var(--color-bg-muted)", color: "var(--color-text-primary)" }}
                        >
                          {size === "small" ? "小" : size === "medium" ? "中" : "大"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spacing */}
                  <div className="p-4 rounded-xl" style={{ background: "var(--color-bg-subtle)" }}>
                    <p className="text-body-bold mb-3 flex items-center gap-2">
                      <Ruler size={18} className="text-primary" />
                      行距
                    </p>
                    <div className="flex gap-2">
                      {(["compact", "normal", "wide"] as const).map((space) => (
                        <button
                          key={space}
                          onClick={() => setSettings({ ...settings, spacing: space })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                            settings.spacing === space
                              ? "btn-primary"
                              : "btn-ghost"
                          }`}
                          style={settings.spacing === space ? {} : { background: "var(--color-bg-muted)", color: "var(--color-text-primary)" }}
                        >
                          {space === "compact" ? "緊湊" : space === "normal" ? "正常" : "寬鬆"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio Settings */}
              <div className="card">
                <h3 className="text-section-title mb-4 flex items-center gap-2">
                  <Volume2 size={20} className="text-primary" />
                  音頻設定
                </h3>
                <div className="space-y-4">
                  {/* Audio Speed */}
                  <div className="p-4 rounded-xl" style={{ background: "var(--color-bg-subtle)" }}>
                    <p className="text-body-bold mb-3">播放速度</p>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.25"
                        value={settings.audioSpeed}
                        onChange={(e) => setSettings({ ...settings, audioSpeed: parseFloat(e.target.value) })}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        style={{ background: "var(--color-bg-muted)", accentColor: "var(--color-primary)" }}
                      />
                      <span className="text-sm text-primary font-mono w-12">{settings.audioSpeed}x</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
                className="btn btn-primary w-full"
              >
                {settingsSaved ? "已儲存！" : "儲存設定"}
              </button>
            </section>
          )}

          {/* Account Settings Tab */}
          {activeTab === "account" && (
            <section className="section space-y-6">
              <h2 className="text-page-title mb-6 flex items-center gap-2">
                <User className="text-primary" size={24} />
                帳戶設定
              </h2>

              {/* Story Audio Seed Customization */}
              <div className="card">
                <h3 className="text-section-title mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-primary" />
                  故事音頻聲線
                </h3>
                <p className="text-body mb-4">
                  選擇小朋友聽故事時使用聲線。連結小朋友帳戶後，此設定會套用到佢哋嘅帳戶。
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {STORY_AUDIO_SEEDS.map((seed) => (
                    <button
                      key={seed.id}
                      onClick={() => setSettings({ ...settings, storyAudioSeed: seed.id })}
                      className={`card-flat text-left ${
                        settings.storyAudioSeed === seed.id
                          ? "border-primary shadow-md"
                          : ""
                      }`}
                    >
                      <div className="text-2xl mb-2">{seed.icon}</div>
                      <p className="text-body-bold text-sm">{seed.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Linked Children Accounts */}
              <div className="card">
                <h3 className="text-section-title mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" />
                  已連結嘅小朋友帳戶
                </h3>
                {students.length === 0 ? (
                  <p className="text-body">尚未連結任何小朋友帳戶</p>
                ) : (
                  <div className="space-y-3">
                    {students.map((s) => (
                      <div key={s.student_id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--color-bg-subtle)" }}>
                        <div className="flex items-center gap-3">
                          <MaterialIcon icon="child_care" className="text-xl text-primary" filled />
                          <div>
                            <p className="text-body-bold">{s.profile?.nickname || "未命名"}</p>
                            <p className="text-small">{s.profile?.age} 歲 · {s.relationship}</p>
                          </div>
                        </div>
                        <div className="text-badge badge-primary">
                          已套用設定
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
                className="btn btn-primary w-full"
              >
                {settingsSaved ? "已儲存！" : "儲存設定"}
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
