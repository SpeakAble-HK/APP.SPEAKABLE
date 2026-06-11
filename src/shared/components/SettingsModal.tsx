import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Globe } from "lucide-react";
import { useAccessibility } from "@/shared/contexts/AccessibilityContext";
import { useLanguage, Language } from "@/shared/contexts/LanguageContext";
import { useAuth } from "@/shared/hooks/useAuth";
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
  const { theme, textSize, toggleTheme, setTextSize } = useAccessibility();
  const { language, setLanguage, t3 } = useLanguage();
  const { user, updateLanguage } = useAuth();

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage as Language);
    if (user) {
      const { error } = await updateLanguage(newLanguage);
      if (error) toast.error(t3("Failed to update language", "更新語言失敗", "更新语言失败"));
      else toast.success(t3("Language updated", "語言已更新", "语言已更新"));
    }
  };

  const dialogProps = open !== undefined ? { open, onOpenChange } : {};

  return (
    <Dialog {...dialogProps}>
      {trigger && (
        <button onClick={() => onOpenChange?.(true)} className="contents">
          {trigger}
        </button>
      )}
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{t3("Settings", "設定", "设置")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t3("Customise your experience", "自訂您的體驗", "自定义您的体验")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 mt-2">
          {/* Dark Mode */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div>
              <Label className="text-sm font-medium cursor-pointer">{t3("Dark Mode", "深色模式", "深色模式")}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{t3("Switch between light and dark themes", "切換淺色和深色主題", "切换浅色和深色主题")}</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>

          {/* Text Size */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div>
              <Label className="text-sm font-medium">{t3("Text Size", "文字大小", "文字大小")}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{t3("Adjust text size for readability", "調整文字大小以提高可讀性", "调整文字大小以提高可读性")}</p>
            </div>
            <Select value={textSize} onValueChange={(v) => setTextSize(v as any)}>
              <SelectTrigger className="w-[130px] h-9 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-[60]">
                <SelectItem value="normal">{t3("Regular", "標準", "标准")}</SelectItem>
                <SelectItem value="large">{t3("Large", "大", "大")}</SelectItem>
                <SelectItem value="extra-large">{t3("Super Large", "超大", "超大")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div>
              <Label className="text-sm font-medium">{t3("Language", "語言", "语言")}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{t3("Choose your preferred language", "選擇您的偏好語言", "选择您的偏好语言")}</p>
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
