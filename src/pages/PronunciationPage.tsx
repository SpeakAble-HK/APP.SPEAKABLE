import { Link } from "react-router-dom";
import { ArrowLeft, Mic, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PronunciationPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Mic className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Pronunciation Correction
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Practice your pronunciation with real-time feedback and corrections.
            Speak clearly and let AI help you improve.
          </p>
          
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Volume2 className="h-6 w-6 text-muted-foreground" />
              <span className="text-muted-foreground">Ready to listen...</span>
            </div>
            
            <Button size="lg" className="gap-2">
              <Mic className="h-5 w-5" />
              Start Recording
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronunciationPage;
