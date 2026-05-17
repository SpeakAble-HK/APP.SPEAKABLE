import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mic, Bell, Volume2, ChevronRight, LogOut,
  Sun, Moon, Globe, Shield,
} from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { LearnerSegment } from "@/types/learningData";
import { getUserProfile, setConsentGiven, setLearnerSegment } from "@/lib/userProfileStore";
import pipiRoom from "@/assets/pipi-mascot.png";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

/* ── shared row wrapper ───────────────────────────────────────── */
function SettingRow({ children, onClick }: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const base =
    "flex items-center gap-3 px-5 py-4 border-b border-mist last:border-b-0 w-full text-left transition-colors min-h-[64px]";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} hover:bg-cloud`}>
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}

/* ── icon circle ─────────────────────────────────────────────── */
function IconCircle({
  children,
  bg = "bg-sky-50",
  color = "text-sky-600",
}: {
  children: React.ReactNode;
  bg?: string;
  color?: string;
}) {
  return (
    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0 ${color}`}>
      {children}
    </div>
  );
}

/* ── inline toggle ───────────────────────────────────────────── */
function InlineToggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-pill transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 shrink-0 ${
        checked ? "bg-sky-400" : "bg-mist"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAccessibility();
  const { language, setLanguage } = useLanguage();

  const [nickname,          setNickname]          = useState("探險家");
  const [soundOn,           setSoundOn]           = useState(true);
  const [reminderOn,        setReminderOn]        = useState(false);
  const [consentLearningLog, setConsentLearningLog] = useState(true);
  const [learnerSegment,    setLearnerSegmentState] = useState<LearnerSegment>("general");

  useEffect(() => {
    const stored = sessionStorage.getItem("explorer_nickname");
    if (stored) setNickname(stored);
  }, []);

  useEffect(() => {
    const p = getUserProfile();
    setConsentLearningLog(p.consent_given !== false);
    setLearnerSegmentState(p.user_type ?? "general");
  }, []);

  const handleLanguageChange = (val: string) => setLanguage(val as Language);

  const handleLogout = () => { sessionStorage.clear(); navigate("/"); };

  const promptNickname = () => {
    const name = prompt("輸入新暱稱：", nickname);
    if (name) {
      setNickname(name);
      sessionStorage.setItem("explorer_nickname", name);
    }
  };

  const languages: { value: Language; label: string }[] = [
    { value: "zh-TW", label: "繁體中文" },
    { value: "zh-CN", label: "简体中文" },
    { value: "en-GB", label: "English" },
  ];

  const learnerSegments: { value: LearnerSegment; label: string }[] = [
    { value: "general", label: "一般" },
    { value: "student", label: "學生" },
    { value: "SEN",     label: "特教需要" },
    { value: "elderly", label: "長者" },
  ];

  return (
    <div className="min-h-full bg-cloud">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* ── Page title ──────────────────────────────────────── */}
        <h1 className="font-display text-h3 font-medium text-ink">設定</h1>

        {/* ── Profile card ────────────────────────────────────── */}
        <div className="bg-white rounded-lg border-[0.5px] border-mist p-5 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-100 to-[#E8F7F3] p-1 shrink-0">
            <img
              src={pipiRoom}
              alt="皮皮"
              className="h-full w-full object-contain rounded-full"
              loading="lazy"
              width={1024}
              height={1024}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-[17px] font-medium text-ink">{nickname}</p>
            <p className="text-small text-slate">語音探險家</p>
          </div>
          <button
            type="button"
            onClick={promptNickname}
            className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 hover:bg-sky-100 transition-colors"
            aria-label="編輯暱稱"
          >
            ✏️
          </button>
        </div>

        {/* ── Settings list ───────────────────────────────────── */}
        <div className="bg-white rounded-lg border-[0.5px] border-mist overflow-hidden divide-y divide-mist">

          {/* Edit profile */}
          <SettingRow onClick={promptNickname}>
            <IconCircle><User className="h-4 w-4" /></IconCircle>
            <span className="flex-1 text-small font-medium text-ink">編輯個人資料</span>
            <ChevronRight className="h-4 w-4 text-slate shrink-0" />
          </SettingRow>

          {/* Re-record */}
          <SettingRow onClick={() => navigate("/explorer/onboarding")}>
            <IconCircle bg="bg-[#E8F7F3]" color="text-mint">
              <Mic className="h-4 w-4" />
            </IconCircle>
            <span className="flex-1 text-small font-medium text-ink">重新錄音</span>
            <ChevronRight className="h-4 w-4 text-slate shrink-0" />
          </SettingRow>

          {/* Theme toggle */}
          <SettingRow>
            <IconCircle bg="bg-[#FFF6E0]" color="text-ink">
              {theme === "dark"
                ? <Moon className="h-4 w-4 text-slate" />
                : <Sun className="h-4 w-4 text-sunshine" />}
            </IconCircle>
            <span className="flex-1 text-small font-medium text-ink">
              {theme === "dark" ? "深色模式" : "淺色模式"}
            </span>
            <InlineToggle checked={theme === "dark"} onToggle={toggleTheme} />
          </SettingRow>

          {/* Language */}
          <SettingRow>
            <IconCircle bg="bg-[#E8F7F3]" color="text-mint">
              <Globe className="h-4 w-4" />
            </IconCircle>
            <span className="flex-1 text-small font-medium text-ink">語言偏好</span>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[140px] h-9 bg-cloud border-mist text-small">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-mist z-[60]">
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          {/* Reminder */}
          <SettingRow>
            <IconCircle bg="bg-[#FFF6E0]" color="text-sunshine">
              <Bell className="h-4 w-4" />
            </IconCircle>
            <span className="flex-1 text-small font-medium text-ink">提醒設定</span>
            <InlineToggle checked={reminderOn} onToggle={() => setReminderOn(!reminderOn)} />
          </SettingRow>

          {/* Sound */}
          <SettingRow>
            <IconCircle><Volume2 className="h-4 w-4" /></IconCircle>
            <span className="flex-1 text-small font-medium text-ink">音效開關</span>
            <InlineToggle checked={soundOn} onToggle={() => setSoundOn(!soundOn)} />
          </SettingRow>

          {/* Learner segment */}
          <SettingRow>
            <IconCircle bg="bg-[#E8F7F3]" color="text-mint">
              <User className="h-4 w-4" />
            </IconCircle>
            <span className="flex-1 text-small font-medium text-ink">學習者類型</span>
            <Select
              value={learnerSegment}
              onValueChange={(val) => {
                const seg = val as LearnerSegment;
                setLearnerSegmentState(seg);
                setLearnerSegment(seg);
              }}
            >
              <SelectTrigger className="w-[120px] h-9 bg-cloud border-mist text-small">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-mist z-[60]">
                {learnerSegments.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          {/* Learning log consent */}
          <SettingRow>
            <IconCircle bg="bg-mist" color="text-slate">
              <Shield className="h-4 w-4" />
            </IconCircle>
            <div className="flex-1 min-w-0">
              <p className="text-small font-medium text-ink">儲存學習分析紀錄</p>
              <p className="text-[12px] text-slate mt-0.5 leading-relaxed">
                關閉後只在本裝置不儲存發音分析摘要（僅前端，不上傳錄音）。
              </p>
            </div>
            <Switch
              checked={consentLearningLog}
              onCheckedChange={(checked) => {
                setConsentLearningLog(checked);
                setConsentGiven(checked);
              }}
              className="shrink-0 ml-2"
              aria-label="儲存學習分析紀錄"
            />
          </SettingRow>
        </div>

        {/* ── Logout ──────────────────────────────────────────── */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full bg-[#FFE8E0] border border-coral/50 rounded-pill py-3.5 px-6 flex items-center justify-center gap-2 hover:bg-coral hover:text-white transition-all min-h-tap text-coral font-medium text-small"
        >
          <LogOut className="h-4 w-4" />
          登出
        </button>

        {/* Bottom padding for nav bar */}
        <div className="h-4" />
      </div>
    </div>
  );
}
