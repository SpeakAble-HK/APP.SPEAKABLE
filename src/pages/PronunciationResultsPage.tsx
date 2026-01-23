import { Link, useLocation, Navigate } from "react-router-dom";
import { ArrowLeft, Volume2, Play, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parsePhonemeResult, getToneDescription, ParsedPhoneme } from "@/utils/jyutpingParser";

interface PhonemeResult {
  character: string;
  phoneme: string | null;
}

interface PronunciationResultsState {
  spokenPhonemes: PhonemeResult[];
  intendedPhonemes: PhonemeResult[];
  generatedAudioUrl: string | null;
  recordingUrl: string | null;
}

const PronunciationResultsPage = () => {
  const location = useLocation();
  const state = location.state as PronunciationResultsState | null;

  if (!state) {
    return <Navigate to="/pronunciation" replace />;
  }

  const { spokenPhonemes, intendedPhonemes, generatedAudioUrl, recordingUrl } = state;

  // Parse phonemes into initials, finals, and tones
  const parsedIntended: ParsedPhoneme[] = intendedPhonemes
    .filter(p => p.phoneme !== null)
    .map(parsePhonemeResult);
  
  const parsedSpoken: ParsedPhoneme[] = spokenPhonemes
    .filter(p => p.phoneme !== null)
    .map(parsePhonemeResult);

  // Compare phonemes
  const comparePhonemes = () => {
    const comparisons: { 
      intended: ParsedPhoneme; 
      spoken: ParsedPhoneme | null; 
      initialMatch: boolean;
      finalMatch: boolean;
      toneMatch: boolean;
      isFullMatch: boolean;
    }[] = [];

    parsedIntended.forEach((intended, index) => {
      const spoken = parsedSpoken[index] || null;
      const initialMatch = spoken?.initial === intended.initial;
      const finalMatch = spoken?.final === intended.final;
      const toneMatch = spoken?.tone === intended.tone;
      const isFullMatch = initialMatch && finalMatch && toneMatch;
      comparisons.push({ intended, spoken, initialMatch, finalMatch, toneMatch, isFullMatch });
    });

    // Add any extra spoken phonemes
    if (parsedSpoken.length > parsedIntended.length) {
      for (let i = parsedIntended.length; i < parsedSpoken.length; i++) {
        comparisons.push({
          intended: { character: '', phoneme: null, initial: null, final: null, tone: null },
          spoken: parsedSpoken[i],
          initialMatch: false,
          finalMatch: false,
          toneMatch: false,
          isFullMatch: false
        });
      }
    }

    return comparisons;
  };

  const comparisons = comparePhonemes();
  const correctCount = comparisons.filter(c => c.isFullMatch).length;
  const totalCount = comparisons.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // Calculate component-level accuracy
  const initialCorrect = comparisons.filter(c => c.initialMatch).length;
  const finalCorrect = comparisons.filter(c => c.finalMatch).length;
  const toneCorrect = comparisons.filter(c => c.toneMatch).length;

  const handlePlayRecording = () => {
    if (recordingUrl) {
      const audio = new Audio(recordingUrl);
      audio.play();
    }
  };

  const handlePlayGenerated = () => {
    if (generatedAudioUrl) {
      const audio = new Audio(generatedAudioUrl);
      audio.play();
    }
  };

  const getMatchClass = (isMatch: boolean) => 
    isMatch 
      ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30' 
      : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/pronunciation">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Recording
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Pronunciation Results
            </h1>
            
            {/* Overall Accuracy */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
              <span className="text-lg font-semibold">Overall Accuracy:</span>
              <span className={`text-2xl font-bold ${accuracy >= 80 ? 'text-green-500' : accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {accuracy}%
              </span>
              <span className="text-muted-foreground">({correctCount}/{totalCount})</span>
            </div>
          </div>

          {/* Component Accuracy Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Initials</p>
              <p className={`text-2xl font-bold ${initialCorrect === totalCount ? 'text-green-500' : 'text-yellow-500'}`}>
                {totalCount > 0 ? Math.round((initialCorrect / totalCount) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">{initialCorrect}/{totalCount}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Finals</p>
              <p className={`text-2xl font-bold ${finalCorrect === totalCount ? 'text-green-500' : 'text-yellow-500'}`}>
                {totalCount > 0 ? Math.round((finalCorrect / totalCount) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">{finalCorrect}/{totalCount}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Tones</p>
              <p className={`text-2xl font-bold ${toneCorrect === totalCount ? 'text-green-500' : 'text-yellow-500'}`}>
                {totalCount > 0 ? Math.round((toneCorrect / totalCount) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">{toneCorrect}/{totalCount}</p>
            </div>
          </div>

          {/* Audio Playback Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Your Recording</h3>
              <Button 
                onClick={handlePlayRecording} 
                variant="outline" 
                className="w-full gap-2"
                disabled={!recordingUrl}
              >
                <Play className="h-4 w-4" />
                Play Your Recording
              </Button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Correct Pronunciation</h3>
              <Button 
                onClick={handlePlayGenerated} 
                variant="outline" 
                className="w-full gap-2"
                disabled={!generatedAudioUrl}
              >
                <Volume2 className="h-4 w-4" />
                Play Correct Version
              </Button>
            </div>
          </div>

          {/* Detailed Breakdown Table */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Detailed Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-3 text-muted-foreground font-medium">Character</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-medium" colSpan={2}>Initial</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-medium" colSpan={2}>Final</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-medium" colSpan={2}>Tone</th>
                    <th className="text-center py-3 px-3 text-muted-foreground font-medium">Status</th>
                  </tr>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-2 px-3"></th>
                    <th className="py-2 px-3 text-xs text-muted-foreground font-normal">Expected</th>
                    <th className="py-2 px-3 text-xs text-muted-foreground font-normal">Yours</th>
                    <th className="py-2 px-3 text-xs text-muted-foreground font-normal">Expected</th>
                    <th className="py-2 px-3 text-xs text-muted-foreground font-normal">Yours</th>
                    <th className="py-2 px-3 text-xs text-muted-foreground font-normal">Expected</th>
                    <th className="py-2 px-3 text-xs text-muted-foreground font-normal">Yours</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comparison, index) => (
                    <tr key={index} className="border-b border-border/50 last:border-0">
                      <td className="py-3 px-3">
                        <div className="flex flex-col items-start">
                          <span className="text-lg font-medium">
                            {comparison.intended.character || comparison.spoken?.character || '-'}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {comparison.intended.phoneme || comparison.spoken?.phoneme || '-'}
                          </span>
                        </div>
                      </td>
                      {/* Initial */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-primary">
                          {comparison.intended.initial || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-mono px-2 py-1 rounded border ${getMatchClass(comparison.initialMatch)}`}>
                          {comparison.spoken?.initial || '-'}
                        </span>
                      </td>
                      {/* Final */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-primary">
                          {comparison.intended.final || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-mono px-2 py-1 rounded border ${getMatchClass(comparison.finalMatch)}`}>
                          {comparison.spoken?.final || '-'}
                        </span>
                      </td>
                      {/* Tone */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-primary" title={getToneDescription(comparison.intended.tone)}>
                          {comparison.intended.tone || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span 
                          className={`font-mono px-2 py-1 rounded border ${getMatchClass(comparison.toneMatch)}`}
                          title={getToneDescription(comparison.spoken?.tone || null)}
                        >
                          {comparison.spoken?.tone || '-'}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {comparison.isFullMatch ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tone Reference</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded">1</span>
                  <span className="text-muted-foreground">High Level (陰平)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded">2</span>
                  <span className="text-muted-foreground">High Rising (陰上)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded">3</span>
                  <span className="text-muted-foreground">Mid Level (陰去)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded">4</span>
                  <span className="text-muted-foreground">Low Falling (陽平)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded">5</span>
                  <span className="text-muted-foreground">Low Rising (陽上)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded">6</span>
                  <span className="text-muted-foreground">Low Level (陽去)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronunciationResultsPage;