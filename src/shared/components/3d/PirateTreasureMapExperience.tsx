import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, PerspectiveCamera } from "@react-three/drei";
import { Color, Group, Box3, Vector3 } from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";
import { ArrowLeft, Sparkles as SparklesIcon, Map, X, Mic, Square, Play, Volume2, Loader2, ChevronDown, ChevronUp, Star, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getVoiceSample } from "@/shared/hooks/useVoiceSampleStore";
import { toast } from "sonner";

/* ─── Hotspot challenge data ─────────────────────────────────── */

type ChallengeHotspot = {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
  question: string;
  options: string[];
  answer: string;
  hint: string;
};

const HOTSPOTS: ChallengeHotspot[] = [
  { id: "tone-1", label: "聲調寶箱", position: [0, 0.5, 0], color: "#fbbf24", question: "「媽」嘅聲調係第幾聲？", options: ["第一聲", "第二聲", "第三聲", "第六聲"], answer: "第一聲", hint: "高平調，好像叫媽媽咁" },
  { id: "tone-2", label: "韻母珍珠", position: [1.5, 0.3, -0.5], color: "#a78bfa", question: "「花」(faa1) 嘅韻母係咩？", options: ["aa", "a", "o", "e"], answer: "aa", hint: "開口大嘅韻母" },
  { id: "tone-3", label: "聲母金幣", position: [-1.2, 0.4, 0.3], color: "#34d399", question: "「波」(bo1) 嘅聲母係咩？", options: ["b", "p", "m", "f"], answer: "b", hint: "雙唇音，閉埋嘴唇再打開" },
  { id: "tone-4", label: "粵語羅盤", position: [0.8, 0.6, 1], color: "#f472b6", question: "粵語有幾多個聲調？", options: ["4個", "6個", "8個", "9個"], answer: "6個", hint: "比普通話多" },
];

/* ─── 3D Model ───────────────────────────────────────────────── */

const MODEL_PATH = "/assets/pirate-treasure-map/";
const MTL_FILE = "14059_Pirate_Treasure_map_Scroll_v1_L1.mtl";
const OBJ_FILE = "14059_Pirate_Treasure_map_Scroll_v1_L1.obj";

function fitModelToScene(root: THREE.Object3D) {
  const bounds = new Box3().setFromObject(root);
  const size = new Vector3();
  const center = new Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);
  root.position.sub(center);
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  root.scale.setScalar(3.5 / maxDimension);
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1a0f0a]">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-amber-400/30 border-t-amber-400 animate-spin" />
        <Map className="absolute inset-0 m-auto h-8 w-8 text-amber-400 animate-pulse" />
      </div>
      <p className="mt-6 text-lg font-bold text-amber-100 animate-pulse">展開藏寶圖...</p>
      <p className="mt-2 text-sm text-amber-200/60">正在載入 3D 場景</p>
    </div>
  );
}

function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="h-12 w-12 rounded-full border-4 border-amber-400/30 border-t-amber-400 animate-spin" />
        <p className="text-sm text-amber-100">載入中...</p>
      </div>
    </Html>
  );
}

function TreasureMapModel() {
  const groupRef = useRef<Group>(null);
  const [model, setModel] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    let isActive = true;
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(MODEL_PATH);
    mtlLoader.load(
      MTL_FILE,
      (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(MODEL_PATH);
        objLoader.load(OBJ_FILE, (object) => {
          if (!isActive) return;
          fitModelToScene(object);
          object.traverse((child: any) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
          setModel(object);
        });
      },
      undefined,
      () => {
        const objLoader = new OBJLoader();
        objLoader.setPath(MODEL_PATH);
        objLoader.load(OBJ_FILE, (object) => { if (!isActive) return; fitModelToScene(object); setModel(object); });
      }
    );
    return () => { isActive = false; };
  }, []);

  useFrame((_, delta) => { if (groupRef.current) groupRef.current.rotation.y += delta * 0.08; });
  if (!model) return null;
  return <group ref={groupRef}><primitive object={model} /></group>;
}

