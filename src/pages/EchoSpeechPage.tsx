import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Square, Play, Sparkles, Loader2, Upload, X, History, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import { usePronunciationResults } from "@/hooks/usePronunciationResults";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import mascot from "@/assets/mascot.png";

const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function EchoSpeechPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { results, isLoading: historyLoading } = usePronunciationResults();

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

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-success";
    if (accuracy >= 50) return "text-accent";
    return "text-destructive";
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <section className="px-4 pt-6 pb-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <img src={mascot} alt="" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-xl font-extrabold text-foreground">
              {isEn ? "Echo Speech" : "迴聲語音"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEn ? "Test and improve your pronunciation accuracy" : isTW ? "測試並提升你的發音準確度" : "测试并提升你的发音准确度"}
            </p>
          </div>
        </div>
      </section>

      {/* Main Echo Speech Card */}
      <section className="px-4 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border-2 border-primary/20 rounded-2xl overflow-hidden">
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
                <p className="text-[11px] text-muted-foreground font-bold mt-1.5">{spokenText.length} {isEn ? "characters" : "字"}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["你好", "早晨", "多謝", "再見", "食咗飯未", "唔該"].map(word => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => setSpokenText(word)}
                      className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      {word}
                    </button>
                  ))}
                </div>
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

      {/* History Records */}
      <section className="px-4 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-extrabold text-foreground">
              {isEn ? "History" : isTW ? "歷史紀錄" : "历史记录"}
            </h2>
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
            <div className="bg-card border-2 border-border rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isEn ? "No records yet. Try analysing your pronunciation!" : isTW ? "尚無紀錄。試試分析你的發音吧！" : "暂无记录。试试分析你的发音吧！"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => navigate('/pronunciation/results', { state: { fromHistory: true, historyId: result.id } })}
                  className="w-full flex items-center gap-3 bg-card border-2 border-border rounded-2xl p-3 hover:border-primary/30 hover:shadow-sm transition-all text-left"
                >
                  <div className={`text-lg font-extrabold ${getAccuracyColor(result.overall_accuracy)} min-w-[48px] text-center`}>
                    {result.overall_accuracy}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{result.intended_text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(result.created_at), 'yyyy-MM-dd HH:mm')}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <TrialLimitModal open={showTrialModal} onOpenChange={setShowTrialModal} />
    </div>
  );
}
