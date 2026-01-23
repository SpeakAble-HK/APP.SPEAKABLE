import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Play, CheckCircle, XCircle, History, Trash2, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parsePhonemeResult, getToneDescription, ParsedPhoneme } from "@/utils/jyutpingParser";
import { usePronunciationResults, PronunciationResult } from "@/hooks/usePronunciationResults";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { toast } from "sonner";

interface PhonemeResult {
  character: string;
  phoneme: string | null;
  confidence?: number;
  jyConf?: number;
  toneConf?: number;
  isLowConfidence?: boolean;
}

interface PronunciationResultsState {
  spokenPhonemes: PhonemeResult[];
  intendedPhonemes: PhonemeResult[];
  generatedAudioUrl: string | null;
  recordingUrl: string | null;
  intendedText?: string;
}

const PronunciationResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const state = location.state as PronunciationResultsState | null;
  const { results, isLoading, saveResult, deleteResult } = usePronunciationResults();
  const { user } = useAuth();
  const [selectedResult, setSelectedResult] = useState<PronunciationResult | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  // Determine data source: from navigation state or selected history
  const displayData = selectedResult 
    ? {
        spokenPhonemes: selectedResult.spoken_phonemes,
        intendedPhonemes: selectedResult.intended_phonemes,
        generatedAudioUrl: null,
        recordingUrl: null,
      }
    : state;

  // Parse and compare phonemes
  const getComparisons = (spokenPhonemes: PhonemeResult[], intendedPhonemes: PhonemeResult[]) => {
    const parsedIntended: ParsedPhoneme[] = intendedPhonemes
      .filter(p => p.phoneme !== null)
      .map(parsePhonemeResult);
    
    const parsedSpoken: ParsedPhoneme[] = spokenPhonemes
      .filter(p => p.phoneme !== null)
      .map(parsePhonemeResult);

    const comparisons: { 
      intended: ParsedPhoneme; 
      spoken: ParsedPhoneme | null; 
      initialMatch: boolean;
      finalMatch: boolean;
      toneMatch: boolean;
      isFullMatch: boolean;
      hasLowConfidence: boolean;
    }[] = [];

    const CONFIDENCE_THRESHOLD = 0.5;

    parsedIntended.forEach((intended, index) => {
      const spoken = parsedSpoken[index] || null;
      
      // Check if confidence is low - if so, treat as mismatch
      const hasLowConfidence = spoken?.isLowConfidence || false;
      const hasLowJyConf = spoken?.jyConf !== undefined && spoken.jyConf < CONFIDENCE_THRESHOLD;
      const hasLowToneConf = spoken?.toneConf !== undefined && spoken.toneConf < CONFIDENCE_THRESHOLD;
      
      // Initial/Final match considers jyConf, Tone match considers toneConf
      const initialMatch = spoken?.initial === intended.initial && !hasLowJyConf;
      const finalMatch = spoken?.final === intended.final && !hasLowJyConf;
      const toneMatch = spoken?.tone === intended.tone && !hasLowToneConf;
      const isFullMatch = initialMatch && finalMatch && toneMatch && !hasLowConfidence;
      
      comparisons.push({ 
        intended, 
        spoken, 
        initialMatch, 
        finalMatch, 
        toneMatch, 
        isFullMatch,
        hasLowConfidence: hasLowConfidence || hasLowJyConf || hasLowToneConf
      });
    });

    if (parsedSpoken.length > parsedIntended.length) {
      for (let i = parsedIntended.length; i < parsedSpoken.length; i++) {
        comparisons.push({
          intended: { character: '', phoneme: null, initial: null, final: null, tone: null },
          spoken: parsedSpoken[i],
          initialMatch: false,
          finalMatch: false,
          toneMatch: false,
          isFullMatch: false,
          hasLowConfidence: parsedSpoken[i].isLowConfidence || false
        });
      }
    }

    return comparisons;
  };

  const calculateAccuracies = (comparisons: ReturnType<typeof getComparisons>) => {
    const totalCount = comparisons.length;
    const correctCount = comparisons.filter(c => c.isFullMatch).length;
    const initialCorrect = comparisons.filter(c => c.initialMatch).length;
    const finalCorrect = comparisons.filter(c => c.finalMatch).length;
    const toneCorrect = comparisons.filter(c => c.toneMatch).length;

    return {
      overall: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
      initial: totalCount > 0 ? Math.round((initialCorrect / totalCount) * 100) : 0,
      final: totalCount > 0 ? Math.round((finalCorrect / totalCount) * 100) : 0,
      tone: totalCount > 0 ? Math.round((toneCorrect / totalCount) * 100) : 0,
      correctCount,
      totalCount,
      initialCorrect,
      finalCorrect,
      toneCorrect,
    };
  };

  // Save new result if from Voice Lab and user is logged in
  const handleSaveResult = async () => {
    if (!state || !user || hasSaved) return;

    const comparisons = getComparisons(state.spokenPhonemes, state.intendedPhonemes);
    const accuracies = calculateAccuracies(comparisons);

    const intendedText = state.intendedText || state.intendedPhonemes.map(p => p.character).join('');
    
    const resultId = await saveResult(
      intendedText,
      state.spokenPhonemes,
      state.intendedPhonemes,
      accuracies.overall,
      accuracies.initial,
      accuracies.final,
      accuracies.tone
    );

    if (resultId) {
      setHasSaved(true);
      toast.success("Result saved to your history!");
    }
  };

  const handleDeleteResult = async (resultId: string) => {
    await deleteResult(resultId);
    if (selectedResult?.id === resultId) {
      setSelectedResult(null);
    }
    toast.success("Result deleted");
  };

  const getMatchClass = (isMatch: boolean) => 
    isMatch 
      ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30' 
      : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';

  // Show empty state if no data
  if (!displayData && !isLoading && results.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link to="/">
            <Button variant="ghost" className="mb-8 gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("nav.backToHome")}
            </Button>
          </Link>

          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <History className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">{t("results.noResultsTitle")}</h1>
            <p className="text-muted-foreground mb-8">
              {user 
                ? t("results.noResultsAuth")
                : t("results.noResultsGuest")}
            </p>
            <Button onClick={() => navigate('/pronunciation')} size="lg" className="gap-2">
              <Mic2 className="h-5 w-5" />
              {t("results.goToVoiceLab")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Current result comparisons and accuracies
  const comparisons = displayData ? getComparisons(displayData.spokenPhonemes, displayData.intendedPhonemes) : [];
  const accuracies = calculateAccuracies(comparisons);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("nav.backToHome")}
          </Button>
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* History Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-4 sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-foreground">{t("results.history")}</h2>
                </div>
                
                {!user && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("results.signInToSave")}
                  </p>
                )}

                {isLoading ? (
                  <p className="text-sm text-muted-foreground">{t("results.loading")}</p>
                ) : results.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("results.noSavedResults")}</p>
                ) : (
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {results.map((result) => (
                      <div
                        key={result.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedResult?.id === result.id 
                            ? 'bg-primary/10 border-primary' 
                            : 'bg-muted/50 border-border hover:bg-muted'
                        }`}
                        onClick={() => setSelectedResult(result)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {result.intended_text}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(result.created_at), 'MMM d, HH:mm')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${
                              result.overall_accuracy >= 80 ? 'text-green-500' : 
                              result.overall_accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                              {result.overall_accuracy}%
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteResult(result.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full mt-4 gap-2"
                  onClick={() => navigate('/pronunciation')}
                >
                  <Mic2 className="h-4 w-4" />
                  {t("results.newAnalysis")}
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {displayData ? (
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                      {t("results.title")}
                    </h1>
                    
                    {/* Save Button for new results */}
                    {state && user && !hasSaved && !selectedResult && (
                      <Button onClick={handleSaveResult} variant="outline" className="mb-4">
                        {t("results.saveToHistory")}
                      </Button>
                    )}
                    
                    {/* Overall Accuracy */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                      <span className="text-lg font-semibold">{t("results.overallAccuracy")}:</span>
                      <span className={`text-2xl font-bold ${accuracies.overall >= 80 ? 'text-green-500' : accuracies.overall >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {accuracies.overall}%
                      </span>
                      <span className="text-muted-foreground">({accuracies.correctCount}/{accuracies.totalCount})</span>
                    </div>
                  </div>

                  {/* Component Accuracy Cards */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-xl p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">{t("results.vowels")}</p>
                      <p className={`text-2xl font-bold ${accuracies.initial === 100 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {accuracies.initial}%
                      </p>
                      <p className="text-xs text-muted-foreground">{accuracies.initialCorrect}/{accuracies.totalCount}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">{t("results.consonants")}</p>
                      <p className={`text-2xl font-bold ${accuracies.final === 100 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {accuracies.final}%
                      </p>
                      <p className="text-xs text-muted-foreground">{accuracies.finalCorrect}/{accuracies.totalCount}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">{t("results.tones")}</p>
                      <p className={`text-2xl font-bold ${accuracies.tone === 100 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {accuracies.tone}%
                      </p>
                      <p className="text-xs text-muted-foreground">{accuracies.toneCorrect}/{accuracies.totalCount}</p>
                    </div>
                  </div>

                  {/* Audio Playback Section - only for fresh results */}
                  {state && !selectedResult && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("results.yourRecording")}</h3>
                        <Button 
                          onClick={() => state.recordingUrl && new Audio(state.recordingUrl).play()} 
                          variant="outline" 
                          className="w-full gap-2"
                          disabled={!state.recordingUrl}
                        >
                          <Play className="h-4 w-4" />
                          {t("results.playYourRecording")}
                        </Button>
                      </div>

                      <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("results.correctPronunciation")}</h3>
                        <Button 
                          onClick={() => state.generatedAudioUrl && new Audio(state.generatedAudioUrl).play()} 
                          variant="outline" 
                          className="w-full gap-2"
                          disabled={!state.generatedAudioUrl}
                        >
                          <Volume2 className="h-4 w-4" />
                          {t("results.playCorrectVersion")}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Detailed Breakdown Table */}
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">{t("results.detailedBreakdown")}</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-center py-3 px-3 text-muted-foreground font-medium" colSpan={2}>{t("results.character")}</th>
                            <th className="text-center py-3 px-3 text-muted-foreground font-medium" colSpan={2}>{t("results.vowel")}</th>
                            <th className="text-center py-3 px-3 text-muted-foreground font-medium" colSpan={2}>{t("results.consonant")}</th>
                            <th className="text-center py-3 px-3 text-muted-foreground font-medium" colSpan={2}>{t("results.tone")}</th>
                            <th className="text-center py-3 px-3 text-muted-foreground font-medium">{t("results.status")}</th>
                          </tr>
                          <tr className="border-b border-border bg-muted/30">
                            <th className="py-2 px-3 text-xs text-muted-foreground font-normal">{t("results.expected")}</th>
                            <th className="py-2 px-3 text-xs text-muted-foreground font-normal">{t("results.yours")}</th>
                            <th className="py-2 px-3 text-xs text-muted-foreground font-normal">{t("results.expected")}</th>
                            <th className="py-2 px-3 text-xs text-muted-foreground font-normal">{t("results.yours")}</th>
                            <th className="py-2 px-3 text-xs text-muted-foreground font-normal">{t("results.expected")}</th>
                            <th className="py-2 px-3 text-xs text-muted-foreground font-normal">{t("results.yours")}</th>
                            <th className="py-2 px-3 text-xs text-muted-foreground font-normal">{t("results.expected")}</th>
                            <th className="py-2 px-3 text-xs text-muted-foreground font-normal">{t("results.yours")}</th>
                            <th className="py-2 px-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisons.map((comparison, index) => (
                            <tr key={index} className="border-b border-border/50 last:border-0">
                              {/* Expected Character */}
                              <td className="py-3 px-3 text-center">
                                <div className="flex flex-col items-center">
                                  <span className="text-lg font-medium text-primary">
                                    {comparison.intended.character || '-'}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {comparison.intended.phoneme || '-'}
                                  </span>
                                </div>
                              </td>
                              {/* Yours Character */}
                              <td className="py-3 px-3 text-center">
                                <div className="flex flex-col items-center">
                                  <span className={`text-lg font-medium px-2 py-0.5 rounded ${comparison.isFullMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {comparison.spoken?.character || '-'}
                                  </span>
                                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${getMatchClass(comparison.isFullMatch)}`}>
                                    {comparison.spoken?.phoneme || '-'}
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
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("results.toneLegend")}</h3>
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
                </>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Select a result from the history to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronunciationResultsPage;
