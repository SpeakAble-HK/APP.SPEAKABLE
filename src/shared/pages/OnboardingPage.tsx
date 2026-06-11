import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialIcon } from "@/shared/components/MaterialIcon";
import { saveVoiceSample } from "@/shared/hooks/useVoiceSampleStore";
import { usePronunciationAPI } from "@/shared/hooks/usePronunciationAPI";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const FOREST_MODEL_URL = "/assets/enchanted-forest/o_donkey_forest_river.gltf";
const KIKI_IMAGES = {
  intro: "/assets/kiki-stage1-intro.png",
  micGranted: "/assets/kiki-stage8-mic-granted.png",
  default: "/assets/pipi-flying-home.jpeg",
};

function ForestModel({ zoomed }: { zoomed: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(FOREST_MODEL_URL);
  const targetPos = useRef(new THREE.Vector3(0, -1.4, 0));
  const targetScale = useRef(new THREE.Vector3(0.42, 0.42, 0.42));

  useEffect(() => {
    if (zoomed) {
      targetPos.current.set(0, -0.8, 2);
      targetScale.current.set(0.7, 0.7, 0.7);
    } else {
      targetPos.current.set(0, -1.4, 0);
      targetScale.current.set(0.42, 0.42, 0.42);
    }
  }, [zoomed]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.04;
    groupRef.current.position.lerp(targetPos.current, delta * 2);
    groupRef.current.scale.lerp(targetScale.current, delta * 2);
  });

  return (
    <group ref={groupRef} position={[0, -1.4, 0]} rotation={[0, -0.55, 0]} scale={0.42}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function LoadingForest() {
  return (
    <mesh position={[0, -0.9, 0]}>
      <boxGeometry args={[3.5, 0.18, 2.4]} />
      <meshStandardMaterial color="#3f8f52" transparent opacity={0.55} />
    </mesh>
  );
}

function TreasureMapBackground({ zoomed }: { zoomed: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0"
      style={{
        background: "linear-gradient(180deg, #b9f2ff 0%, #dff9d5 54%, #7ccf87 100%)",
      }}
    >
      <Canvas camera={{ position: [0, 3.4, 8.2], fov: 42 }} gl={{ alpha: true, antialias: true }} shadows>
        <color attach="background" args={["#c9f5ff"]} />
        <fog attach="fog" args={["#dff9d5", 8, 18]} />
        <ambientLight intensity={1.25} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow />
        <directionalLight position={[-4, 4, -4]} intensity={0.55} color="#b6f7d0" />
        <Suspense fallback={<LoadingForest />}>
          <ForestModel zoomed={zoomed} />
        </Suspense>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.62, 0]} receiveShadow>
          <circleGeometry args={[8, 64]} />
          <meshStandardMaterial color="#74c365" transparent opacity={0.42} />
        </mesh>
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06)), radial-gradient(circle at 22% 35%, rgba(255,244,171,0.34), transparent 24%)",
        }}
      />
    </div>
  );
}

type OnboardingStage =
  | "intro"
  | "microphone"
  | "voice-clone"
  | "challenge"
  | "mirror"
  | "treasure"
  | "transition";

const ONBOARDING_KEY = "speakable-onboarding-complete";

function KikiAvatar({ size = 120, emotion = "happy", zoomed = false, stage }: { size?: number; emotion?: "happy" | "excited" | "thinking" | "encouraging"; zoomed?: boolean; stage?: OnboardingStage }) {
  const getImageUrl = () => {
    if (stage === "intro") return KIKI_IMAGES.intro;
    if (stage === "microphone" && emotion === "happy") return KIKI_IMAGES.micGranted;
    return KIKI_IMAGES.default;
  };

  return (
    <div
      className={`relative transition-all duration-700 ${zoomed ? "scale-110" : "scale-100"}`}
      style={{
        animation: "kikiFloat 3s ease-in-out infinite",
        filter: emotion === "excited" ? "drop-shadow(0 0 20px rgba(251, 191, 36, 0.6))" : "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
      }}
    >
      <img
        src={getImageUrl()}
        alt="琪琪 KiKi"
        width={size}
        height={size}
        className="object-contain"
        style={{ imageRendering: "auto" }}
      />
      {emotion === "excited" && (
        <div className="absolute -inset-4 animate-ping opacity-30">
          <div className="h-full w-full rounded-full bg-amber-400" />
        </div>
      )}
    </div>
  );
}

function MapPopup({ children, position, delay = 0 }: { children: React.ReactNode; position: "left" | "right" | "center" | "top"; delay?: number }) {
  const positionClasses = {
    left: "left-8 top-1/2 -translate-y-1/2",
    right: "right-8 top-1/2 -translate-y-1/2",
    center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    top: "left-1/2 top-16 -translate-x-1/2",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} z-20 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="rounded-2xl border-2 border-amber-400/40 bg-white/95 p-4 shadow-2xl backdrop-blur-md">
        <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-amber-400/40 bg-white/95" />
        {children}
      </div>
    </div>
  );
}

