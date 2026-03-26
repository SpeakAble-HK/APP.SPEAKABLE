import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { BrandHeader } from "@/components/BrandHeader";
import { MaterialIcon } from "@/components/MaterialIcon";
import { toast } from "sonner";
import mascot from "@/assets/pipi-mascot.png";
import {
  ExplorerOnboardingProvider,
  useExplorerOnboarding,
} from "@/contexts/ExplorerOnboardingContext";

const STEPS = ["暱稱", "聲音樣本 1", "聲音樣本 2"] as const;

const VOICE_PHRASES = {
  1: "你好，朋友！",
  2: "皮皮早晨！",
} as const;

function useOnboardingRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setAudioURL((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
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

  const resetRecording = useCallback(() => {
    setAudioURL((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setSeconds(0);
  }, []);

  const setAudioURLExternal = useCallback((url: string | null) => {
    setAudioURL((prev) => {
      if (prev && prev !== url) URL.revokeObjectURL(prev);
      return url;
    });
  }, []);

  return {
    recording,
    audioURL,
    seconds,
    startRecording,
    stopRecording,
    resetRecording,
    setAudioURLExternal,
    setSeconds,
  };
}

function OnboardingProgress() {
  const location = useLocation();
  const step =
    location.pathname.endsWith("/voice/2") ? 2 : location.pathname.endsWith("/voice/1") ? 1 : 0;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed top-14 left-0 w-full z-40 px-0">
      <div className="mx-auto max-w-lg px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-1.5 gap-1">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`text-[10px] sm:text-xs font-bold transition-colors text-center leading-tight ${
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
  );
}

function OnboardingBackground() {
  return (
    <>
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-b from-[#c8e8f2] via-surface to-[#a8d4e8]"
        aria-hidden="true"
      />
      <div
        className="fixed -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-[100px] -z-10"
        aria-hidden="true"
      />
      <div
        className="fixed top-1/4 -right-16 h-[22rem] w-[22rem] rounded-full bg-secondary-container/40 blur-[90px] -z-10"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-20 left-1/4 h-[18rem] w-[18rem] rounded-full bg-tertiary-container/35 blur-[80px] -z-10"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-0 right-1/3 h-64 w-64 rounded-full bg-primary-fixed/30 blur-[70px] -z-10"
        aria-hidden="true"
      />
      <div
        className="fixed top-40 left-1/3 h-40 w-56 rounded-[60%] bg-white/40 blur-3xl -z-10 rotate-12"
        aria-hidden="true"
      />
    </>
  );
}

function OnboardingWaveFooter() {
  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-0 overflow-hidden leading-none text-primary/20"
      aria-hidden="true"
    >
      <svg
        className="relative block w-full h-[120px] sm:h-[160px]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,74.7C672,75,768,53,864,48C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
        />
        <path
          fill="currentColor"
          fillOpacity="0.45"
          d="M0,90L60,85.3C120,81,240,71,360,74.7C480,79,600,95,720,90.7C840,85,960,59,1080,53.3C1200,47,1320,61,1380,68L1440,75L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
        />
      </svg>
    </div>
  );
}

function NicknamePage() {
  const navigate = useNavigate();
  const { nickname, setNickname } = useExplorerOnboarding();
  const [localNick, setLocalNick] = useState(nickname);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localNick.trim()) {
      toast.error("請輸入你的暱稱。");
      return;
    }
    setNickname(localNick.trim());
    navigate("/explorer/onboarding/voice/1");
  };

  return (
    <>
      <header className="mb-8 flex flex-col items-center text-center">
        <p className="font-headline text-xl font-bold text-on-surface sm:text-2xl">開始你的語言旅程</p>
      </header>

      <form
        onSubmit={handleSubmit}
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
            value={localNick}
            onChange={(e) => setLocalNick(e.target.value)}
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
  );
}

type VoiceSample = 1 | 2;

function VoiceSamplePage({ sample }: { sample: VoiceSample }) {
  const navigate = useNavigate();
  const { nickname, voice1Url, voice2Url, setVoice1Url, setVoice2Url } = useExplorerOnboarding();
  const phrase = VOICE_PHRASES[sample];

  const {
    recording,
    audioURL,
    seconds,
    startRecording,
    stopRecording,
    resetRecording,
    setAudioURLExternal,
    setSeconds,
  } = useOnboardingRecorder();

  const savedUrl = sample === 1 ? voice1Url : voice2Url;

  useEffect(() => {
    if (!savedUrl) return;
    setAudioURLExternal(savedUrl);
    setSeconds(0);
  }, [sample, savedUrl, setAudioURLExternal, setSeconds]);

  if (!nickname.trim()) {
    return <Navigate to="/explorer/onboarding" replace />;
  }
  if (sample === 2 && !voice1Url) {
    return <Navigate to="/explorer/onboarding/voice/1" replace />;
  }

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleBack = () => {
    if (sample === 1) navigate("/explorer/onboarding");
    else navigate("/explorer/onboarding/voice/1");
  };

  const handleNextFromSample1 = () => {
    if (!audioURL) {
      toast.error("請先錄製你的聲音。");
      return;
    }
    setVoice1Url(audioURL);
    navigate("/explorer/onboarding/voice/2");
  };

  const handleFinish = () => {
    if (!audioURL) {
      toast.error("請先錄製你的聲音。");
      return;
    }
    setVoice2Url(audioURL);
    localStorage.setItem(
      "speakable_user",
      JSON.stringify({
        nickname: nickname.trim(),
        role: "learner",
        voiceCloned: true,
        voiceSamples: 2,
      })
    );
    navigate("/adventure-start");
  };

  return (
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
          {sample === 1
            ? "第一句：請朗讀下方句子並錄音。完成兩句錄音有助聲音複製更準確。"
            : "第二句：再朗讀一句，讓皮皮更熟悉你的聲音。"}
        </p>
      </header>

      <div className="glass-card rounded-xl border border-white/60 p-6 shadow-xl shadow-primary/10 sm:p-8 space-y-6">
        <div className="bg-primary-container/30 rounded-xl p-5 text-center border border-primary/10">
          <p className="text-xs text-on-surface-variant mb-2 font-medium">
            聲音樣本 {sample}/2 — 請朗讀：
          </p>
          <p className="font-headline text-2xl sm:text-3xl font-bold text-primary tracking-wide">
            「{phrase}」
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <span className="font-mono text-2xl font-bold text-on-surface tabular-nums">
            {fmt(seconds)}
          </span>

          {!recording && !audioURL && (
            <button
              type="button"
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-error text-on-error shadow-lg shadow-error/30 flex items-center justify-center hover:bg-error/90 active:scale-95 transition-all"
              aria-label="開始錄音"
            >
              <MaterialIcon icon="mic" className="text-3xl" />
            </button>
          )}

          {recording && (
            <button
              type="button"
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-error text-on-error shadow-lg shadow-error/30 flex items-center justify-center hover:bg-error/90 active:scale-95 transition-all animate-pulse"
              aria-label="停止錄音"
            >
              <MaterialIcon icon="stop" className="text-3xl" />
            </button>
          )}

          {!recording && audioURL && (
            <div className="flex flex-col items-center gap-3 w-full">
              <audio src={audioURL} controls className="w-full max-w-xs" />
              <button
                type="button"
                onClick={resetRecording}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface font-bold text-sm hover:bg-surface-container active:scale-95 transition-all"
              >
                <MaterialIcon icon="refresh" className="text-lg" />
                重新錄製
              </button>
            </div>
          )}

          {!recording && !audioURL && (
            <p className="text-xs text-on-surface-variant">點擊按鈕開始錄音</p>
          )}

          {recording && (
            <p className="text-xs text-error font-bold animate-pulse">錄音中⋯ 點擊停止</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 rounded-lg border border-outline-variant py-3.5 text-sm font-bold text-on-surface hover:bg-surface-container active:scale-[0.98] transition-all"
          >
            上一步
          </button>
          {sample === 1 ? (
            <button
              type="button"
              onClick={handleNextFromSample1}
              disabled={!audioURL}
              className="flex-1 rounded-lg bg-primary py-3.5 text-base font-bold text-on-primary shadow-lg shadow-primary/30 transition hover:bg-primary-dim active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={!audioURL}
              className="flex-1 rounded-lg bg-primary py-3.5 text-base font-bold text-on-primary shadow-lg shadow-primary/30 transition hover:bg-primary-dim active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              開始旅程
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function OnboardingRoutes() {
  const { pathname } = useLocation();
  const base = pathname.replace(/\/$/, "");

  if (base.endsWith("/voice/2")) {
    return <VoiceSamplePage sample={2} />;
  }
  if (base.endsWith("/voice/1")) {
    return <VoiceSamplePage sample={1} />;
  }
  if (base === "/explorer/onboarding") {
    return <NicknamePage />;
  }
  return <Navigate to="/explorer/onboarding" replace />;
}

export default function ExplorerOnboardingPage() {
  return (
    <ExplorerOnboardingProvider>
      <div className="font-body text-on-surface min-h-screen relative overflow-x-hidden bg-background">
        <OnboardingBackground />
        <BrandHeader showBack />
        <OnboardingProgress />
        <div className="relative z-10 mx-auto max-w-lg px-4 pt-32 pb-32 sm:pt-36">
          <OnboardingRoutes />
        </div>
        <OnboardingWaveFooter />
      </div>
    </ExplorerOnboardingProvider>
  );
}
