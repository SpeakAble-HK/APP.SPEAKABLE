import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Square, Play, Sparkles, Loader2, Upload, X, History, ChevronRight, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import { usePronunciationResults } from "@/hooks/usePronunciationResults";
import { useLanguage } from "@/contexts/LanguageContext";

import { toast } from "sonner";
import { format } from "date-fns";
import mascot from "@/assets/mascot.png";

const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Target phonemes for quick practice
const TARGET_PHONEMES = [
  { phoneme: '/b/', instruction: '雙唇緊閉然後釋放', example: '爸爸' },
  { phoneme: '/p/', instruction: '雙唇緊閉，用力釋放氣流', example: '婆婆' },
  { phoneme: '/m/', instruction: '雙唇緊閉，氣流通過鼻腔', example: '媽媽' },
  { phoneme: '/t/', instruction: '舌尖觸碰上門牙後方', example: '大' },
  { phoneme: '/k/', instruction: '舌根抬起觸碰軟齶', example: '家' },
  { phoneme: '/n/', instruction: '舌尖觸碰上門牙，通過鼻腔', example: '奶奶' },
];

export default function EchoSpeechPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const { results, isLoading: historyLoading } = usePronunciationResults();

  const [selectedPhoneme, setSelectedPhoneme] = useState(TARGET_PHONEMES[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState(TARGET_PHONEMES[0].example);
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
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const { processRecording, isProcessing, error } = usePronunciationAPI();

  const isEn = language === 'en-GB';
  const isTW = language === 'zh-TW';

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPhoneme = () => {
    const utterance = new SpeechSynthesisUtterance(selectedPhoneme.example);
    utterance.lang = 'zh-HK';
    utterance.rate = 0.7;
    speechSynthesis.speak(utterance);
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
      toast.error("Invalid audio format");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Max 10MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setRecordingUrl(url);
    setAudioBlob(file);
    setHasRecording(true);
    setUploadedFileName(file.name);
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => setAudioDuration(audio.duration));
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
      toast.error("請提供音頻並輸入文字");
      return;
    }
    const result = await processRecording(audioBlob, spokenText);
    if (result && 'spoken' in result) {
      toast.success("分析完成！");
      const contentType = result.clone?.content_type || 'audio/wav';
      const generatedAudioUrl = result.clone ? `data:${contentType};base64,${result.clone.audio_base64}` : null;
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
            <h1 className="text-xl font-extrabold text-foreground">Echo Speech</h1>
            <p className="text-xs text-muted-foreground">測試並提升你的發音準確度</p>
          </div>
        </div>
      </section>

      {/* Target Phoneme Selector */}
      <section className="px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border-2 border-primary/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-muted-foreground uppercase">目標音素</p>
              <Button onClick={handlePlayPhoneme} size="sm" variant="outline" className="gap-1 rounded-xl">
                <Volume2 className="h-3.5 w-3.5" />
                播放
              </Button>
            </div>
            <p className="text-4xl font-extrabold text-primary text-center mb-2">{selectedPhoneme.phoneme}</p>
            <p className="text-sm text-center text-foreground mb-1">{selectedPhoneme.example}</p>
            <p className="text-xs text-center text-muted-foreground mb-4">{selectedPhoneme.instruction}</p>

            <div className="flex flex-wrap gap-2 justify-center">
              {TARGET_PHONEMES.map((tp) => (
                <button
                  key={tp.phoneme}
                  onClick={() => { setSelectedPhoneme(tp); setSpokenText(tp.example); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    selectedPhoneme.phoneme === tp.phoneme
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:border-primary/30'
                  }`}
                >
                  {tp.phoneme}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recording & Analysis Card */}
      <section className="px-4 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
            <div className="p-4 space-y-4">
              {/* Text input */}
              <div>
                <label htmlFor="practice-text" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  你要說什麼？
                </label>
                <Textarea
                  id="practice-text"
                  placeholder="輸入句子..."
                  value={spokenText}
                  onChange={e => setSpokenText(e.target.value)}
                  className="min-h-[60px] resize-none border-2 border-border bg-background text-base rounded-xl focus:border-primary"
                />
              </div>

              {/* Audio input tabs */}
              <Tabs value={audioSource} onValueChange={v => setAudioSource(v as 'record' | 'upload')}>
                <TabsList className="h-10 bg-muted p-1 gap-1 rounded-xl w-full">
                  <TabsTrigger value="record" className="gap-1.5 text-xs px-3 h-8 rounded-lg font-bold flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    <Mic className="h-3.5 w-3.5" />
                    錄音
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-1.5 text-xs px-3 h-8 rounded-lg font-bold flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    <Upload className="h-3.5 w-3.5" />
                    上傳
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="record" className="mt-3">
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                        isRecording ? 'bg-destructive animate-pulse shadow-lg' : 'bg-primary hover:bg-primary/90 shadow-md game-btn'
                      }`}
                      style={!isRecording ? { boxShadow: '0 4px 0 hsl(var(--primary-dark))' } : {}}
                    >
                      {isRecording ? <Square className="h-6 w-6 text-primary-foreground" /> : <Mic className="h-7 w-7 text-primary-foreground" />}
                    </button>
                    <p className="text-xs text-muted-foreground font-bold">
                      {isRecording ? `🔴 錄音中... ${formatDuration(audioDuration)}` : '點擊錄音'}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="mt-3">
                  <input ref={fileInputRef} type="file" accept=".mp3,.wav,.webm,.ogg,.m4a,audio/*" onChange={handleFileUpload} className="hidden" id="audio-upload" />
                  <div
                    className="w-full border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-primary/40 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs font-bold text-muted-foreground">選擇音頻檔案</p>
                    <p className="text-[10px] text-muted-foreground mt-1">MP3, WAV, WebM, OGG, M4A (max 10MB)</p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Audio Preview */}
              {hasRecording && (
                <div className="p-3 bg-muted/50 rounded-xl border-2 border-border">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 rounded-lg" onClick={handlePlayRecording}>
                      {isPlaying ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </Button>
                    <div className="flex-1">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${isPlaying ? playbackProgress : 100}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold mt-1">{uploadedFileName || '錄音就緒'} · {formatDuration(audioDuration)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg" onClick={handleClearAudio}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {(isRecording || hasRecording) && (
                <div className="bg-muted/30 rounded-xl p-3 border-2 border-border">
                  <WaveformVisualizer isRecording={isRecording} audioStream={audioStream} accuracy={null} />
                </div>
              )}

              <Button
                onClick={handleProcessRecording}
                className="w-full gap-2 rounded-xl h-12 text-base font-extrabold game-btn"
                style={{ boxShadow: '0 4px 0 hsl(var(--primary-dark))' }}
                disabled={!hasRecording || !spokenText.trim() || isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> 分析中...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> 檢查我的發音</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="px-4 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-extrabold text-foreground">歷史紀錄</h2>
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
            <div className="bg-card border-2 border-border rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground">尚無紀錄。試試分析你的發音吧！</p>
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
    </div>
  );
}
