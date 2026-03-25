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

const FEATURES = [
  {
    title: "趣味任務與遊戲",
    description:
      "專為特殊教育需要學習者及長者設計的互動式語音任務。透過生動有趣的音頻闖關遊戲，學習者在歡笑中反覆練習粵語發音——每次正確發音都能獲得金幣與獎勵，讓居家練習不再枯燥。",
    illustration: <QuestIllustration />,
    bg: "bg-white",
  },
  {
    title: "「聲音複製」糾正學習",
    description:
      "獨創「黃金發音員」功能：系統透過聲音複製技術，用學習者自己的聲音示範正確發音。配合視覺化舌位引導及即時語音比對回饋，讓學習者直觀感受「我的聲音也能這麼標準」，大幅提升學習動力。",
    illustration: <VoiceCloneIllustration />,
    bg: "bg-surface",
    reversed: true,
  },
  {
    title: "自適應學習路徑",
    description:
      "AI 驅動的個人化學習系統會根據每次練習表現，自動調整難度與內容。系統持續追蹤發音準確度、練習頻率及進步曲線，為每位學習者打造獨一無二的練習路徑——聰明練習，事半功倍。",
    illustration: <AdaptivePathIllustration />,
    bg: "bg-white",
  },
  {
    title: "居家練習無障礙功能",
    description:
      "專為獨立居家使用而設計：高對比度介面、超大觸控目標（最少 44×44px）、清晰的視覺回饋及簡潔的操作流程。無論是特殊教育需要兒童、長者或一般市民，均能輕鬆上手，無需他人協助即可完成練習。",
    illustration: <AccessibilityIllustration />,
    bg: "bg-surface",
    reversed: true,
  },
];

const Index = () => (
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

export default Index;
