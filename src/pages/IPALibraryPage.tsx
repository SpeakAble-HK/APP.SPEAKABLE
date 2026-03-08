import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const IPALibraryPage = () => {
  const { t } = useLanguage();

  // Phoneme data with translation keys
  const plosives = [
    { symbol: "p", descriptionKey: "phoneme.voicelessBilabial" },
    { symbol: "b", descriptionKey: "phoneme.voicedBilabial" },
    { symbol: "t", descriptionKey: "phoneme.voicelessAlveolar" },
    { symbol: "d", descriptionKey: "phoneme.voicedAlveolar" },
    { symbol: "k", descriptionKey: "phoneme.voicelessVelar" },
    { symbol: "g", descriptionKey: "phoneme.voicedVelar" },
  ];

  const fricatives = [
    { symbol: "f", descriptionKey: "phoneme.voicelessLabiodental" },
    { symbol: "v", descriptionKey: "phoneme.voicedLabiodental" },
    { symbol: "θ", descriptionKey: "phoneme.voicelessDental" },
    { symbol: "ð", descriptionKey: "phoneme.voicedDental" },
    { symbol: "s", descriptionKey: "phoneme.voicelessAlveolar" },
    { symbol: "z", descriptionKey: "phoneme.voicedAlveolar" },
    { symbol: "ʃ", descriptionKey: "phoneme.voicelessPostalv" },
    { symbol: "ʒ", descriptionKey: "phoneme.voicedPostalv" },
  ];

  // Vowels with example words (these are the same across languages as examples)
  const vowels = [
    { symbol: "iː", description: "sheep" },
    { symbol: "ɪ", description: "ship" },
    { symbol: "uː", description: "shoot" },
    { symbol: "ʊ", description: "good" },
    { symbol: "e", description: "bed" },
    { symbol: "ə", description: "teacher" },
    { symbol: "ɜː", description: "bird" },
    { symbol: "ɔː", description: "door" },
    { symbol: "æ", description: "cat" },
    { symbol: "ʌ", description: "up" },
    { symbol: "ɑː", description: "far" },
    { symbol: "ɒ", description: "on" },
  ];

  interface PhonemeCardProps {
    symbol: string;
    description: string;
  }

  const PhonemeCard = ({ symbol, description }: PhonemeCardProps) => (
    <div className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all cursor-pointer min-w-[100px]">
      <span className="text-3xl md:text-4xl font-serif text-foreground mb-2">{symbol}</span>
      <span className="text-xs text-muted-foreground text-center leading-tight">{description}</span>
    </div>
  );

  interface PhonemeSectionProps {
    title: string;
    children: React.ReactNode;
  }

  const PhonemeSection = ({ title, children }: PhonemeSectionProps) => (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>
      <div className="flex flex-wrap gap-3">
        {children}
      </div>
    </div>
  );

  return (
    <div className="hero-gradient min-h-full">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Back Button */}
        <Link to="/home">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("nav.backToHome")}
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            {t("ipa.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("ipa.subtitle")}
          </p>
        </div>

        {/* Phoneme Sections */}
        <PhonemeSection title={t("ipa.plosives")}>
          {plosives.map((phoneme) => (
            <PhonemeCard key={phoneme.symbol} symbol={phoneme.symbol} description={t(phoneme.descriptionKey)} />
          ))}
        </PhonemeSection>

        <PhonemeSection title={t("ipa.fricatives")}>
          {fricatives.map((phoneme) => (
            <PhonemeCard key={phoneme.symbol} symbol={phoneme.symbol} description={t(phoneme.descriptionKey)} />
          ))}
        </PhonemeSection>

        <PhonemeSection title={t("ipa.vowels")}>
          {vowels.map((phoneme) => (
            <PhonemeCard key={phoneme.symbol} symbol={phoneme.symbol} description={phoneme.description} />
          ))}
        </PhonemeSection>
      </div>
    </div>
  );
};

export default IPALibraryPage;
