import type { PhonemeTarget } from '../minigame-sdk/types';

export function PhonemeTagger({
  learnerId,
  onSave,
}: {
  learnerId: string;
  onSave: (phonemes: PhonemeTarget[]) => void;
}) {
  const cantonesePhonemes: PhonemeTarget[] = [
    { symbol: '/b/', ipa: 'b', position: 'initial' },
    { symbol: '/p/', ipa: 'p', position: 'initial' },
    { symbol: '/m/', ipa: 'm', position: 'initial' },
    { symbol: '/n/', ipa: 'n', position: 'initial' },
    { symbol: '/l/', ipa: 'l', position: 'initial' },
    { symbol: '/g/', ipa: 'g', position: 'initial' },
    { symbol: '/k/', ipa: 'k', position: 'initial' },
    { symbol: '/z/', ipa: 'z', position: 'initial' },
    { symbol: '/c/', ipa: 'c', position: 'initial' },
    { symbol: '/s/', ipa: 's', position: 'initial' },
  ];

  return (
    <div className="phoneme-tagger">
      <h3>Target Phonemes</h3>
      <div className="ipa-grid">
        {cantonesePhonemes.map((phoneme) => (
          <label key={phoneme.symbol} className="phoneme-checkbox">
            <input type="checkbox" value={phoneme.symbol} />
            <span>{phoneme.symbol}</span>
          </label>
        ))}
      </div>
      <button onClick={() => onSave(cantonesePhonemes)}>Save</button>
    </div>
  );
}
