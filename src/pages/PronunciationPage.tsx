import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mic, Square, Volume2, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PronunciationPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [hasRecording, setHasRecording] = useState(false);
  const [hasGeneratedAudio, setHasGeneratedAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = () => {
        setHasRecording(true);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleGenerateExample = () => {
    // Placeholder for generating example audio
    setHasGeneratedAudio(true);
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
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Play className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-primary rounded-full" />
                  </div>
                  <span className="text-sm text-muted-foreground">0:03</span>
                </div>
              )}
            </div>
          </div>

          {/* Generate Example Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-foreground">
                Example Pronunciation
              </label>
              <Button 
                onClick={handleGenerateExample} 
                variant="secondary" 
                className="gap-2"
                disabled={!spokenText.trim()}
              >
                <Sparkles className="h-4 w-4" />
                Generate Example
              </Button>
            </div>

            {hasGeneratedAudio ? (
              <div className="p-4 bg-muted/50 rounded-xl flex items-center gap-3">
                <Button variant="outline" size="icon" className="shrink-0">
                  <Volume2 className="h-4 w-4" />
                </Button>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-primary rounded-full" />
                </div>
                <span className="text-sm text-muted-foreground">0:00</span>
              </div>
            ) : (
              <div className="p-8 bg-muted/30 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                <Volume2 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {spokenText.trim() 
                    ? "Click 'Generate Example' to hear the correct pronunciation"
                    : "Enter text above to generate an example pronunciation"
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronunciationPage;
