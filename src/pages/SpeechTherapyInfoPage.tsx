import { Link } from "react-router-dom";
import { ArrowLeft, Heart, AlertTriangle, BookOpen, MapPin, HelpCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import mascot from "@/assets/mascot.png";

const SpeechTherapyInfoPage = () => {
  const { language } = useLanguage();
  const isEn = language === "en-GB";
  const isTW = language === "zh-TW";

  const sections = [
    {
      icon: HelpCircle,
      titleEn: "What is Speech Therapy?",
      titleTW: "什麼是言語治療？",
      titleCN: "什么是言语治疗？",
      contentEn: "Speech therapy helps people improve their ability to communicate. A speech therapist (also known as a speech-language pathologist) works with individuals who have difficulties with speech sounds, language, voice, fluency, or swallowing.",
      contentTW: "言語治療幫助人們改善溝通能力。言語治療師與有語音、語言、聲音、流暢度或吞嚥困難的人一起工作。",
      contentCN: "言语治疗帮助人们改善沟通能力。言语治疗师与有语音、语言、声音、流畅度或吞咽困难的人一起工作。",
    },
    {
      icon: Users,
      titleEn: "Common Speech Difficulties",
      titleTW: "常見語言障礙",
      titleCN: "常见语言障碍",
      contentEn: "Common issues include articulation disorders (difficulty producing sounds), phonological disorders (patterns of sound errors), apraxia of speech (motor planning difficulties), stuttering, and voice disorders. In Cantonese speakers, tone production and nasal sound distinctions are frequent areas of focus.",
      contentTW: "常見問題包括構音障礙（難以發出聲音）、音韻障礙（聲音錯誤模式）、言語失用症（動作計劃困難）、口吃和聲音障礙。在廣東話使用者中，聲調產生和鼻音區分是常見的重點領域。",
      contentCN: "常见问题包括构音障碍（难以发出声音）、音韵障碍（声音错误模式）、言语失用症（动作计划困难）、口吃和声音障碍。在广东话使用者中，声调产生和鼻音区分是常见的重点领域。",
    },
    {
      icon: BookOpen,
      titleEn: "How Speech Therapy Works",
      titleTW: "言語治療如何運作",
      titleCN: "言语治疗如何运作",
      contentEn: "Treatment typically begins with an assessment to identify specific difficulties. The therapist then creates a tailored plan with exercises and strategies. Sessions may include practising specific sounds, strengthening mouth muscles, learning breathing techniques, and using technology-assisted tools for feedback.",
      contentTW: "治療通常從評估開始，以識別特定的困難。治療師然後制定量身定做的計劃，包含練習和策略。療程可能包括練習特定聲音、加強口腔肌肉、學習呼吸技巧以及使用科技輔助工具進行反饋。",
      contentCN: "治疗通常从评估开始，以识别特定的困难。治疗师然后制定量身定做的计划，包含练习和策略。疗程可能包括练习特定声音、加强口腔肌肉、学习呼吸技巧以及使用科技辅助工具进行反馈。",
    },
    {
      icon: MapPin,
      titleEn: "Resources in Hong Kong",
      titleTW: "香港資源",
      titleCN: "香港资源",
      contentEn: "Hong Kong offers speech therapy services through public hospitals (Hospital Authority), private clinics, university speech clinics (e.g., HKU, PolyU), and community health centres. Many therapists specialise in Cantonese-specific pronunciation patterns.",
      contentTW: "香港通過公立醫院（醫院管理局）、私人診所、大學語言診所（如港大、理大）和社區健康中心提供言語治療服務。許多治療師專門研究廣東話的特定發音模式。",
      contentCN: "香港通过公立医院（医院管理局）、私人诊所、大学语言诊所（如港大、理大）和社区健康中心提供言语治疗服务。许多治疗师专门研究广东话的特定发音模式。",
    },
  ];

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 font-bold">
            <ArrowLeft className="h-4 w-4" />
            {isEn ? "Back" : "返回"}
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <img src={mascot} alt="" className="h-16 w-16 mx-auto mb-3 mascot-bounce" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
            {isEn ? "Speech Therapy Information" : isTW ? "言語治療資訊" : "言语治疗资讯"}
          </h1>
          <p className="text-muted-foreground">
            {isEn ? "Learn about speech therapy and speech development." : isTW ? "了解言語治療和語言發展。" : "了解言语治疗和语言发展。"}
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-accent/10 border-2 border-accent/30 rounded-2xl p-4 mb-8 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-extrabold text-foreground mb-1">
              {isEn ? "Important Notice" : isTW ? "重要通知" : "重要通知"}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isEn
                ? "SpeakAble HK does not provide diagnosis or medical treatment. This section is for educational purposes only. If you have concerns about speech or language development, please consult a qualified speech therapist."
                : isTW
                ? "SpeakAble HK 不提供診斷或醫療治療。本部分僅供教育用途。如果您對語言發展有疑慮，請諮詢合資格的言語治療師。"
                : "SpeakAble HK 不提供诊断或医疗治疗。本部分仅供教育用途。如果您对语言发展有疑虑，请咨询合资格的言语治疗师。"}
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, i) => (
            <div key={i} className="bg-card border-2 border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-extrabold text-foreground">
                  {isEn ? section.titleEn : isTW ? section.titleTW : section.titleCN}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isEn ? section.contentEn : isTW ? section.contentTW : section.contentCN}
              </p>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6">
            <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-sm font-bold text-foreground mb-3">
              {isEn
                ? "Want to practise your pronunciation?"
                : isTW ? "想練習你的發音嗎？"
                : "想练习你的发音吗？"}
            </p>
            <Link to="/speech-quest">
              <Button className="game-btn gap-2 font-extrabold" style={{ boxShadow: "0 4px 0 hsl(var(--primary-dark))" }}>
                {isEn ? "Start Speech Quest" : isTW ? "開始語音冒險" : "开始语音冒险"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechTherapyInfoPage;
