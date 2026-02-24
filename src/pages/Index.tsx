import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, Square, Play, Sparkles, Loader2, Upload, X, BarChart3, BookOpen, Headphones, MessageSquare, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const Index = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
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
    const result = await processRecording(audioBlob, spokenText);
    if (result) {
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

  const heroTitle = isEn
    ? "Accessible Speech Therapy, Powered by AI"
    : isTW ? "無障礙語音治療，由 AI 驅動" : "无障碍语音治疗，由 AI 驱动";
  const heroDesc = isEn
    ? "SpeakAble HK helps you improve your Cantonese pronunciation with real-time AI feedback using the Golden Theory."
    : isTW ? "SpeakAble HK 利用黃金理論，透過即時 AI 反饋幫助您改善廣東話發音。" : "SpeakAble HK 利用黄金理论，通过即时 AI 反馈帮助您改善广东话发音。";
  const ctaLabel = isEn ? "Start Practising Below" : isTW ? "在下方開始練習" : "在下方开始练习";

  const services = [
    {
      icon: AudioLines,
      title: isEn ? "Real-time Feedback" : isTW ? "即時反饋" : "即时反馈",
      desc: isEn ? "Get instant pronunciation analysis with phoneme-level accuracy scoring." : isTW ? "獲得即時發音分析和音素級準確度評分。" : "获得即时发音分析和音素级准确度评分。",
    },
    {
      icon: Headphones,
      title: isEn ? "Echo Speech" : isTW ? "迴聲語音" : "回声语音",
      desc: isEn ? "Listen to AI-generated correct pronunciation and compare with yours." : isTW ? "聆聽 AI 生成的正確發音並與您的進行比較。" : "聆听 AI 生成的正确发音并与您的进行比较。",
    },
    {
      icon: BookOpen,
      title: isEn ? "IPA Learning" : isTW ? "國際音標學習" : "国际音标学习",
      desc: isEn ? "Master the International Phonetic Alphabet with interactive guides." : isTW ? "透過互動指南掌握國際音標。" : "通过互动指南掌握国际音标。",
    },
    {
      icon: BarChart3,
      title: isEn ? "Progress Tracking" : isTW ? "進度追蹤" : "进度追踪",
      desc: isEn ? "Track your improvement over time with detailed analytics." : isTW ? "通過詳細分析追蹤您的進步。" : "通过详细分析追踪您的进步。",
    },
  ];

  return (
    <div className="min-h-full flex flex-col bg-background">
      {/* Hero Section */}
      <section className="hero-gradient py-12 md:py-20 px-4" aria-labelledby="hero-heading">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <img src={logo} alt="SpeakAble HK Logo" className="h-16 w-16 md:h-20 md:w-20 mx-auto object-contain" />
          <h1 id="hero-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            {heroTitle}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            {heroDesc}
          </p>
          <a href="#echo-speech" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            {ctaLabel}
          </a>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-10 md:py-14 px-4" aria-labelledby="services-heading">
        <div className="max-w-4xl mx-auto">
          <h2 id="services-heading" className="text-2xl font-bold text-foreground text-center mb-8">
            {isEn ? "Our Features" : isTW ? "我們的功能" : "我们的功能"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((svc, i) => (
              <article key={i} className="bg-card border border-border rounded-xl p-5 text-center card-shadow hover:card-shadow-hover transition-shadow">
                <svc.icon className="h-8 w-8 text-primary mx-auto mb-3" aria-hidden="true" />
                <h3 className="font-semibold text-foreground mb-1">{svc.title}</h3>
                <p className="text-sm text-muted-foreground">{svc.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Echo Speech Tool */}
      <section id="echo-speech" className="py-10 md:py-14 px-4 hero-gradient" aria-labelledby="echo-speech-heading">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <h2 id="echo-speech-heading" className="text-2xl font-bold text-foreground mb-1">
              {isEn ? "Echo Speech" : isTW ? "迴聲語音" : "回声语音"}
            </h2>
            <p className="text-xs text-primary font-medium tracking-wider uppercase">
              {isEn ? "Powered by the Golden Theory" : isTW ? "基於黃金理論" : "基于黄金理论"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {isEn ? "What would you like to practice today?" : isTW ? "今天想練習什麼？" : "今天想练习什么？"}
            </p>
          </div>

          {/* Text Input */}
          <div className="bg-card border border-border rounded-2xl p-4 card-shadow">
            <label htmlFor="practice-text" className="sr-only">
              {isEn ? "Enter the sentence you want to practice" : "輸入您想練習的句子"}
            </label>
            <Textarea
              id="practice-text"
              placeholder={isEn
                ? "Type the sentence you want to practice... e.g. 你今日食咗飯未啊"
                : "輸入您想練習的句子... 例如 你今日食咗飯未啊"}
              value={spokenText}
              onChange={e => setSpokenText(e.target.value)}
              className="min-h-[80px] resize-none border-0 shadow-none focus-visible:ring-0 text-base"
              aria-describedby="text-input-help"
            />
            <p id="text-input-help" className="sr-only">
              {isEn ? "Enter a Cantonese sentence or word to practice pronunciation" : "輸入一個廣東話句子或詞語來練習發音"}
            </p>
          </div>

          {/* Audio Input */}
          <div className="bg-card border border-border rounded-2xl p-4 card-shadow">
            <Tabs value={audioSource} onValueChange={v => setAudioSource(v as 'record' | 'upload')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="record" className="gap-2">
                  <Mic className="h-4 w-4" aria-hidden="true" />
                  {t("voiceLab.record")}
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  {t("voiceLab.upload")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="record" className="mt-0">
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isRecording ? "bg-destructive animate-pulse" : "bg-primary hover:bg-primary/90"}`}
                    aria-label={isRecording ? (isEn ? 'Stop recording' : '停止錄音') : (isEn ? 'Start recording' : '開始錄音')}
                  >
                    {isRecording ? <Square className="h-6 w-6 text-primary-foreground" aria-hidden="true" /> : <Mic className="h-6 w-6 text-primary-foreground" aria-hidden="true" />}
                  </button>
                  <p className="text-sm text-muted-foreground" aria-live="polite">
                    {isRecording
                      ? (isEn ? 'Recording... tap to stop' : '錄音中... 點擊停止')
                      : (isEn ? 'Tap to record' : '點擊錄音')}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="mt-0">
                <div className="flex flex-col items-center gap-3">
                  <input ref={fileInputRef} type="file" accept=".mp3,.wav,.webm,.ogg,.m4a,audio/*" onChange={handleFileUpload} className="hidden" id="audio-upload" aria-label={isEn ? "Upload audio file" : "上傳音頻文件"} />
                  <div className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      {t("voiceLab.chooseFile")}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">MP3, WAV, WebM, OGG, M4A (max 10MB)</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Audio Preview */}
            {hasRecording && (
              <div className="mt-4 p-3 bg-muted/50 rounded-xl" role="region" aria-label={isEn ? "Audio preview" : "音頻預覽"}>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="shrink-0 h-8 w-8" onClick={handlePlayRecording} aria-label={isPlaying ? (isEn ? 'Pause playback' : '暫停播放') : (isEn ? 'Play recording' : '播放錄音')}>
                    {isPlaying ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <div className="flex-1">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(isPlaying ? playbackProgress : 100)} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${isPlaying ? playbackProgress : 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">{uploadedFileName || t("voiceLab.recordingReady")}</p>
                      <p className="text-xs font-medium text-foreground">{formatDuration(audioDuration)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleClearAudio} aria-label={isEn ? "Remove recording" : "刪除錄音"}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleProcessRecording}
            size="lg"
            className="w-full gap-2 h-12 text-base"
            disabled={!hasRecording || !spokenText.trim() || isProcessing}
            aria-busy={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                {t("voiceLab.processing")}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                {isEn ? 'Analyze Pronunciation' : isTW ? '分析發音' : '分析发音'}
              </>
            )}
          </Button>

          {/* Quick Links */}
          <nav className="grid grid-cols-2 gap-3 pt-2" aria-label={isEn ? "Quick links" : "快速連結"}>
            <Link to="/practice" className="group">
              <div className="bg-card border border-border rounded-xl p-4 text-center transition-all hover:border-primary/30 hover:card-shadow-hover card-shadow">
                <BookOpen className="h-5 w-5 text-primary mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">
                  {isEn ? 'Practice Drills' : isTW ? '練習模式' : '练习模式'}
                </p>
              </div>
            </Link>
            <Link to="/pronunciation/results" className="group">
              <div className="bg-card border border-border rounded-xl p-4 text-center transition-all hover:border-primary/30 hover:card-shadow-hover card-shadow">
                <BarChart3 className="h-5 w-5 text-primary mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">
                  {isEn ? 'View Results' : isTW ? '查看結果' : '查看结果'}
                </p>
              </div>
            </Link>
          </nav>

          {/* Sign in prompt for saving */}
          {!user && (
            <p className="text-center text-sm text-muted-foreground">
              {isEn
                ? 'Results are available instantly. '
                : isTW ? '結果即時可用。' : '结果即时可用。'}
              <Link to="/auth" className="text-primary font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded">
                {isEn ? 'Sign in to save your history' : isTW ? '登入以保存記錄' : '登录以保存记录'}
              </Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
