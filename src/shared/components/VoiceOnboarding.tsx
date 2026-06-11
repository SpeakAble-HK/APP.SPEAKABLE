import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/shared/components/MaterialIcon";
import { useCurrency } from "@/shared/hooks/useCurrency";
import { saveVoiceSample } from "@/shared/hooks/useVoiceSampleStore";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import mascot from "@/assets/pipi-mascot.png";

type Stage = "record" | "playback" | "uploading" | "demo";

interface VoiceOnboardingProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function VoiceOnboarding({ onComplete, onCancel }: VoiceOnboardingProps) {
  const navigate = useNavigate();
  const { coins, xp } = useCurrency();

  const [stage, setStage] = useState<Stage>("record");
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [demoText, setDemoText] = useState("你好，我正在學習說話！");
  const [demoResult, setDemoResult] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        blobRef.current = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        setIsRecording(false);
        setHasRecording(true);
        setStage("playback");
        if (timerRef.current) clearInterval(timerRef.current);
      };
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      mr.start();
      setIsRecording(true);
    } catch {
      setUploadStatus("無法存取麥克風。");
    }
  };

  const handlePlayback = () => {
    if (!blobRef.current) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const url = URL.createObjectURL(blobRef.current);
    const a = new Audio(url);
    audioRef.current = a;
    a.onended = () => URL.revokeObjectURL(url);
    a.play().catch(() => {});
  };

  const handleUpload = async () => {
    if (!blobRef.current) return;
    setUploadStatus("上傳中⋯");
    setStage("uploading");
    try {
      await saveVoiceSample("sample1", blobRef.current);
      setUploadStatus("語音樣本已儲存！");
      const token = await (async () => {
        let { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error || !data.session?.access_token) throw new Error("No session");
          session = data.session;
        }
        return session.access_token;
      })();
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const fd = new FormData();
      fd.append("prompt_audio", blobRef.current, "voice-sample.webm");
      fd.append("prompt_text", "你好，我正在學習說話！");
      fd.append("text", "你好，我正在學習說話！");
      const res = await fetch(`${projectUrl}/functions/v1/voice-clone`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: fd,
      });
      if (res.ok) {
        setUploadStatus("語音模型已準備好！");
      } else {
        setUploadStatus("語音樣本已儲存，複製功能稍後可用。");
      }
    } catch {
      setUploadStatus("語音樣本已本地儲存。");
    }
    setStage("demo");
  };

  const handleGenerate = async () => {
    if (!demoText.trim()) { setDemoResult("請輸入文字。"); return; }
    setDemoResult("生成中⋯");
    try {
      const sample = blobRef.current;
      if (!sample) {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(demoText);
          u.lang = "zh-HK";
          u.rate = 0.8;
          u.onend = () => setDemoResult("正在播放預設語音！");
          window.speechSynthesis.speak(u);
        } else {
          setDemoResult("語音複製功能即將推出，敬請期待！");
        }
        return;
      }
      const token = await (async () => {
        let { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error || !data.session?.access_token) throw new Error("No session");
          session = data.session;
        }
        return session.access_token;
      })();
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const fd = new FormData();
      fd.append("text", demoText);
      fd.append("prompt_text", demoText);
      fd.append("prompt_audio", sample, "voice-sample.webm");
      const res = await fetch(`${projectUrl}/functions/v1/voice-clone`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (data.audio_base64 && data.content_type) {
        const raw = atob(data.audio_base64);
        const u8 = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
        const audioBlob = new Blob([u8], { type: data.content_type });
        const url = URL.createObjectURL(audioBlob);
        const a = new Audio(url);
        a.onended = () => { URL.revokeObjectURL(url); setDemoResult("正在播放你的複製語音！"); };
        a.onerror = () => URL.revokeObjectURL(url);
        await a.play();
      } else {
        setDemoResult("語音複製功能即將推出，敬請期待！");
      }
    } catch {
      setDemoResult("語音複製功能即將推出，敬請期待！");
    }
  };

  const handleContinue = () => {
    if (onComplete) onComplete();
    else navigate("/adventure-start");
  };

  return (
    <div className="min-h-screen overflow-x-hidden relative bg-surface font-body text-on-surface">
      {/* Ocean blobs */}
      <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-primary-container blur-[80px] opacity-45 pointer-events-none animate-float-blob" aria-hidden="true" />
      <div className="absolute top-1/3 -right-20 w-[380px] h-[380px] rounded-full bg-secondary-container blur-[80px] opacity-45 pointer-events-none animate-float-blob" style={{ animationDelay: "-6s" }} aria-hidden="true" />
      <div className="absolute bottom-20 left-1/4 w-[300px] h-[300px] rounded-full bg-tertiary-container blur-[80px] opacity-45 pointer-events-none animate-float-blob" style={{ animationDelay: "-10s" }} aria-hidden="true" />

      {/* Header */}
      <header className="relative z-20 px-4 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity active:scale-95"
          aria-label="返回首頁"
        >
          <img src={logo} alt="" className="h-9 w-9 object-contain" />
          <span className="font-headline text-xl sm:text-2xl font-bold text-primary tracking-tight">SpeakAble HK</span>
        </button>
        <div className="glass-card rounded-full px-4 py-2 flex items-center gap-4 text-sm font-medium text-on-surface">
          <span className="flex items-center gap-1.5">
            <MaterialIcon icon="monetization_on" filled className="text-tertiary text-lg" />
            <span>{coins}</span>
          </span>
          <span className="w-px h-5 bg-surface-variant/80" />
          <span className="flex items-center gap-1.5">
            <MaterialIcon icon="auto_awesome" filled className="text-primary text-lg" />
            <span>{xp}</span>
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 pb-40 pt-2">
        {/* Hero spectrogram */}
        <section className="text-center mb-8">
          <div className="flex items-end justify-center gap-[3px] h-16 max-w-md mx-auto mb-6" aria-hidden="true">
            {Array.from({ length: 28 }, (_, i) => (
              <div
                key={i}
                className="w-1 min-h-[8px] rounded-full bg-gradient-to-b from-primary-container to-primary animate-spec-bar"
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-primary mb-2">
            從你自己的聲音中學習
          </h1>
          <p className="text-on-surface/90 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            錄製一段簡短的語音樣本。我們會建立你的個人語音模型，讓你聽到自己正確發音的效果！
          </p>
        </section>

        {/* Recording card */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col items-center">
            {isRecording && (
              <div className="mb-4 text-lg font-semibold text-secondary tabular-nums" aria-live="polite">
                {formatTime(seconds)}
              </div>
            )}
            <button
              onClick={handleRecord}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-transform focus:outline-none focus:ring-4 focus:ring-primary-container"
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              <MaterialIcon icon={isRecording ? "stop" : "mic"} className="text-5xl sm:text-6xl" />
              {isRecording && (
                <span className="absolute inset-0 rounded-full pointer-events-none border-4 border-red-500/90 animate-pulse-ring" />
              )}
            </button>
            <p className="mt-4 text-sm text-on-surface/70">
              {isRecording ? "點擊停止" : hasRecording ? "錄音完成！" : "點擊開始錄音"}
            </p>
          </div>

          {/* Waveform playback */}
          {hasRecording && (stage === "playback" || stage === "demo") && (
            <div className="mt-8">
              <p className="text-center text-sm font-medium text-primary mb-3">你的錄音</p>
              <div className="flex items-end justify-center gap-1 h-14 mx-auto max-w-xs" aria-hidden="true">
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded bg-gradient-to-b from-secondary-container to-secondary animate-wave-bar"
                    style={{
                      height: `${18 + (i * 7) % 32}%`,
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {hasRecording && stage === "playback" && (
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handlePlayback}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 bg-secondary-container text-secondary font-semibold hover:opacity-90 transition-opacity"
              >
                <MaterialIcon icon="play_arrow" />
                播放
              </button>
              <button
                onClick={handleUpload}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity"
              >
                <MaterialIcon icon="cloud_upload" />
                上傳及複製
              </button>
            </div>
          )}

          {uploadStatus && (
            <p className="mt-4 text-center text-sm" role="status">{uploadStatus}</p>
          )}
        </section>

        {/* Demo section */}
        {stage === "demo" && (
          <section className="glass-card rounded-3xl p-6 sm:p-8 mb-8">
            <h2 className="font-headline text-xl font-bold text-primary mb-2 text-center">示範你的聲音</h2>
            <p className="text-center text-sm text-on-surface/75 mb-6">
              輸入一段文字，用你的語音模型聽聽效果。
            </p>
            <textarea
              rows={3}
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              className="w-full rounded-2xl border border-surface-variant bg-white/80 px-4 py-3 text-on-surface placeholder:text-outline/70 focus:border-primary focus:ring-primary focus:outline-none mb-4"
              placeholder="輸入要朗讀的文字⋯"
            />
            <div className="flex justify-center mb-4">
              <button
                onClick={handleGenerate}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3 bg-tertiary-container text-tertiary font-bold hover:opacity-90 transition-opacity"
              >
                <MaterialIcon icon="graphic_eq" />
                生成
              </button>
            </div>
            {demoResult && (
              <div className="rounded-2xl bg-surface-container-low/90 p-4 text-center text-sm" role="region" aria-live="polite">
                {demoResult}
              </div>
            )}
          </section>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 bg-primary text-on-primary font-bold shadow-lg shadow-primary/25 hover:opacity-95 transition-opacity active:scale-[0.98]"
          >
            繼續冒險
            <MaterialIcon icon="arrow_forward" />
          </button>
          {onCancel && (
            <button onClick={onCancel} className="ml-4 text-sm text-on-surface-variant hover:text-primary transition-colors">
              稍後再說
            </button>
          )}
        </div>
      </main>

      {/* PiPi corner widget */}
      <div className="fixed bottom-6 right-4 sm:right-8 z-50 flex items-end gap-3 max-w-[min(100%,320px)]">
        <div className="glass-card rounded-2xl rounded-br-sm px-4 py-3 text-sm text-on-surface shadow-lg max-w-[220px]">
          你的聲音獨一無二！一起學習吧！
        </div>
        <img
          src={mascot}
          alt=""
          role="presentation"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover shadow-lg border-2 border-white/60 animate-pipi-bob"
        />
      </div>
    </div>
  );
}
