import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Square, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import mascot from "@/assets/mascot.png";
import { GlobalHeader } from "@/components/GlobalHeader";

export default function ExplorerOnboardingPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<'info' | 'voice'>('info');
  const [nickname, setNickname] = useState('');

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleInfoNext = () => {
    if (!nickname.trim()) {
      toast.error('請輸入你的暱稱');
      return;
    }
    setStep('voice');
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordingUrl(URL.createObjectURL(blob));
        setHasRecording(true);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast.error('無法使用麥克風');
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleComplete = () => {
    // Store nickname in sessionStorage for the prototype
    sessionStorage.setItem('explorer_nickname', nickname.trim());
    toast.success(`歡迎，${nickname}！🎉`);
    navigate('/explorer');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <img src={mascot} alt="" className="h-20 w-20 object-contain mascot-bounce mb-6" />

      {step === 'info' && (
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-foreground mb-1">歡迎，探險家！</h1>
            <p className="text-sm text-muted-foreground">告訴我們一些關於你的事情</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nickname" className="text-sm font-bold">暱稱 <span className="text-destructive">*</span></Label>
              <Input
                id="nickname"
                placeholder="你的暱稱"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="h-12 rounded-xl text-lg"
              />
            </div>
          </div>

          <Button
            onClick={handleInfoNext}
            className="w-full h-14 text-lg font-extrabold rounded-2xl game-btn gap-2"
            style={{ boxShadow: '0 5px 0 hsl(var(--primary-dark))' }}
          >
            下一步
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {step === 'voice' && (
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-foreground mb-1">聲音設定</h1>
            <p className="text-sm text-muted-foreground">錄製你的聲音，用於未來所有音頻播放</p>
          </div>

          <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 text-center">
            <p className="text-3xl font-extrabold text-foreground mb-2">hello 皮皮</p>
            <p className="text-sm text-muted-foreground">按下錄音鍵，然後大聲讀出來</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-destructive animate-pulse shadow-lg'
                  : 'bg-primary hover:bg-primary/90 shadow-md game-btn'
              }`}
              style={!isRecording ? { boxShadow: '0 5px 0 hsl(var(--primary-dark))' } : {}}
            >
              {isRecording ? (
                <Square className="h-8 w-8 text-primary-foreground" />
              ) : (
                <Mic className="h-10 w-10 text-primary-foreground" />
              )}
            </button>
            <p className="text-sm text-muted-foreground font-bold">
              {isRecording ? '🔴 錄音中...' : hasRecording ? '✅ 錄音完成！' : '點擊開始錄音'}
            </p>
          </div>

          {hasRecording && recordingUrl && (
            <div className="bg-muted/50 rounded-xl p-3 border border-border">
              <audio src={recordingUrl} controls className="w-full h-10" preload="auto" />
            </div>
          )}

          <Button
            onClick={handleComplete}
            className="w-full h-14 text-lg font-extrabold rounded-2xl game-btn gap-2"
            style={{ boxShadow: '0 5px 0 hsl(var(--primary-dark))' }}
          >
            完成！開始探險
            <Check className="h-5 w-5" />
          </Button>

          <button
            onClick={handleComplete}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            跳過錄音
          </button>
        </div>
      )}
    </div>
  );
}
