import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, Square, Play, Sparkles, Loader2, Upload, X, BarChart3, BookOpen } from "lucide-react";
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
      toast.error("Please provide audio and enter the text you're speaking");
      return;
    }
    const result = await processRecording(audioBlob, spokenText);
    if (result) {
      toast.success("Processing complete!");
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

  const greeting = language === 'en-GB' 
    ? "What would you like to practice today?" 
    : language === 'zh-TW' ? "今天想練習什麼？" : "今天想练习什么？";

  const goldenTheoryLabel = language === 'en-GB'
    ? "Powered by the Golden Theory"
    : language === 'zh-TW' ? "基於黃金理論" : "基于黄金理论";

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-background px-4 py-8">
      {/* Hero / Welcome */}
      <div className="text-center mb-8 max-w-2xl">
        <img src={logo} alt="SpeakAble HK" className="h-20 w-20 mx-auto mb-4 object-contain" />
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Echo Speech
        </h1>
        <p className="text-muted-foreground text-lg mb-1">{greeting}</p>
        <p className="text-xs text-primary font-medium tracking-wider uppercase">
          {goldenTheoryLabel}
        </p>
      </div>

      {/* Main Echo Speech Interface */}
      <div className="w-full max-w-2xl space-y-4">
        {/* Text Input - ChatGPT style */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <Textarea 
            placeholder={language === 'en-GB' 
              ? "Type the sentence you want to practice... e.g. 你好" 
              : "輸入您想練習的句子... 例如 你好"}
            value={spokenText} 
            onChange={e => setSpokenText(e.target.value)} 
            className="min-h-[80px] resize-none border-0 shadow-none focus-visible:ring-0 text-base"
          />
        </div>

        {/* Audio Input */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <Tabs value={audioSource} onValueChange={v => setAudioSource(v as 'record' | 'upload')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="record" className="gap-2">
                <Mic className="h-4 w-4" />
                {t("voiceLab.record")}
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                {t("voiceLab.upload")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="record" className="mt-0">
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-destructive animate-pulse" : "bg-primary hover:bg-primary/90"}`}
                >
                  {isRecording ? <Square className="h-6 w-6 text-primary-foreground" /> : <Mic className="h-6 w-6 text-primary-foreground" />}
                </button>
                <p className="text-sm text-muted-foreground">
                  {isRecording 
                    ? (language === 'en-GB' ? 'Recording... tap to stop' : '錄音中... 點擊停止')
                    : (language === 'en-GB' ? 'Tap to record' : '點擊錄音')}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="mt-0">
              <div className="flex flex-col items-center gap-3">
                <input ref={fileInputRef} type="file" accept=".mp3,.wav,.webm,.ogg,.m4a,audio/*" onChange={handleFileUpload} className="hidden" id="audio-upload" />
                <div className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
                    <Upload className="h-4 w-4" />
                    {t("voiceLab.chooseFile")}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">MP3, WAV, WebM, OGG, M4A (max 10MB)</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Audio Preview */}
          {hasRecording && (
            <div className="mt-4 p-3 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="shrink-0 h-8 w-8" onClick={handlePlayRecording}>
                  {isPlaying ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <div className="flex-1">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${isPlaying ? playbackProgress : 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{uploadedFileName || t("voiceLab.recordingReady")}</p>
                    <p className="text-xs font-medium text-foreground">{formatDuration(audioDuration)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleClearAudio}>
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
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("voiceLab.processing")}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {language === 'en-GB' ? 'Analyze Pronunciation' : '分析發音'}
            </>
          )}
        </Button>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link to="/practice" className="group">
            <div className="bg-card border border-border rounded-xl p-4 text-center transition-all hover:border-primary/30 hover:shadow-sm">
              <BookOpen className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">
                {language === 'en-GB' ? 'Practice Drills' : '練習模式'}
              </p>
            </div>
          </Link>
          <Link to="/pronunciation/results" className="group">
            <div className="bg-card border border-border rounded-xl p-4 text-center transition-all hover:border-primary/30 hover:shadow-sm">
              <BarChart3 className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">
                {language === 'en-GB' ? 'View Results' : '查看結果'}
              </p>
            </div>
          </Link>
        </div>

        {/* Sign in prompt for saving */}
        {!user && (
          <p className="text-center text-sm text-muted-foreground">
            {language === 'en-GB' 
              ? 'Results are available instantly. ' 
              : '結果即時可用。'}
            <Link to="/auth" className="text-primary font-medium hover:underline">
              {language === 'en-GB' ? 'Sign in to save your history' : '登入以保存記錄'}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;
