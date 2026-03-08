import { useNavigate } from "react-router-dom";
import { MapPin, BookOpen, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import mascot from "@/assets/mascot.png";

const ResourcesPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";
  const t = (en: string, tw: string, cn: string) => (isEn ? en : isTW ? tw : cn);

  const cards = [
    {
      icon: MapPin,
      title: t("Find Speech Therapy", "尋找言語治療", "寻找言语治疗"),
      desc: t(
        "Search for the closest speech therapy provider in Hong Kong.",
        "搜尋香港最近的言語治療服務提供者。",
        "搜索香港最近的言语治疗服务提供者。"
      ),
      path: "/resources/find-provider",
      color: "bg-primary text-primary-foreground",
      iconBg: "bg-primary-foreground/20",
      shadow: "hsl(var(--primary-dark))",
    },
    {
      icon: BookOpen,
      title: t("Speech Therapy Information", "言語治療資訊", "言语治疗资讯"),
      desc: t(
        "Educational information about speech therapy.",
        "關於言語治療的教育資訊。",
        "关于言语治疗的教育资讯。"
      ),
      path: "/resources/speech-therapy-info",
      color: "bg-card text-foreground border-2 border-border",
      iconBg: "bg-accent/15",
      shadow: "hsl(var(--border))",
      iconColor: "text-accent",
    },
    {
      icon: Languages,
      title: t("IPA Library", "IPA 音標庫", "IPA 音标库"),
      desc: t(
        "Learn phonetic symbols and pronunciation guides.",
        "學習音標符號和發音指南。",
        "学习音标符号和发音指南。"
      ),
      path: "/ipa",
      color: "bg-card text-foreground border-2 border-border",
      iconBg: "bg-primary/10",
      shadow: "hsl(var(--border))",
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="min-h-full bg-background">
      <section className="px-4 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <img src={mascot} alt="" className="h-16 w-16 object-contain mascot-bounce" />
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">
                {t("Resources", "資源", "资源")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t(
                  "Speech therapy tools and learning materials.",
                  "言語治療工具和學習資源。",
                  "言语治疗工具和学习资源。"
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {cards.map((card, i) => (
              <button
                key={i}
                onClick={() => navigate(card.path)}
                className={`w-full rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-1 active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${card.color}`}
                style={{ boxShadow: `0 6px 0 ${card.shadow}` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 min-w-[56px] rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <card.icon className={`h-7 w-7 ${card.iconColor || 'text-primary-foreground'}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xl font-extrabold block leading-tight">
                      {card.title}
                    </span>
                    <span className={`text-sm font-medium mt-0.5 block leading-snug ${
                      i === 0 ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}>
                      {card.desc}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResourcesPage;
