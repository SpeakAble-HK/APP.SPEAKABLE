import { useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";
import logo from "@/assets/logo.png";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { value: "zh-TW", label: "繁體中文" },
  { value: "zh-CN", label: "简体中文" },
  { value: "en-GB", label: "English" },
];

export function LandingNav() {
  const navigate = useNavigate();
  const { t3, language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-variant/30">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-14">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="" className="h-9 w-9 object-contain" aria-hidden="true" />
          <span className="font-headline font-extrabold text-primary text-lg tracking-tight select-none">
            SpeakAble HK
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger
              className="h-10 w-[44px] sm:w-[140px] bg-white/70 border-surface-variant/40 rounded-xl px-2 sm:px-3 gap-1.5"
              aria-label={t3("Language", "語言", "语言")}
            >
              <Globe className="h-4 w-4 text-on-surface-variant shrink-0" />
              <span className="hidden sm:inline">
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => navigate("/role-select")}
            className="bg-primary hover:bg-primary-dim text-on-primary font-headline font-bold text-sm px-4 sm:px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            {t3("Get Started", "開始使用", "开始使用")}
          </button>
        </div>
      </div>
    </header>
  );
}
