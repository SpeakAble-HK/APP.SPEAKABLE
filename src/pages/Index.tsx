import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturePanel } from "@/components/landing/FeaturePanel";
import {
  QuestIllustration,
  VoiceCloneIllustration,
  AdaptivePathIllustration,
  AccessibilityIllustration,
} from "@/components/landing/FeatureIllustrations";
import { PremiumBanner } from "@/components/landing/PremiumBanner";
import { ProductCards } from "@/components/landing/ProductCards";
import { CTAFooter } from "@/components/landing/CTAFooter";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t3 } = useLanguage();

  const FEATURES = [
    {
      title: t3("Fun Quests & Games", "趣味任務與遊戲", "趣味任务与游戏"),
      description: t3(
        "Interactive voice quests designed for SEN learners and elderly users. Through engaging audio-based mini-games, learners practise Cantonese pronunciation with fun — every correct utterance earns coins and rewards, making home practice enjoyable.",
        "專為特殊教育需要學習者及長者設計的互動式語音任務。透過生動有趣的音頻闖關遊戲，學習者在歡笑中反覆練習粵語發音——每次正確發音都能獲得金幣與獎勵，讓居家練習不再枯燥。",
        "专为特殊教育需要学习者及长者设计的互动式语音任务。通过生动有趣的音频闯关游戏，学习者在欢笑中反复练习粤语发音——每次正确发音都能获得金币与奖励，让居家练习不再枯燥。"
      ),
      illustration: <QuestIllustration />,
      bg: "bg-white",
    },
    {
      title: t3("Voice Clone Corrective Learning", "「聲音複製」糾正學習", "「声音复制」纠正学习"),
      description: t3(
        'Our unique "Golden Speaker" feature uses voice cloning technology to demonstrate correct pronunciation in the learner\'s own voice. Combined with visual tongue position guides and real-time speech comparison feedback, learners intuitively feel "my voice can sound this standard too", greatly boosting motivation.',
        "獨創「黃金發音員」功能：系統透過聲音複製技術，用學習者自己的聲音示範正確發音。配合視覺化舌位引導及即時語音比對回饋，讓學習者直觀感受「我的聲音也能這麼標準」，大幅提升學習動力。",
        "独创「黄金发音员」功能：系统通过声音复制技术，用学习者自己的声音示范正确发音。配合视觉化舌位引导及即时语音比对反馈，让学习者直观感受「我的声音也能这么标准」，大幅提升学习动力。"
      ),
      illustration: <VoiceCloneIllustration />,
      bg: "bg-surface",
      reversed: true,
    },
    {
      title: t3("Adaptive Learning Path", "自適應學習路徑", "自适应学习路径"),
      description: t3(
        "Our AI-driven personalised learning system automatically adjusts difficulty and content based on each practice session. The system continuously tracks pronunciation accuracy, practice frequency, and improvement curves, creating a unique practice path for every learner — smart practice, better results.",
        "AI 驅動的個人化學習系統會根據每次練習表現，自動調整難度與內容。系統持續追蹤發音準確度、練習頻率及進步曲線，為每位學習者打造獨一無二的練習路徑——聰明練習，事半功倍。",
        "AI 驱动的个人化学习系统会根据每次练习表现，自动调整难度与内容。系统持续追踪发音准确度、练习频率及进步曲线，为每位学习者打造独一无二的练习路径——聪明练习，事半功倍。"
      ),
      illustration: <AdaptivePathIllustration />,
      bg: "bg-white",
    },
    {
      title: t3("Accessible Home Practice", "居家練習無障礙功能", "居家练习无障碍功能"),
      description: t3(
        "Designed for independent home use: high-contrast interface, extra-large touch targets (min 44×44px), clear visual feedback, and streamlined workflows. Whether for SEN children, elderly, or general users, everyone can get started easily without assistance.",
        "專為獨立居家使用而設計：高對比度介面、超大觸控目標（最少 44×44px）、清晰的視覺回饋及簡潔的操作流程。無論是特殊教育需要兒童、長者或一般市民，均能輕鬆上手，無需他人協助即可完成練習。",
        "专为独立居家使用而设计：高对比度界面、超大触控目标（最少 44×44px）、清晰的视觉反馈及简洁的操作流程。无论是特殊教育需要儿童、长者或一般市民，均能轻松上手，无需他人协助即可完成练习。"
      ),
      illustration: <AccessibilityIllustration />,
      bg: "bg-surface",
      reversed: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white font-body text-on-surface">
      <LandingNav />
      <HeroSection />

      {FEATURES.map((f, i) => (
        <FeaturePanel
          key={i}
          title={f.title}
          description={f.description}
          illustration={f.illustration}
          bg={f.bg}
          reversed={"reversed" in f ? f.reversed : false}
        />
      ))}

      <PremiumBanner />
      <ProductCards />
      <CTAFooter />
    </div>
  );
};

export default Index;
