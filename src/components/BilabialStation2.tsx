import { useState, useRef } from "react";
import { ArrowRight, Volume2, Mic, Square, RotateCcw, CheckCircle2, XCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { station2Phonemes, Station2Phoneme, LessonLevel, MatchingItem } from "@/data/bilabialLessons";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import { toast } from "sonner";
import pipi from "@/assets/pipi-parrot-only.png";

// Helper to parse jyutping
function parseJyutping(jp: string): { initial: string; final: string; tone: string } {
  const toneMatch = jp.match(/(\d)$/);
  const tone = toneMatch ? toneMatch[1] : '';
  const body = jp.replace(/\d$/, '');
  const initials = ['ng','gw','kw','b','p','m','f','d','t','n','l','g','k','h','z','c','s','j','w'];
  let initial = '';
  for (const ini of initials) {
    if (body.startsWith(ini)) { initial = ini; break; }
  }
  const final = body.slice(initial.length);
  return { initial, final, tone };
}

type ExercisePhase = 'select-phoneme' | 'select-level' | 'matching' | 'record' | 'feedback' | 'complete';

interface BilabialStation2Props {
  onComplete: () => void;
  onBack: () => void;
}

export function BilabialStation2({ onComplete, onBack }: BilabialStation2Props) {
  const { processRecording, isProcessing } = usePronunciationAPI();

  const [phase, setPhase] = useState<ExercisePhase>('select-phoneme');
  const [selectedPhoneme, setSelectedPhoneme] = useState<Station2Phoneme | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LessonLevel | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [matchResult, setMatchResult] = useState<'correct' | 'wrong' | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<MatchingItem[]>([]);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Feedback state
  const [accuracy, setAccuracy] = useState(0);
  const [feedbackDetails, setFeedbackDetails] = useState<any>(null);

  // Progress tracking (per phoneme per level)
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const getProgress = () => {
    try { return JSON.parse(sessionStorage.getItem('bilabial_progress') || '{}'); }
    catch { return {}; }
  };

  const playWord = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'zh-HK';
    utterance.rate = 0.7;
    speechSynthesis.speak(utterance);
  };

  const startLevel = (phoneme: Station2Phoneme, level: LessonLevel) => {
    setSelectedPhoneme(phoneme);
    setSelectedLevel(level);
    setCurrentItemIndex(0);
    setMatchResult(null);
    prepareMatching(level, 0);
    setPhase('matching');
  };

  const prepareMatching = (level: LessonLevel, itemIdx: number) => {
    const correctItem = level.items[itemIdx];
    // Create wrong options from other items in same level or other phonemes
    const allOtherItems = station2Phonemes
      .flatMap(p => p.levels.flatMap(l => l.items))
      .filter(i => i.word !== correctItem.word);
    const shuffled = allOtherItems.sort(() => Math.random() - 0.5).slice(0, 2);
    const options = [correctItem, ...shuffled].sort(() => Math.random() - 0.5);
    setShuffledOptions(options);
    setMatchResult(null);
  };

  const handleMatch = (selected: MatchingItem) => {
    const correct = selected.word === selectedLevel!.items[currentItemIndex].word;
    setMatchResult(correct ? 'correct' : 'wrong');

    if (correct) {
      // After correct match, ask user to record
      setTimeout(() => {
        setPhase('record');
        setHasRecording(false);
        setAudioBlob(null);
        setFeedbackDetails(null);
      }, 1000);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setHasRecording(true);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast.error('無法使用麥克風');
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmitRecording = async () => {
    if (!audioBlob || !selectedLevel) return;
    const word = selectedLevel.items[currentItemIndex].word;
    const result = await processRecording(audioBlob, word);

    if (!result) return;

    const intended = result.intended.filter((p: any) => p.phoneme !== null);
    const spoken = result.spoken.filter((p: any) => p.phoneme !== null);
    let matches = 0;
    intended.forEach((p: any, i: number) => {
      if (spoken[i] && spoken[i].phoneme === p.phoneme) matches++;
    });
    const acc = intended.length > 0 ? Math.round((matches / intended.length) * 100) : 0;

    setAccuracy(acc);
    setFeedbackDetails(result);
    setPhase('feedback');

    // Save progress
    const key = `${selectedPhoneme!.phoneme}-${selectedLevel.level}-${currentItemIndex}`;
    if (acc >= 60) {
      setCompletedItems(prev => ({ ...prev, [key]: true }));
      try {
        const existing = getProgress();
        existing[key] = { completed: true, accuracy: acc };
        sessionStorage.setItem('bilabial_progress', JSON.stringify(existing));
      } catch {}
    }
  };

  const handleNextItem = () => {
    if (!selectedLevel) return;
    if (currentItemIndex + 1 < selectedLevel.items.length) {
      const nextIdx = currentItemIndex + 1;
      setCurrentItemIndex(nextIdx);
      prepareMatching(selectedLevel, nextIdx);
      setPhase('matching');
      setHasRecording(false);
      setAudioBlob(null);
      setFeedbackDetails(null);
    } else {
      // Level complete
      setPhase('select-level');
    }
  };

  const handleRetryItem = () => {
    setPhase('record');
    setHasRecording(false);
    setAudioBlob(null);
    setFeedbackDetails(null);
  };

  // Build accuracy table
  const buildAccuracyTable = () => {
    if (!feedbackDetails) return null;
    const intended = feedbackDetails.intended.filter((p: any) => p.phoneme);
    const spoken = feedbackDetails.spoken.filter((p: any) => p.phoneme);
    return intended.map((ip: any, i: number) => {
      const sp = spoken[i];
      const ep = ip.phoneme ? parseJyutping(ip.phoneme) : { initial: '', final: '', tone: '' };
      const spk = sp?.phoneme ? parseJyutping(sp.phoneme) : { initial: '', final: '', tone: '' };
      return {
        character: ip.character,
        initialMatch: ep.initial === spk.initial,
        finalMatch: ep.final === spk.final,
        toneMatch: ep.tone === spk.tone,
        expectedInitial: ep.initial, spokenInitial: spk.initial,
        expectedFinal: ep.final, spokenFinal: spk.final,
        expectedTone: ep.tone, spokenTone: spk.tone,
      };
    });
  };

  // ── Phoneme selection ──
  if (phase === 'select-phoneme') {
    const progress = getProgress();
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-4">
            ← 返回
          </button>
          <div className="text-center mb-6">
            <h1 className="text-lg font-extrabold text-foreground">🏝️ 雙唇海灘</h1>
            <p className="text-sm text-primary font-bold">第二站：單字配對大進擊</p>
          </div>
          <div className="space-y-3">
            {station2Phonemes.map((phoneme) => (
              <button
                key={phoneme.phoneme}
                onClick={() => { setSelectedPhoneme(phoneme); setPhase('select-level'); }}
                className="w-full bg-card border-2 border-border hover:border-primary/30 rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-extrabold text-foreground">{phoneme.phoneme} {phoneme.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {phoneme.levels.length} 個級別
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Level selection ──
  if (phase === 'select-level' && selectedPhoneme) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button onClick={() => setPhase('select-phoneme')} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-4">
            ← 返回
          </button>
          <div className="text-center mb-6">
            <p className="text-2xl font-extrabold text-primary">{selectedPhoneme.phoneme}</p>
            <p className="text-lg font-extrabold text-foreground">{selectedPhoneme.label}</p>
          </div>
          <div className="space-y-3">
            {selectedPhoneme.levels.map((level, li) => {
              const isLocked = li > 0; // Only level 1 unlocked for now in prototype
              return (
                <button
                  key={level.level}
                  onClick={() => !isLocked && startLevel(selectedPhoneme, level)}
                  disabled={isLocked}
                  className={`w-full bg-card border-2 rounded-2xl p-5 text-left transition-all ${
                    isLocked
                      ? 'border-muted opacity-50 cursor-not-allowed'
                      : 'border-border hover:border-primary/30 hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-extrabold text-foreground">
                        第 {level.level} 級：{level.levelLabel}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {level.items.length} 個練習
                      </p>
                    </div>
                    {isLocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Matching exercise ──
  if (phase === 'matching' && selectedLevel && selectedPhoneme) {
    const currentItem = selectedLevel.items[currentItemIndex];
    const progressPct = ((currentItemIndex + 1) / selectedLevel.items.length) * 100;

    return (
      <div className="min-h-full bg-background">
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setPhase('select-level')} className="text-sm font-bold text-muted-foreground">✕</button>
            <Progress value={progressPct} className="flex-1 h-3" />
            <span className="text-xs font-bold text-muted-foreground">{currentItemIndex + 1}/{selectedLevel.items.length}</span>
          </div>

          {/* Pipi prompt */}
          <div className="flex items-start gap-3 mb-6">
            <img src={pipi} alt="皮皮" className="h-14 w-14 object-contain shrink-0" loading="lazy" width={512} height={512} />
            <div className="bg-card border-2 border-primary/20 rounded-2xl rounded-bl-sm px-4 py-3">
              <p className="text-sm font-bold text-foreground">{selectedLevel.prompt}</p>
            </div>
          </div>

          {/* Play button for reference */}
          <div className="text-center mb-6">
            <Button
              onClick={() => playWord(currentItem.word)}
              className="gap-2 h-14 px-8 rounded-2xl text-lg font-extrabold game-btn"
              style={{ boxShadow: '0 4px 0 hsl(var(--primary-dark))' }}
            >
              <Volume2 className="h-5 w-5" />
              播放讀音
            </Button>
          </div>

          {/* Matching options */}
          <div className="space-y-3">
            {shuffledOptions.map((opt) => {
              const isCorrect = opt.word === currentItem.word;
              const showResult = matchResult !== null;
              return (
                <button
                  key={opt.word}
                  onClick={() => !matchResult && handleMatch(opt)}
                  disabled={!!matchResult}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                    showResult && isCorrect
                      ? 'bg-success/10 border-success'
                      : showResult && !isCorrect && matchResult === 'wrong'
                        ? 'bg-destructive/10 border-destructive'
                        : 'bg-card border-border hover:border-primary/30'
                  }`}
                >
                  <span className="text-3xl">{opt.image}</span>
                  <span className="text-xl font-extrabold text-foreground">{opt.word}</span>
                  {showResult && isCorrect && <CheckCircle2 className="h-6 w-6 text-success ml-auto" />}
                  {showResult && !isCorrect && matchResult === 'wrong' && <XCircle className="h-6 w-6 text-destructive ml-auto" />}
                </button>
              );
            })}
          </div>

          {matchResult === 'wrong' && (
            <div className="mt-4">
              <div className="bg-destructive/5 border-2 border-destructive/20 rounded-2xl p-4 mb-3">
                <div className="flex items-start gap-2">
                  <img src={pipi} alt="" className="h-10 w-10 object-contain shrink-0" loading="lazy" width={512} height={512} />
                  <p className="text-sm text-foreground">
                    你 {selectedPhoneme.label} 讀咗另一個音喎，試下再聽多次？
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setMatchResult(null);
                  prepareMatching(selectedLevel, currentItemIndex);
                }}
                variant="outline"
                className="w-full gap-2 rounded-2xl"
              >
                <RotateCcw className="h-4 w-4" />
                再試一次
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Record phase ──
  if (phase === 'record' && selectedLevel) {
    const currentItem = selectedLevel.items[currentItemIndex];
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-start gap-3 mb-6">
            <img src={pipi} alt="皮皮" className="h-14 w-14 object-contain shrink-0" loading="lazy" width={512} height={512} />
            <div className="bg-card border-2 border-success/20 rounded-2xl rounded-bl-sm px-4 py-3">
              <p className="text-sm font-bold text-foreground">
                配對正確！✅ 而家跟住讀一次「{currentItem.word}」
              </p>
            </div>
          </div>

          <div className="text-center mb-6">
            <span className="text-5xl mb-2 block">{currentItem.image}</span>
            <p className="text-3xl font-extrabold text-foreground">{currentItem.word}</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-destructive animate-pulse shadow-lg'
                  : 'bg-primary hover:bg-primary/90 shadow-md game-btn'
              }`}
              style={!isRecording ? { boxShadow: '0 5px 0 hsl(var(--primary-dark))' } : {}}
            >
              {isRecording ? (
                <Square className="h-8 w-8 text-primary-foreground" />
              ) : (
                <Mic className="h-10 w-10 text-primary-foreground" />
              )}
            </button>
            <p className="text-sm text-muted-foreground font-bold">
              {isRecording ? '🔴 錄音中...' : hasRecording ? '✅ 錄音完成！' : '點擊開始錄音'}
            </p>

            {hasRecording && (
              <Button
                onClick={handleSubmitRecording}
                disabled={isProcessing}
                className="w-full h-14 text-lg font-extrabold rounded-2xl game-btn gap-2"
                style={{ boxShadow: '0 5px 0 hsl(var(--primary-dark))' }}
              >
                {isProcessing ? '分析中...' : '提交'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Feedback phase ──
  if (phase === 'feedback' && selectedLevel) {
    const currentItem = selectedLevel.items[currentItemIndex];
    const passed = accuracy >= 60;
    const tableData = buildAccuracyTable();

    return (
      <div className="min-h-full bg-background">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex flex-col items-center text-center gap-4">
            {/* Score circle */}
            <div className={`w-28 h-28 rounded-full flex items-center justify-center ${
              passed ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              <span className="text-3xl font-extrabold" style={{ color: passed ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
                {accuracy}%
              </span>
            </div>

            <div className="flex items-start gap-3">
              <img src={pipi} alt="" className="h-12 w-12 object-contain shrink-0" loading="lazy" width={512} height={512} />
              <div className="bg-card border-2 border-border rounded-2xl rounded-bl-sm px-4 py-3 text-left">
                <p className="text-sm font-bold text-foreground">
                  {passed
                    ? `做得好！「${currentItem.word}」讀得好準確！`
                    : `加油！留意「${currentItem.word}」嘅發音位置，再試多次！`
                  }
                </p>
              </div>
            </div>

            {/* Accuracy table */}
            {tableData && tableData.length > 0 && (
              <div className="w-full bg-card border-2 border-border rounded-2xl p-4 text-left overflow-x-auto">
                <h4 className="text-xs font-bold text-muted-foreground mb-3">📊 逐字準確度分析</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-2 text-left font-bold text-muted-foreground">字</th>
                      <th className="py-2 px-2 text-center font-bold text-muted-foreground">聲母</th>
                      <th className="py-2 px-2 text-center font-bold text-muted-foreground">韻母</th>
                      <th className="py-2 px-2 text-center font-bold text-muted-foreground">聲調</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row: any, i: number) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 px-2 font-extrabold text-foreground text-base">{row.character}</td>
                        <td className="py-2 px-2 text-center">
                          <div className={`inline-flex flex-col items-center px-2 py-1 rounded-lg ${row.initialMatch ? 'bg-success/10' : 'bg-destructive/10'}`}>
                            <span className={`font-bold ${row.initialMatch ? 'text-success' : 'text-destructive'}`}>
                              {row.spokenInitial || '—'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">目標：{row.expectedInitial || '—'}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className={`inline-flex flex-col items-center px-2 py-1 rounded-lg ${row.finalMatch ? 'bg-success/10' : 'bg-destructive/10'}`}>
                            <span className={`font-bold ${row.finalMatch ? 'text-success' : 'text-destructive'}`}>
                              {row.spokenFinal || '—'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">目標：{row.expectedFinal || '—'}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className={`inline-flex flex-col items-center px-2 py-1 rounded-lg ${row.toneMatch ? 'bg-success/10' : 'bg-destructive/10'}`}>
                            <span className={`font-bold ${row.toneMatch ? 'text-success' : 'text-destructive'}`}>
                              {row.spokenTone || '—'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">目標：{row.expectedTone || '—'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Accuracy bar */}
            <div className="w-full bg-card border-2 border-border rounded-2xl p-4 text-left">
              <h4 className="text-xs font-bold text-muted-foreground mb-2">準確度</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${passed ? 'bg-success' : 'bg-destructive'}`}
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
                <span className="text-sm font-extrabold text-foreground">{accuracy}%</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 w-full">
              <Button
                onClick={handleRetryItem}
                variant="outline"
                className="flex-1 h-14 text-lg font-bold rounded-2xl gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                重試
              </Button>
              <Button
                onClick={handleNextItem}
                className="flex-1 h-14 text-lg font-extrabold rounded-2xl game-btn gap-2"
                style={{ boxShadow: '0 5px 0 hsl(var(--primary-dark))' }}
              >
                {currentItemIndex + 1 < selectedLevel.items.length ? '下一個' : '完成'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
