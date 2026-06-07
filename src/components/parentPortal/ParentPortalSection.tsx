import { useState, useEffect, useCallback } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";

/* ─── Storage helpers ─── */

const PARENT_PREFIX = "speakable-parent-";
const CONSENT_KEY = `${PARENT_PREFIX}privacy-consent`;
const PWD_HASH_KEY = `${PARENT_PREFIX}password-hash`;
const PWD_SALT_KEY = `${PARENT_PREFIX}password-salt`;

const HK_ORDINANCE_VERSION = "2024-v1";
const CONSENT_EXPIRY_DAYS = 365;

interface ConsentRecord {
  version: string;
  agreedAt: string;
  ip?: string;
}

function getStoredConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function storeConsent() {
  const record: ConsentRecord = {
    version: HK_ORDINANCE_VERSION,
    agreedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
}

function isConsentValid(): boolean {
  const record = getStoredConsent();
  if (!record) return false;
  if (record.version !== HK_ORDINANCE_VERSION) return false;
  const agreed = new Date(record.agreedAt).getTime();
  const now = Date.now();
  return (now - agreed) < CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const enc = new TextEncoder();
  const s = salt || crypto.randomUUID();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(password + s), { name: "PBKDF2" }, false, ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(s), iterations: 100000, hash: "SHA-256" },
    key, 256,
  );
  const hash = Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return { hash, salt: s };
}

async function verifyParentPassword(password: string): Promise<boolean> {
  const storedHash = localStorage.getItem(PWD_HASH_KEY);
  const storedSalt = localStorage.getItem(PWD_SALT_KEY);
  if (!storedHash || !storedSalt) return false;
  const { hash } = await hashPassword(password, storedSalt);
  return hash === storedHash;
}

async function setParentPassword(password: string) {
  const { hash, salt } = await hashPassword(password);
  localStorage.setItem(PWD_HASH_KEY, hash);
  localStorage.setItem(PWD_SALT_KEY, salt);
}

function isPasswordSet(): boolean {
  return !!localStorage.getItem(PWD_HASH_KEY);
}

/* ─── Sub-views ─── */

function PrivacyConsentView({ onDone }: { onDone: () => void }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <MaterialIcon icon="verified" className="text-2xl text-amber-600" filled />
        <h3 className="font-headline font-extrabold text-on-surface">私隱同意書</h3>
      </div>

      <div className="text-sm text-on-surface space-y-3 leading-relaxed mb-4 max-h-48 overflow-y-auto bg-white rounded-xl p-3 border border-outline-variant/30">
        <p><strong>香港《兒童權利公約》及《個人資料（私隱）條例》</strong></p>
        <p>SpeakAble HK 致力保護兒童及青少年嘅個人資料。根據香港法例，收集 18 歲以下人士嘅個人資料須獲得家長或監護人同意。</p>
        <p><strong>收集嘅資料：</strong></p>
        <ul className="list-disc pl-4 space-y-1">
          <li>小朋友嘅語音錄音（只用於語音分析及改善發音表現）</li>
          <li>練習進度數據（題目準確率、使用時間）</li>
          <li>帳戶基本資料（姓名、年齡範圍）</li>
        </ul>
        <p><strong>資料用途：</strong></p>
        <ul className="list-disc pl-4 space-y-1">
          <li>提供個人化語音治療練習</li>
          <li>追蹤進度同生成報告</li>
          <li>改善 AI 語音辨識準確度</li>
        </ul>
        <p><strong>資料保安：</strong>所有錄音同數據經加密傳輸，唔會分享俾第三方。家長有權查閱、更正或刪除子女嘅資料。</p>
        <p className="text-amber-700 font-bold">此同意書有效期為一年，每年將提示家長續期。</p>
      </div>

      <label className="flex items-start gap-3 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
        />
        <span className="text-sm text-on-surface-variant">
          本人確認已閱讀並同意以上條款，授權 SpeakAble HK 收集及使用本人子女嘅語音數據用作治療練習用途。
        </span>
      </label>

      <div className="flex gap-2">
        <button
          onClick={() => { storeConsent(); onDone(); }}
          disabled={!agreed}
          className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm disabled:opacity-40"
        >
          同意並繼續
        </button>
      </div>
    </div>
  );
}

