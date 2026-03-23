import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Mic, Square, CheckCircle2, XCircle, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getLessonById } from "@/data/lessons";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { useStreak } from "@/hooks/useStreak";
import { toast } from "sonner";

type LessonStep = 'listen' | 'perception' | 'production' | 'feedback';

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const lesson = getLessonById(lessonId || '');
  const { processRecording, isProcessing } = usePronunciationAPI();
  const { recordResult } = useLessonProgress();
  const { recordActivity } = useStreak();

  const [step, setStep] = useState<LessonStep>('listen');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [perceptionCorrect, setPerceptionCorrect] = useState<boolean | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Feedback state
  const [accuracy, setAccuracy] = useState<number>(0);
  const [passed, setPassed] = useState(false);
  const [feedbackDetails, setFeedbackDetails] = useState<any>(null);

  if (!lesson) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Lesson not found</p>
      </div>
    );
  }

  const stepIndex = ['listen', 'perception', 'production', 'feedback'].indexOf(step);
  const progressPct = ((stepIndex + 1) / 4) * 100;

  const handlePlaySound = () => {
    // Use speech synthesis for demo (the real API would generate audio)
    const utterance = new SpeechSynthesisUtterance(lesson.exampleWord);
    utterance.lang = 'zh-HK';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const handlePerceptionSelect = (text: string) => {
    setSelectedOption(text);
    const correct = lesson.perceptionOptions.find(o => o.text === text)?.correct || false;
    setPerceptionCorrect(correct);
    // Auto-advance after a delay
    setTimeout(() => {
      if (correct) {
        setStep('production');
        setSelectedOption(null);
        setPerceptionCorrect(null);
      }
    }, 1200);
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
    if (!audioBlob) return;

    const result = await processRecording(audioBlob, lesson.productionText);
    if (!result) return;

    // Calculate accuracy from spoken vs intended phonemes
    const intended = result.intended.filter(p => p.phoneme !== null);
    const spoken = result.spoken.filter(p => p.phoneme !== null);
    let matches = 0;
    intended.forEach((p, i) => {
      if (spoken[i] && spoken[i].phoneme === p.phoneme) matches++;
    });
    const acc = intended.length > 0 ? Math.round((matches / intended.length) * 100) : 0;

    setAccuracy(acc);
    setPassed(acc >= 70);
    setFeedbackDetails(result);
    setStep('feedback');

    // Record result
    if (acc >= 70) {
      await recordResult(lesson.id, acc, lesson.xpReward);
      await recordActivity();
    }
  };

  const handleRetry = () => {
    setStep('listen');
    setHasRecording(false);
    setAudioBlob(null);
    setAccuracy(0);
    setPassed(false);
    setFeedbackDetails(null);
    setSelectedOption(null);
    setPerceptionCorrect(null);
  };

  return (
    <div className="min-h-full bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-card border-b-2 border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <Progress value={progressPct} className="flex-1 h-3 rounded-full" />
          <span className="text-xs font-bold text-muted-foreground">{stepIndex + 1}/4</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step 1: Listen */}
        {step === 'listen' && (
          <div className="flex flex-col items-center text-center gap-6">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">第一步：聆聽</h2>
            <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 w-full">
              <p className="text-sm text-muted-foreground mb-2">目標音素</p>
              <p className="text-5xl font-extrabold text-primary mb-4">{lesson.targetPhoneme}</p>
              <p className="text-xl font-bold text-foreground mb-1">{lesson.exampleWord}</p>
              <p className="text-sm text-muted-foreground mb-4">{lesson.exampleWordEn}</p>

              <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs font-bold text-muted-foreground mb-1">發音提示</p>
                <p className="text-sm text-foreground">{lesson.articulationInstructionZh}</p>
              </div>

              <Button
                onClick={handlePlaySound}
                className="gap-2 h-14 px-8 rounded-2xl text-lg font-extrabold game-btn"
                style={{ boxShadow: '0 4px 0 hsl(var(--primary-dark))' }}
              >
                <Volume2 className="h-5 w-5" />
                播放聲音
              </Button>
            </div>

            <Button
              onClick={() => setStep('perception')}
              className="w-full h-14 text-lg font-extrabold rounded-2xl game-btn gap-2"
              style={{ boxShadow: '0 5px 0 hsl(var(--primary-dark))' }}
            >
              下一步
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Perception (match) */}
        {step === 'perception' && (
          <div className="flex flex-col items-center text-center gap-6">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">第二步：辨認</h2>
            <p className="text-xl font-extrabold text-foreground">
              邊個詞語包含 {lesson.targetPhoneme}？
            </p>

            <div className="w-full space-y-3">
              {lesson.perceptionOptions.map((opt) => {
                const isSelected = selectedOption === opt.text;
                const showResult = isSelected && perceptionCorrect !== null;

                return (
                  <button
                    key={opt.text}
                    onClick={() => !selectedOption && handlePerceptionSelect(opt.text)}
                    disabled={!!selectedOption}
                    className={`w-full p-5 rounded-2xl border-2 text-xl font-extrabold transition-all ${
                      showResult && opt.correct
                        ? 'bg-success/10 border-success text-success'
                        : showResult && !opt.correct
                        ? 'bg-destructive/10 border-destructive text-destructive'
                        : 'bg-card border-border hover:border-primary/30 hover:-translate-y-0.5 text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt.text}</span>
                      {showResult && opt.correct && <CheckCircle2 className="h-6 w-6 text-success" />}
                      {showResult && isSelected && !opt.correct && <XCircle className="h-6 w-6 text-destructive" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {perceptionCorrect === false && (
              <Button
                onClick={() => { setSelectedOption(null); setPerceptionCorrect(null); }}
                variant="outline"
                className="gap-2 rounded-2xl"
              >
                <RotateCcw className="h-4 w-4" />
                再試一次
              </Button>
            )}
          </div>
        )}

        {/* Step 3: Production (record) */}
        {step === 'production' && (
          <div className="flex flex-col items-center text-center gap-6">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">第三步：發音</h2>

            <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 w-full">
              <p className="text-sm text-muted-foreground mb-2">請讀出</p>
              <p className="text-4xl font-extrabold text-foreground mb-4">{lesson.productionText}</p>
              <p className="text-sm text-muted-foreground">
                {lesson.articulationInstructionZh}
              </p>
            </div>

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
        )}

        {/* Step 4: Feedback */}
        {step === 'feedback' && (
          <div className="flex flex-col items-center text-center gap-6">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">第四步：反饋</h2>

            {/* 準確度 */}
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
              passed ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              <span className="text-4xl font-extrabold" style={{ color: passed ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
                {accuracy}%
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-foreground mb-1">
                {passed ? '🎉 太棒了！' : '💪 再試一次！'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {passed
                  ? `+${lesson.xpReward} XP！課程已完成。`
                  : `需要 70% 才能通過。你獲得了 ${accuracy}%。`
                }
              </p>
            </div>

            {/* AI Feedback Details */}
            {feedbackDetails && (
              <div className="w-full space-y-3">
                {/* 識別結果 */}
                <div className="bg-card border-2 border-border rounded-2xl p-4 text-left">
                  <h4 className="text-xs font-bold text-muted-foreground mb-2">識別結果</h4>
                  <div className="flex flex-wrap gap-1">
                    {feedbackDetails.spoken.filter((p: any) => p.phoneme).map((p: any, i: number) => (
                      <span key={i} className={`px-2 py-1 rounded text-xs font-bold ${
                        p.isLowConfidence ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                      }`}>
                        {p.character}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 拼音 */}
                <div className="bg-card border-2 border-border rounded-2xl p-4 text-left">
                  <h4 className="text-xs font-bold text-muted-foreground mb-2">拼音</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground mb-1">目標</p>
                      <div className="flex flex-wrap gap-1">
                        {feedbackDetails.intended.filter((p: any) => p.phoneme).map((p: any, i: number) => (
                          <span key={i} className="px-2 py-1 bg-muted rounded text-xs font-bold">
                            {p.character} ({p.phoneme})
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground mb-1">你的發音</p>
                      <div className="flex flex-wrap gap-1">
                        {feedbackDetails.spoken.filter((p: any) => p.phoneme).map((p: any, i: number) => (
                          <span key={i} className={`px-2 py-1 rounded text-xs font-bold ${
                            p.isLowConfidence ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                          }`}>
                            {p.character} ({p.phoneme})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 準確度 */}
                <div className="bg-card border-2 border-border rounded-2xl p-4 text-left">
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

                {/* 建議 */}
                <div className="bg-card border-2 border-border rounded-2xl p-4 text-left">
                  <h4 className="text-xs font-bold text-muted-foreground mb-2">建議</h4>
                  <p className="text-sm text-foreground">
                    {passed
                      ? '做得好！繼續保持，嘗試下一課練習。'
                      : `留意 ${lesson.targetPhoneme} 的發音位置。${lesson.articulationInstructionZh}。多練習幾次就會進步！`
                    }
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="flex-1 h-14 text-lg font-bold rounded-2xl gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                重試
              </Button>
              {passed && (
                <Button
                  onClick={() => navigate(-1)}
                  className="flex-1 h-14 text-lg font-extrabold rounded-2xl game-btn gap-2"
                  style={{ boxShadow: '0 5px 0 hsl(var(--primary-dark))' }}
                >
                  繼續
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
