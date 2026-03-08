import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, Square, Play, Sparkles, Loader2, Upload, X, BarChart3, BookOpen, ArrowRight, AudioLines, Headphones, Swords, Shield, Target, Star, Trophy, Gamepad2, BookHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { ToneContourVisualizer } from "@/components/ToneContourVisualizer";
import { PrecisionPractice } from "@/components/PrecisionPractice";
import { VoiceOnboarding } from "@/components/VoiceOnboarding";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import { useVoiceProfile } from "@/hooks/useVoiceProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useGuestTrial } from "@/hooks/useGuestTrial";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useUserStats } from "@/hooks/useUserStats";
import { TrialLimitModal } from "@/components/TrialLimitModal";
import { toast } from "sonner";
import mascot from "@/assets/mascot.png";

const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const Index = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { stats } = useUserStats();
  const isAuthenticated = !!user && !user.is_anonymous;
  const { hasVoiceProfile, markProfileCreated } = useVoiceProfile(user?.id);
  const [showOnboarding, setShowOnboarding] = useState(false);
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

  // --- All handlers remain exactly the same ---
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
        if (recordingIntervalRef.current) { clearInterval(recordingIntervalRef.current); recordingIntervalRef.current = null; }
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
    setRecordingUrl(null); setAudioBlob(null); setHasRecording(false);
    setUploadedFileName(null); setAudioDuration(0); setPlaybackProgress(0); setIsPlaying(false);
    if (audioElementRef.current) { audioElementRef.current.pause(); audioElementRef.current = null; }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProcessRecording = async () => {
    if (!audioBlob || !spokenText.trim()) {
      toast.error(isEn ? "Please provide audio and enter the text you're speaking" : "請提供音頻並輸入您正在說的文字");
      return;
    }
    if (isLocked) { setShowTrialModal(true); return; }
    if (!isAuthenticated) await ensureGuestSession();
    const result = await processRecording(audioBlob, spokenText);
    if (result && 'trialExhausted' in result && result.trialExhausted) { markTrialUsed(); return; }
    if (result && 'spoken' in result) {
      toast.success(isEn ? "Processing complete!" : "處理完成！");
      const contentType = result.clone.content_type || 'audio/wav';
      const generatedAudioUrl = `data:${contentType};base64,${result.clone.audio_base64}`;
      navigate('/pronunciation/results', {
        state: { spokenPhonemes: result.spoken, intendedPhonemes: result.intended, generatedAudioUrl, recordingUrl, intendedText: spokenText.trim() }
      });
    } else if (error) toast.error(error);
  };

  const handlePlayRecording = () => {
    if (!recordingUrl) return;
    if (isPlaying && audioElementRef.current) { audioElementRef.current.pause(); setIsPlaying(false); return; }
    const audio = new Audio(recordingUrl);
    audioElementRef.current = audio;
    audio.addEventListener('timeupdate', () => { if (audio.duration > 0) setPlaybackProgress((audio.currentTime / audio.duration) * 100); });
    audio.addEventListener('ended', () => { setIsPlaying(false); setPlaybackProgress(0); });
    audio.play();
    setIsPlaying(true);
  };

  return (
    <div className="min-h-full bg-background" ref={scrollRef}>
      {/* Hero — mascot greeting + mode selection */}
      <section className="relative overflow-hidden px-4 pt-8 pb-6 md:pt-12 md:pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="scroll-reveal flex flex-col items-center text-center gap-4 mb-8">
            <img src={mascot} alt="SpeakAble mascot" className="h-24 w-24 md:h-28 md:w-28 object-contain mascot-bounce" />
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
                {isEn ? "Welcome to" : isTW ? "歡迎來到" : "欢迎来到"}
                {" "}
                <span className="text-primary">SpeakAble HK</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-base md:text-lg max-w-md mx-auto">
                {isEn
                  ? "Let's practise Cantonese together."
                  : isTW ? "一起練習廣東話吧。"
                  : "一起练习广东话吧。"}
              </p>
            </div>
          </div>

          {/* Two Mode Buttons — side by side */}
          <div className="scroll-reveal grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Game Mode */}
            <button
              onClick={() => {
                if (!hasVoiceProfile) {
                  setShowOnboarding(true);
                } else {
                  document.getElementById("golden-speaker")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="bg-primary text-primary-foreground rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-1 active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group"
              style={{ boxShadow: "0 6px 0 hsl(var(--primary-dark))" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 min-w-[56px] rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <Gamepad2 className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <span className="text-xl font-extrabold block leading-tight">
                    {isEn ? "Speech Quest" : isTW ? "語音冒險" : "语音冒险"}
                  </span>
                  <span className="text-sm font-medium text-primary-foreground/80 mt-0.5 block leading-snug">
                    {isEn
                      ? "Interactive pronunciation practice through games."
                      : isTW ? "通過遊戲進行互動發音練習。"
                      : "通过游戏进行互动发音练习。"}
                  </span>
                </div>
              </div>
            </button>

            {/* Speech Therapy Information */}
            <button
              onClick={() => navigate("/speech-therapy-info")}
              className="bg-card text-foreground border-2 border-border rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 active:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group"
              style={{ boxShadow: "0 6px 0 hsl(var(--border))" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 min-w-[56px] rounded-xl bg-accent/15 flex items-center justify-center">
                  <BookHeart className="h-7 w-7 text-accent" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <span className="text-xl font-extrabold block leading-tight">
                    {isEn ? "Speech Therapy Information" : isTW ? "言語治療資訊" : "言语治疗资讯"}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground mt-0.5 block leading-snug">
                    {isEn
                      ? "Educational information about speech therapy."
                      : isTW ? "關於言語治療和語言發展的教育資訊。"
                      : "关于言语治疗和语言发展的教育资讯。"}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar (if logged in) */}
      {user && stats && (
        <section className="px-4 pb-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-6 bg-card border-2 border-border rounded-2xl py-3 px-4">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-accent" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{isEn ? "Streak" : "連續"}</p>
                  <p className="text-sm font-extrabold text-foreground">{stats.streak_days}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{isEn ? "Score" : "分數"}</p>
                  <p className="text-sm font-extrabold text-foreground">{stats.fluency_score}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center">
                  <Target className="h-4 w-4 text-success" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{isEn ? "Goal" : "目標"}</p>
                  <p className="text-sm font-extrabold text-foreground">{stats.daily_progress_minutes}/{stats.daily_goal_minutes}m</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions — game-style cards */}
      <section className="px-4 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: Swords,
                title: isEn ? "Speech Quest" : isTW ? "語音冒險" : "语音冒险",
                desc: isEn ? "Game-based learning path" : isTW ? "遊戲化學習路線" : "游戏化学习路线",
                link: "/speech-quest",
                color: "bg-primary/10 text-primary border-primary/20",
                iconBg: "bg-primary/15",
              },
              {
                icon: BookOpen,
                title: isEn ? "IPA Library" : isTW ? "IPA 音標庫" : "IPA 音标库",
                desc: isEn ? "Learn phonetic symbols" : isTW ? "學習音標符號" : "学习音标符号",
                link: "/ipa",
                color: "bg-accent/10 text-accent-foreground border-accent/20",
                iconBg: "bg-accent/15",
              },
              {
                icon: BarChart3,
                title: isEn ? "Progress" : isTW ? "進度" : "进度",
                desc: isEn ? "Track your improvement" : isTW ? "追蹤進步" : "追踪进步",
                link: "/learning/progress",
                color: "bg-success/10 text-foreground border-success/20",
                iconBg: "bg-success/15",
              },
            ].map((action, i) => (
              <Link key={i} to={action.link} className="scroll-reveal group">
                <div className={`bg-card border-2 ${action.color} rounded-2xl p-3 md:p-4 text-center hover:shadow-md transition-all hover:-translate-y-1`}>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${action.iconBg} flex items-center justify-center mx-auto mb-2`}>
                    <action.icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
                  </div>
                  <p className="text-xs md:text-sm font-extrabold text-foreground leading-tight">{action.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 hidden md:block">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Echo Speech Card — main interaction */}
      <section className="px-4 pb-6" id="golden-speaker">
        <div className="max-w-2xl mx-auto scroll-reveal">
          <div className="bg-card border-2 border-primary/20 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-primary/5 border-b-2 border-primary/10 px-4 py-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-foreground">
                  {isEn ? "Echo Speech" : "迴聲語音"}
                </h2>
                <p className="text-[10px] text-muted-foreground">
                  {isEn ? "Practice your pronunciation" : isTW ? "練習你的發音" : "练习你的发音"}
                </p>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Text input */}
              <div>
                <label htmlFor="practice-text" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  {isEn ? "What will you say?" : isTW ? "你要說什麼？" : "你要说什么？"}
                </label>
                <Textarea
                  id="practice-text"
                  placeholder={isEn ? "Type a sentence... e.g. 你今日食咗飯未啊" : "輸入句子... 例如 你今日食咗飯未啊"}
                  value={spokenText}
                  onChange={e => setSpokenText(e.target.value)}
                  className="min-h-[72px] resize-none border-2 border-border bg-background text-base rounded-xl focus:border-primary"
                />
              </div>

              {/* Audio input tabs */}
              <Tabs value={audioSource} onValueChange={v => setAudioSource(v as 'record' | 'upload')}>
                <TabsList className="h-10 bg-muted p-1 gap-1 rounded-xl w-full">
                  <TabsTrigger value="record" className="gap-1.5 text-xs px-3 h-8 rounded-lg font-bold flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("voiceLab.record")}
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-1.5 text-xs px-3 h-8 rounded-lg font-bold flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("voiceLab.upload")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="record" className="mt-3">
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-ring ${
                        isRecording
                          ? "bg-destructive animate-pulse shadow-lg"
                          : "bg-primary hover:bg-primary/90 shadow-md game-btn"
                      }`}
                      style={!isRecording ? { boxShadow: '0 4px 0 hsl(var(--primary-dark))' } : {}}
                      aria-label={isRecording ? (isEn ? 'Stop recording' : '停止錄音') : (isEn ? 'Start recording' : '開始錄音')}
                    >
                      {isRecording ? <Square className="h-6 w-6 text-primary-foreground" /> : <Mic className="h-7 w-7 text-primary-foreground" />}
                    </button>
                    <p className="text-xs text-muted-foreground font-bold" aria-live="polite">
                      {isRecording
                        ? `🔴 ${isEn ? 'Recording...' : '錄音中...'} ${formatDuration(audioDuration)}`
                        : (isEn ? 'Tap to record' : '點擊錄音')}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="mt-3">
                  <input ref={fileInputRef} type="file" accept=".mp3,.wav,.webm,.ogg,.m4a,audio/*" onChange={handleFileUpload} className="hidden" id="audio-upload" />
                  <div
                    className="w-full border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-primary/40 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
                    <p className="text-xs font-bold text-muted-foreground">{t("voiceLab.chooseFile")}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">MP3, WAV, WebM, OGG, M4A (max 10MB)</p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Audio Preview */}
              {hasRecording && (
                <div className="p-3 bg-muted/50 rounded-xl border-2 border-border" role="region" aria-label={isEn ? "Audio preview" : "音頻預覽"}>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 rounded-lg" onClick={handlePlayRecording}>
                      {isPlaying ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </Button>
                    <div className="flex-1">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${isPlaying ? playbackProgress : 100}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-muted-foreground font-bold">{uploadedFileName || (isEn ? 'Recording ready' : '錄音就緒')}</p>
                        <p className="text-[10px] font-extrabold text-foreground">{formatDuration(audioDuration)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg" onClick={handleClearAudio}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Waveform */}
              {(isRecording || hasRecording) && (
                <div className="bg-muted/30 rounded-xl p-3 border-2 border-border">
                  <WaveformVisualizer isRecording={isRecording} audioStream={audioStream} accuracy={null} />
                </div>
              )}

              {/* Submit */}
              <Button
                onClick={handleProcessRecording}
                className="w-full gap-2 rounded-xl h-12 text-base font-extrabold game-btn"
                style={{ boxShadow: '0 4px 0 hsl(var(--primary-dark))' }}
                disabled={!hasRecording || !spokenText.trim() || isProcessing}
                aria-busy={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {isEn ? 'Analysing...' : isTW ? '分析中...' : '分析中...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    {isEn ? 'Check My Pronunciation' : isTW ? '檢查我的發音' : '检查我的发音'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tone & Precision Practice */}
      <section className="px-4 pb-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="scroll-reveal bg-card border-2 border-border rounded-2xl p-4">
            <ToneContourVisualizer isRecording={isRecording} audioStream={audioStream} />
          </div>
          <div className="scroll-reveal bg-card border-2 border-border rounded-2xl p-4">
            <PrecisionPractice audioUrl={recordingUrl} />
          </div>
        </div>
      </section>

      {/* Features Grid — game cards */}
      <section className="px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-extrabold text-foreground mb-4 text-center">
            {isEn ? "What you can do" : isTW ? "你可以做什麼" : "你可以做什么"} 🎯
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: AudioLines, title: isEn ? "AI Feedback" : isTW ? "AI 反饋" : "AI 反馈", desc: isEn ? "Instant pronunciation scoring" : isTW ? "即時發音評分" : "即时发音评分", color: "border-primary/20" },
              { icon: Headphones, title: isEn ? "Echo Speech" : "迴聲語音", desc: isEn ? "Hear the correct way" : isTW ? "聽正確發音" : "听正确发音", color: "border-accent/20" },
              { icon: Swords, title: isEn ? "Speech Quest" : isTW ? "語音冒險" : "语音冒险", desc: isEn ? "Learn through games" : isTW ? "透過遊戲學習" : "通过游戏学习", color: "border-success/20" },
              { icon: Shield, title: isEn ? "Accessible" : isTW ? "無障礙" : "无障碍", desc: isEn ? "WCAG 2.1 AA ready" : "WCAG 2.1 AA", color: "border-border" },
            ].map((feat, i) => (
              <div key={i} className={`scroll-reveal bg-card border-2 ${feat.color} rounded-2xl p-4 hover:shadow-md transition-all`}>
                <feat.icon className="h-6 w-6 text-primary mb-2" aria-hidden="true" />
                <p className="text-sm font-extrabold text-foreground">{feat.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — sign in or pricing */}
      <section className="px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {!user ? (
            <div className="scroll-reveal bg-primary/5 border-2 border-primary/20 rounded-2xl p-6 text-center">
              <img src={mascot} alt="" className="h-14 w-14 mx-auto mb-3" />
              <h3 className="text-lg font-extrabold text-foreground mb-1">
                {isEn ? "Ready to start learning?" : isTW ? "準備好開始學習了嗎？" : "准备好开始学习了吗？"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isEn ? "Create a free account to track your progress!" : isTW ? "建立免費帳戶來追蹤你的進度！" : "创建免费账户来追踪你的进度！"}
              </p>
              <Link to="/auth">
                <Button className="game-btn gap-2 px-8 h-12 font-extrabold text-base" style={{ boxShadow: '0 4px 0 hsl(var(--primary-dark))' }}>
                  {isEn ? "Sign Up Free" : isTW ? "免費註冊" : "免费注册"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/pricing" className="scroll-reveal block">
              <div className="bg-accent/10 border-2 border-accent/20 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all">
                <p className="text-sm font-bold text-foreground">
                  {isEn ? "Need more credits? 🚀" : isTW ? "需要更多額度？🚀" : "需要更多额度？🚀"}
                </p>
                <span className="text-sm font-extrabold text-accent flex items-center gap-1">
                  {isEn ? "See Plans" : isTW ? "查看方案" : "查看方案"} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>

      <TrialLimitModal open={showTrialModal} onOpenChange={setShowTrialModal} />

      {showOnboarding && (
        <VoiceOnboarding
          onComplete={async () => {
            if (user?.id) await markProfileCreated(user.id);
            setShowOnboarding(false);
            setTimeout(() => {
              document.getElementById("golden-speaker")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
          onCancel={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
};

export default Index;