function PasswordSetupView({ onDone }: { onDone: () => void }) {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSet = async () => {
    if (pwd.length < 6) { setError("密碼至少 6 個字符"); return; }
    if (pwd !== confirm) { setError("兩次密碼唔一致"); return; }
    setError("");
    await setParentPassword(pwd);
    onDone();
  };

  return (
    <div className="rounded-xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <MaterialIcon icon="lock" className="text-2xl text-sky-600" filled />
        <h3 className="font-headline font-extrabold text-on-surface">設定家長密碼</h3>
      </div>
      <p className="text-sm text-on-surface-variant mb-4">設定密碼後，每次進入家長專區需要輸入密碼驗證。</p>

      <input
        type="password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        placeholder="輸入密碼（至少 6 位）"
        className="w-full rounded-xl border border-outline-variant bg-white p-3 text-sm mb-3"
      />
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="再次輸入密碼"
        className="w-full rounded-xl border border-outline-variant bg-white p-3 text-sm mb-3"
      />
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      <button onClick={handleSet} className="w-full py-2.5 rounded-xl bg-sky-500 text-white font-bold text-sm">
        設定密碼
      </button>
    </div>
  );
}

function PasswordVerifyView({ onVerified }: { onVerified: () => void }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    const ok = await verifyParentPassword(pwd);
    if (ok) { onVerified(); setError(""); }
    else { setError("密碼錯誤"); }
  };

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 text-center">
      <MaterialIcon icon="lock" className="text-4xl text-amber-500 mb-3" filled />
      <h3 className="font-headline font-extrabold text-on-surface mb-2">家長專區</h3>
      <p className="text-sm text-on-surface-variant mb-4">請輸入家長密碼</p>
      <input
        type="password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleVerify()}
        placeholder="密碼"
        className="w-full max-w-xs rounded-xl border border-outline-variant bg-white p-3 text-sm mb-3 mx-auto"
      />
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <button onClick={handleVerify} className="w-full max-w-xs py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm mx-auto">
        解鎖
      </button>
    </div>
  );
}

/* ─── Stripe Billing ─── */

const PLANS = [
  {
    id: "family-monthly",
    name: "家庭計劃（月費）",
    price: "HK$129",
    period: "/月",
    features: [
      "無限語音練習",
      "3 個互動故事",
      "12 個迷你遊戲",
      "基本進度報告",
      "家長洞察分析",
      "最多 3 個小朋友帳戶",
      "有限度 AI 聲線克隆",
    ],
    highlighted: false,
  },
  {
    id: "family-yearly",
    name: "家庭計劃（年費）",
    price: "HK$99",
    period: "/月",
    badge: "慳 23%",
    features: [
      "無限語音練習",
      "3 個互動故事",
      "12 個迷你遊戲",
      "基本進度報告",
      "家長洞察分析",
      "最多 3 個小朋友帳戶",
      "有限度 AI 聲線克隆",
    ],
    highlighted: true,
  },
  {
    id: "pro-yearly",
    name: "專業計劃（年費）",
    price: "HK$199",
    period: "/月",
    badge: "專業版",
    features: [
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
    ],
    highlighted: false,
  },
];

