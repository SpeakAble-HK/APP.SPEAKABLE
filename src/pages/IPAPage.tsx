import { Link } from "react-router-dom";
import { BookOpen, Languages, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function IPAPage() {
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const sections = [
    {
      icon: BookOpen,
      title: isEn ? "IPA Library" : isTW ? "IPA 資料庫" : "IPA 资料库",
      desc: isEn
        ? "Browse the full International Phonetic Alphabet with audio examples and articulation guides."
        : isTW ? "瀏覽完整的國際音標，附有音頻範例和發音指南。" : "浏览完整的国际音标，附有音频范例和发音指南。",
      url: "/learning/library",
    },
    {
      icon: Languages,
      title: isEn ? "IPA Transcription" : isTW ? "IPA 轉寫" : "IPA 转写",
      desc: isEn
        ? "Convert Cantonese text into IPA transcription for phonetic analysis."
        : isTW ? "將廣東話文字轉換為 IPA 轉寫以進行語音分析。" : "将广东话文字转换为 IPA 转写以进行语音分析。",
      url: "/ipa-transcription",
    },
  ];

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {isEn ? "International Phonetic Alphabet" : "國際音標"}
        </h1>
        <p className="text-muted-foreground mb-10">
          {isEn
            ? "Explore IPA resources to improve your Cantonese pronunciation."
            : isTW ? "探索 IPA 資源以改善您的廣東話發音。" : "探索 IPA 资源以改善您的广东话发音。"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--bento-gap)]">
          {sections.map((s) => (
            <Link key={s.url} to={s.url} className="group">
              <div className="bento-card h-full flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">{s.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {isEn ? "Open" : "打開"} <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
