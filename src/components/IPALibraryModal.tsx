import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface IPALibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

const PhonemeCard = ({ symbol, description }: { symbol: string; description: string }) => (
  <div className="flex flex-col items-center justify-center p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-all min-w-[72px]">
    <span className="text-2xl font-serif text-foreground mb-1">{symbol}</span>
    <span className="text-[10px] text-muted-foreground text-center leading-tight">{description}</span>
  </div>
);

const PhonemeSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-5">
    <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

export function IPALibraryModal({ open, onOpenChange }: IPALibraryModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("ipa.title")}</DialogTitle>
          <DialogDescription>{t("ipa.subtitle")}</DialogDescription>
        </DialogHeader>

        <PhonemeSection title={t("ipa.plosives")}>
          {plosives.map((p) => (
            <PhonemeCard key={p.symbol} symbol={p.symbol} description={t(p.descriptionKey)} />
          ))}
        </PhonemeSection>

        <PhonemeSection title={t("ipa.fricatives")}>
          {fricatives.map((p) => (
            <PhonemeCard key={p.symbol} symbol={p.symbol} description={t(p.descriptionKey)} />
          ))}
        </PhonemeSection>

        <PhonemeSection title={t("ipa.vowels")}>
          {vowels.map((p) => (
            <PhonemeCard key={p.symbol} symbol={p.symbol} description={p.description} />
          ))}
        </PhonemeSection>
      </DialogContent>
    </Dialog>
  );
}