/* ─── Hotspot marker ─────────────────────────────────────────── */

function HotspotMarker({ hotspot, onClick, completed }: { hotspot: ChallengeHotspot; onClick: (h: ChallengeHotspot) => void; completed: boolean }) {
  const ref = useRef<any>(null);
  useFrame(({ clock }) => {
    if (ref.current) { const t = clock.getElapsedTime(); const s = 1 + Math.sin(t * 3 + hotspot.position[0]) * 0.15; ref.current.scale.set(s, s, s); }
  });
  return (
    <group position={hotspot.position}>
      <mesh ref={ref} onClick={(e) => { e.stopPropagation(); onClick(hotspot); }} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial color={completed ? "#22c55e" : hotspot.color} emissive={completed ? "#22c55e" : hotspot.color} emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      <Html distanceFactor={5} position={[0, 0.3, 0]} center>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-full bg-amber-900/80 px-3 py-1 text-xs font-bold text-amber-100 ring-1 ring-amber-300/60 backdrop-blur">
          {completed ? "✓ " : ""}{hotspot.label}
        </div>
      </Html>
    </group>
  );
}

/* ─── Particles ──────────────────────────────────────────────── */

function GoldenParticles() {
  const pointsRef = useRef<any>(null);
  const count = 200;
  const positions = useMemo(() => { const pos = new Float32Array(count * 3); for (let i = 0; i < count * 3; i += 3) { pos[i] = (Math.random() - 0.5) * 6; pos[i + 1] = Math.random() * 3; pos[i + 2] = (Math.random() - 0.5) * 6; } return pos; }, []);
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      const arr = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < arr.length; i += 3) { arr[i + 1] += Math.sin(clock.getElapsedTime() + i) * 0.002; if (arr[i + 1] > 3) arr[i + 1] = 0; }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  return (
    <points ref={pointsRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.05} color="#fbbf24" sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

/* ─── API helpers ────────────────────────────────────────────── */

async function getAuthToken(): Promise<string> {
  let { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) { const { data, error } = await supabase.auth.signInAnonymously(); if (error || !data.session?.access_token) throw new Error("No session"); session = data.session; }
  return session.access_token;
}

async function callASR(audioBlob: Blob): Promise<string> {
  const token = await getAuthToken();
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const fd = new FormData();
  fd.append("audio", audioBlob, "recording.webm");
  fd.append("language", "yue");
  const res = await fetch(`${projectUrl}/functions/v1/asr`, { method: "POST", headers: { Authorization: `Bearer ${token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: fd });
  if (!res.ok) throw new Error(`ASR failed (${res.status})`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "ASR failed");
  return (data.result as [string, string | null][]).map(([char]) => char).join("");
}

async function callVoiceClone(text: string, promptAudio: Blob): Promise<string | null> {
  const token = await getAuthToken();
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const fd = new FormData();
  fd.append("text", text); fd.append("prompt_text", text); fd.append("prompt_audio", promptAudio, "voice-sample.webm");
  const res = await fetch(`${projectUrl}/functions/v1/voice-clone`, { method: "POST", headers: { Authorization: `Bearer ${token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: fd });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.audio_base64 || !data.content_type) return null;
  const raw = atob(data.audio_base64); const u8 = new Uint8Array(raw.length); for (let i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
  return URL.createObjectURL(new Blob([u8], { type: data.content_type }));
}

function speakText(text: string) { if (!window.speechSynthesis) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = "zh-HK"; u.rate = 0.8; window.speechSynthesis.speak(u); }

/* ─── Exercise data ──────────────────────────────────────────── */

interface ExerciseDef { id: string; nameZh: string; difficulty: "basic" | "intermediate" | "challenge"; icon: string; xp: number; coins: number; requires?: string; }
interface CategoryDef { id: string; labelZh: string; phonemes: string; exercises: ExerciseDef[]; comingSoon?: boolean; }

const EXERCISE_CATEGORIES: CategoryDef[] = [
  { id: "bilabial", labelZh: "雙唇音", phonemes: "/b/ /p/ /m/", exercises: [
    { id: "bilabial-s1", nameZh: "噴氣實驗室", difficulty: "basic", icon: "🔬", xp: 30, coins: 10 },
    { id: "bilabial-s2", nameZh: "單字配對大進擊", difficulty: "intermediate", icon: "🎯", xp: 50, coins: 15, requires: "bilabial-s1" },
    { id: "bilabial-s3", nameZh: "貝殼分類大賽", difficulty: "challenge", icon: "🐚", xp: 80, coins: 25, requires: "bilabial-s2" },
  ]},
  { id: "alveolar", labelZh: "齒齦音", phonemes: "/d/ /t/ /n/", exercises: [
    { id: "alveolar-s1", nameZh: "舌頭訓練營", difficulty: "basic", icon: "🏋️", xp: 30, coins: 10 },
    { id: "alveolar-s2", nameZh: "聽音配對", difficulty: "intermediate", icon: "👂", xp: 50, coins: 15, requires: "alveolar-s1" },
    { id: "alveolar-s3", nameZh: "速度挑戰", difficulty: "challenge", icon: "", xp: 80, coins: 25, requires: "alveolar-s2" },
  ]},
  { id: "nasal", labelZh: "鼻音", phonemes: "/m/ /n/ /ng/", comingSoon: true, exercises: [
    { id: "nasal-s1", nameZh: "鼻音探索", difficulty: "basic", icon: "👃", xp: 30, coins: 10 },
    { id: "nasal-s2", nameZh: "共鳴配對", difficulty: "intermediate", icon: "🎵", xp: 50, coins: 15, requires: "nasal-s1" },
    { id: "nasal-s3", nameZh: "鼻音大師", difficulty: "challenge", icon: "🏆", xp: 80, coins: 25, requires: "nasal-s2" },
  ]},
  { id: "velar", labelZh: "軟顎音", phonemes: "/g/ /k/ /ng/", comingSoon: true, exercises: [
    { id: "velar-s1", nameZh: "喉嚨練習", difficulty: "basic", icon: "🗣️", xp: 30, coins: 10 },
    { id: "velar-s2", nameZh: "聲音分類", difficulty: "intermediate", icon: "📊", xp: 50, coins: 15, requires: "velar-s1" },
    { id: "velar-s3", nameZh: "軟顎挑戰", difficulty: "challenge", icon: "💪", xp: 80, coins: 25, requires: "velar-s2" },
  ]},
];

const DIFF_STYLES: Record<string, string> = { basic: "bg-[#E8F7F3] text-[#1F9A7A] border border-[#A8E6CA]", intermediate: "bg-[#FFF6E0] text-[#8B6914] border border-[#FCD34D]", challenge: "bg-[#FFE8E0] text-[#C14825] border border-[#FCA5A5]" };
const DIFF_ZH: Record<string, string> = { basic: "基礎", intermediate: "進階", challenge: "挑戰" };

function getCompletedIds(): Set<string> { try { return new Set(JSON.parse(localStorage.getItem("completed_exercises") || "[]")); } catch { return new Set(); } }

/* ─── Main component ─────────────────────────────────────────── */

export default function PirateTreasureMapExperience() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<ChallengeHotspot | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [asrResult, setAsrResult] = useState<string | null>(null);
  const [asrLoading, setAsrLoading] = useState(false);
  const [voiceCloneLoading, setVoiceCloneLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Exercise state
  const [completedIds] = useState<Set<string>>(getCompletedIds);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["bilabial"]));
  const [practiceModal, setPracticeModal] = useState<{ exercise: ExerciseDef; category: CategoryDef } | null>(null);
  const [modalRecording, setModalRecording] = useState(false);
  const [modalAsrLoading, setModalAsrLoading] = useState(false);
  const [modalAsrResult, setModalAsrResult] = useState<string | null>(null);
  const [modalVcLoading, setModalVcLoading] = useState(false);
  const modalMediaRef = useRef<MediaRecorder | null>(null);
  const modalChunksRef = useRef<Blob[]>([]);

  useEffect(() => { const timer = setTimeout(() => setIsLoading(false), 1500); return () => clearTimeout(timer); }, []);

  const handleAnswer = useCallback((answer: string) => {
    setSelectedAnswer(answer);
    if (activeHotspot && answer === activeHotspot.answer) { setTimeout(() => { setCompleted((c) => [...c, activeHotspot.id]); setActiveHotspot(null); setSelectedAnswer(null); setAsrResult(null); }, 1000); }
  }, [activeHotspot]);

  const handleClose = useCallback(() => { setActiveHotspot(null); setSelectedAnswer(null); setAsrResult(null); setIsRecording(false); }, []);

  const handleStartRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || "audio/webm" });
        setAsrLoading(true);
        try {
          const transcript = await callASR(blob);
          setAsrResult(transcript);
          const matched = activeHotspot?.options.find((opt) => transcript.includes(opt) || opt.includes(transcript));
          if (matched) handleAnswer(matched);
        } catch { toast.error("語音辨識失敗，請重試"); } finally { setAsrLoading(false); }
      };
      mr.start(); setIsRecording(true); setAsrResult(null);
    } catch { toast.error("無法存取麥克風"); }
  }, [activeHotspot, handleAnswer]);

  const handleVoiceCloneSpeak = useCallback(async () => {
    if (!activeHotspot) return;
    setVoiceCloneLoading(true);
    try {
      const sample = await getVoiceSample("sample1");
      if (!sample) { speakText(activeHotspot.question); toast.info("未有語音樣本，使用預設語音"); return; }
      const url = await callVoiceClone(activeHotspot.question, sample);
      if (url) { const a = new Audio(url); a.onended = () => URL.revokeObjectURL(url); a.onerror = () => URL.revokeObjectURL(url); await a.play(); }
      else { speakText(activeHotspot.question); toast.info("語音複製失敗，使用預設語音"); }
    } catch { speakText(activeHotspot.question); toast.info("語音複製失敗，使用預設語音"); } finally { setVoiceCloneLoading(false); }
  }, [activeHotspot]);

  // Exercise handlers
  const toggleCategory = useCallback((id: string) => { setExpandedCategories((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }, []);
  const getCompletedCount = useCallback((cat: CategoryDef) => cat.exercises.filter((ex) => completedIds.has(ex.id)).length, [completedIds]);
  const isUnlocked = useCallback((ex: ExerciseDef) => !ex.requires || completedIds.has(ex.requires), [completedIds]);

  const handleStartExercise = useCallback((exercise: ExerciseDef, category: CategoryDef) => {
    if (!isUnlocked(exercise)) { toast.info("請先完成上一關"); return; }
    setPracticeModal({ exercise, category });
  }, [isUnlocked]);

  const handleModalStartRecording = useCallback(async () => {
    if (!practiceModal) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      modalChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      modalMediaRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size) modalChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setModalRecording(false);
        const blob = new Blob(modalChunksRef.current, { type: mr.mimeType || "audio/webm" });
        setModalAsrLoading(true);
        try { const transcript = await callASR(blob); setModalAsrResult(transcript); toast.success(`辨識結果：「${transcript}」`); }
        catch { setModalAsrResult("辨識失敗，請重試"); toast.error("語音辨識失敗"); } finally { setModalAsrLoading(false); }
      };
      mr.start(); setModalRecording(true); setModalAsrResult(null);
    } catch { toast.error("無法存取麥克風"); }
  }, [practiceModal]);

  const handleModalVoiceClone = useCallback(async () => {
    if (!practiceModal) return;
    setModalVcLoading(true);
    try {
      const sample = await getVoiceSample("sample1");
      const text = practiceModal.exercise.nameZh;
      if (!sample) { speakText(text); toast.info("未有語音樣本，使用預設語音"); return; }
      const url = await callVoiceClone(text, sample);
      if (url) { const a = new Audio(url); a.onended = () => URL.revokeObjectURL(url); a.onerror = () => URL.revokeObjectURL(url); await a.play(); }
      else { speakText(text); toast.info("語音複製失敗，使用預設語音"); }
    } catch { speakText(practiceModal.exercise.nameZh); toast.info("語音複製失敗，使用預設語音"); } finally { setModalVcLoading(false); }
  }, [practiceModal]);

  const handleCloseModal = useCallback(() => { setPracticeModal(null); setModalRecording(false); setModalAsrResult(null); }, []);

  const handleLaunchExercise = useCallback(() => {
    if (!practiceModal) return;
    navigate(`/speech-quest`);
    handleCloseModal();
  }, [practiceModal, navigate, handleCloseModal]);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#1a0f0a]">
      {/* ─── 3D Scene (fixed top portion) ─────────────────────── */}
      <div className="relative w-full" style={{ height: "clamp(280px, 45vh, 420px)" }}>
        <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }} shadows>
          <PerspectiveCamera makeDefault position={[0, 2, 4]} fov={50} />
          <ambientLight intensity={0.8} color={new Color(0xfff5e6)} />
          <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow color="#fff5e6" />
          <pointLight position={[0, 3, 0]} intensity={1.5} color="#fbbf24" distance={10} />
          <color attach="background" args={["#1a0f0a"]} />
          <fog attach="fog" args={["#1a0f0a", 5, 15]} />
          <Suspense fallback={<CanvasLoader />}>
            <TreasureMapModel />
            <GoldenParticles />
            {HOTSPOTS.map((h) => <HotspotMarker key={h.id} hotspot={h} onClick={setActiveHotspot} completed={completed.includes(h.id)} />)}
          </Suspense>
          <OrbitControls enablePan={false} enableZoom={true} minDistance={2} maxDistance={8} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.5} />
        </Canvas>

        {/* Top HUD */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3 sm:p-4">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-900/70 px-3 py-1.5 text-xs sm:text-sm font-bold text-amber-100 backdrop-blur transition hover:bg-amber-800">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> 返回
          </button>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-amber-300/60 bg-amber-900/70 px-3 py-1.5 text-xs sm:text-sm font-bold text-amber-200 backdrop-blur">
              <SparklesIcon className="mr-1 inline h-3.5 w-3.5 sm:h-4 sm:w-4" /> 已發現 {completed.length}/{HOTSPOTS.length}
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center px-4">
          <div className="rounded-full border border-amber-300/30 bg-amber-900/70 px-3 py-1.5 text-center text-[10px] sm:text-xs font-semibold text-amber-100/90 backdrop-blur">
            拖曳旋轉地圖 · 滾輪縮放 · 點擊發光寶箱開始挑戰
          </div>
        </div>
      </div>

      {/* ─── 皮皮練習 Section ─────────────────────────────────── */}
      <div className="relative z-10 bg-gradient-to-b from-[#1a0f0a] to-[#2a1a10] px-3 sm:px-4 pb-8 -mt-2 rounded-t-3xl">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-t-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
              <h2 className="text-lg sm:text-xl font-bold text-white">皮皮練習</h2>
            </div>
            <button type="button" onClick={() => { const allOpen = EXERCISE_CATEGORIES.every((c) => expandedCategories.has(c.id)); setExpandedCategories(allOpen ? new Set() : new Set(EXERCISE_CATEGORIES.map((c) => c.id))); }} className="text-white/80 hover:text-white transition-colors p-1">
              {EXERCISE_CATEGORIES.every((c) => expandedCategories.has(c.id)) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {/* Categories accordion */}
          <div className="bg-white rounded-b-2xl divide-y divide-sky-100">
            {EXERCISE_CATEGORIES.map((category) => {
              const isExpanded = expandedCategories.has(category.id);
              const completedCount = getCompletedCount(category);
              const total = category.exercises.length;
              return (
                <div key={category.id}>
                  <button type="button" onClick={() => toggleCategory(category.id)} className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-sky-50/50 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <span className="font-display text-base sm:text-lg font-semibold text-slate-900">{category.labelZh}</span>
                      <span className="text-sm text-slate-500">{category.phonemes}</span>
                      {category.comingSoon && <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">即將推出</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: total }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < completedCount ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-200"}`} />)}
                      </div>
                      <span className="text-xs sm:text-sm text-slate-500 tabular-nums">{completedCount}/{total}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 space-y-3">
                      {category.exercises.map((exercise) => {
                        const unlocked = isUnlocked(exercise);
                        const completed = completedIds.has(exercise.id);
                        return (
                          <div key={exercise.id} className={`group flex items-center gap-3 sm:gap-4 rounded-xl border px-4 sm:px-5 py-3 sm:py-4 transition-all ${unlocked ? "bg-white border-slate-200 hover:border-sky-400 hover:shadow-sm" : "bg-slate-50 border-slate-200 opacity-75"}`}>
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 text-2xl sm:text-3xl ${unlocked ? "bg-sky-50" : "bg-slate-200 grayscale"}`}>{exercise.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-display text-sm sm:text-base font-medium text-slate-900 leading-snug">{exercise.nameZh}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={`inline-block text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${DIFF_STYLES[exercise.difficulty]}`}>{DIFF_ZH[exercise.difficulty]}</span>
                                {completed && <span className="text-[10px] sm:text-xs font-medium text-green-600">✓ 已完成</span>}
                              </div>
                            </div>
                            <button type="button" disabled={!unlocked} onClick={() => unlocked ? handleStartExercise(exercise, category) : toast.info("請先完成上一關")} className={`shrink-0 flex items-center justify-center gap-1.5 sm:gap-2 rounded-full font-medium text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5 min-h-[44px] transition-all ${unlocked ? "bg-sky-500 text-white hover:bg-sky-600 active:scale-95 shadow-sm" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`}>
                              {unlocked ? <><Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /><span>開始</span></> : <><Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden sm:inline">鎖定</span></>}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Hotspot Challenge Modal ──────────────────────────── */}
      {activeHotspot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm" onClick={handleClose}>
          <div className="w-full max-w-lg sm:max-w-xl rounded-2xl border-2 border-amber-400/60 bg-amber-950 p-4 sm:p-6 shadow-[0_0_60px_-10px_rgba(251,191,36,0.7)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg sm:text-xl font-bold text-amber-100">{activeHotspot.label}</h2>
              <button type="button" onClick={handleClose} className="rounded-full p-2 text-amber-200 hover:bg-amber-800 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="關閉"><X className="h-5 w-5 sm:h-6 sm:w-6" /></button>
            </div>
            <div className="rounded-xl bg-amber-900/50 p-3 sm:p-4">
              <div className="mb-4 flex items-start justify-between gap-2">
                <p className="flex-1 text-sm sm:text-base font-medium text-amber-100">{activeHotspot.question}</p>
                <div className="flex shrink-0 gap-1.5">
                  <button type="button" onClick={handleVoiceCloneSpeak} disabled={voiceCloneLoading} className="inline-flex items-center gap-1 rounded-lg border border-purple-400/40 bg-purple-900/60 px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-bold text-purple-100 transition hover:bg-purple-800 disabled:opacity-50 min-h-[44px]">
                    {voiceCloneLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />} <span className="hidden sm:inline">語音</span>
                  </button>
                  <button type="button" onClick={() => speakText(activeHotspot.question)} className="inline-flex items-center gap-1 rounded-lg border border-sky-400/40 bg-sky-900/60 px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-bold text-sky-100 transition hover:bg-sky-800 min-h-[44px]"><Play className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {activeHotspot.options.map((opt) => {
                  const isSelected = selectedAnswer === opt; const isCorrect = opt === activeHotspot.answer; const showResult = selectedAnswer !== null;
                  return (
                    <button key={opt} onClick={() => !showResult && handleAnswer(opt)} disabled={showResult} className={`rounded-xl border-2 p-3 sm:p-4 text-center font-medium text-sm sm:text-base transition-all min-h-[52px] ${showResult ? isCorrect ? "border-emerald-400 bg-emerald-400/20 text-emerald-100" : isSelected ? "border-red-400 bg-red-400/20 text-red-100" : "border-amber-700 bg-amber-900/30 text-amber-300 opacity-50" : "border-amber-600 bg-amber-800/50 text-amber-100 hover:border-amber-400 hover:bg-amber-700/50"}`}>{opt}</button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button type="button" onClick={isRecording ? () => mediaRecorderRef.current?.stop() : handleStartRecording} disabled={asrLoading} className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm sm:text-base font-bold transition min-h-[52px] ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-amber-600 text-amber-100 hover:bg-amber-500"} disabled:opacity-50`}>
                  {asrLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />} {asrLoading ? "辨識中..." : isRecording ? "停止" : "語音作答"}
                </button>
                {asrResult && <span className="text-xs sm:text-sm text-amber-200/80">辨識結果：{asrResult}</span>}
              </div>
              {selectedAnswer && (
                <div className="mt-4 text-center">
                  {selectedAnswer === activeHotspot.answer ? <p className="text-emerald-300 font-bold text-sm sm:text-base">答啱喇！恭喜你發現寶藏！</p> : <div><p className="text-red-300 font-bold text-sm sm:text-base">再試下啦！</p><p className="text-amber-200/70 text-xs sm:text-sm mt-1">提示：{activeHotspot.hint}</p></div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Practice Modal ───────────────────────────────────── */}
      {practiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={handleCloseModal}>
          <div className="w-full max-w-lg sm:max-w-xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-t-2xl px-5 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{practiceModal.exercise.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">{practiceModal.exercise.nameZh}</h3>
                  <p className="text-xs text-sky-100">{practiceModal.category.labelZh} · {DIFF_ZH[practiceModal.exercise.difficulty]}</p>
                </div>
              </div>
              <button type="button" onClick={handleCloseModal} className="text-white/80 hover:text-white p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"><span className="text-xl">✕</span></button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-medium">+{practiceModal.exercise.xp} XP</span><span>·</span><span>+{practiceModal.exercise.coins} 🪙</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={modalRecording ? () => modalMediaRef.current?.stop() : handleModalStartRecording} disabled={modalAsrLoading} className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition min-h-[48px] ${modalRecording ? "bg-red-500 text-white animate-pulse" : "bg-amber-500 text-white hover:bg-amber-600"} disabled:opacity-50`}>
                  {modalAsrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : modalRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />} {modalAsrLoading ? "辨識中..." : modalRecording ? "停止" : "🎤 語音作答"}
                </button>
                <button type="button" onClick={handleModalVoiceClone} disabled={modalVcLoading} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 text-white px-4 py-2.5 text-sm font-bold hover:bg-violet-600 transition min-h-[48px] disabled:opacity-50">
                  {modalVcLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}  語音複製
                </button>
                <button type="button" onClick={() => speakText(practiceModal.exercise.nameZh)} className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 text-white px-4 py-2.5 text-sm font-bold hover:bg-sky-600 transition min-h-[48px]">▶ 播放</button>
              </div>
              {modalAsrResult && <div className={`rounded-lg p-3 text-sm ${modalAsrResult.includes("失敗") ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-800"}`}>{modalAsrResult}</div>}
              <button type="button" onClick={handleLaunchExercise} className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold py-3.5 text-base hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg active:scale-[0.98] min-h-[52px]">開始練習 →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