function SpeechBubble({ children, position = "bottom" }: { children: React.ReactNode; position?: "bottom" | "top" }) {
  return (
    <div className={`relative mx-auto max-w-lg rounded-2xl border-2 border-amber-400/30 bg-white/95 p-5 shadow-2xl backdrop-blur-md ${position === "bottom" ? "mt-4" : "mb-4"}`}>
      <div className={`absolute left-1/2 -translate-x-1/2 ${position === "bottom" ? "-top-3 border-b-8 border-l-8 border-r-8 border-b-white/95 border-l-transparent border-r-transparent" : "-bottom-3 border-t-8 border-l-8 border-r-8 border-t-white/95 border-l-transparent border-r-transparent"}`} />
      <div className="text-center text-base leading-relaxed text-slate-800">{children}</div>
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
    <div className="flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 backdrop-blur-md">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-500 ${i < current ? "w-6 bg-amber-400" : i === current ? "w-8 bg-amber-300" : "w-2 bg-white/50"}`}
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
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { processRecording, isProcessing, getGeneratedAudioUrl } = usePronunciationAPI();

  const isZoomed = stage === "intro" || stage === "microphone" || stage === "voice-clone";

  useEffect(() => {
    (async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasMic = devices.some(d => d.kind === "audioinput" && d.deviceId !== "");
          if (hasMic) {
            setMicAvailable(true);
            return;
          }
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        setMicAvailable(true);
      } catch {
        setMicAvailable(false);
      }
    })();
  }, []);

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
      setMicAvailable(false);
      alert("偵測唔到麥克風，我哋會跳過聲音步驟，直接進入冒險！");
      setTimeout(() => {
        setShowTreasure(true);
        setStage("treasure");
      }, 500);
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

        const result = await processRecording(blob, "哈囉琪琪", "yue");
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
    // Trigger transition animation
    setStage("transition");
    // Navigate after animation completes
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  }, [navigate]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <TreasureMapBackground zoomed={isZoomed} />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="absolute left-1/2 top-6 z-30 -translate-x-1/2">
          <StageIndicator current={stageIndex} total={6} />
        </div>

        {/* ─── STAGE 1: INTRO ─── */}
        {stage === "intro" && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-1000">
            <MapPopup position="top" delay={300}>
              <p className="text-lg font-bold text-slate-800">
                Hi！我係你嘅語音夥伴<span className="text-amber-600">琪琪</span>！
              </p>
              <p className="mt-2 text-sm text-slate-600">
                語音島嘅彩色能量石失去咗光芒，我需要你嘅聲音魔法幫手。一齊開始我哋嘅聲音冒險啦！
              </p>
              {micAvailable === false && (
                <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                  ⚠️ 偵測唔到麥克風，聲音步驟會自動跳過
                </p>
              )}
            </MapPopup>
            <div className="mt-32">
              <KikiAvatar size={180} emotion="excited" zoomed stage="intro" />
            </div>
            <GoldenButton
              onClick={() => {
                if (micAvailable === false) {
                  setShowTreasure(true);
                  setStage("treasure");
                } else {
                  setStage("microphone");
                }
              }}
              pulse
            >
              <span className="flex items-center gap-2">
                <MaterialIcon icon="play_arrow" filled className="text-xl" />
                同琪琪啟航冒險！
              </span>
            </GoldenButton>
          </div>
        )}

        {/* ─── STAGE 2: MICROPHONE ─── */}
        {stage === "microphone" && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
            <MapPopup position="top" delay={200}>
              {micAvailable === false ? (
                <>
                  <p className="text-lg font-bold text-slate-800">偵測唔到你嘅麥克風！</p>
                  <p className="mt-2 text-sm text-slate-600">
                    冇關係！我哋可以跳過聲音步驟，直接開始冒險。之後有麥克風嘅時候再返嚟玩都可以㗎！
                  </p>
                </>
              ) : !micGranted ? (
                <>
                  <p className="text-lg font-bold text-slate-800">在出發之前，我哋要先解鎖呢個<span className="text-amber-600">魔法麥克風</span>！</p>
                  <p className="mt-2 text-sm text-slate-600">
                    等我可以聽到你美妙嘅聲音。請幫我點擊下面嘅按鈕，然後喺彈出嘅視窗點擊「允許」！
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-emerald-600">魔法麥克風解鎖成功！</p>
                  <p className="mt-2 text-sm text-slate-600">琪琪已經可以聽到你喇！準備好進入下一步！</p>
                </>
              )}
            </MapPopup>

            <div className="mt-32">
              <KikiAvatar size={140} emotion={micAvailable === false ? "thinking" : micGranted ? "happy" : "thinking"} zoomed stage="microphone" />
            </div>

            {micAvailable === false ? (
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => {
                    setShowTreasure(true);
                    setStage("treasure");
                  }}
                  className="rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-4 text-lg font-black text-amber-950 shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    <MaterialIcon icon="skip_next" filled className="text-xl" />
                    跳過，直接冒險！
                  </span>
                </button>
              </div>
            ) : !micGranted ? (
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
                <p className="rounded-full bg-black/30 px-4 py-2 text-sm text-white backdrop-blur-md">點擊解鎖魔法麥克風</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-400/50">
                  <MaterialIcon icon="mic" filled className="text-4xl text-emerald-600" />
                </div>
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 backdrop-blur-md">
                  <MaterialIcon icon="check_circle" filled className="text-xl text-emerald-600" />
                  <span className="font-bold text-emerald-700">已解鎖</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── STAGE 3: VOICE CLONE ─── */}
        {stage === "voice-clone" && micAvailable !== false && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
            <MapPopup position="top" delay={200}>
              {!recordingComplete ? (
                <>
                  <p className="text-lg font-bold text-slate-800">
                    而家請你對住麥克風講一聲<span className="text-amber-600">「哈囉琪琪」</span>！
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    將你最初嘅聲音魔法注入能量瓶入面！
                  </p>
                </>
              ) : clonePlaying ? (
                <>
                  <p className="text-lg font-bold text-emerald-600">我收到你嘅聲音魔法喇！</p>
                  <p className="mt-2 text-sm text-slate-600">聽下琪琪用你嘅聲音講嘢！</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-slate-800">聲音魔法注入成功！</p>
                  <p className="mt-2 text-sm text-slate-600">準備好進入限時挑戰！</p>
                </>
              )}
            </MapPopup>

            <div className="mt-32">
              <KikiAvatar size={140} emotion={clonePlaying ? "excited" : "encouraging"} zoomed stage="voice-clone" />
            </div>

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
                <p className="rounded-full bg-black/30 px-4 py-2 text-sm text-white backdrop-blur-md">
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
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 backdrop-blur-md">
                <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-emerald-700">播放緊琪琪嘅聲音克隆...</span>
              </div>
            )}
          </div>
        )}

        {/* ─── STAGE 4: CHALLENGE ─── */}
        {stage === "challenge" && (
          <div className="flex flex-col items-center gap-5 animate-in fade-in duration-700">
            <div className="flex w-full max-w-md items-center justify-between">
              <KikiAvatar size={60} emotion="excited" stage="challenge" />
              <div className="flex items-center gap-2 rounded-full bg-amber-500/80 px-4 py-2 backdrop-blur-md">
                <MaterialIcon icon="hourglass_top" filled className="text-amber-900" />
                <span className={`font-mono text-xl font-black ${challengeTime <= 10 ? "text-red-600 animate-pulse" : "text-amber-900"}`}>
                  {challengeTime}s
                </span>
              </div>
            </div>

            <MapPopup position="top">
              <p className="text-lg font-bold text-slate-800">
                寶箱被鎖住咗！我哋要在 <span className="text-amber-600">60 秒</span>之內讀出發音密碼！
              </p>
              <p className="mt-2 text-sm text-slate-600">請讀出呢個字：</p>
            </MapPopup>

            <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border-2 border-amber-400/50 bg-white/90 px-8 py-6 shadow-xl backdrop-blur-md">
              <span className="text-7xl font-black text-amber-700">魚</span>
              <span className="text-2xl font-bold text-amber-600">/jyu5/</span>
              <span className="text-sm text-slate-500">意思：fish</span>
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
                <p className="rounded-full bg-black/30 px-4 py-2 text-sm text-white backdrop-blur-md">
                  {isRecording ? "再次點擊停止" : "點擊開始錄音"}
                </p>
                {isProcessing && (
                  <div className="flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-2 backdrop-blur-md">
                    <MaterialIcon icon="hourglass_top" className="animate-spin text-amber-600" filled />
                    <span className="text-sm font-bold text-amber-700">琪琪分析緊...</span>
                  </div>
                )}
              </div>
            )}

            {challengeResult === "success" && (
              <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-500">
                <MaterialIcon icon="check_circle" filled className="text-5xl text-emerald-500" />
                <p className="rounded-full bg-emerald-500/80 px-6 py-3 text-xl font-black text-white backdrop-blur-md">發音正確！寶箱解鎖緊...</p>
              </div>
            )}
          </div>
        )}

        {/* ─── STAGE 5: MAGIC MIRROR ─── */}
        {stage === "mirror" && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
            <KikiAvatar size={100} emotion="thinking" stage="mirror" />

            <MapPopup position="top">
              <p className="text-lg font-bold text-slate-800">唔緊要！我哋用<span className="text-purple-600">神奇魔法鏡子</span>睇下點樣改善！</p>
            </MapPopup>

            <div className="mt-4 relative flex flex-col items-center gap-4">
              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-purple-400/50 bg-gradient-to-br from-purple-100 to-indigo-100 shadow-2xl shadow-purple-500/20">
                <div className="absolute inset-2 rounded-full border-2 border-purple-300/40" />
                <div className="flex flex-col items-center gap-2">
                  <div className="text-5xl">👄</div>
                  <div className="rounded-lg bg-purple-500/20 px-3 py-1">
                    <p className="text-xs font-bold text-purple-700">嘴巴要縮圓</p>
                  </div>
                </div>
              </div>

              <div className="max-w-sm rounded-xl border border-purple-400/30 bg-white/90 p-4 text-center shadow-lg backdrop-blur-md">
                <p className="text-sm text-slate-700">
                  讀「魚 /jyu5/」嘅時候，嘴巴要<span className="font-bold text-purple-600">像吹口哨一樣縮圓圓地</span>。
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
              <KikiAvatar size={140} emotion="excited" stage="treasure" />
            </div>

            <MapPopup position="top">
              <p className="text-xl font-black text-amber-600">太棒了！</p>
              <p className="mt-2 text-sm text-slate-600">
                你已經解鎖咗語音島嘅冒險地圖。你可以隨時選擇不同嘅關卡，或者返去睇下治療師同老師為你準備嘅專屬任務。
              </p>
            </MapPopup>

            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-amber-400/50 bg-white/90 p-6 shadow-xl backdrop-blur-md">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-4xl shadow-lg shadow-amber-500/30">
                🏆
              </div>
              <p className="text-lg font-black text-amber-700">語音島勇士</p>
              <p className="text-xs text-slate-500">你嘅第一個電子貼紙！</p>
            </div>

            <GoldenButton onClick={finishOnboarding} pulse>
              <span className="flex items-center gap-2">
                <MaterialIcon icon="map" filled className="text-xl" />
                我哋地圖見！
              </span>
            </GoldenButton>
          </div>
        )}

        {/* ─── TRANSITION: Seamless journey to dashboard ─── */}
        {stage === "transition" && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
            {/* Animated background */}
            <div
              className="absolute inset-0 animate-[zoomIn_2s_ease-in-out_forwards]"
              style={{
                background: "linear-gradient(180deg, #b9f2ff 0%, #dff9d5 54%, #7ccf87 100%)",
              }}
            >
              <Canvas camera={{ position: [0, 3.4, 8.2], fov: 42 }} gl={{ alpha: true, antialias: true }} shadows>
                <color attach="background" args={["#c9f5ff"]} />
                <fog attach="fog" args={["#dff9d5", 8, 18]} />
                <ambientLight intensity={1.25} />
                <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow />
                <directionalLight position={[-4, 4, -4]} intensity={0.55} color="#b6f7d0" />
                <Suspense fallback={<LoadingForest />}>
                  <ForestModel zoomed={true} />
                </Suspense>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.62, 0]} receiveShadow>
                  <circleGeometry args={[8, 64]} />
                  <meshStandardMaterial color="#74c365" transparent opacity={0.42} />
                </mesh>
              </Canvas>
            </div>

            {/* Overlay content */}
            <div className="relative z-10 flex flex-col items-center gap-6 animate-[fadeInUp_1s_ease-out_forwards]">
              <div className="relative">
                <KikiAvatar size={180} emotion="excited" stage="transition" zoomed />
                {/* Sparkles around Kiki */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-2xl animate-ping"
                    style={{
                      left: `${Math.cos((i / 12) * Math.PI * 2) * 120 + 60}px`,
                      top: `${Math.sin((i / 12) * Math.PI * 2) * 120 + 60}px`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: "1.5s",
                    }}
                  >
                    {["⭐", "🌟", "✨", "💫"][i % 4]}
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border-4 border-amber-400/60 bg-white/95 px-8 py-6 shadow-2xl backdrop-blur-md">
                <p className="text-2xl font-black text-amber-600 animate-pulse">出發啦！</p>
                <p className="mt-2 text-center text-sm text-slate-600">
                  帶你去語音島嘅冒險地圖...
                </p>
              </div>

              {/* Progress indicator */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-amber-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes kikiFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes zoomIn {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes fadeInUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </main>
  );
}

useGLTF.preload(FOREST_MODEL_URL);
