import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, Square, Play, Sparkles, Loader2, Upload, X, BarChart3, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useGuestTrial } from "@/hooks/useGuestTrial";
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
  const { trialUsed, showTrialModal, setShowTrialModal, isLocked, markTrialUsed, ensureGuestSession } = useGuestTrial(isAuthenticated);
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
    // For unauthenticated users, ensure an anonymous session exists for API access
    if (!isAuthenticated) {
      await ensureGuestSession();
    }
    const result = await processRecording(audioBlob, spokenText);
    if (result) {
      // Mark trial as used for unauthenticated users
      if (!isAuthenticated) {
        markTrialUsed();
      }
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
    ? "AI-Powered Cantonese Speech Articulation Application"
    : isTW ? "AI 驅動的廣東話語音發音應用程式" : "AI 驱动的广东话语音发音应用程序";
  const subSlogan = isEn
    ? "Learning from your own voice."
    : isTW ? "從你自己的聲音中學習。" : "从你自己的声音中学习。";
  const promptLabel = isEn ? "What would you like to practice today?" : isTW ? "今天想練習什麼？" : "今天想练习什么？";

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-background relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        {/* Branding */}
        <div className="text-center mb-10 space-y-3">
          <img src={logo} alt="SpeakAble HK Logo" className="h-14 w-14 mx-auto object-contain" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-snug">
            {slogan}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground italic">
            {subSlogan}
          </p>
          <p className="text-sm text-muted-foreground pt-2">
            {promptLabel}
          </p>
        </div>

        {/* Unified Input Card — ChatGPT-style */}
        <div className={`w-full bg-card border border-border rounded-2xl shadow-[var(--shadow-card)] overflow-hidden ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Text Input */}
          <div className="p-4 pb-0">
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
              className="min-h-[72px] resize-none border-0 shadow-none focus-visible:ring-0 text-base bg-transparent"
              aria-describedby="text-input-help"
            />
            <p id="text-input-help" className="sr-only">
              {isEn ? "Enter a Cantonese sentence or word to practice pronunciation" : "輸入一個廣東話句子或詞語來練習發音"}
            </p>
          </div>

          {/* Audio Controls */}
          <div className="px-4 pb-4">
            <Tabs value={audioSource} onValueChange={v => setAudioSource(v as 'record' | 'upload')}>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <TabsList className="h-9 bg-transparent p-0 gap-1">
                  <TabsTrigger value="record" className="gap-1.5 text-xs px-3 h-8 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
                    <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("voiceLab.record")}
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-1.5 text-xs px-3 h-8 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("voiceLab.upload")}
                  </TabsTrigger>
                </TabsList>

                {/* Analyze button inline */}
                <Button
                  onClick={handleProcessRecording}
                  size="sm"
                  className="gap-1.5 h-8 px-4 rounded-lg"
                  disabled={isLocked || !hasRecording || !spokenText.trim() || isProcessing}
                  aria-busy={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      {isEn ? 'Analysing Articulation...' : isTW ? '正在分析發音...' : '正在分析发音...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      {isEn ? 'Analyse' : isTW ? '分析' : '分析'}
                    </>
                  )}
                </Button>
              </div>

              <TabsContent value="record" className="mt-3">
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${isRecording ? "bg-destructive animate-pulse" : "bg-primary hover:bg-primary/90"}`}
                    aria-label={isRecording ? (isEn ? 'Stop recording' : '停止錄音') : (isEn ? 'Start recording' : '開始錄音')}
                  >
                    {isRecording ? <Square className="h-5 w-5 text-primary-foreground" aria-hidden="true" /> : <Mic className="h-5 w-5 text-primary-foreground" aria-hidden="true" />}
                  </button>
                  <p className="text-xs text-muted-foreground" aria-live="polite">
                    {isRecording
                      ? (isEn ? 'Recording... tap to stop' : '錄音中... 點擊停止')
                      : (isEn ? 'Tap to record' : '點擊錄音')}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="mt-3">
                <div className="flex flex-col items-center gap-3">
                  <input ref={fileInputRef} type="file" accept=".mp3,.wav,.webm,.ogg,.m4a,audio/*" onChange={handleFileUpload} className="hidden" id="audio-upload" aria-label={isEn ? "Upload audio file" : "上傳音頻文件"} />
                  <div className="w-full border border-dashed border-border rounded-xl p-5 text-center hover:border-primary/40 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
                    <p className="text-xs text-muted-foreground">{t("voiceLab.chooseFile")}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">MP3, WAV, WebM, OGG, M4A (max 10MB)</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Audio Preview */}
            {hasRecording && (
              <div className="mt-3 p-3 bg-muted/40 rounded-xl" role="region" aria-label={isEn ? "Audio preview" : "音頻預覽"}>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="shrink-0 h-7 w-7" onClick={handlePlayRecording} aria-label={isPlaying ? (isEn ? 'Pause playback' : '暫停播放') : (isEn ? 'Play recording' : '播放錄音')}>
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
                  <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={handleClearAudio} aria-label={isEn ? "Remove recording" : "刪除錄音"}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <nav className="grid grid-cols-3 gap-3 mt-6 w-full" aria-label={isEn ? "Quick links" : "快速連結"}>
          <Link to="/speech-quest" className="group">
            <div className="bg-card/60 backdrop-blur border border-border rounded-xl p-3 text-center transition-all hover:border-primary/30 hover:bg-card">
              <BookOpen className="h-4 w-4 text-primary mx-auto mb-1.5" aria-hidden="true" />
              <p className="text-xs font-medium text-foreground">
                {isEn ? 'Speech Quest' : isTW ? '語音冒險' : '语音冒险'}
              </p>
            </div>
          </Link>
          <Link to="/pronunciation/results" className="group">
            <div className="bg-card/60 backdrop-blur border border-border rounded-xl p-3 text-center transition-all hover:border-primary/30 hover:bg-card">
              <BarChart3 className="h-4 w-4 text-primary mx-auto mb-1.5" aria-hidden="true" />
              <p className="text-xs font-medium text-foreground">
                {isEn ? 'Results' : isTW ? '結果' : '结果'}
              </p>
            </div>
          </Link>
          <Link to="/about" className="group">
            <div className="bg-card/60 backdrop-blur border border-border rounded-xl p-3 text-center transition-all hover:border-primary/30 hover:bg-card">
              <ArrowRight className="h-4 w-4 text-primary mx-auto mb-1.5" aria-hidden="true" />
              <p className="text-xs font-medium text-foreground">
                {isEn ? 'About' : isTW ? '關於' : '关于'}
              </p>
            </div>
          </Link>
        </nav>

        {/* Sign in prompt */}
        {!user && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            {isEn
              ? 'Results are available instantly. '
              : isTW ? '結果即時可用。' : '结果即时可用。'}
            <Link to="/auth" className="text-primary font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded">
              {isEn ? 'Sign in to save your history' : isTW ? '登入以保存記錄' : '登录以保存记录'}
            </Link>
          </p>
        )}
      </div>

      {/* Trial limit modal for unauthenticated users */}
      <TrialLimitModal open={showTrialModal} onOpenChange={setShowTrialModal} />
    </div>
  );
};

export default Index;
