import { useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";
import logo from "@/assets/logo.png";
import { useLanguage, Language } from "@/shared/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const languages = [
  { value: "zh-TW", label: "繁體中文" },
  { value: "zh-CN", label: "简体中文" },
  { value: "en-GB", label: "English" },
];

export function LandingNav() {
  const navigate = useNavigate();
  const { t3, language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-cream/85 backdrop-blur-xl border-b border-sunshine/20">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-16">
        <div className="flex items-center gap-2.5">
          <img
            src={logo}
            alt=""
            className="h-10 w-10 object-contain drop-shadow-sm"
            aria-hidden="true"
          />
          <span className="font-headline font-extrabold text-ink text-lg tracking-tight select-none">
            SpeakAble HK
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={language}
            onValueChange={(v) => setLanguage(v as Language)}
          >
            <SelectTrigger
              className="h-11 w-[44px] sm:w-[140px] bg-white/80 border-2 border-sunshine/40 rounded-full px-2 sm:px-4 gap-1.5 hover:bg-white transition-colors"
              aria-label={t3("Language", "語言", "语言")}
            >
              <Globe className="h-4 w-4 text-ink shrink-0" />
              <span className="hidden sm:inline">
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50 rounded-2xl">
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => navigate("/role-select")}
            className="bg-sunshine hover:bg-coral text-ink hover:text-white font-headline font-extrabold text-sm sm:text-base px-5 sm:px-7 py-3 rounded-full shadow-soft hover:shadow-playful transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            {t3("Let's Play!", "一齊玩！", "一起玩！")}
          </button>
        </div>
      </div>
    </header>
  );
}
