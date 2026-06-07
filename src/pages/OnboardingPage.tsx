import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/components/MaterialIcon";
import { saveVoiceSample } from "@/hooks/useVoiceSampleStore";
import { usePronunciationAPI } from "@/hooks/usePronunciationAPI";

type OnboardingStage =
  | "intro"
  | "microphone"
  | "voice-clone"
  | "challenge"
  | "mirror"
  | "treasure";

const ONBOARDING_KEY = "speakable-onboarding-complete";

function PipiAvatar({ size = 120, emotion = "happy" }: { size?: number; emotion?: "happy" | "excited" | "thinking" | "encouraging" }) {
  const eyeStyle = emotion === "happy" ? "M0,0 Q5,-3 10,0" : emotion === "excited" ? "M0,-2 L5,2 L10,-2" : "M0,0 L10,0";
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-2xl">
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <radialGradient id="wingGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="65" rx="35" ry="40" fill="url(#bodyGrad)" />
      <ellipse cx="25" cy="55" rx="18" ry="12" fill="url(#wingGrad)" transform="rotate(-20 25 55)" />
      <ellipse cx="95" cy="55" rx="18" ry="12" fill="url(#wingGrad)" transform="rotate(20 95 55)" />
      <circle cx="48" cy="52" r="8" fill="white" />
      <circle cx="72" cy="52" r="8" fill="white" />
      <circle cx="50" cy="53" r="4" fill="#1e293b" />
      <circle cx="74" cy="53" r="4" fill="#1e293b" />
      <circle cx="51" cy="51" r="1.5" fill="white" />
      <circle cx="75" cy="51" r="1.5" fill="white" />
      <path d="M52 72 Q60 80 68 72" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M50 30 Q55 15 60 25 Q65 15 70 30" fill="#ef4444" />
      <ellipse cx="60" cy="100" rx="8" ry="5" fill="#f97316" />
    </svg>
  );
}

function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-40"
          style={{
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(${180 + Math.random() * 60}, 80%, 70%)`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

function VoiceIslandBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-cyan-950" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-900/40 to-transparent" />
      <svg className="absolute bottom-0 w-full opacity-30" viewBox="0 0 800 200" preserveAspectRatio="none">
        <path d="M0,200 Q200,100 400,150 Q600,200 800,120 L800,200 Z" fill="#065f46" />
        <path d="M0,200 Q150,140 350,170 Q550,200 800,160 L800,200 Z" fill="#047857" />
      </svg>
      <FloatingParticles />
    </div>
  );
}

function SpeechBubble({ children, position = "bottom" }: { children: React.ReactNode; position?: "bottom" | "top" }) {
  return (
    <div className={`relative mx-auto max-w-lg rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md ${position === "bottom" ? "mt-4" : "mb-4"}`}>
      <div className={`absolute left-1/2 -translate-x-1/2 ${position === "bottom" ? "-top-2 border-b-8 border-l-8 border-r-8 border-b-white/10 border-l-transparent border-r-transparent" : "-bottom-2 border-t-8 border-l-8 border-r-8 border-t-white/10 border-l-transparent border-r-transparent"}`} />
      <div className="text-center text-base leading-relaxed text-white">{children}</div>
    </div>
  );
}

function GoldenButton({ onClick, children, disabled = false, pulse = false }: { onClick: () => void; children: React.ReactNode; disabled?: boolean; pulse?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-4 text-lg font-black text-amber-950 shadow-lg shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/40 disabled:opacity-50 disabled:hover:scale-100 ${pulse ? "animate-pulse" : ""}`}
    >
      {children}
    </button>
  );
}

function StageIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-500 ${i < current ? "w-6 bg-amber-400" : i === current ? "w-8 bg-amber-300" : "w-2 bg-white/30"}`}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<OnboardingStage>("intro");
  const [micGranted, setMicGranted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [clonePlaying, setClonePlaying] = useState(false);
  const [challengeTime, setChallengeTime] = useState(60);
  const [challengeResult, setChallengeResult] = useState<"success" | "fail" | null>(null);
  const [showMirror, setShowMirror] = useState(false);
  const [showTreasure, setShowTreasure] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { processRecording, isProcessing, getGeneratedAudioUrl } = usePronunciationAPI();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stageIndex = ["intro", "microphone", "voice-clone", "challenge", "mirror", "treasure"].indexOf(stage);

  const requestMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicGranted(true);
      setTimeout(() => setStage("voice-clone"), 1500);
    } catch {
      alert("請允許麥克風權限，皮皮需要聽到你嘅聲音！");
    }
  }, []);

  const startAudioLevel = useCallback((stream: MediaStream) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(Math.min(100, avg * 2));
      animFrameRef.current = requestAnimationFrame(updateLevel);
    };
    updateLevel();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startAudioLevel(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setAudioLevel(0);
        setRecordingComplete(true);

        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await saveVoiceSample("sample1", blob);

        const result = await processRecording(blob, "哈囉皮皮", "yue");
        if (result?.clone) {
          setClonePlaying(true);
          const audioUrl = getGeneratedAudioUrl();
          if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.onended = () => {
              setClonePlaying(false);
              setTimeout(() => setStage("challenge"), 1000);
            };
            audio.play().catch(() => {
              setClonePlaying(false);
              setTimeout(() => setStage("challenge"), 1000);
            });
          } else {
            setClonePlaying(false);
            setTimeout(() => setStage("challenge"), 1000);
          }
        } else {
          setTimeout(() => setStage("challenge"), 1500);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert("無法啟動麥克風，請檢查瀏覽器設定。");
    }
  }, [processRecording, getGeneratedAudioUrl, startAudioLevel]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
  }, []);

  const startChallenge = useCallback(async () => {
    setChallengeTime(60);
    timerRef.current = setInterval(() => {
      setChallengeTime((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);

        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const result = await processRecording(blob, "魚", "yue");

        if (result && result.spoken.length > 0) {
          const avgConf = result.spoken.reduce((sum, s) => sum + (s.confidence || 0), 0) / result.spoken.length;
          if (avgConf >= 0.5) {
            setChallengeResult("success");
            setTimeout(() => {
              setShowTreasure(true);
              setStage("treasure");
            }, 2000);
          } else {
            setChallengeResult("fail");
            setShowMirror(true);
            setStage("mirror");
          }
        } else {
          setChallengeResult("fail");
          setShowMirror(true);
          setStage("mirror");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert("無法啟動麥克風");
    }
  }, [processRecording]);

  const stopChallengeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const retryFromMirror = useCallback(async () => {
    setShowMirror(false);
    setChallengeResult(null);
    setStage("challenge");
    setTimeout(() => startChallenge(), 500);
  }, [startChallenge]);

  const finishOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    navigate("/dashboard");
  }, [navigate]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <VoiceIslandBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="mb-6">
          <StageIndicator current={stageIndex} total={6} />
        </div>

        {/* ─── STAGE 1: INTRO ─── */}
        {stage === "intro" && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-1000">
            <div className="animate-bounce">
              <PipiAvatar size={160} emotion="excited" />
            </div>
            <SpeechBubble>
              <p className="text-lg font-bold">
                Hi！我係你嘅語音夥伴<span className="text-amber-300">皮皮</span>！
              </p>
              <p className="mt-2 text-sm text-white/80">
                語音島嘅彩色能量石失去咗光芒，我需要你嘅聲音魔法幫手。一齊開始我哋嘅聲音冒險啦！
              </p>
            </SpeechBubble>
            <GoldenButton onClick={() => setStage("microphone")} pulse>
              <span className="flex items-center gap-2">
                <MaterialIcon icon="play_arrow" filled className="text-xl" />
                同皮皮啟航冒險！
              </span>
            </GoldenButton>
          </div>
        )}

        {/* ─── STAGE 2: MICROPHONE ─── */}
        {stage === "microphone" && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
            <PipiAvatar size={120} emotion={micGranted ? "happy" : "thinking"} />
            <SpeechBubble>
              {!micGranted ? (
                <>
                  <p className="text-lg font-bold">在出發之前，我哋要先解鎖呢個<span className="text-amber-300">魔法麥克風</span>！</p>
                  <p className="mt-2 text-sm text-white/80">
                    等我可以聽到你美妙嘅聲音。請幫我點擊下面嘅按鈕，然後喺彈出嘅視窗點擊「允許」！
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-emerald-300">魔法麥克風解鎖成功！</p>
                  <p className="mt-2 text-sm text-white/80">皮皮已經可以聽到你喇！準備好進入下一步！</p>
                </>
              )}
            </SpeechBubble>

            {!micGranted ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/30" />
                  <button
                    onClick={requestMicrophone}
                    className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-xl shadow-amber-500/40 transition-all hover:scale-110"
                  >
                    <MaterialIcon icon="mic" filled className="text-4xl text-amber-950" />
                  </button>
                </div>
                <p className="text-sm text-white/60">點擊解鎖魔法麥克風</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-400/50">
                  <MaterialIcon icon="mic" filled className="text-4xl text-emerald-400" />
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <MaterialIcon icon="check_circle" filled className="text-xl" />
                  <span className="font-bold">已解鎖</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── STAGE 3: VOICE CLONE ─── */}
        {stage === "voice-clone" && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
            <PipiAvatar size={120} emotion={clonePlaying ? "excited" : "encouraging"} />
            <SpeechBubble>
              {!recordingComplete ? (
                <>
                  <p className="text-lg font-bold">
                    而家請你對住麥克風講一聲<span className="text-amber-300">「哈囉皮皮」</span>！
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    將你最初嘅聲音魔法注入能量瓶入面！
                  </p>
                </>
              ) : clonePlaying ? (
                <>
                  <p className="text-lg font-bold text-emerald-300">我收到你嘅聲音魔法喇！</p>
                  <p className="mt-2 text-sm text-white/80">聽下皮皮用你嘅聲音講嘢！</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold">聲音魔法注入成功！</p>
                  <p className="mt-2 text-sm text-white/80">準備好進入限時挑戰！</p>
                </>
              )}
            </SpeechBubble>

            {!recordingComplete && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-32 w-32">
                  <div
                    className="absolute inset-0 rounded-full bg-gradient-to-t from-cyan-500/40 to-purple-500/40 transition-all duration-200"
                    style={{ transform: `scale(${0.3 + (audioLevel / 100) * 0.7})`, opacity: isRecording ? 1 : 0.3 }}
                  />
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`absolute inset-0 flex items-center justify-center rounded-full transition-all ${isRecording ? "bg-red-500 shadow-xl shadow-red-500/50" : "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-xl shadow-cyan-500/40 hover:scale-105"}`}
                  >
                    {isRecording ? (
                      <div className="h-8 w-8 rounded-sm bg-white" />
                    ) : (
                      <MaterialIcon icon="mic" filled className="text-4xl text-white" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-white/60">
                  {isRecording ? "再次點擊停止錄音" : "點擊開始注入聲音魔法"}
                </p>
                {isRecording && (
                  <div className="flex items-end gap-1 h-8">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 rounded-t bg-gradient-to-t from-cyan-400 to-purple-400 transition-all duration-100"
                        style={{ height: `${Math.random() * audioLevel * 0.8}px` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {clonePlaying && (
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-sm font-bold text-emerald-300">播放緊皮皮嘅聲音克隆...</span>
              </div>
            )}
          </div>
        )}

        {/* ─── STAGE 4: CHALLENGE ─── */}
        {stage === "challenge" && (
          <div className="flex flex-col items-center gap-5 animate-in fade-in duration-700">
            <div className="flex w-full max-w-md items-center justify-between">
              <PipiAvatar size={60} emotion="excited" />
              <div className="flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-2">
                <MaterialIcon icon="hourglass_top" filled className="text-amber-400" />
                <span className={`font-mono text-xl font-black ${challengeTime <= 10 ? "text-red-400 animate-pulse" : "text-amber-300"}`}>
                  {challengeTime}s
                </span>
              </div>
            </div>

            <SpeechBubble>
              <p className="text-lg font-bold">
                寶箱被鎖住咗！我哋要在 <span className="text-amber-300">60 秒</span>之內讀出發音密碼！
              </p>
              <p className="mt-2 text-sm text-white/80">請讀出呢個字：</p>
            </SpeechBubble>

            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-amber-400/30 bg-amber-500/10 px-8 py-6">
              <span className="text-7xl font-black text-amber-200">魚</span>
              <span className="text-2xl font-bold text-amber-300/80">/jyu5/</span>
              <span className="text-sm text-white/60">意思：fish</span>
            </div>

            {challengeResult === null && (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={isRecording ? stopChallengeRecording : startChallenge}
                  className={`flex h-20 w-20 items-center justify-center rounded-full transition-all ${isRecording ? "bg-red-500 shadow-xl shadow-red-500/50 scale-110" : "bg-gradient-to-br from-emerald-400 to-green-500 shadow-xl shadow-emerald-500/40 hover:scale-105"}`}
                >
                  {isRecording ? (
                    <div className="h-7 w-7 rounded-sm bg-white" />
                  ) : (
                    <MaterialIcon icon="play_arrow" filled className="text-3xl text-white" />
                  )}
                </button>
                <p className="text-sm text-white/60">
                  {isRecording ? "再次點擊停止" : "點擊開始錄音"}
                </p>
                {isProcessing && (
                  <div className="flex items-center gap-2 text-amber-300">
                    <MaterialIcon icon="hourglass_top" className="animate-spin" filled />
                    <span className="text-sm font-bold">皮皮分析緊...</span>
                  </div>
                )}
              </div>
            )}

            {challengeResult === "success" && (
              <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-500">
                <MaterialIcon icon="check_circle" filled className="text-5xl text-emerald-400" />
                <p className="text-xl font-black text-emerald-300">發音正確！寶箱解鎖緊...</p>
              </div>
            )}
          </div>
        )}

        {/* ─── STAGE 5: MAGIC MIRROR ─── */}
        {stage === "mirror" && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
            <PipiAvatar size={100} emotion="thinking" />

            <SpeechBubble>
              <p className="text-lg font-bold">唔緊要！我哋用<span className="text-purple-300">神奇魔法鏡子</span>睇下點樣改善！</p>
            </SpeechBubble>

            <div className="relative flex flex-col items-center gap-4">
              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-purple-400/50 bg-gradient-to-br from-purple-900/60 to-indigo-900/60 shadow-2xl shadow-purple-500/20">
                <div className="absolute inset-2 rounded-full border-2 border-purple-300/20" />
                <div className="flex flex-col items-center gap-2">
                  <div className="text-5xl">👄</div>
                  <div className="rounded-lg bg-purple-500/20 px-3 py-1">
                    <p className="text-xs font-bold text-purple-200">嘴巴要縮圓</p>
                  </div>
                </div>
              </div>

              <div className="max-w-sm rounded-xl border border-purple-400/20 bg-purple-500/10 p-4 text-center">
                <p className="text-sm text-white/90">
                  讀「魚 /jyu5/」嘅時候，嘴巴要<span className="font-bold text-purple-300">像吹口哨一樣縮圓圓地</span>。
                  舌頭放平，聲音從喉咙流出。我哋再試一次！
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={retryFromMirror}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    <MaterialIcon icon="replay" filled className="text-lg" />
                    再試一次
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STAGE 6: TREASURE ─── */}
        {stage === "treasure" && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
            <div className="relative">
              {showTreasure && (
                <>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-2xl animate-ping"
                      style={{
                        left: `${Math.random() * 200 - 50}px`,
                        top: `${Math.random() * 200 - 50}px`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1 + Math.random() * 2}s`,
                      }}
                    >
                      {["⭐", "🌟", "✨", "💫", "🪙"][Math.floor(Math.random() * 5)]}
                    </div>
                  ))}
                </>
              )}
              <PipiAvatar size={140} emotion="excited" />
            </div>

            <SpeechBubble>
              <p className="text-xl font-black text-amber-300">太棒了！</p>
              <p className="mt-2 text-sm text-white/80">
                你已經解鎖咗語音島嘅冒險地圖。你可以隨時選擇不同嘅關卡，或者返去睇下治療師同老師為你準備嘅專屬任務。
              </p>
            </SpeechBubble>

            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-amber-400/30 bg-amber-500/10 p-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-4xl shadow-lg shadow-amber-500/30">
                🏆
              </div>
              <p className="text-lg font-black text-amber-200">語音島勇士</p>
              <p className="text-xs text-white/60">你嘅第一個電子貼紙！</p>
            </div>

            <GoldenButton onClick={finishOnboarding} pulse>
              <span className="flex items-center gap-2">
                <MaterialIcon icon="map" filled className="text-xl" />
                我哋地圖見！
              </span>
            </GoldenButton>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </main>
  );
}
