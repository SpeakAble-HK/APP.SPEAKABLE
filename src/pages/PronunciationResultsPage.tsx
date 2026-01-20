import { Link, useLocation, Navigate } from "react-router-dom";
import { ArrowLeft, Volume2, Play, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Compare phonemes - create a map of position -> match status
  const comparePhonemes = () => {
    const comparisons: { 
      intended: PhonemeResult; 
      spoken: PhonemeResult | null; 
      isMatch: boolean;
    }[] = [];

    // Filter out punctuation (null phonemes) for comparison
    const filteredIntended = intendedPhonemes.filter(p => p.phoneme !== null);
    const filteredSpoken = spokenPhonemes.filter(p => p.phoneme !== null);

    filteredIntended.forEach((intended, index) => {
      const spoken = filteredSpoken[index] || null;
      const isMatch = spoken?.phoneme === intended.phoneme;
      comparisons.push({ intended, spoken, isMatch });
    });

    // Add any extra spoken phonemes
    if (filteredSpoken.length > filteredIntended.length) {
      for (let i = filteredIntended.length; i < filteredSpoken.length; i++) {
        comparisons.push({
          intended: { character: '', phoneme: null },
          spoken: filteredSpoken[i],
          isMatch: false
        });
      }
    }

    return comparisons;
  };

  const comparisons = comparePhonemes();
  const correctCount = comparisons.filter(c => c.isMatch).length;
  const totalCount = comparisons.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

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
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
              <span className="text-lg font-semibold">Accuracy:</span>
              <span className={`text-2xl font-bold ${accuracy >= 80 ? 'text-green-500' : accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {accuracy}%
              </span>
              <span className="text-muted-foreground">({correctCount}/{totalCount})</span>
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

          {/* Phoneme Comparison */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Phoneme Comparison</h2>
            
            {/* Intended Phonemes */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Intended Pronunciation
              </h3>
              <div className="flex flex-wrap gap-2">
                {intendedPhonemes.filter(p => p.phoneme !== null).map((item, index) => {
                  const comparison = comparisons[index];
                  const isMatch = comparison?.isMatch;
                  return (
                    <div 
                      key={index}
                      className={`flex flex-col items-center px-3 py-2 rounded-lg border-2 transition-all ${
                        isMatch 
                          ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400' 
                          : 'bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400'
                      }`}
                    >
                      <span className="text-lg font-medium">{item.character}</span>
                      <span className="text-xs opacity-80">{item.phoneme}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spoken Phonemes */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-muted-foreground" />
                Your Pronunciation
              </h3>
              <div className="flex flex-wrap gap-2">
                {spokenPhonemes.filter(p => p.phoneme !== null).map((item, index) => {
                  const intendedItem = intendedPhonemes.filter(p => p.phoneme !== null)[index];
                  const isMatch = intendedItem?.phoneme === item.phoneme;
                  return (
                    <div 
                      key={index}
                      className={`flex flex-col items-center px-3 py-2 rounded-lg border-2 transition-all ${
                        isMatch 
                          ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400' 
                          : 'bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400'
                      }`}
                    >
                      <span className="text-lg font-medium">{item.character}</span>
                      <span className="text-xs opacity-80">{item.phoneme}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Detailed Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">#</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Character</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Expected</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Your Pronunciation</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comparison, index) => (
                    <tr key={index} className="border-b border-border/50 last:border-0">
                      <td className="py-2 px-3 text-muted-foreground">{index + 1}</td>
                      <td className="py-2 px-3 font-medium text-lg">
                        {comparison.intended.character || comparison.spoken?.character || '-'}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-mono text-primary">
                          {comparison.intended.phoneme || '-'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`font-mono ${comparison.isMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {comparison.spoken?.phoneme || '-'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {comparison.isMatch ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronunciationResultsPage;
