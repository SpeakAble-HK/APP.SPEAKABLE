import { ALargeSmall, Contrast } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const textSizeLabels = {
  normal: { "en-GB": "Text: Normal", "zh-TW": "文字：正常", "zh-CN": "文字：正常" },
  large: { "en-GB": "Text: Large", "zh-TW": "文字：大", "zh-CN": "文字：大" },
  "extra-large": { "en-GB": "Text: Extra Large", "zh-TW": "文字：特大", "zh-CN": "文字：特大" },
};

export function AccessibilityToolbar() {
  const { textSize, contrastMode, cycleTextSize, toggleContrast } = useAccessibility();
  const { language } = useLanguage();
  const lang = language as "en-GB" | "zh-TW" | "zh-CN";

  const sizeLabel = textSizeLabels[textSize][lang] || textSizeLabels[textSize]["en-GB"];
  const contrastLabel = contrastMode === "high-contrast"
    ? (lang === "en-GB" ? "High Contrast: On" : "高對比：開")
    : (lang === "en-GB" ? "High Contrast: Off" : "高對比：關");

  return (
    <div className="flex items-center gap-1" role="toolbar" aria-label="Accessibility options">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleTextSize}
            aria-label={sizeLabel}
            className="h-9 w-9 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ALargeSmall className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{sizeLabel}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={contrastMode === "high-contrast" ? "secondary" : "ghost"}
            size="icon"
            onClick={toggleContrast}
            aria-label={contrastLabel}
            className="h-9 w-9 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Contrast className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{contrastLabel}</TooltipContent>
      </Tooltip>
    </div>
  );
}
