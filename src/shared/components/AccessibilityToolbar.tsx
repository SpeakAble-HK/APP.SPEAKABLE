import { ALargeSmall, Check, Sun, Moon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useAccessibility, TextSize } from "@/shared/contexts/AccessibilityContext";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";

const textSizeOptions: { value: TextSize; labels: Record<string, string> }[] = [
  { value: "normal", labels: { "en-GB": "Regular", "zh-TW": "標準", "zh-CN": "标准" } },
  { value: "large", labels: { "en-GB": "Large", "zh-TW": "大", "zh-CN": "大" } },
  { value: "extra-large", labels: { "en-GB": "Super Large", "zh-TW": "超大", "zh-CN": "超大" } },
];

export function AccessibilityToolbar() {
  const { textSize, theme, setTextSize, toggleTheme } = useAccessibility();
  const { language } = useLanguage();
  const lang = (language as "en-GB" | "zh-TW" | "zh-CN") || "en-GB";

  const textSizeLabel = lang === "en-GB" ? "Text Size" : "文字大小";
  const themeLabel = lang === "en-GB" ? (theme === "dark" ? "Switch to Light" : "Switch to Dark") : (theme === "dark" ? "切換淺色" : "切換深色");

  return (
    <div className="flex items-center gap-1" role="toolbar" aria-label="Accessibility options">
      <Button variant="ghost" size="icon" aria-label={themeLabel} onClick={toggleTheme} title={themeLabel}>
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
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
    </div>
  );
}
