import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, Square, Play, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";
import { toast } from "sonner";

const PronunciationPage = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { 
    processRecording, 
    isProcessing, 
    error,
    getGeneratedAudioUrl 
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

  const handleProcessRecording = async () => {
    if (!audioBlob || !spokenText.trim()) {
      toast.error("Please record audio and enter the text you're speaking");
      return;
    }

    const result = await processRecording(audioBlob, spokenText);
    if (result) {
      toast.success("Processing complete!");
      // Navigate to results page with the data
      navigate('/pronunciation/results', {
        state: {
          spokenPhonemes: result.spoken,
          intendedPhonemes: result.intended,
          generatedAudioUrl: getGeneratedAudioUrl(),
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
              Pronunciation Correction
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

          {/* Recording Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
            <label className="block text-sm font-medium text-foreground mb-4">
              Your Recording
            </label>
            
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

              {hasRecording && (
                <div className="w-full mt-4 p-4 bg-muted/50 rounded-xl flex items-center gap-3">
                  <Button variant="outline" size="icon" className="shrink-0" onClick={handlePlayRecording}>
                    <Play className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-primary rounded-full" />
                  </div>
                  <span className="text-sm text-muted-foreground">Recording ready</span>
                </div>
              )}
            </div>
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
