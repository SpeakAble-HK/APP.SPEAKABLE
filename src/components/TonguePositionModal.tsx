import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface TonguePositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: string;
  spokenPhoneme: string | null;
  intendedPhoneme: string | null;
}

// Mapping of vowel phonemes to tongue position descriptions and approximate SVG paths
const vowelPositions: Record<string, { label: string; y: number; color: string }> = {
  'aa': { label: 'a (open, back)', y: 85, color: '#9b59b6' },
  'a': { label: 'a (open, back)', y: 85, color: '#9b59b6' },
  'e': { label: 'e (mid, front)', y: 45, color: '#3498db' },
  'i': { label: 'i (close, front)', y: 15, color: '#e74c3c' },
  'o': { label: 'o (mid, back)', y: 55, color: '#e67e22' },
  'u': { label: 'u (close, back)', y: 20, color: '#2ecc71' },
  'oe': { label: 'ɛ (open-mid, front)', y: 65, color: '#27ae60' },
  'eo': { label: 'ɛ (open-mid, front)', y: 65, color: '#27ae60' },
  'yu': { label: 'y (close, front rounded)', y: 18, color: '#1abc9c' },
};

function getVowelFromPhoneme(phoneme: string | null): string | null {
  if (!phoneme) return null;
  // Extract vowel part (remove tone number and initial consonant patterns)
  const cleaned = phoneme.replace(/[0-9]/g, '');
  // Try to match known vowels from longest to shortest
  const vowels = ['aa', 'oe', 'eo', 'yu', 'a', 'e', 'i', 'o', 'u'];
  for (const v of vowels) {
    if (cleaned.includes(v)) return v;
  }
  return null;
}

function TonguePositionSVG({ vowel, label }: { vowel: string | null; label: string }) {
  const pos = vowel ? vowelPositions[vowel] : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <svg viewBox="0 0 200 200" className="w-full max-w-[180px] h-auto" aria-label={`Tongue position diagram for ${vowel || 'unknown'}`}>
        {/* Head outline */}
        <path d="M160,20 C180,20 190,40 190,70 L190,130 C190,160 170,190 140,190 L100,190 C70,190 50,170 50,140 L50,70 C50,40 70,20 100,20 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" />
        {/* Mouth cavity */}
        <path d="M70,80 Q70,60 90,55 L140,55 Q160,55 160,80 L160,130 Q160,150 140,155 L90,155 Q70,155 70,130 Z" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/30" />
        {/* Tongue position indicator */}
        {pos ? (
          <>
            <circle cx={100} cy={40 + pos.y} r="8" fill={pos.color} opacity="0.8" />
            <text x={100} y={40 + pos.y + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">
              {vowel}
            </text>
            <text x={100} y={40 + pos.y + 22} textAnchor="middle" fontSize="8" fill={pos.color} className="font-mono">
              {pos.label}
            </text>
          </>
        ) : (
          <text x={100} y={105} textAnchor="middle" fontSize="11" className="fill-muted-foreground">
            N/A
          </text>
        )}
        {/* Reference lines */}
        <line x1="75" y1="55" x2="75" y2="155" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/20" strokeDasharray="3,3" />
        <text x="72" y="52" fontSize="7" className="fill-muted-foreground/40">Close</text>
        <text x="72" y="162" fontSize="7" className="fill-muted-foreground/40">Open</text>
      </svg>
    </div>
  );
}

export default function TonguePositionModal({ open, onOpenChange, character, spokenPhoneme, intendedPhoneme }: TonguePositionModalProps) {
  const { language } = useLanguage();
  const isEn = language === 'en-GB';

  const spokenVowel = getVowelFromPhoneme(spokenPhoneme);
  const intendedVowel = getVowelFromPhoneme(intendedPhoneme);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEn ? 'Tongue Position Analysis' : '舌位分析'} — {character}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4">
          <TonguePositionSVG
            vowel={spokenVowel}
            label={isEn ? 'Your Tongue Position' : '你的舌位'}
          />
          <TonguePositionSVG
            vowel={intendedVowel}
            label={isEn ? 'Target Correct Position' : '目標正確舌位'}
          />
        </div>
        {spokenVowel && intendedVowel && spokenVowel !== intendedVowel && (
          <p className="text-sm text-center text-muted-foreground">
            {isEn
              ? `Your vowel "${spokenVowel}" differs from the target "${intendedVowel}". Try adjusting your tongue height and position.`
              : `你的元音「${spokenVowel}」與目標「${intendedVowel}」不同，請嘗試調整舌頭高度和位置。`}
          </p>
        )}
        {spokenVowel && intendedVowel && spokenVowel === intendedVowel && (
          <p className="text-sm text-center text-green-600 dark:text-green-400">
            {isEn ? 'Great! Your tongue position matches the target.' : '很好！你的舌位與目標一致。'}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
