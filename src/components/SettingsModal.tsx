import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface SettingsModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const languages = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-GB', label: 'English (UK)' },
];

export function SettingsModal({ trigger, open, onOpenChange }: SettingsModalProps) {
  const { theme, textSize, focusMode, contrastMode, toggleTheme, setTextSize, toggleFocusMode, toggleContrast } = useAccessibility();
  const { language, setLanguage, t } = useLanguage();
  const { user, updateLanguage } = useAuth();
  const isEn = language === "en-GB";

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage as Language);
    if (user) {
      const { error } = await updateLanguage(newLanguage);
      if (error) toast.error(isEn ? "Failed to update language" : "更新語言失敗");
      else toast.success(isEn ? "Language updated" : "語言已更新");
    }
  };

  const settings = [
    {
      id: "dark-mode",
      num: 1,
      label: isEn ? "Dark Mode" : "深色模式",
      desc: isEn ? "Switch between light and dark themes" : "切換淺色和深色主題",
      checked: theme === "dark",
      onChange: toggleTheme,
    },
    {
      id: "font-size",
      num: 2,
      label: isEn ? "Font Size" : "字體大小",
      desc: isEn ? "Enlarge text for better readability" : "放大文字以提高可讀性",
      checked: textSize !== "normal",
      onChange: () => setTextSize(textSize === "normal" ? "large" : "normal"),
    },
    {
      id: "sen-focus",
      num: 3,
      label: isEn ? "SEN Focus Mode" : "SEN 專注模式",
      desc: isEn ? "Hide non-essential UI elements" : "隱藏非必要的介面元素",
      checked: focusMode,
      onChange: toggleFocusMode,
    },
    {
      id: "high-contrast",
      num: 4,
      label: isEn ? "High Contrast" : "高對比",
      desc: isEn ? "Increase contrast for accessibility" : "提高對比度以改善可及性",
      checked: contrastMode === "high-contrast",
      onChange: toggleContrast,
    },
  ];

  // Support both controlled (open/onOpenChange) and uncontrolled (trigger) modes
  const dialogProps = open !== undefined
    ? { open, onOpenChange }
    : {};

  return (
    <Dialog {...dialogProps}>
      {trigger && (
        <button onClick={() => onOpenChange?.(true)} className="contents">
          {trigger}
        </button>
      )}
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{isEn ? "Settings" : "設定"}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEn ? "Customise your experience" : "自訂您的體驗"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 mt-2">
          {settings.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold text-muted-foreground mt-0.5 w-5 text-right">{s.num}.</span>
                <div>
                  <Label htmlFor={s.id} className="text-sm font-medium cursor-pointer">{s.label}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
              <Switch id={s.id} checked={s.checked} onCheckedChange={s.onChange} />
            </div>
          ))}

          {/* Language Preference */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-muted-foreground mt-0.5 w-5 text-right">5.</span>
              <div>
                <Label className="text-sm font-medium">{isEn ? "Language" : "語言"}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{isEn ? "Choose your preferred language" : "選擇您的偏好語言"}</p>
              </div>
            </div>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[140px] h-9 bg-background border-border">
                <Globe className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
