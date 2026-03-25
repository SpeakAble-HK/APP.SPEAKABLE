import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BrandHeader } from "@/components/BrandHeader";
import { MaterialIcon } from "@/components/MaterialIcon";
import { toast } from "sonner";
import mascot from "@/assets/pipi-mascot.png";

const PROMPT_TEXT = "你好，早晨啊皮皮";
const STEPS = ["暱稱", "聲音複製"] as const;

export default function ExplorerOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");

  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleNicknameNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      toast.error("請輸入你的暱稱。");
      return;
    }
    setStep(1);
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.current = mr;
      mr.start();
      setRecording(true);
      setAudioURL(null);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("無法存取麥克風，請檢查權限設定。");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop();
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetRecording = () => {
    setAudioURL(null);
    setSeconds(0);
  };

  const handleFinish = () => {
    if (!audioURL) {
      toast.error("請先錄製你的聲音。");
      return;
    }
    localStorage.setItem(
      "speakable_user",
      JSON.stringify({ nickname: nickname.trim(), role: "learner", voiceCloned: true })
    );
    navigate("/adventure-start");
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="font-body text-on-surface min-h-screen relative overflow-x-hidden bg-background">
      {/* Gradient background + blobs */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#c8e8f2] via-surface to-[#a8d4e8]" aria-hidden="true" />
      <div className="fixed -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-[100px] -z-10" aria-hidden="true" />
      <div className="fixed top-1/4 -right-16 h-[22rem] w-[22rem] rounded-full bg-secondary-container/40 blur-[90px] -z-10" aria-hidden="true" />
      <div className="fixed bottom-20 left-1/4 h-[18rem] w-[18rem] rounded-full bg-tertiary-container/35 blur-[80px] -z-10" aria-hidden="true" />
      <div className="fixed bottom-0 right-1/3 h-64 w-64 rounded-full bg-primary-fixed/30 blur-[70px] -z-10" aria-hidden="true" />
      <div className="fixed top-40 left-1/3 h-40 w-56 rounded-[60%] bg-white/40 blur-3xl -z-10 rotate-12" aria-hidden="true" />

      <BrandHeader showBack />

      {/* Progress bar */}
      <div className="fixed top-14 left-0 w-full z-40 px-0">
        <div className="mx-auto max-w-lg px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={`text-xs font-bold transition-colors ${
                  i <= step ? "text-primary" : "text-on-surface-variant/50"
                }`}
              >
                {i + 1}. {label}
              </span>
            ))}
          </div>
          <div className="h-2 w-full rounded-full bg-surface-container overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-4 pt-32 pb-32 sm:pt-36">
        {/* Step 1: Nickname */}
        {step === 0 && (
          <>
            <header className="mb-8 flex flex-col items-center text-center">
              <p className="font-headline text-xl font-bold text-on-surface sm:text-2xl">
                開始你的語言旅程
              </p>
            </header>

            <form
              onSubmit={handleNicknameNext}
              className="glass-card rounded-xl border border-white/60 p-6 shadow-xl shadow-primary/10 sm:p-8"
            >
              <div>
                <label
                  htmlFor="nickname"
                  className="font-label mb-1.5 block text-sm font-semibold text-on-surface"
                >
                  暱稱
                </label>
                <input
                  type="text"
                  id="nickname"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest/80 px-4 py-3 font-body text-on-surface shadow-sm focus:border-primary focus:ring-primary focus:outline-none"
                  placeholder="你希望怎樣稱呼"
                />
              </div>

              <button
                type="submit"
                className="font-label mt-8 w-full rounded-lg bg-primary py-4 text-base font-bold text-on-primary shadow-lg shadow-primary/30 transition hover:bg-primary-dim focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98]"
              >
                下一步
              </button>
            </form>
          </>
        )}

        {/* Step 2: Voice clone */}
        {step === 1 && (
          <>
            <header className="mb-8 flex flex-col items-center text-center gap-3">
              <img
                src={mascot}
                alt=""
                className="w-20 h-20 object-contain drop-shadow-xl animate-pipi-bob"
              />
              <p className="font-headline text-xl font-bold text-on-surface sm:text-2xl">
                讓皮皮認識你的聲音
              </p>
              <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
                請朗讀以下句子，我們會用你的聲音來建立個人化的練習體驗。
              </p>
            </header>

            <div className="glass-card rounded-xl border border-white/60 p-6 shadow-xl shadow-primary/10 sm:p-8 space-y-6">
              {/* Prompt card */}
              <div className="bg-primary-container/30 rounded-xl p-5 text-center border border-primary/10">
                <p className="text-xs text-on-surface-variant mb-2 font-medium">請朗讀：</p>
                <p className="font-headline text-2xl sm:text-3xl font-bold text-primary tracking-wide">
                  「{PROMPT_TEXT}」
                </p>
              </div>

              {/* Recording controls */}
              <div className="flex flex-col items-center gap-4">
                {/* Timer */}
                <span className="font-mono text-2xl font-bold text-on-surface tabular-nums">
                  {fmt(seconds)}
                </span>

                {/* Record / Stop button */}
                {!recording && !audioURL && (
                  <button
                    onClick={startRecording}
                    className="w-20 h-20 rounded-full bg-error text-on-error shadow-lg shadow-error/30 flex items-center justify-center hover:bg-error/90 active:scale-95 transition-all"
                    aria-label="開始錄音"
                  >
                    <MaterialIcon icon="mic" className="text-3xl" />
                  </button>
                )}

                {recording && (
                  <button
                    onClick={stopRecording}
                    className="w-20 h-20 rounded-full bg-error text-on-error shadow-lg shadow-error/30 flex items-center justify-center hover:bg-error/90 active:scale-95 transition-all animate-pulse"
                    aria-label="停止錄音"
                  >
                    <MaterialIcon icon="stop" className="text-3xl" />
                  </button>
                )}

                {!recording && audioURL && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    {/* Playback */}
                    <audio src={audioURL} controls className="w-full max-w-xs" />

                    <div className="flex gap-3">
                      <button
                        onClick={resetRecording}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface font-bold text-sm hover:bg-surface-container active:scale-95 transition-all"
                      >
                        <MaterialIcon icon="refresh" className="text-lg" />
                        重新錄製
                      </button>
                    </div>
                  </div>
                )}

                {!recording && !audioURL && (
                  <p className="text-xs text-on-surface-variant">點擊按鈕開始錄音</p>
                )}

                {recording && (
                  <p className="text-xs text-error font-bold animate-pulse">錄音中⋯ 點擊停止</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 rounded-lg border border-outline-variant py-3.5 text-sm font-bold text-on-surface hover:bg-surface-container active:scale-[0.98] transition-all"
                >
                  上一步
                </button>
                <button
                  onClick={handleFinish}
                  disabled={!audioURL}
                  className="flex-1 rounded-lg bg-primary py-3.5 text-base font-bold text-on-primary shadow-lg shadow-primary/30 transition hover:bg-primary-dim active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  開始旅程
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Wave SVG footer */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-0 overflow-hidden leading-none text-primary/20" aria-hidden="true">
        <svg className="relative block w-full h-[120px] sm:h-[160px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,74.7C672,75,768,53,864,48C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          <path fill="currentColor" fillOpacity="0.45" d="M0,90L60,85.3C120,81,240,71,360,74.7C480,79,600,95,720,90.7C840,85,960,59,1080,53.3C1200,47,1320,61,1380,68L1440,75L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" />
        </svg>
      </div>
    </div>
  );
}
