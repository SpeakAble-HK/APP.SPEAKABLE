import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, Square, Play, Sparkles, Loader2, Upload, X, BarChart3, BookOpen, ArrowRight, AudioLines, Headphones, Swords, Shield, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { ToneContourVisualizer } from "@/components/ToneContourVisualizer";
import { PrecisionPractice } from "@/components/PrecisionPractice";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useGuestTrial } from "@/hooks/useGuestTrial";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TrialLimitModal } from "@/components/TrialLimitModal";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const Index = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isAuthenticated = !!user && !user.is_anonymous;
  const { ensureGuestSession, showTrialModal, setShowTrialModal, markTrialUsed, isLocked } = useGuestTrial(isAuthenticated);
  const scrollRef = useScrollReveal();

  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioSource, setAudioSource] = useState<'record' | 'upload'>('record');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const { processRecording, isProcessing, error } = usePronunciationAPI();

  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();
      setAudioDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
        setAudioDuration(elapsed);
      }, 100);

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
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
        setAudioStream(null);
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
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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
    audio.addEventListener('loadedmetadata', () => setAudioDuration(audio.duration));
    toast.success(`Uploaded: ${file.name}`);
  };

  const handleClearAudio = () => {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingUrl(null);
    setAudioBlob(null);
    setHasRecording(false);
    setUploadedFileName(null);
    setAudioDuration(0);
    setPlaybackProgress(0);
    setIsPlaying(false);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProcessRecording = async () => {
    if (!audioBlob || !spokenText.trim()) {
      toast.error(isEn ? "Please provide audio and enter the text you're speaking" : "請提供音頻並輸入您正在說的文字");
      return;
    }
    if (isLocked) {
      setShowTrialModal(true);
      return;
    }
    if (!isAuthenticated) {
      await ensureGuestSession();
    }
    const result = await processRecording(audioBlob, spokenText);
    if (result && 'trialExhausted' in result && result.trialExhausted) {
      markTrialUsed();
      return;
    }
    if (result && 'spoken' in result) {
      toast.success(isEn ? "Processing complete!" : "處理完成！");
      const contentType = result.clone.content_type || 'audio/wav';
      const generatedAudioUrl = `data:${contentType};base64,${result.clone.audio_base64}`;
      navigate('/pronunciation/results', {
        state: {
          spokenPhonemes: result.spoken,
          intendedPhonemes: result.intended,
          generatedAudioUrl,
          recordingUrl,
          intendedText: spokenText.trim()
        }
      });
    } else if (error) {
      toast.error(error);
    }
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
      if (audio.duration > 0) setPlaybackProgress((audio.currentTime / audio.duration) * 100);
    });
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
    });
    audio.play();
    setIsPlaying(true);
  };

  const slogan = isEn
    ? "AI-Powered Cantonese Speech Articulation"
    : isTW ? "AI 驅動的廣東話語音發音" : "AI 驱动的广东话语音发音";
  const subSlogan = isEn
    ? "Learning from your own voice."
    : isTW ? "從你自己的聲音中學習。" : "从你自己的声音中学习。";

  const features = [
    {
      icon: AudioLines,
      title: isEn ? "Real-time Feedback" : isTW ? "即時反饋" : "即时反馈",
      desc: isEn ? "Phoneme-level accuracy scoring with instant analysis" : isTW ? "音素級準確度評分和即時分析" : "音素级准确度评分和即时分析",
      link: "/",
      span: "col-span-1",
    },
    {
      icon: Headphones,
      title: isEn ? "Echo Speech" : isTW ? "迴聲語音" : "回声语音",
      desc: isEn ? "AI-generated correct pronunciation to compare with yours" : isTW ? "AI 生成的正確發音與您的比較" : "AI 生成的正确发音与您的比较",
      link: "/",
      span: "col-span-1",
      featured: true,
    },
    {
      icon: Swords,
      title: isEn ? "Speech Quest" : isTW ? "語音冒險" : "语音冒险",
      desc: isEn ? "Gamified learning with quests and progression" : isTW ? "遊戲化學習，包含任務和進度" : "游戏化学习，包含任务和进度",
      link: "/speech-quest",
      span: "col-span-1",
    },
    {
      icon: BookOpen,
      title: isEn ? "IPA Learning" : isTW ? "國際音標學習" : "国际音标学习",
      desc: isEn ? "Interactive guides to master the phonetic alphabet" : isTW ? "互動指南掌握音標" : "互动指南掌握音标",
      link: "/learning/library",
      span: "col-span-1",
    },
    {
      icon: BarChart3,
      title: isEn ? "Progress Tracking" : isTW ? "進度追蹤" : "进度追踪",
      desc: isEn ? "Detailed analytics of your improvement over time" : isTW ? "詳細分析您的進步" : "详细分析您的进步",
      link: "/learning/progress",
      span: "col-span-1",
    },
    {
      icon: Shield,
      title: isEn ? "Accessibility First" : isTW ? "無障礙優先" : "无障碍优先",
      desc: isEn ? "WCAG 2.1 AA compliant with full keyboard navigation" : isTW ? "符合 WCAG 2.1 AA 標準" : "符合 WCAG 2.1 AA 标准",
      link: "/about",
      span: "col-span-1",
    },
  ];

  return (
    <div className="min-h-full bg-background" ref={scrollRef}>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,hsl(185_100%_50%/0.08)_0%,transparent_70%)] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="scroll-reveal">
            <img src={logo} alt="SpeakAble HK Logo" className="h-16 w-16 mx-auto object-contain mb-6 drop-shadow-[0_0_20px_hsl(185_100%_50%/0.3)]" />
            <h1 className="text-5xl md:text-[64px] font-bold text-foreground tracking-tight leading-[1.1] glow-text">
              {slogan}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mt-4 max-w-xl mx-auto">
              {subSlogan}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content — Bento Grid */}
      <section className="px-4 pb-12 md:pb-20">
        <div className="max-w-5xl mx-auto space-y-[var(--bento-gap)]">

          {/* Golden Speaker Card — large featured card */}
          <div className="scroll-reveal">
            <div className="bento-card glass-card glow-accent p-0 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left: Input interface */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                      {isEn ? "Golden Speaker" : "金色揚聲器"}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {isEn ? "Analyse your pronunciation" : isTW ? "分析您的發音" : "分析您的发音"}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="practice-text" className="sr-only">
                        {isEn ? "Enter the sentence you want to practice" : "輸入您想練習的句子"}
                      </label>
                      <Textarea
                        id="practice-text"
                        placeholder={isEn
                          ? "Type a sentence to practice... e.g. 你今日食咗飯未啊"
                          : "輸入您想練習的句子... 例如 你今日食咗飯未啊"}
                        value={spokenText}
                        onChange={e => setSpokenText(e.target.value)}
                        className="min-h-[80px] resize-none border border-border bg-background/50 text-base rounded-2xl"
                        aria-describedby="text-input-help"
                      />
                    </div>

                    <Tabs value={audioSource} onValueChange={v => setAudioSource(v as 'record' | 'upload')}>
                      <TabsList className="h-9 bg-muted p-0.5 gap-0.5 rounded-xl">
                        <TabsTrigger value="record" className="gap-1.5 text-xs px-3 h-8 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">
                          <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                          {t("voiceLab.record")}
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="gap-1.5 text-xs px-3 h-8 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">
                          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                          {t("voiceLab.upload")}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="record" className="mt-3">
                        <div className="flex flex-col items-center gap-3">
                          <button
                            onClick={isRecording ? handleStopRecording : handleStartRecording}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isRecording ? "bg-destructive animate-pulse shadow-[0_0_20px_hsl(0_72%_51%/0.4)]" : "bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(185_100%_50%/0.3)]"}`}
                            aria-label={isRecording ? (isEn ? 'Stop recording' : '停止錄音') : (isEn ? 'Start recording' : '開始錄音')}
                          >
                            {isRecording ? <Square className="h-5 w-5 text-primary-foreground" aria-hidden="true" /> : <Mic className="h-5 w-5 text-primary-foreground" aria-hidden="true" />}
                          </button>
                          <p className="text-xs text-muted-foreground" aria-live="polite">
                            {isRecording ? (isEn ? 'Recording... tap to stop' : '錄音中... 點擊停止') : (isEn ? 'Tap to record' : '點擊錄音')}
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="upload" className="mt-3">
                        <input ref={fileInputRef} type="file" accept=".mp3,.wav,.webm,.ogg,.m4a,audio/*" onChange={handleFileUpload} className="hidden" id="audio-upload" aria-label={isEn ? "Upload audio file" : "上傳音頻文件"} />
                        <div className="w-full border border-dashed border-border rounded-2xl p-5 text-center hover:border-primary/40 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
                          <p className="text-xs text-muted-foreground">{t("voiceLab.chooseFile")}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">MP3, WAV, WebM, OGG, M4A (max 10MB)</p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Audio Preview */}
                    {hasRecording && (
                      <div className="p-3 bg-muted/40 rounded-2xl" role="region" aria-label={isEn ? "Audio preview" : "音頻預覽"}>
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="icon" className="shrink-0 h-8 w-8 rounded-xl" onClick={handlePlayRecording} aria-label={isPlaying ? (isEn ? 'Pause' : '暫停') : (isEn ? 'Play' : '播放')}>
                            {isPlaying ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          </Button>
                          <div className="flex-1">
                            <div className="h-1 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(isPlaying ? playbackProgress : 100)} aria-valuemin={0} aria-valuemax={100}>
                              <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${isPlaying ? playbackProgress : 100}%` }} />
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-[10px] text-muted-foreground">{uploadedFileName || t("voiceLab.recordingReady")}</p>
                              <p className="text-[10px] font-medium text-foreground">{formatDuration(audioDuration)}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive rounded-xl" onClick={handleClearAudio} aria-label={isEn ? "Remove recording" : "刪除錄音"}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleProcessRecording}
                      className="w-full gap-2 rounded-2xl h-12 text-base font-semibold shadow-[0_0_20px_hsl(185_100%_50%/0.2)]"
                      disabled={!hasRecording || !spokenText.trim() || isProcessing}
                      aria-busy={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          {isEn ? 'Analysing Articulation...' : isTW ? '正在分析發音...' : '正在分析发音...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" aria-hidden="true" />
                          {isEn ? 'Analyse Pronunciation' : isTW ? '分析發音' : '分析发音'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Right: Waveform Visualization */}
                <div className="p-6 md:p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-border">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      {isEn ? "Live Waveform" : "即時波形"}
                    </h3>
                  </div>
                  <WaveformVisualizer
                    isRecording={isRecording}
                    audioStream={audioStream}
                    accuracy={null}
                  />

                  {/* 3D Abstract visual placeholder */}
                  <div className="mt-6 flex items-center justify-center">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 blur-xl" />
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-transparent border border-primary/20" />
                      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/30 flex items-center justify-center">
                        <AudioLines className="h-8 w-8 text-primary drop-shadow-[0_0_8px_hsl(185_100%_50%/0.5)]" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Banner */}
          <div className="scroll-reveal">
            <Link to="/pricing">
              <div className="bento-card flex flex-col sm:flex-row items-center justify-between gap-3 hover:border-primary/30 cursor-pointer group">
                <p className="text-base text-foreground">
                  {isEn ? "Need more credits? View our subscription plans." : isTW ? "需要更多額度？查看我們的訂閱方案。" : "需要更多额度？查看我们的订阅方案。"}
                </p>
                <span className="text-sm font-semibold text-primary whitespace-nowrap flex items-center gap-1 group-hover:gap-2 transition-all">
                  {isEn ? "See Pricing" : isTW ? "查看定價" : "查看定价"} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* Tone Analysis + Precision Practice */}
          <div className="bento-grid grid-cols-1 lg:grid-cols-2">
            <div className="scroll-reveal">
              <div className="bento-card">
                <ToneContourVisualizer isRecording={isRecording} audioStream={audioStream} />
              </div>
            </div>
            <div className="scroll-reveal">
              <div className="bento-card">
                <PrecisionPractice audioUrl={recordingUrl} />
              </div>
            </div>
          </div>

          {/* Feature Bento Grid */}
          <div className="bento-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, i) => (
              <Link key={i} to={feat.link} className="scroll-reveal group">
                <div className={`bento-card h-full ${feat.featured ? 'glass-card glow-accent' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${feat.featured ? 'bg-primary/20' : 'bg-muted'}`}>
                    <feat.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEn ? "Explore" : "探索"} <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Sign in prompt */}
          {!user && (
            <div className="scroll-reveal text-center py-4">
              <p className="text-sm text-muted-foreground">
                {isEn ? 'Results are available instantly. ' : isTW ? '結果即時可用。' : '结果即时可用。'}
                <Link to="/auth" className="text-primary font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded">
                  {isEn ? 'Sign in to save your history' : isTW ? '登入以保存記錄' : '登录以保存记录'}
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>
      <TrialLimitModal open={showTrialModal} onOpenChange={setShowTrialModal} />
    </div>
  );
};

export default Index;
