import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, Square, Play, Sparkles, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const PronunciationPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
  const {
    processRecording,
    isProcessing,
    error
  } = usePronunciationAPI();
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Start duration tracking
      recordingStartTimeRef.current = Date.now();
      setAudioDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
        setAudioDuration(elapsed);
      }, 100);

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        // Stop duration tracking
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        const finalDuration = (Date.now() - recordingStartTimeRef.current) / 1000;
        setAudioDuration(finalDuration);

        const blob = new Blob(audioChunksRef.current, {
          type: 'audio/webm'
        });
        // Revoke previous URL to prevent memory leaks
        if (recordingUrl) {
          URL.revokeObjectURL(recordingUrl);
        }
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

    // Validate file type
    if (!ALLOWED_AUDIO_TYPES.includes(file.type) && !file.name.endsWith('.mp3')) {
      toast.error("Invalid audio format. Supported formats: MP3, WAV, WebM, OGG, M4A");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setRecordingUrl(url);
    setAudioBlob(file);
    setHasRecording(true);
    setUploadedFileName(file.name);
    
    // Get audio duration from uploaded file
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });
    
    toast.success(`Uploaded: ${file.name}`);
  };
  const handleClearAudio = () => {
    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
    }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleProcessRecording = async () => {
    if (!audioBlob || !spokenText.trim()) {
      toast.error("Please provide audio and enter the text you're speaking");
      return;
    }
    try {
      const result = await processRecording(audioBlob, spokenText);
      if (result) {
        toast.success("Processing complete!");
        const contentType = result.clone.content_type || 'audio/wav';
        const generatedAudioUrl = `data:${contentType};base64,${result.clone.audio_base64}`;
        navigate('/pronunciation/results', {
          state: {
            spokenPhonemes: result.spoken,
            intendedPhonemes: result.intended,
            generatedAudioUrl: generatedAudioUrl,
            recordingUrl: recordingUrl,
            intendedText: spokenText.trim()
          }
        });
      }
      // Error toast is already shown by the hook
    } catch (err) {
      // Unexpected error fallback
      toast.error('An unexpected error occurred. Please try again.');
    }
  };
  // Persistent audio element bound to recordingUrl
  useEffect(() => {
    if (!recordingUrl) {
      audioElementRef.current = null;
      return;
    }

    const audio = new Audio(recordingUrl);
    audioElementRef.current = audio;

    const onTimeUpdate = () => {
      if (audio.duration > 0) {
        setPlaybackProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [recordingUrl]);

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl);
      }
    };
  }, []);

  const handlePlayRecording = () => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Playback failed:", err);
        toast.error("Playback failed. Try again.");
      });
    }
  };
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("nav.backToHome")}
          </Button>
        </Link>
        
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Mic className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t("voiceLab.title")}
            </h1>
            
            <p className="text-lg text-muted-foreground">
              {t("voiceLab.subtitle")}
            </p>
          </div>

          {/* Step 1: Text Input Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                1
              </div>
              <h2 className="text-lg font-semibold text-foreground">{t("voiceLab.step1Title")}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {t("voiceLab.step1Desc")}
            </p>
            <Textarea placeholder="e.g., 你好 or Hello, how are you today?" value={spokenText} onChange={e => setSpokenText(e.target.value)} className="min-h-[100px] resize-none" />
          </div>

          {/* Step 2: Audio Input Section with Tabs */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                2
              </div>
              <h2 className="text-lg font-semibold text-foreground">{t("voiceLab.step2Title")}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("voiceLab.step2Desc")}
            </p>
            
            <Tabs value={audioSource} onValueChange={v => setAudioSource(v as 'record' | 'upload')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
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
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-destructive/20 animate-pulse" : "bg-primary/10"}`}>
                    <Mic className={`h-10 w-10 ${isRecording ? "text-destructive" : "text-primary"}`} />
                  </div>
                  
                  <div className="flex gap-3">
                    {!isRecording ? <Button onClick={handleStartRecording} size="lg" className="gap-2">
                        <Mic className="h-5 w-5" />
                        {t("voiceLab.startRecording")}
                      </Button> : <Button onClick={handleStopRecording} size="lg" variant="destructive" className="gap-2">
                        <Square className="h-5 w-5" />
                        {t("voiceLab.stopRecording")}
                      </Button>}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="mt-0">
                <div className="flex flex-col items-center gap-4">
                  <input ref={fileInputRef} type="file" accept=".mp3,.wav,.webm,.ogg,.m4a,audio/*" onChange={handleFileUpload} className="hidden" id="audio-upload" />
                  <div className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("voiceLab.dragDrop")}
                    </p>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                      <Upload className="h-4 w-4" />
                      {t("voiceLab.chooseFile")}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      {t("voiceLab.supportedFormats")}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Audio Preview */}
            {hasRecording && <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="shrink-0" onClick={handlePlayRecording}>
                    {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-100" 
                        style={{ width: `${playbackProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-muted-foreground">
                        {uploadedFileName || t("voiceLab.recordingReady")}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {formatDuration(audioDuration)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={handleClearAudio}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>}
          </div>

          {/* Step 3: Process Recording Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                3
              </div>
              <h2 className="text-lg font-semibold text-foreground">{t("voiceLab.step3Title")}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("voiceLab.step3Desc")}
            </p>
            <div className="flex items-center justify-center">
              <Button onClick={handleProcessRecording} variant="default" size="lg" className="gap-2" disabled={!hasRecording || !spokenText.trim() || isProcessing}>
                {isProcessing ? <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("voiceLab.processing")}
                  </> : <>
                    <Sparkles className="h-4 w-4" />
                    {t("voiceLab.processGenerate")}
                  </>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default PronunciationPage;