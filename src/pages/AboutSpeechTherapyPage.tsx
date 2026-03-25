import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart, AlertTriangle, BookOpen, HelpCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import mascot from "@/assets/pipi-mascot.png";

const AboutSpeechTherapyPage = () => {
  const { language } = useLanguage();

  const t = useMemo(() => {
    const idx = language === "en-GB" ? 0 : language === "zh-TW" ? 1 : 2;
    return (en: string, tw: string, cn: string) => [en, tw, cn][idx];
  }, [language]);

  const sections = useMemo(
    () => [
      {
        icon: HelpCircle,
        title: t("What is Speech Therapy?", "什麼是言語治療？", "什么是言语治疗？"),
        content: t(
          "Speech therapy helps people improve their ability to communicate. A speech therapist works with individuals who have difficulties with speech sounds, language, voice, fluency, or swallowing.",
          "言語治療幫助人們改善溝通能力。言語治療師與有語音、語言、聲音、流暢度或吞嚥困難的人一起工作。",
          "言语治疗帮助人们改善沟通能力。言语治疗师与有语音、语言、声音、流畅度或吞咽困难的人一起工作。",
        ),
      },
      {
        icon: Users,
        title: t("Common Speech Difficulties", "常見語言障礙", "常见语言障碍"),
        content: t(
          "Common issues include articulation disorders, phonological disorders, apraxia of speech, stuttering, and voice disorders. In Cantonese speakers, tone production and nasal sound distinctions are frequent areas of focus.",
          "常見問題包括構音障礙、音韻障礙、言語失用症、口吃和聲音障礙。在廣東話使用者中，聲調產生和鼻音區分是常見的重點領域。",
          "常见问题包括构音障碍、音韵障碍、言语失用症、口吃和声音障碍。在广东话使用者中，声调产生和鼻音区分是常见的重点领域。",
        ),
      },
      {
        icon: BookOpen,
        title: t("How Speech Therapy Works", "言語治療如何運作", "言语治疗如何运作"),
        content: t(
          "Treatment begins with an assessment to identify specific difficulties. The therapist then creates a tailored plan with exercises and strategies — practising specific sounds, strengthening mouth muscles, learning breathing techniques, and using technology-assisted tools for feedback.",
          "治療從評估開始，以識別特定的困難。治療師然後制定量身定做的計劃，包含練習和策略——練習特定聲音、加強口腔肌肉、學習呼吸技巧以及使用科技輔助工具進行反饋。",
          "治疗从评估开始，以识别特定的困难。治疗师然后制定量身定做的计划，包含练习和策略——练习特定声音、加强口腔肌肉、学习呼吸技巧以及使用科技辅助工具进行反馈。",
        ),
      },
    ],
    [t],
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="text-center mb-10">
          <img
            src={mascot}
            alt=""
            role="presentation"
            className="h-20 w-20 mx-auto mb-4 animate-pipi-bob drop-shadow-2xl"
          />
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface mb-2">
            {t("Speech Therapy Information", "言語治療資訊", "言语治疗资讯")}
          </h1>
          <p className="font-body text-on-surface-variant text-sm">
            {t(
              "Learn about speech therapy and speech development.",
              "了解言語治療和語言發展。",
              "了解言语治疗和语言发展。",
            )}
          </p>
        </header>

        <div
          role="alert"
          className="glass-card rounded-2xl p-4 sm:p-5 mb-8 flex gap-3 items-start border-secondary-container/40"
        >
          <AlertTriangle className="h-5 w-5 text-secondary shrink-0 mt-0.5" aria-hidden="true" />
          <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {t(
              "SpeakAble HK does not provide diagnosis or medical treatment. This section is for educational purposes only. If you have concerns about speech or language development, please consult a qualified speech therapist.",
              "SpeakAble HK 不提供診斷或醫療治療。本部分僅供教育用途。如果您對語言發展有疑慮，請諮詢合資格的言語治療師。",
              "SpeakAble HK 不提供诊断或医疗治疗。本部分仅供教育用途。如果您对语言发展有疑虑，请咨询合资格的言语治疗师。",
            )}
          </p>
        </div>

        <div className="space-y-4" role="list">
          {sections.map((section, i) => (
            <article
              key={i}
              role="listitem"
              className="glass-card rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-card-hover hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary-container/25 flex items-center justify-center shrink-0">
                  <section.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h2 className="font-headline text-base sm:text-lg font-extrabold text-on-surface">
                  {section.title}
                </h2>
              </div>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed ml-[56px]">
                {section.content}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <div className="glass-card rim-light rounded-2xl p-6 sm:p-8">
            <Heart
              className="h-10 w-10 text-primary mx-auto mb-4 animate-float"
              aria-hidden="true"
            />
            <p className="font-headline text-base font-bold text-on-surface mb-4">
              {t(
                "Want to practise your pronunciation?",
                "想練習你的發音嗎？",
                "想练习你的发音吗？",
              )}
            </p>
            <Link to="/speech-quest">
              <Button className="game-btn bg-primary text-on-primary font-extrabold px-8 py-3 text-base hover:bg-primary-dim hover:scale-105 active:scale-95 shadow-primary/20 transition-all duration-200">
                {t("Start Speech Quest", "開始語音冒險", "开始语音冒险")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSpeechTherapyPage;
