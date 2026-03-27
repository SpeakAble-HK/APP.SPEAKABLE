import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mic, Bell, Volume2, ChevronRight, LogOut, Sun, Moon, Globe, Shield } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { LearnerSegment } from "@/types/learningData";
import { getUserProfile, setConsentGiven, setLearnerSegment } from "@/lib/userProfileStore";
import pipiRoom from "@/assets/pipi-mascot.png";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAccessibility();
  const [nickname, setNickname] = useState("探險家");
  const [soundOn, setSoundOn] = useState(true);
  const [reminderOn, setReminderOn] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("app_language") || "zh-TW";
  });
  const [consentLearningLog, setConsentLearningLog] = useState(true);
  const [learnerSegment, setLearnerSegmentState] = useState<LearnerSegment>("general");

  useEffect(() => {
    const stored = sessionStorage.getItem("explorer_nickname");
    if (stored) setNickname(stored);
  }, []);

  useEffect(() => {
    const p = getUserProfile();
    setConsentLearningLog(p.consent_given !== false);
    setLearnerSegmentState(p.user_type ?? "general");
  }, []);

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    localStorage.setItem("app_language", val);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const languages = [
    { value: "zh-TW", label: "繁體中文" },
    { value: "zh-CN", label: "简体中文" },
  ];

  const learnerSegments: { value: LearnerSegment; label: string }[] = [
    { value: "general", label: "一般" },
    { value: "student", label: "學生" },
    { value: "SEN", label: "特教需要" },
    { value: "elderly", label: "長者" },
  ];

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            ⚙️ 設定
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center gap-4">
          <img src={pipiRoom} alt="皮皮" className="h-16 w-16 object-contain rounded-xl bg-muted" loading="lazy" width={1024} height={1024} />
          <div className="flex-1">
            <p className="text-base font-extrabold text-foreground">{nickname}</p>
            <p className="text-xs text-muted-foreground">語音探險家</p>
          </div>
          <button
            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
            onClick={() => {
              const name = prompt("輸入新暱稱：", nickname);
              if (name) {
                setNickname(name);
                sessionStorage.setItem("explorer_nickname", name);
              }
            }}
          >
            ✏️
          </button>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden divide-y divide-border">
          {/* Edit Profile */}
          <button
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors text-left"
            onClick={() => {
              const name = prompt("輸入新暱稱：", nickname);
              if (name) {
                setNickname(name);
                sessionStorage.setItem("explorer_nickname", name);
              }
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="flex-1 text-sm font-bold text-foreground">編輯個人資料</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Re-record */}
          <button
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors text-left"
            onClick={() => navigate("/explorer/onboarding")}
          >
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Mic className="h-4 w-4 text-destructive" />
            </div>
            <span className="flex-1 text-sm font-bold text-foreground">重新錄音</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Theme Toggle */}
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              {theme === "dark" ? <Moon className="h-4 w-4 text-accent" /> : <Sun className="h-4 w-4 text-accent" />}
            </div>
            <span className="flex-1 text-sm font-bold text-foreground">
              {theme === "dark" ? "深色模式" : "淺色模式"}
            </span>
            <button
              onClick={toggleTheme}
              className={`w-12 h-7 rounded-full transition-colors ${
                theme === "dark" ? "bg-primary" : "bg-muted"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-card shadow-sm transition-transform mx-1 ${
                theme === "dark" ? "translate-x-5" : ""
              }`} />
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
              <Globe className="h-4 w-4 text-success" />
            </div>
            <span className="flex-1 text-sm font-bold text-foreground">語言偏好</span>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[120px] h-8 bg-background border-border text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-[60]">
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reminder */}
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-accent" />
            </div>
            <span className="flex-1 text-sm font-bold text-foreground">提醒設定</span>
            <button
              onClick={() => setReminderOn(!reminderOn)}
              className={`w-12 h-7 rounded-full transition-colors ${
                reminderOn ? "bg-primary" : "bg-muted"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-card shadow-sm transition-transform mx-1 ${
                reminderOn ? "translate-x-5" : ""
              }`} />
            </button>
          </div>

          {/* Sound */}
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Volume2 className="h-4 w-4 text-primary" />
            </div>
            <span className="flex-1 text-sm font-bold text-foreground">音效開關</span>
            <button
              onClick={() => setSoundOn(!soundOn)}
              className={`w-12 h-7 rounded-full transition-colors ${
                soundOn ? "bg-primary" : "bg-muted"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-card shadow-sm transition-transform mx-1 ${
                soundOn ? "translate-x-5" : ""
              }`} />
            </button>
          </div>

          {/* Learner segment (local profile) */}
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
              <User className="h-4 w-4 text-success" />
            </div>
            <span className="flex-1 text-sm font-bold text-foreground">學習者類型</span>
            <Select
              value={learnerSegment}
              onValueChange={(val) => {
                const seg = val as LearnerSegment;
                setLearnerSegmentState(seg);
                setLearnerSegment(seg);
              }}
            >
              <SelectTrigger className="w-[120px] h-8 bg-background border-border text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-[60]">
                {learnerSegments.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Consent: store pronunciation analysis summaries locally */}
          <div className="flex flex-col gap-2 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">儲存學習分析紀錄</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  關閉後只在本裝置不儲存發音分析摘要（僅前端，不上傳錄音）。
                </p>
              </div>
              <Switch
                checked={consentLearningLog}
                onCheckedChange={(checked) => {
                  setConsentLearningLog(checked);
                  setConsentGiven(checked);
                }}
                className="shrink-0 mt-1"
                aria-label="儲存學習分析紀錄"
              />
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-destructive/10 border-2 border-destructive/20 rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="h-5 w-5 text-destructive" />
          <span className="text-sm font-extrabold text-destructive">登出</span>
        </button>
      </div>
    </div>
  );
}
