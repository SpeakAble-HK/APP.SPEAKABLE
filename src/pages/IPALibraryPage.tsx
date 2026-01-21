import { BookText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

// Phoneme data
const plosives = [
  { symbol: "p", description: "voiceless bilabial" },
  { symbol: "b", description: "voiced bilabial" },
  { symbol: "t", description: "voiceless alveolar" },
  { symbol: "d", description: "voiced alveolar" },
  { symbol: "k", description: "voiceless velar" },
  { symbol: "g", description: "voiced velar" },
];

const fricatives = [
  { symbol: "f", description: "voiceless labiodental" },
  { symbol: "v", description: "voiced labiodental" },
  { symbol: "θ", description: "voiceless dental" },
  { symbol: "ð", description: "voiced dental" },
  { symbol: "s", description: "voiceless alveolar" },
  { symbol: "z", description: "voiced alveolar" },
  { symbol: "ʃ", description: "voiceless post-alv" },
  { symbol: "ʒ", description: "voiced post-alv" },
];

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
  phonemes: PhonemeCardProps[];
}

const PhonemeSection = ({ title, phonemes }: PhonemeSectionProps) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>
    <div className="flex flex-wrap gap-3">
      {phonemes.map((phoneme) => (
        <PhonemeCard key={phoneme.symbol} {...phoneme} />
      ))}
    </div>
  </div>
);

const IPALibraryPage = () => {
  const [language, setLanguage] = useState("en-uk");

  return (
    <div className="hero-gradient min-h-full">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              IPA Library
            </h1>
            <p className="text-muted-foreground mt-1">
              A comprehensive reference of standard English sounds and their articulatory features.
            </p>
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[140px] bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-uk">English (UK)</SelectItem>
              <SelectItem value="en-us">English (US)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Phoneme Sections */}
        <PhonemeSection title="Plosives (Stops)" phonemes={plosives} />
        <PhonemeSection title="Fricatives" phonemes={fricatives} />
        <PhonemeSection title="Vowels (Monophthongs)" phonemes={vowels} />
      </div>
    </div>
  );
};

export default IPALibraryPage;
