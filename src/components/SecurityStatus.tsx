import { ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";

interface SecurityStatusProps {
  isProcessing?: boolean;
}

export function SecurityStatus({ isProcessing = false }: SecurityStatusProps) {
  const { language } = useLanguage();
  const isEn = language === "en-GB";

  const statusText = isProcessing
    ? (isEn ? "Secure Local Processing" : "安全本地處理")
    : (isEn ? "Data Protected" : "數據已保護");

  const tooltipText = isEn
    ? "All voice data is processed securely. Audio is encrypted in transit (TLS 1.3) and never stored permanently. Golden Speaker models run within our secured infrastructure."
    : "所有語音數據均經安全處理。音頻在傳輸中加密（TLS 1.3），不會永久存儲。金色揚聲器模型在我們的安全基礎設施內運行。";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors hover:bg-[hsl(var(--sidebar-accent))] cursor-default">
          <div className={`relative ${isProcessing ? "security-pulse" : ""}`}>
            <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" aria-hidden="true" />
            {isProcessing && (
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            )}
          </div>
          <span className="text-sm text-[hsl(var(--sidebar-foreground))]">{statusText}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-[260px] text-xs leading-relaxed">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}
