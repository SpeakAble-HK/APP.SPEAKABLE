import { ALargeSmall, Contrast, Check, Zap, Sun, Moon, Focus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessibility, TextSize, ContrastMode } from "@/contexts/AccessibilityContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const textSizeOptions: { value: TextSize; labels: Record<string, string> }[] = [
  { value: "normal", labels: { "en-GB": "Normal", "zh-TW": "正常", "zh-CN": "正常" } },
  { value: "large", labels: { "en-GB": "Large", "zh-TW": "大", "zh-CN": "大" } },
  { value: "extra-large", labels: { "en-GB": "Extra Large", "zh-TW": "特大", "zh-CN": "特大" } },
];

const contrastOptions: { value: ContrastMode; labels: Record<string, string> }[] = [
  { value: "default", labels: { "en-GB": "Default", "zh-TW": "預設", "zh-CN": "默认" } },
  { value: "high-contrast", labels: { "en-GB": "High Contrast", "zh-TW": "高對比", "zh-CN": "高对比" } },
];

export function AccessibilityToolbar() {
  const { textSize, contrastMode, animationsEnabled, theme, focusMode, setTextSize, setContrastMode, toggleAnimations, toggleTheme, toggleFocusMode } = useAccessibility();
  const { language } = useLanguage();
  const lang = (language as "en-GB" | "zh-TW" | "zh-CN") || "en-GB";

  const textSizeLabel = lang === "en-GB" ? "Text Size" : "文字大小";
  const contrastLabel = lang === "en-GB" ? "Contrast" : "對比度";
  const animLabel = lang === "en-GB" ? (animationsEnabled ? "Disable Animations" : "Enable Animations") : (animationsEnabled ? "關閉動畫" : "開啟動畫");
  const themeLabel = lang === "en-GB" ? (theme === "dark" ? "Switch to Light" : "Switch to Dark") : (theme === "dark" ? "切換淺色" : "切換深色");
  const focusLabel = lang === "en-GB" ? (focusMode ? "Exit Focus Mode" : "SEN Focus Mode") : (focusMode ? "退出專注模式" : "SEN 專注模式");

  return (
    <div className="flex items-center gap-1" role="toolbar" aria-label="Accessibility options">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={themeLabel}
        onClick={toggleTheme}
        title={themeLabel}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      {/* Text Size Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={textSizeLabel}>
            <ALargeSmall className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px] bg-popover border-border z-50">
          <DropdownMenuLabel className="text-xs text-muted-foreground">{textSizeLabel}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {textSizeOptions.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => setTextSize(opt.value)}
              className="flex items-center justify-between gap-2 cursor-pointer"
            >
              <span>{opt.labels[lang] || opt.labels["en-GB"]}</span>
              {textSize === opt.value && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Contrast Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={contrastMode === "high-contrast" ? "secondary" : "ghost"} size="icon" aria-label={contrastLabel}>
            <Contrast className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px] bg-popover border-border z-50">
          <DropdownMenuLabel className="text-xs text-muted-foreground">{contrastLabel}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {contrastOptions.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => setContrastMode(opt.value)}
              className="flex items-center justify-between gap-2 cursor-pointer"
            >
              <span>{opt.labels[lang] || opt.labels["en-GB"]}</span>
              {contrastMode === opt.value && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Animation Toggle */}
      <Button
        variant={animationsEnabled ? "ghost" : "secondary"}
        size="icon"
        aria-label={animLabel}
        onClick={toggleAnimations}
        title={animLabel}
      >
        <Zap className={`h-5 w-5 ${!animationsEnabled ? "opacity-50" : ""}`} />
      </Button>

      {/* SEN Focus Mode Toggle */}
      <Button
        variant={focusMode ? "default" : "ghost"}
        size="icon"
        aria-label={focusLabel}
        onClick={toggleFocusMode}
        title={focusLabel}
      >
        <Focus className="h-5 w-5" />
      </Button>
    </div>
  );
}