function BillingView() {
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  const handleSubscribe = async () => {
    setStatus("loading");
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      alert("Stripe 未設定 — 請設定 VITE_STRIPE_PUBLISHABLE_KEY");
      setStatus("idle");
      return;
    }
    alert("Stripe checkout 將在後端 webhook 就緒後啟用。目前為前端預覽。");
    setStatus("idle");
  };

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-white p-5">
      <h3 className="font-headline font-extrabold text-on-surface mb-4 flex items-center gap-2">
        <MaterialIcon icon="credit_card" className="text-xl text-primary" filled />
        訂閱計劃
      </h3>
      <p className="text-xs text-on-surface-variant mb-4">
        選擇最適合你家庭嘅計劃。所有計劃包括 7 日免費試用。
      </p>

      <div className="grid gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border-2 p-5 ${plan.highlighted ? "border-primary bg-primary/5 shadow-card" : "border-outline-variant bg-white"}`}
          >
            <div className="flex items-baseline justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-on-surface">{plan.name}</h4>
                {plan.badge && (
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                    {plan.badge}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="font-headline text-2xl font-extrabold text-primary">{plan.price}</span>
                <span className="text-xs text-on-surface-variant">{plan.period}</span>
              </div>
            </div>
            <ul className="space-y-1.5 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <MaterialIcon icon="check" className="text-sm text-primary" filled />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleSubscribe}
              disabled={status === "loading"}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm disabled:opacity-40"
            >
              {status === "loading" ? "處理中..." : "選擇此計劃"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-on-surface-variant mt-4 text-center">
        所有價格均以港幣 (HKD) 計算。隨時取消，無隱藏費用。
      </p>
    </div>
  );
}

/* ─── AI Cantonese Insights ─── */

const INSIGHT_CATEGORIES = [
  { key: "accuracy", label: "發音準確度", icon: "check_circle" },
  { key: "tone", label: "聲調表現", icon: "music_note" },
  { key: "fatigue", label: "疲勞指數", icon: "bedtime" },
  { key: "practice", label: "練習習慣", icon: "trending_up" },
];

const CANTO_ADVICE: Record<string, Record<string, string>> = {
  low_accuracy: {
    title: "發音需要多啲練習",
    advice: "小朋友喺 /n/ 同 /l/ 聲母上混淆較多。建議每日 5 分鐘針對性練習，用「你、我、他」句子慢慢讀。",
    tip: "用鏡子觀察舌頭位置：/n/ 舌尖頂上齒齦，/l/ 舌尖放平。",
  },
  mid_accuracy: {
    title: "進步中！繼續努力",
    advice: "整體表現穩定，尤其係雙唇音 /b/ /p/ /m/ 做得好好。建議增加難度，試下讀詞語而非單字。",
    tip: "每日揀一個主題（如「水果」），用粵語講五樣嘢出嚟。",
  },
  good_accuracy: {
    title: "表現優異 🎉",
    advice: "小朋友發音準確度好高！建議開始挑戰完整句子同對話練習，提升自然流暢度。",
    tip: "試下一齊講短故事，用唔同角色聲線增加趣味。",
  },
  fatigue: {
    title: "疲勞警報",
    advice: "今日練習時長已達到建議上限。休息一陣，聽日再繼續效果更好。",
    tip: "練習時間每次 10-15 分鐘就夠，每日定時定量更有效。",
  },
  tone_struggle: {
    title: "聲調需要關注",
    advice: "第一聲同第六聲混淆較多。建議用手勢輔助：第一聲手平放，第六聲手向下。",
    tip: "用「詩、史、試、時、市、事」六字每日讀三次。",
  },
};

function InsightsView() {
  const [selectedCategory, setSelectedCategory] = useState("accuracy");

  const getAdvice = (cat: string) => {
    switch (cat) {
      case "accuracy": return CANTO_ADVICE.low_accuracy;
      case "tone": return CANTO_ADVICE.tone_struggle;
      case "fatigue": return CANTO_ADVICE.fatigue;
      case "practice": return CANTO_ADVICE.mid_accuracy;
      default: return CANTO_ADVICE.mid_accuracy;
    }
  };

  const advice = getAdvice(selectedCategory);

  return (
    <div className="rounded-xl border-2 border-primary/10 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <MaterialIcon icon="lightbulb" className="text-2xl text-amber-500" filled />
        <h3 className="font-headline font-extrabold text-on-surface">AI 家長洞察</h3>
        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">由 NEPA 驅動</span>
      </div>
      <p className="text-xs text-on-surface-variant mb-4">根據小朋友練習數據，AI 自動生成嘅 Cantonese 分析同行動建議</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {INSIGHT_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat.key
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <MaterialIcon icon={cat.icon} className="text-sm" />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 p-4">
        <h4 className="font-bold text-on-surface text-sm mb-2">{advice.title}</h4>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{advice.advice}</p>
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-100/50 rounded-lg p-2.5">
          <MaterialIcon icon="tips_and_updates" className="text-base shrink-0" filled />
          <span>{advice.tip}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ParentPortalSection ─── */

type ParentView = "locked" | "consent" | "setup" | "portal";

export default function ParentPortalSection() {
  const [view, setView] = useState<ParentView>("locked");
  const [unlockedSession, setUnlockedSession] = useState(false);

  useEffect(() => {
    if (!isConsentValid()) { setView("consent"); return; }
    if (!isPasswordSet()) { setView("setup"); return; }
    setView("locked");
  }, []);

  const handleConsentDone = () => {
    if (!isPasswordSet()) setView("setup");
    else setView("locked");
  };

  const handleSetupDone = () => {
    setView("locked");
  };

  const handleVerified = () => {
    setUnlockedSession(true);
    setView("portal");
    setTimeout(() => setUnlockedSession(false), 5 * 60 * 1000);
  };

  return (
    <section aria-labelledby="parent-heading" className="shadow-lg shadow-amber-900/10 rounded-xl">
      <button
        type="button"
        onClick={() => {
          if (view === "portal") setView("locked");
          else if (view === "locked") {
            if (!isConsentValid()) setView("consent");
            else if (!isPasswordSet()) setView("setup");
            else setView("locked");
          }
        }}
        className="w-full flex items-center justify-between rounded-t-xl bg-gradient-to-r from-amber-700 to-amber-800 px-5 py-3.5 text-left transition-all duration-300 hover:scale-[1.01]"
        style={{ boxShadow: "0 0 24px -6px rgba(217,119,6,0.25)" }}
      >
        <div className="flex items-center gap-2">
          <MaterialIcon icon="family_history" className="text-2xl text-amber-200" filled />
          <h2 id="parent-heading" className="font-headline text-lg font-bold text-white">家長專區</h2>
          {view === "portal" && (
            <span className="text-[11px] font-medium text-amber-200 bg-amber-400/20 px-2.5 py-0.5 rounded-full">
              已解鎖
            </span>
          )}
        </div>
        <MaterialIcon
          icon={view === "portal" ? "keyboard_arrow_up" : "keyboard_arrow_down"}
          className="text-xl text-amber-200"
        />
      </button>

      {view === "portal" && (
        <div className="rounded-b-xl border-x-2 border-b-2 border-amber-900/30 bg-white p-4 space-y-4">
          <PrivacyConsentView onDone={() => {}} />
          <BillingView />
          <InsightsView />
          <button
            onClick={() => { setUnlockedSession(false); setView("locked"); }}
            className="w-full py-2 rounded-xl bg-surface-container-high text-on-surface-variant font-bold text-sm flex items-center justify-center gap-2"
          >
            <MaterialIcon icon="lock" className="text-lg" />
            鎖定家長專區
          </button>
        </div>
      )}

      {view === "locked" && (
        <div className="rounded-b-xl border-x-2 border-b-2 border-amber-900/30 bg-white p-4">
          <PasswordVerifyView onVerified={handleVerified} />
        </div>
      )}

      {view === "consent" && (
        <div className="rounded-b-xl border-x-2 border-b-2 border-amber-900/30 bg-white p-4">
          <PrivacyConsentView onDone={handleConsentDone} />
        </div>
      )}

      {view === "setup" && (
        <div className="rounded-b-xl border-x-2 border-b-2 border-amber-900/30 bg-white p-4">
          <PasswordSetupView onDone={handleSetupDone} />
        </div>
      )}
    </section>
  );
}
