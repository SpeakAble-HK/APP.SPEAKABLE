import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function SettingsModal({ trigger }: { trigger?: React.ReactNode }) {
  const { theme, textSize, focusMode, contrastMode, toggleTheme, setTextSize, toggleFocusMode, toggleContrast } = useAccessibility();
  const { language } = useLanguage();
  const isEn = language === "en-GB";

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
