import { LandingNav } from "@/shared/components/landing/LandingNav";
import { HeroSection } from "@/shared/components/landing/HeroSection";
import { FeaturePanel } from "@/shared/components/landing/FeaturePanel";
import { WaveDivider } from "@/shared/components/landing/WaveDivider";
import {
  QuestIllustration,
  VoiceCloneIllustration,
  AdaptivePathIllustration,
  AccessibilityIllustration,
} from "@/shared/components/landing/FeatureIllustrations";
import { PremiumBanner } from "@/shared/components/landing/PremiumBanner";
import { ProductCards } from "@/shared/components/landing/ProductCards";
import { CTAFooter } from "@/shared/components/landing/CTAFooter";
import { useLanguage } from "@/shared/contexts/LanguageContext";

const Index = () => {
  const { t3 } = useLanguage();

  const FEATURES = [
    {
      title: t3("Fun quests & games", "趣味任務與遊戲", "趣味任务与游戏"),
      description: t3(
        "Friendly voice quests for young learners and elders. Audio mini-games make Cantonese practice joyful — every good try earns coins and stars, so practice at home feels like play.",
        "為小朋友及長者設計的親切語音任務。音頻小遊戲令粵語練習變得開心——每次努力都會獲得金幣同星星，喺屋企練習就好似玩耍咁。",
        "为小朋友及长者设计的亲切语音任务。音频小游戏让粤语练习变得开心——每次努力都会获得金币和星星，在家练习就像玩耍一样。"
      ),
      illustration: <QuestIllustration />,
      bg: "bg-cream",
      panelKey: "quest",
    },
    {
      title: t3("Voice-clone golden speaker", "「聲音複製」黃金發音員", "「声音复制」黄金发音员"),
      description: t3(
        'Our "Golden Speaker" gently shows the right sound using the learner\'s own voice. With friendly tongue-position hints and live comparison, kids feel "wow, my voice can sound like that too!" and want to keep going.',
        "「黃金發音員」用學習者自己嘅聲音示範正確發音。配合親切嘅舌位提示同即時比較，小朋友會覺得「嘩，我嘅聲音都可以咁標準！」想繼續練落去。",
        "「黄金发音员」用学习者自己的声音示范正确发音。配合亲切的舌位提示和即时比较，小朋友会觉得「哇，我的声音也可以这么标准！」想继续练下去。"
      ),
      illustration: <VoiceCloneIllustration />,
      bg: "bg-sky-soft",
      reversed: true,
      panelKey: "clone",
    },
    {
      title: t3("Smart learning path", "聰明學習路徑", "聪明学习路径"),
      description: t3(
        "PiPi remembers what you've practised and what's next. The path grows with you — softer when you're tired, brighter when you're ready for a new challenge.",
        "皮皮會記住你練咗咩、跟住係咩。學習路徑會隨你成長——攰嘅時候放鬆啲，準備好嘅時候挑戰新嘢。",
        "皮皮会记住你练了什么、接下来是什么。学习路径会随你成长——累的时候放松些，准备好的时候挑战新事物。"
      ),
      illustration: <AdaptivePathIllustration />,
      bg: "bg-cream",
      panelKey: "path",
    },
    {
      title: t3("Kind & easy to use", "親切又易用", "亲切又易用"),
      description: t3(
        "Big buttons (44×44px), high-contrast colours, clear voice feedback, and simple steps. Built so kids, elders, and families can all join in on their own.",
        "大大粒按鈕（44×44px）、高對比顏色、清晰語音回饋、簡單步驟。設計畀小朋友、長者同家庭都可以獨立完成。",
        "大大颗按钮（44×44px）、高对比颜色、清晰语音反馈、简单步骤。设计让小朋友、长者和家庭都可以独立完成。"
      ),
      illustration: <AccessibilityIllustration />,
      bg: "bg-mint-soft",
      reversed: true,
      panelKey: "a11y",
    },
  ];

  return (
    <div className="min-h-screen bg-cream font-body text-ink">
      <LandingNav />
      <HeroSection />

      {FEATURES.map((f, i) => {
        const next = FEATURES[i + 1];
        // Map bg class → fill class for the wave
        const fillMap: Record<string, string> = {
          "bg-cream": "fill-[hsl(var(--cream))]",
          "bg-sky-soft": "fill-[hsl(var(--sky-soft))]",
          "bg-mint-soft": "fill-[hsl(var(--mint-soft))]",
          "bg-sunshine-soft": "fill-[hsl(var(--sunshine-soft))]",
        };
        return (
          <div key={f.panelKey}>
            <FeaturePanel
              title={f.title}
              description={f.description}
              illustration={f.illustration}
              bg={f.bg}
              reversed={"reversed" in f ? f.reversed : false}
            />
            {next && (
              <WaveDivider
                from={f.bg}
                to={fillMap[next.bg] ?? "fill-[hsl(var(--cream))]"}
              />
            )}
          </div>
        );
      })}

      <WaveDivider from="bg-mint-soft" to="fill-[hsl(var(--sky-soft))]" />
      <PremiumBanner />
      <WaveDivider from="bg-sunshine-soft" to="fill-[hsl(var(--cream))]" />
      <ProductCards />
      <WaveDivider from="bg-cream" to="fill-[hsl(var(--coral-bright))]" />
      <CTAFooter />
    </div>
  );
};

export default Index;
