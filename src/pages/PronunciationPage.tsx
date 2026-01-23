import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, Square, Play, Sparkles, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import { toast } from "sonner";

const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const PronunciationPage = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioSource, setAudioSource] = useState<'record' | 'upload'>('record');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    processRecording, 
    isProcessing, 
    error,
  } = usePronunciationAPI();

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          generatedAudioUrl: generatedAudioUrl,
          recordingUrl: recordingUrl
        }
      });
    } else if (error) {
      toast.error(error);
    }
  };

  const handlePlayRecording = () => {
    if (recordingUrl) {
      const audio = new Audio(recordingUrl);
      audio.play();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Mic className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Voice Lab
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Practice your pronunciation with real-time feedback and corrections.
            </p>
          </div>

          {/* Text Input Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              What are you speaking?
            </label>
            <Textarea
              placeholder="Type the text you want to practice pronouncing..."
              value={spokenText}
              onChange={(e) => setSpokenText(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Audio Input Section with Tabs */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
            <Tabs value={audioSource} onValueChange={(v) => setAudioSource(v as 'record' | 'upload')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="record" className="gap-2">
                  <Mic className="h-4 w-4" />
                  Record
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="record" className="mt-0">
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? "bg-destructive/20 animate-pulse" 
                      : "bg-primary/10"
                  }`}>
                    <Mic className={`h-10 w-10 ${isRecording ? "text-destructive" : "text-primary"}`} />
                  </div>
                  
                  <div className="flex gap-3">
                    {!isRecording ? (
                      <Button onClick={handleStartRecording} size="lg" className="gap-2">
                        <Mic className="h-5 w-5" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button onClick={handleStopRecording} size="lg" variant="destructive" className="gap-2">
                        <Square className="h-5 w-5" />
                        Stop Recording
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="mt-0">
                <div className="flex flex-col items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,.wav,.webm,.ogg,.m4a,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="audio-upload"
                  />
                  <div className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop an audio file, or click to browse
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Supported: MP3, WAV, WebM, OGG, M4A (max 10MB)
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Audio Preview */}
            {hasRecording && (
              <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="shrink-0" onClick={handlePlayRecording}>
                    <Play className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-primary rounded-full" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {uploadedFileName || "Recording ready"}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={handleClearAudio}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Process Recording Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-center">
              <Button 
                onClick={handleProcessRecording} 
                variant="default" 
                size="lg"
                className="gap-2"
                disabled={!hasRecording || !spokenText.trim() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Process & Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronunciationPage;
