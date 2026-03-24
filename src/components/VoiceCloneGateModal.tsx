import { Mic, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import parrot from "@/assets/pipi-mascot.png";

interface VoiceCloneGateModalProps {
  onStartClone: () => void;
  onSkip: () => void;
}

export function VoiceCloneGateModal({ onStartClone, onSkip }: VoiceCloneGateModalProps) {
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <img src={parrot} alt="" className="h-32 w-32 mx-auto mascot-bounce" />

        <div>
          <h2 className="text-2xl font-extrabold text-foreground">
            {isEn ? "Create Your Voice First!" : isTW ? "先建立你的語音！" : "先建立你的语音！"}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {isEn
              ? "Record your voice so our AI can give you personalised feedback on your pronunciation."
              : isTW
              ? "錄製你的聲音，讓 AI 為你提供個人化的發音反饋。"
              : "录制你的声音，让 AI 为你提供个性化的发音反馈。"}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onStartClone}
            className="w-full h-14 text-lg font-extrabold rounded-2xl game-btn gap-2"
            style={{ boxShadow: "0 4px 0 hsl(var(--primary-dark))" }}
          >
            <Mic className="h-5 w-5" />
            {isEn ? "Start Now" : isTW ? "立即開始" : "立即开始"}
            <ArrowRight className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            onClick={onSkip}
            className="w-full text-muted-foreground font-bold gap-1.5"
          >
            <Clock className="h-4 w-4" />
            {isEn ? "Later" : isTW ? "稍後再說" : "稍后再说"}
          </Button>
        </div>
      </div>
    </div>
  );
}
