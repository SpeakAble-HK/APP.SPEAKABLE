import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Mic, 
  Upload, 
  Play, 
  Pause, 
  ChevronRight, 
  Volume2,
  Target,
  Flame,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { usePracticeSession, QuestionResult } from "@/hooks/usePracticeSession";
import { usePronunciationResults } from "@/hooks/usePronunciationResults";
import { getTodaysTopic, getTopicTitle, getTopicDescription, PracticeTopic } from "@/data/practiceTopics";
import { toast } from "sonner";

const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/m4a'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type PracticeStep = 'language' | 'practice' | 'feedback' | 'summary';

const PracticePage = () => {
  const navigate = useNavigate();
  const { t, t3, language } = useLanguage();
  const { user } = useAuth();
  const { stats } = useUserStats();
  const { saveResult } = usePronunciationResults();
  
  const [step, setStep] = useState<PracticeStep>('language');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('yue'); // Cantonese default
  const [topic] = useState<PracticeTopic>(getTodaysTopic());
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const recordingIntervalRef = useRef<number | null>(null);

  const {
    sessionState,
    currentResult,
    isProcessing,
    getCurrentWord,
    analyzeRecording,
    confirmAndNext,
    getSummaryStats,
    resetSession,
  } = usePracticeSession(topic);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      recordingStartTimeRef.current = Date.now();
      setAudioDuration(0);
      recordingIntervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
        setAudioDuration(elapsed);
      }, 100);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        const finalDuration = (Date.now() - recordingStartTimeRef.current) / 1000;
        setAudioDuration(finalDuration);

        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        setAudioBlob(blob);
        setHasRecording(true);
        setUploadedFileName(null);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Failed to access microphone");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AUDIO_TYPES.includes(file.type) && !file.name.endsWith('.mp3')) {
      toast.error("Invalid audio format. Supported formats: MP3, WAV, WebM, OGG, M4A");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setRecordingUrl(url);
    setAudioBlob(file);
    setHasRecording(true);
    setUploadedFileName(file.name);
    
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });
    
    toast.success(`Uploaded: ${file.name}`);
  };

  const handlePlayRecording = () => {
    if (!recordingUrl) return;
    
    if (isPlaying && audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(recordingUrl);
    audioElementRef.current = audio;
    
    audio.addEventListener('timeupdate', () => {
      if (audio.duration > 0) {
        setPlaybackProgress((audio.currentTime / audio.duration) * 100);
      }
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
    });
    
    audio.play();
    setIsPlaying(true);
  };

  const handleAnalyze = async () => {
    if (!audioBlob || !recordingUrl) {
      toast.error("Please record or upload your voice first");
      return;
    }

    const result = await analyzeRecording(audioBlob, recordingUrl);
    if (result) {
      setStep('feedback');
      toast.success("Analysis complete!");
    } else {
      toast.error("Analysis failed. Please try again.");
    }
  };

  const handleNextQuestion = () => {
    confirmAndNext();
    
    // Reset recording state
    setHasRecording(false);
    setAudioBlob(null);
    setRecordingUrl(null);
    setUploadedFileName(null);
    setAudioDuration(0);
    setPlaybackProgress(0);

    if (sessionState.currentQuestionIndex + 1 >= sessionState.totalQuestions) {
      setStep('summary');
    } else {
      setStep('practice');
    }
  };

  const handleStartPractice = () => {
    setStep('practice');
  };

  const handleRestartPractice = () => {
    resetSession();
    setHasRecording(false);
    setAudioBlob(null);
    setRecordingUrl(null);
    setUploadedFileName(null);
    setAudioDuration(0);
    setStep('language');
  };

  const handleSaveSummary = async () => {
    if (!user) {
      toast.error("Sign in to save your progress");
      return;
    }

    const summaryStats = getSummaryStats();
    
    // Save aggregate result to pronunciation_results
    const allSpoken = sessionState.results.flatMap(r => r.spokenPhonemes);
    const allIntended = sessionState.results.flatMap(r => r.intendedPhonemes);
    const intendedText = sessionState.results.map(r => r.word.character).join('');
    
    await saveResult(
      intendedText,
      allSpoken,
      allIntended,
      summaryStats.avgOverall,
      summaryStats.avgVowel,
      summaryStats.avgConsonant,
      summaryStats.avgTone
    );
    
    toast.success("Practice session saved!");
    navigate('/');
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-500';
    if (accuracy >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-500/10 border-green-500/30';
    if (accuracy >= 50) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  // Language Selection Step
  if (step === 'language') {
    return (
      <div className="hero-gradient min-h-full">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Back Button */}
          <Link to="/">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("nav.backToHome")}
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                {t3('Practice Mode', '練習模式', '练习模式')}
                <BookOpen className="h-6 w-6 text-primary" />
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>{t3('Streak:', '連續:', '连续:')} {stats.streak_days} {t3('days', '天', '天')}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  <span>{t3("Today's goal: 10 drills", '今日目標：10題', '今日目标：10题')}</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground">
              {t3(
                'Complete 10 pronunciation drills to improve your skills.',
                '完成10道發音練習以提升您的技能。',
                '完成10道发音练习以提升您的技能。'
              )}
            </p>
          </div>

          {/* Today's Topic Card */}
          <Card className="card-shadow mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {t3("Today's Focus", '今日主題', '今日主题')}
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-foreground">
                    {getTopicTitle(topic, language)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {getTopicDescription(topic, language)}
              </p>
              <div className="flex flex-wrap gap-2">
                {topic.focusPhonemes.map((phoneme) => (
                  <span
                    key={phoneme}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    /{phoneme}/
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Language Selection */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>
                {t3('Select Practice Language', '選擇練習語言', '选择练习语言')}
              </CardTitle>
              <CardDescription>
                {t3(
                  'Choose the language you want to practice',
                  '選擇您想練習的語言',
                  '选择您想练习的语言'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedLanguage('yue')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedLanguage === 'yue'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-2">🇭🇰</div>
                  <div className="font-semibold">
                    {t3('Cantonese', '粵語', '粤语')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t3('Hong Kong Cantonese', '香港粵語', '香港粤语')}
                  </div>
                </button>
                <button
                  disabled
                  className="p-4 rounded-xl border-2 border-border opacity-50 cursor-not-allowed text-left"
                >
                  <div className="text-2xl mb-2">🇬🇧</div>
                  <div className="font-semibold">
                    {t3('English', '英語', '英语')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t3('Coming soon', '即將推出', '即将推出')}
                  </div>
                </button>
              </div>

              <Button onClick={handleStartPractice} className="w-full gap-2" size="lg">
                {t3('Start Practice', '開始練習', '开始练习')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Practice Step
  if (step === 'practice') {
    const currentWord = getCurrentWord();
    const progress = ((sessionState.currentQuestionIndex) / sessionState.totalQuestions) * 100;

    return (
      <div className="hero-gradient min-h-full">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
          {/* Progress Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {t3('Question', '題目', '题目')} {sessionState.currentQuestionIndex + 1} / {sessionState.totalQuestions}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Topic Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {t3("Today's Focus:", '今日主題：', '今日主题：')} {getTopicTitle(topic, language)}
            </span>
          </div>

          {/* Word Card */}
          <Card className="card-shadow mb-6">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="text-6xl md:text-8xl font-bold mb-4">
                {currentWord.character}
              </div>
              <div className="text-xl text-primary font-mono mb-2">
                {currentWord.jyutping}
              </div>
              <div className="text-muted-foreground">
                {currentWord.meaning}
              </div>
            </CardContent>
          </Card>

          {/* Recording Section */}
          <Card className="card-shadow mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {t3('Record Your Pronunciation', '錄製您的發音', '录制您的发音')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="record" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="record" className="gap-2">
                    <Mic className="h-4 w-4" />
                    {t3('Record', '錄音', '录音')}
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-2">
                    <Upload className="h-4 w-4" />
                    {language === 'en-GB' ? 'Upload' : '上傳'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="record" className="space-y-4">
                  <div className="flex justify-center">
                    <button
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      className={`h-20 w-20 rounded-full flex items-center justify-center transition-all ${
                        isRecording
                      ? 'bg-destructive animate-pulse'
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  <Mic className="h-8 w-8 text-primary-foreground" />
                    </button>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    {isRecording 
                      ? (language === 'en-GB' ? 'Recording... Tap to stop' : '錄音中... 點擊停止')
                      : (language === 'en-GB' ? 'Tap to start recording' : '點擊開始錄音')}
                  </p>
                </TabsContent>

                <TabsContent value="upload">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="audio/*"
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadedFileName || (language === 'en-GB' ? 'Choose Audio File' : '選擇音頻文件')}
                  </Button>
                </TabsContent>
              </Tabs>

              {/* Audio Preview */}
              {hasRecording && (
                <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePlayRecording}
                      className="h-10 w-10 rounded-full bg-primary flex items-center justify-center"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4 text-white" />
                      ) : (
                        <Play className="h-4 w-4 text-white ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <Progress value={playbackProgress} className="h-2" />
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">
                      {formatDuration(audioDuration)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!hasRecording || isProcessing}
            className="w-full gap-2"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {language === 'en-GB' ? 'Analyzing...' : '分析中...'}
              </>
            ) : (
              <>
                {language === 'en-GB' ? 'Analyze Pronunciation' : '分析發音'}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Feedback Step
  if (step === 'feedback' && currentResult) {
    const progress = ((sessionState.currentQuestionIndex + 1) / sessionState.totalQuestions) * 100;

    return (
      <div className="hero-gradient min-h-full">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
          {/* Progress Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {language === 'en-GB' ? 'Question' : '題目'} {sessionState.currentQuestionIndex + 1} / {sessionState.totalQuestions}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Result Card */}
          <Card className="card-shadow mb-6">
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold mb-2">
                {currentResult.word.character}
              </div>
              <div className="text-lg text-primary font-mono mb-4">
                {currentResult.word.jyutping}
              </div>

              {/* Overall Accuracy */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getAccuracyBg(currentResult.overallAccuracy)}`}>
                {currentResult.overallAccuracy >= 80 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-2xl font-bold ${getAccuracyColor(currentResult.overallAccuracy)}`}>
                  {currentResult.overallAccuracy}%
                </span>
                <span className="text-muted-foreground">
                  {language === 'en-GB' ? 'Accuracy' : '準確度'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Component Accuracy */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="card-shadow">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'en-GB' ? 'Vowels' : '元音'}
                </p>
                <p className={`text-xl font-bold ${getAccuracyColor(currentResult.vowelAccuracy)}`}>
                  {currentResult.vowelAccuracy}%
                </p>
              </CardContent>
            </Card>
            <Card className="card-shadow">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'en-GB' ? 'Consonants' : '輔音'}
                </p>
                <p className={`text-xl font-bold ${getAccuracyColor(currentResult.consonantAccuracy)}`}>
                  {currentResult.consonantAccuracy}%
                </p>
              </CardContent>
            </Card>
            <Card className="card-shadow">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'en-GB' ? 'Tones' : '聲調'}
                </p>
                <p className={`text-xl font-bold ${getAccuracyColor(currentResult.toneAccuracy)}`}>
                  {currentResult.toneAccuracy}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Audio Playback */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => currentResult.recordingUrl && new Audio(currentResult.recordingUrl).play()}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {language === 'en-GB' ? 'Play Mine' : '播放我的'}
            </Button>
            <Button
              variant="outline"
              onClick={() => currentResult.generatedAudioUrl && new Audio(currentResult.generatedAudioUrl).play()}
              className="gap-2"
            >
              <Volume2 className="h-4 w-4" />
              {language === 'en-GB' ? 'Play Model' : '播放示範'}
            </Button>
          </div>

          {/* Next Button */}
          <Button onClick={handleNextQuestion} className="w-full gap-2" size="lg">
            {sessionState.currentQuestionIndex + 1 >= sessionState.totalQuestions
              ? (language === 'en-GB' ? 'View Summary' : '查看總結')
              : (language === 'en-GB' ? 'Next Question' : '下一題')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Summary Step
  if (step === 'summary') {
    const summaryStats = getSummaryStats();

    return (
      <div className="hero-gradient min-h-full">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
          {/* Celebration Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {language === 'en-GB' ? 'Practice Complete!' : '練習完成！'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en-GB' 
                ? `You've completed today's ${getTopicTitle(topic, language)} practice`
                : `您已完成今日的 ${getTopicTitle(topic, language)} 練習`}
            </p>
          </div>

          {/* Overall Score Card */}
          <Card className="card-shadow mb-6">
            <CardContent className="pt-8 pb-8 text-center">
              <div className={`text-6xl font-bold mb-2 ${getAccuracyColor(summaryStats.avgOverall)}`}>
                {summaryStats.avgOverall}%
              </div>
              <p className="text-muted-foreground">
                {language === 'en-GB' ? 'Overall Accuracy' : '整體準確度'}
              </p>
            </CardContent>
          </Card>

          {/* Component Breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="card-shadow">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'en-GB' ? 'Vowels' : '元音'}
                </p>
                <p className={`text-2xl font-bold ${getAccuracyColor(summaryStats.avgVowel)}`}>
                  {summaryStats.avgVowel}%
                </p>
              </CardContent>
            </Card>
            <Card className="card-shadow">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'en-GB' ? 'Consonants' : '輔音'}
                </p>
                <p className={`text-2xl font-bold ${getAccuracyColor(summaryStats.avgConsonant)}`}>
                  {summaryStats.avgConsonant}%
                </p>
              </CardContent>
            </Card>
            <Card className="card-shadow">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'en-GB' ? 'Tones' : '聲調'}
                </p>
                <p className={`text-2xl font-bold ${getAccuracyColor(summaryStats.avgTone)}`}>
                  {summaryStats.avgTone}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Question Results List */}
          <Card className="card-shadow mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'en-GB' ? 'Question Breakdown' : '題目明細'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessionState.results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className="text-lg font-medium">
                        {result.word.character}
                      </span>
                      <span className="text-sm text-primary font-mono">
                        {result.word.jyutping}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getAccuracyColor(result.overallAccuracy)}`}>
                        {result.overallAccuracy}%
                      </span>
                      {result.overallAccuracy >= 80 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            {user && (
              <Button onClick={handleSaveSummary} className="w-full gap-2" size="lg">
                <CheckCircle className="h-4 w-4" />
                {language === 'en-GB' ? 'Save & Return to Dashboard' : '保存並返回儀表板'}
              </Button>
            )}
            <Button
              onClick={handleRestartPractice}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <RotateCcw className="h-4 w-4" />
              {language === 'en-GB' ? 'Practice Again' : '再次練習'}
            </Button>
            {!user && (
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full"
              >
                {language === 'en-GB' ? 'Return to Dashboard' : '返回儀表板'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PracticePage;
