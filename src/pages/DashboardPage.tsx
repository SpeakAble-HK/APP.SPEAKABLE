import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Lock, Play, ChevronRight, CheckCircle, XCircle, RotateCcw, Lightbulb, Gamepad2, Mic, Volume2, BookOpen, X, MessageSquare, Map, TrendingUp, Target, Award } from "lucide-react";
import { getAuraStoryUnlocked } from "@/lib/therapistMissionConfig";
import { getMiniGameConfig, isQuizGameEnabled } from "@/lib/miniGameConfigStore";
import { useAuth } from "@/hooks/useAuth";
import { auraJourneyScenes } from "@/components/auraJourney/auraJourneyScenes";
import { useVoiceCloning } from "@/components/auraJourney/useVoiceCloning";
import { FadeIn } from "@/components/ui/animations";
import pipiParrot from "@/assets/pipi-parrot-only.png";

const SEALS_KEY = "speakable-dashboard-seals";
const HELPER_DONE_KEY = "speakable-helper-completed";
const DREAM_CHAPTERS_KEY = "speakable-dream-chapters";
const FOREST_STORIES_KEY = "speakable-forest-stories";

const FOREST_STORIES = [
  { id: "portal", emoji: "🚪", label: "靈光之門", desc: "聲調挑戰：分辨「媽」嘅聲調", question: "哪一個係「媽」嘅聲調？", options: ["第一聲", "第二聲", "第三聲", "第四聲"], answer: "第一聲", hint: "高平調" },
  { id: "pipi", emoji: "🦜", label: "皮皮嘅回音", desc: "聲母挑戰：搵出「波」嘅聲母", question: "請輸入「波」嘅聲母。", options: ["b", "p", "m", "f"], answer: "b", hint: "雙唇音" },
  { id: "mushroom", emoji: "🍄", label: "光暈蘑菇", desc: "韻母挑戰：聽音辨認韻母", question: "聽聽聲音，呢個音嘅韻母係？", options: ["aa", "a", "o", "e"], answer: "a", hint: "開口大", audioText: "媽" },
];

const MINIGAMES = [
  { id: "game-tone", name: "聲調快拍", emoji: "🎯", description: "聽聲辨調，掌握粵語六聲" },
  { id: "game-mouth", name: "口型對對碰", emoji: "👄", description: "觀察口型，配對正確發音" },
  { id: "game-rhythm", name: "節奏跟讀賽", emoji: "🥁", description: "跟住節奏，讀出準確粵語" },
];

interface ExerciseDef {
  id: string; nameZh: string; difficulty: "basic" | "intermediate" | "challenge";
  icon: string; xp: number; coins: number; requires?: string;
}
interface IslandDef {
  id: string; labelZh: string; phonemes: string; exercises: ExerciseDef[];
}

const PRACTICE_ISLANDS: IslandDef[] = [
  {
    id: "bilabial", labelZh: "雙唇音", phonemes: "/b/ /p/ /m/",
    exercises: [
      { id: "bilabial-s1", nameZh: "噴氣實驗室", difficulty: "basic", icon: "🔬", xp: 30, coins: 10 },
      { id: "bilabial-s2", nameZh: "單字配對大進擊", difficulty: "intermediate", icon: "🎯", xp: 50, coins: 15, requires: "bilabial-s1" },
      { id: "bilabial-s3", nameZh: "貝殼分類大賽", difficulty: "challenge", icon: "🐚", xp: 80, coins: 25, requires: "bilabial-s2" },
    ],
  },
  {
    id: "alveolar", labelZh: "齒齦音", phonemes: "/d/ /t/ /n/",
    exercises: [
      { id: "alveolar-s1", nameZh: "舌頭訓練營", difficulty: "basic", icon: "🏋️", xp: 30, coins: 10 },
      { id: "alveolar-s2", nameZh: "聽音配對", difficulty: "intermediate", icon: "👂", xp: 50, coins: 15, requires: "alveolar-s1" },
      { id: "alveolar-s3", nameZh: "速度挑戰", difficulty: "challenge", icon: "⚡", xp: 80, coins: 25, requires: "alveolar-s2" },
    ],
  },
];

// ─── Aura portal SVG scene ───────────────────────────────────────────

function AuraPortalScene() {
  return (
    <svg viewBox="0 0 1280 400" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label="靈光故事：森林故事任務">
      <defs>
        <radialGradient id="aps-sky" cx="50%" cy="40%" r="80%">
          <stop offset="0%" stopColor="#0c1b3a" /><stop offset="60%" stopColor="#050a1a" /><stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="aps-portal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="1" />
          <stop offset="40%" stopColor="#22d3ee" stopOpacity="0.85" />
          <stop offset="80%" stopColor="#1e40af" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="aps-stream" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" /><stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="aps-stone" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#475569" /><stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <filter id="aps-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="1280" height="400" fill="url(#aps-sky)" />
      {Array.from({ length: 30 }).map((_, i) => {
        const x = (i * 137) % 1280; const y = (i * 73) % 200;
        return <circle key={i} cx={x} cy={y} r={(i % 3) * 0.5 + 0.3} fill="#bae6fd" opacity={0.3 + (i % 5) * 0.1} />;
      })}
      <path d="M 0 280 L 0 200 L 60 190 L 90 160 L 130 190 L 180 170 L 230 200 L 280 180 L 340 200 L 420 170 L 500 200 L 580 180 L 660 200 L 720 170 L 800 200 L 880 180 L 960 200 L 1040 170 L 1120 200 L 1200 180 L 1280 200 L 1280 280 Z" fill="#020617" opacity="0.9" />
      <g transform="translate(640 240)">
        <path d="M -100 100 L -100 -20 C -100 -90, 100 -90, 100 -20 L 100 100 Z" fill="url(#aps-stone)" stroke="#0f172a" strokeWidth="2" />
        <ellipse cx="0" cy="20" rx="85" ry="110" fill="url(#aps-portal)" filter="url(#aps-glow)" />
        <ellipse cx="0" cy="20" rx="55" ry="80" fill="#22d3ee" opacity="0.25" />
        <ellipse cx="0" cy="20" rx="30" ry="50" fill="#bae6fd" opacity="0.35" />
        {Array.from({ length: 5 }).map((_, i) => (
          <ellipse key={i} cx="0" cy="20" rx={75 - i * 12} ry={95 - i * 16} fill="none" stroke="#67e8f9" strokeWidth="1" opacity={0.15 + i * 0.05} />
        ))}
      </g>
      <ellipse cx="640" cy="350" rx="160" ry="25" fill="#22d3ee" opacity="0.2" filter="url(#aps-glow)" />
      <path d="M 640 365 C 580 380, 500 390, 420 400 L 860 400 L 780 390 C 700 380, 620 365, 640 365 Z" fill="url(#aps-stream)" opacity="0.7" />
      {[{ x: 280, y: 370, c: "#22d3ee" }, { x: 340, y: 390, c: "#a78bfa" }, { x: 960, y: 370, c: "#22d3ee" }, { x: 1020, y: 390, c: "#a78bfa" }].map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`} filter="url(#aps-glow)">
          <circle r="4" fill={f.c} /><circle r="8" fill={f.c} opacity="0.3" />
        </g>
      ))}
    </svg>
  );
}

// ─── Storage helpers ─────────────────────────────────────────────────

function getSealStates(): boolean[] {
  try {
    const raw = localStorage.getItem(SEALS_KEY);
    if (!raw) return [false, false, false];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 3) return parsed.map(Boolean);
    return [false, false, false];
  } catch { return [false, false, false]; }
}
function persistSeals(states: boolean[]) { localStorage.setItem(SEALS_KEY, JSON.stringify(states)); }
function getHelperDone(): boolean { return localStorage.getItem(HELPER_DONE_KEY) === "1"; }
function setHelperDone() { localStorage.setItem(HELPER_DONE_KEY, "1"); }
function getCompletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem("completed_exercises");
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}
function getDreamChapters(): boolean[] {
  try {
    const raw = localStorage.getItem(DREAM_CHAPTERS_KEY);
    if (!raw) return Array(12).fill(false);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 12) return parsed.map(Boolean);
    return Array(12).fill(false);
  } catch { return Array(12).fill(false); }
}
function persistDreamChapters(states: boolean[]) { localStorage.setItem(DREAM_CHAPTERS_KEY, JSON.stringify(states)); }
function getForestStoryStates(): boolean[] {
  try {
    const raw = localStorage.getItem(FOREST_STORIES_KEY);
    if (!raw) return [false, false, false];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 3) return parsed.map(Boolean);
    return [false, false, false];
  } catch { return [false, false, false]; }
}
function persistForestStories(states: boolean[]) { localStorage.setItem(FOREST_STORIES_KEY, JSON.stringify(states)); }

function speakCantonese(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-HK";
  utterance.rate = 0.82;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("zh"));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

// ─── Floating PiPi character ─────────────────────────────────────────

function FloatingPipi({ onClick }: { onClick: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % 4), 3000);
    return () => clearInterval(t);
  }, []);

  const positions = [
    { bottom: "24px", right: "24px", rotate: "0deg" },
    { bottom: "36px", right: "32px", rotate: "8deg" },
    { bottom: "28px", right: "20px", rotate: "-5deg" },
    { bottom: "40px", right: "28px", rotate: "3deg" },
  ];

  const pos = positions[phase];

  return (
    <button type="button" onClick={onClick}
      className="fixed z-40 cursor-pointer group"
      style={{
        bottom: pos.bottom, right: pos.right,
        transform: `rotate(${pos.rotate})`,
        transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
      }}>
      <div className="relative">
        <img src={pipiParrot} alt="皮皮" className="w-16 h-16 md:w-20 md:h-20 object-contain
          transition-transform duration-300 group-hover:scale-110 group-active:scale-95
          drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
          <span className="relative inline-flex h-full w-full items-center justify-center rounded-full bg-amber-400 text-[9px] md:text-[10px] font-bold text-amber-950">
            <Mic className="w-2.5 h-2.5 md:w-3 md:h-3" />
          </span>
        </span>
      </div>
      <p className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">同我講嘢</p>
    </button>
  );
}

// ─── Voice Practice Modal (free text) ─────────────────────────────────

function VoicePracticeModal({ onClose }: { onClose: () => void }) {
  const voice = useVoiceCloning();
  const [text, setText] = useState("");
  const [step, setStep] = useState<"input" | "recording" | "done">("input");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleRecord = async () => {
    if (!text.trim()) return;
    setStep("recording");
    await voice.startRecording("請跟讀以下粵語句子", text.trim());
  };

  useEffect(() => {
    if (voice.audioUrl && step === "recording") {
      setStep("done");
    }
  }, [voice.audioUrl, step]);

  const handlePlayClone = () => {
    if (voice.audioUrl) {
      const audio = new Audio(voice.audioUrl);
      audio.play();
    }
  };

  const handleReset = () => {
    voice.reset();
    setStep("input");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm md:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl animate-in"
        style={{ animation: "slideUp 0.3s ease-out" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <img src={pipiParrot} alt="琪琪" className="w-8 h-8 object-contain" />
            <span className="text-sm font-bold text-amber-700">同琪琪講嘢</span>
          </div>
          <button type="button" onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "input" && (
          <>
            <p className="text-sm text-slate-600 mb-3">輸入你想練習嘅粵語句子，琪琪會幫你 AI 聲線克隆練習：</p>
            <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)}
              placeholder="例如：今日天氣好好，我好開心！"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all" />
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={handleRecord} disabled={!text.trim() || voice.recording}
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-amber-950 hover:bg-amber-300 disabled:opacity-40 transition-all active:scale-95">
                <Mic className="w-4 h-4" /> 錄音練習
              </button>
              <button type="button" onClick={() => speakCantonese(text || "輸入句子後可以聽示範")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all">
                <Volume2 className="w-4 h-4" /> 聽示範
              </button>
            </div>
            {voice.error && <p className="mt-3 text-sm text-red-500">{voice.error}</p>}
          </>
        )}

        {step === "recording" && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-4 w-4 rounded-full bg-red-400 animate-pulse" />
              <span className="text-base font-medium text-slate-700">錄音中... 請講出句子</span>
            </div>
            <p className="text-sm text-slate-500 italic">「{text}」</p>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-400/30">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-base font-bold text-emerald-600 mb-1">聲線克隆完成！</p>
            <p className="text-xs text-slate-500 mb-5">AI 已複製你把聲朗讀句子</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={handlePlayClone}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-emerald-950 hover:bg-emerald-300 transition-all active:scale-95">
                <Play className="w-4 h-4 fill-current" /> 播放你把聲
              </button>
              <button type="button" onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all">
                <RotateCcw className="w-4 h-4" /> 再試一次
              </button>
              <button type="button" onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all">
                完成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper Exercise ─────────────────────────────────────────────────

function HelperExercise({ onComplete }: { onComplete: () => void }) {
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(0);
  const [showTip, setShowTip] = useState(false);

  if (done) {
    return (
      <div className="rounded-xl border-2 border-mint bg-gradient-to-br from-mint/5 to-emerald-50 p-4 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-mint/20 flex items-center justify-center mx-auto mb-2">
          <CheckCircle className="h-7 w-7 text-mint" />
        </div>
            <p className="font-bold text-ink text-base text-3d">皮皮小幫手完成！</p>
        <p className="text-sm text-slate mt-1">已解鎖森林故事同印記 🎉</p>
      </div>
    );
  }

  if (step < 2) {
    const steps = [
      { icon: "👋", title: "皮皮小幫手", subtitle: "準備好未？我教你基本粵語發音", content: "你好！我係皮皮，你嘅粵語練習小幫手。一齊準備好，再進入森林冒險！" },
      { icon: "🎵", title: "粵語六聲", subtitle: "記住「詩史試時市事」", content: "粵語有六聲：1 高平、2 高升、3 中平、4 低降、5 低升、6 低平。" },
    ];
    return (
      <div className="rounded-xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl">{steps[step].icon}</span>
          <div className="flex-1">
            <p className="font-bold text-ink">{steps[step].title}</p>
            <p className="text-xs text-slate">{steps[step].subtitle}</p>
          </div>
        </div>
        <p className="text-sm text-ink mb-3 leading-relaxed">{steps[step].content}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate">{step + 1} / 3</span>
          <button type="button" onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-1 rounded-full bg-sky-400 px-5 py-1.5 text-sm font-bold text-white hover:bg-sky-500 transition-all active:scale-95 shadow-sm">
            繼續 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">🤔</span>
        <div><p className="font-bold text-ink">試下辨認聲調</p><p className="text-xs text-slate">「媽」係第幾聲？</p></div>
      </div>
      {!showTip ? (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {["1 (高平)", "3 (中平)", "5 (低升)", "2 (高升)"].map((opt) => (
            <button key={opt} type="button" onClick={() => setShowTip(true)}
              className="rounded-xl border-2 border-amber-200 bg-white p-3 text-center font-medium text-ink hover:border-amber-400 hover:bg-amber-50 transition-all active:scale-[0.97] text-sm shadow-sm">{opt}</button>
          ))}
        </div>
      ) : (
        <div className="mb-3 rounded-xl bg-white border-2 border-mint p-4">
          <p className="text-sm text-ink mb-3">💡 「媽」係第一聲（高平），即係你叫媽媽嗰陣嘅平穩聲調。</p>
          <div className="grid grid-cols-2 gap-2">
            {["1", "2", "3", "4"].map((opt) => (
              <button key={opt} type="button" onClick={() => { if (opt === "1") { setDone(true); onComplete(); } else setShowTip(false); }}
                className={`rounded-xl border-2 p-3 text-center font-bold transition-all active:scale-[0.97] text-sm ${opt === "1" ? "border-mint bg-mint/10 text-mint hover:bg-mint/20" : "border-coral/30 bg-coral/5 text-coral hover:bg-coral/10"}`}>{opt}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ForestStoryCard ─────────────────────────────────────────────────

function ForestStoryCard({ story, index, completed, onComplete, helperDone }: {
  story: typeof FOREST_STORIES[0]; index: number; completed: boolean[];
  onComplete: (index: number) => void; helperDone: boolean;
}) {
  const unlocked = index === 0 ? helperDone : completed[index - 1];
  const isDone = completed[index];
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(false);

  if (isDone) {
    return (
      <div className="flex items-center gap-3 rounded-xl border-2 border-mint/40 bg-gradient-to-r from-mint/5 to-emerald-50 p-3.5 shadow-sm card-3d">
        <span className="text-2xl shrink-0">{story.emoji}</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-ink">{story.label}</p>
          <p className="text-xs text-mint">{story.desc}</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-mint flex items-center justify-center shrink-0">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <button type="button" onClick={() => unlocked && setStarted(true)} disabled={!unlocked}
        className={`w-full flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${unlocked ? "border-mist bg-white hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-md cursor-pointer active:scale-[0.99]" : "border-dashed border-mist bg-cloud/30 opacity-50"}`}>
        <span className={`text-2xl shrink-0 ${!unlocked ? "grayscale" : ""}`}>{story.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink">{story.label}</p>
          <p className="text-xs text-slate">{unlocked ? story.desc : index === 0 ? "先完成皮皮小幫手" : `先完成「${FOREST_STORIES[index - 1].label}」`}</p>
        </div>
        {unlocked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow-sm"><Play className="w-3 h-3 fill-current" />開始</span>
        ) : (
          <Lock className="w-4 h-4 text-slate shrink-0" />
        )}
      </button>
    );
  }

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm animate-in" style={{ animation: "fadeIn 0.25s ease-out" }}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{story.emoji}</span>
        <div>
          <p className="text-sm font-bold text-ink">{story.label}</p>
          <p className="text-xs text-slate">{story.hint}</p>
        </div>
      </div>
      <p className="text-sm font-medium text-ink mb-2">{story.question}</p>
      {!showResult ? (
        <div className="grid grid-cols-2 gap-2">
          {story.options.map((opt) => (
            <button key={opt} type="button" onClick={() => { setSelected(opt); setCorrect(opt === story.answer); setShowResult(true); }}
              className={`rounded-xl border-2 p-3 text-center font-medium transition-all text-sm active:scale-[0.97] ${selected === opt ? "border-sky-400 bg-sky-50 shadow-sm" : "border-mist bg-white hover:border-sky-300 hover:shadow-sm"}`}>{opt}</button>
          ))}
        </div>
      ) : (
        <div className="text-center py-3">
          {correct ? (
            <div><CheckCircle className="mx-auto h-8 w-8 text-mint" /><p className="text-sm font-bold text-mint mt-1">答啱啦！</p><p className="text-xs text-slate mt-1">{story.answer}</p></div>
          ) : (
            <div><XCircle className="mx-auto h-8 w-8 text-coral" /><p className="text-sm font-bold text-coral mt-1">正確答案：{story.answer}</p></div>
          )}
          <div className="flex gap-2 justify-center mt-3">
            <button type="button" onClick={() => { setShowResult(false); setSelected(null); }}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-bold text-slate hover:bg-slate-50 transition-all">
              <RotateCcw className="w-3 h-3" />再試
            </button>
            {correct && (
              <button type="button" onClick={() => { onComplete(index); setStarted(false); setShowResult(false); setSelected(null); }}
                className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-4 py-1.5 text-sm font-bold text-amber-950 hover:bg-amber-300 transition-all active:scale-95 shadow-sm">
                <CheckCircle className="w-3 h-3" />完成故事
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SealGame ────────────────────────────────────────────────────────

const MINIGAME_CHALLENGES: Record<string, { question: string; options: string[]; answer: string }[]> = {
  "game-tone": [
    { question: "「媽」係第幾聲？", options: ["1", "2", "3", "4"], answer: "1" },
    { question: "「馬」係第幾聲？", options: ["3", "4", "5", "6"], answer: "5" },
    { question: "「走」係第幾聲？", options: ["1", "2", "3", "4"], answer: "2" },
  ],
  "game-mouth": [
    { question: "發 /b/ 音時，嘴唇應該？", options: ["打開", "合埋", "圓唇", "放鬆"], answer: "合埋" },
    { question: "發 /m/ 音時，氣流從邊度出？", options: ["鼻", "口", "喉", "牙"], answer: "鼻" },
    { question: "以下邊個係圓唇韻母？", options: ["aa", "i", "oe", "e"], answer: "oe" },
  ],
  "game-rhythm": [
    { question: "粵語有幾多個聲調？", options: ["4", "5", "6", "9"], answer: "6" },
    { question: "「一、二、三」嘅聲調順序係？", options: ["1-2-3", "1-6-1", "1-6-3", "7-8-9"], answer: "1-6-1" },
    { question: "入聲字尾邊個唔係入聲韻尾？", options: ["p", "t", "k", "m"], answer: "m" },
  ],
};

function SealGame({ game, sealIndex, sealStates, onComplete }: {
  game: typeof MINIGAMES[0]; sealIndex: number; sealStates: boolean[]; onComplete: (index: number) => void;
}) {
  const isUnlocked = sealIndex === 0 ? getHelperDone() : sealStates[sealIndex - 1];
  const isCompleted = sealStates[sealIndex];
  const [started, setStarted] = useState(false);
  const [qi, setQi] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const challenges = MINIGAME_CHALLENGES[game.id];
  const current = challenges[qi];
  const isLast = qi >= challenges.length - 1;

  const handleAnswer = (answer: string) => {
    const correct = answer === current.answer;
    setLastCorrect(correct);
    if (correct) setScore((s) => s + 1);
    setShowResult(true);
  };
  const handleNext = () => {
    setShowResult(false);
    if (isLast) { onComplete(sealIndex); setStarted(false); setQi(0); setScore(0); setLastCorrect(false); }
    else setQi((i) => i + 1);
  };

  if (!started) {
    return (
      <div className={`relative rounded-xl border-2 p-4 text-center transition-all min-h-[140px] flex flex-col items-center justify-center gap-1.5 card-3d ${isCompleted ? "border-mint bg-gradient-to-br from-mint/5 to-emerald-50 shadow-sm" : isUnlocked ? "border-sky-200 bg-white hover:border-sky-400 hover:shadow-md cursor-pointer shadow-sm active:scale-[0.98]" : "border-mist bg-cloud/30 opacity-50"}`}>
        {isCompleted ? (
          <><span className="text-3xl">{game.emoji}</span><span className="text-sm font-bold text-ink">{game.name}</span><span className="flex items-center gap-1 text-xs text-mint font-medium"><CheckCircle className="w-3 h-3" />完成</span><button type="button" onClick={() => setStarted(true)} className="text-xs text-mint underline hover:text-mint/80">重玩</button></>
        ) : isUnlocked ? (
          <button type="button" onClick={() => setStarted(true)} className="flex flex-col items-center gap-1 w-full h-full">
            <span className="text-3xl">{game.emoji}</span><span className="text-sm font-bold text-ink">{game.name}</span><span className="text-xs text-slate">{game.description}</span>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-sky-400 px-4 py-1 text-xs font-bold text-white shadow-sm"><Play className="w-3 h-3 fill-current" /> 開始</span>
            <span className="text-xs text-slate">印記 {sealIndex + 1}/3</span>
          </button>
        ) : (
          <><span className="text-3xl grayscale">{game.emoji}</span><span className="text-sm font-bold text-slate">{game.name}</span><span className="flex items-center gap-1 text-xs text-slate"><Lock className="w-3 h-3" />{sealIndex === 0 ? "先完成皮皮小幫手" : `先完成「${MINIGAMES[sealIndex - 1].name}」`}</span></>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-sky-200 bg-white p-4 shadow-sm animate-in" style={{ animation: "fadeIn 0.25s ease-out" }}>
      <div className="flex items-center justify-between mb-2"><span className="text-sm font-bold text-ink">{game.name}</span><span className="text-xs text-slate">{qi + 1}/{challenges.length}</span></div>
      <div className="mb-2 h-1.5 rounded-full bg-sky-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-mint transition-all" style={{ width: `${((qi + (showResult ? 1 : 0)) / challenges.length) * 100}%` }} /></div>
      {!showResult ? (
        <><p className="mb-3 text-center text-base font-medium text-ink">{current.question}</p><div className="grid grid-cols-2 gap-2">{current.options.map((opt) => (<button key={opt} type="button" onClick={() => handleAnswer(opt)} className="rounded-xl border-2 border-mist bg-white p-3 text-center text-sm font-medium text-ink hover:border-sky-400 hover:bg-sky-50 transition-all active:scale-[0.97] shadow-sm">{opt}</button>))}</div></>
      ) : (
        <div className="text-center py-3">
          {lastCorrect ? <div><CheckCircle className="mx-auto h-8 w-8 text-mint" /><p className="text-sm font-bold text-mint mt-1">答啱啦！</p></div> : <div><XCircle className="mx-auto h-8 w-8 text-coral" /><p className="text-sm font-bold text-coral mt-1">正確答案：{current.answer}</p></div>}
          <button type="button" onClick={handleNext} className="mt-2 inline-flex items-center gap-1 rounded-full bg-sky-400 px-5 py-1.5 text-sm font-bold text-white hover:bg-sky-500 transition-all active:scale-95 shadow-sm">{isLast ? "完成印記" : "下一題"} <ChevronRight className="w-3 h-3" /></button>
        </div>
      )}
    </div>
  );
}

// ─── ExerciseRow ─────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<string, string> = {
  basic: "bg-[#E8F7F3] text-[#1F9A7A] border border-[#A8E6CA]",
  intermediate: "bg-[#FFF6E0] text-[#8B6914] border border-sunshine",
  challenge: "bg-[#FFE8E0] text-[#C14825] border border-coral/40",
};

function ExerciseRow({ exercise, unlocked, onStart }: { exercise: ExerciseDef; unlocked: boolean; onStart: (id: string) => void }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all card-3d ${unlocked ? "border-mist bg-white hover:border-sky-300 hover:shadow-sm cursor-pointer active:scale-[0.99]" : "border-dashed border-mist bg-cloud/30"}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl ${unlocked ? "bg-sky-50" : "bg-mist grayscale"}`}>{exercise.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{exercise.nameZh}</p>
        <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[exercise.difficulty]}`}>
          {{ basic: "基礎", intermediate: "進階", challenge: "挑戰" }[exercise.difficulty]}
        </span>
      </div>
      <button type="button" disabled={!unlocked} onClick={() => unlocked && onStart(exercise.id)}
        className={`shrink-0 flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-bold transition-all active:scale-95 ${unlocked ? "bg-sky-400 text-white hover:bg-sky-500 shadow-sm" : "bg-mist text-slate cursor-not-allowed"}`}>
        {unlocked ? <><Play className="w-3 h-3 fill-current" /> 開始</> : <><Lock className="w-3 h-3" /> 鎖定</>}
      </button>
    </div>
  );
}

// ─── Road Map Progress ───────────────────────────────────────────────

interface RoadMapStep {
  id: string;
  label: string;
  icon: string;
  completed: boolean;
  current: boolean;
  progress?: number;
  total?: number;
}

function RoadMapView({ helperDone, forestStories, sealsLit, completedIds, dreamLit }: {
  helperDone: boolean;
  forestStories: boolean[];
  sealsLit: number;
  completedIds: Set<string>;
  dreamLit: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalExercises = PRACTICE_ISLANDS.reduce((sum, i) => sum + i.exercises.length, 0);
  const completedExercises = Array.from(completedIds).filter(id =>
    PRACTICE_ISLANDS.some(i => i.exercises.some(e => e.id === id))
  ).length;

  const steps: RoadMapStep[] = [
    {
      id: "onboarding",
      label: "皮皮小幫手",
      icon: "👋",
      completed: helperDone,
      current: !helperDone,
    },
    {
      id: "forest",
      label: "森林故事",
      icon: "🌲",
      completed: forestStories.filter(Boolean).length === 3,
      current: helperDone && forestStories.filter(Boolean).length < 3,
      progress: forestStories.filter(Boolean).length,
      total: 3,
    },
    {
      id: "seals",
      label: "森林印記",
      icon: "🏆",
      completed: sealsLit === 3,
      current: helperDone && sealsLit < 3,
      progress: sealsLit,
      total: 3,
    },
    {
      id: "practice",
      label: "發音練習",
      icon: "🎯",
      completed: completedExercises === totalExercises && totalExercises > 0,
      current: helperDone && completedExercises < totalExercises,
      progress: completedExercises,
      total: totalExercises,
    },
    {
      id: "dream",
      label: "夢話歷險",
      icon: "✨",
      completed: dreamLit === 12,
      current: false,
      progress: dreamLit,
      total: 12,
    },
  ];

  const currentStepIndex = steps.findIndex(s => s.current);
  const completedCount = steps.filter(s => s.completed).length;

  return (
    <div className="rounded-xl border-2 border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-orange-50/50 overflow-hidden shadow-sm card-3d">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-100/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <Map className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-display text-base font-bold text-ink">學習路線圖</h3>
            <p className="text-xs text-slate">{completedCount}/{steps.length} 階段完成</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  step.completed
                    ? "bg-emerald-400"
                    : step.current
                    ? "bg-amber-400 animate-pulse"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <ChevronRight className={`w-5 h-5 text-slate transition-transform ${expanded ? "rotate-90" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-amber-200/50">
          <div className="relative">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                {index < steps.length - 1 && (
                  <div className={`absolute left-5 top-10 w-0.5 h-[calc(100%-2.5rem)] ${
                    step.completed ? "bg-emerald-300" : "bg-slate-200"
                  }`} />
                )}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg transition-all ${
                  step.completed
                    ? "bg-emerald-400 shadow-md shadow-emerald-200"
                    : step.current
                    ? "bg-amber-400 shadow-md shadow-amber-200 animate-pulse"
                    : "bg-slate-100 border-2 border-dashed border-slate-300"
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className={step.current ? "" : "grayscale opacity-50"}>{step.icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-bold text-sm ${
                      step.completed ? "text-emerald-700" : step.current ? "text-amber-800" : "text-slate-400"
                    }`}>
                      {step.label}
                    </p>
                    {step.progress !== undefined && step.total !== undefined && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        step.completed
                          ? "bg-emerald-100 text-emerald-700"
                          : step.current
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-400"
                      }`}>
                        {step.progress}/{step.total}
                      </span>
                    )}
                  </div>
                  {step.current && step.progress !== undefined && step.total !== undefined && (
                    <div className="mt-2 h-2 rounded-full bg-amber-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                        style={{ width: `${(step.progress / step.total) * 100}%` }}
                      />
                    </div>
                  )}
                  {step.current && (
                    <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      進行中
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Interactive Practice Sidebar ────────────────────────────────────

function PracticeSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeSession, setActiveSession] = useState<{
    phoneme: string;
    accuracy: number;
    attempts: number;
    tips: string[];
  } | null>(null);

  useEffect(() => {
    const loadSession = () => {
      try {
        const raw = localStorage.getItem("speakable-active-practice");
        if (raw) setActiveSession(JSON.parse(raw));
      } catch {}
    };
    loadSession();
    const interval = setInterval(loadSession, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={onClose}
      />
      <aside className={`fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-slate-200 shadow-2xl z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-cyan-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-ink">練習助手</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeSession ? (
              <>
                <div className="rounded-xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4">
                  <p className="text-xs text-sky-600 font-medium mb-1">正在練習</p>
                  <p className="text-2xl font-black text-ink">{activeSession.phoneme}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate">準確度</span>
                    <span className={`text-lg font-black ${
                      activeSession.accuracy >= 80 ? "text-emerald-500" :
                      activeSession.accuracy >= 60 ? "text-amber-500" : "text-red-400"
                    }`}>
                      {Math.round(activeSession.accuracy * 100)}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        activeSession.accuracy >= 80 ? "bg-emerald-400" :
                        activeSession.accuracy >= 60 ? "bg-amber-400" : "bg-red-400"
                      }`}
                      style={{ width: `${activeSession.accuracy * 100}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-medium text-slate">嘗試次數</span>
                  </div>
                  <p className="text-3xl font-black text-ink">{activeSession.attempts}</p>
                </div>

                {activeSession.tips.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-amber-800">小貼士</span>
                    </div>
                    <ul className="space-y-1.5">
                      {activeSession.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                          <span className="text-amber-400 mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Mic className="w-10 h-10 text-slate-300" />
                </div>
                <p className="font-bold text-ink mb-1">未有進行中嘅練習</p>
                <p className="text-sm text-slate">開始練習後，呢度會顯示即時反饋</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-4 bg-slate-50">
            <div className="flex items-center gap-2 text-xs text-slate">
              <Award className="w-4 h-4 text-amber-400" />
              <span>繼續努力，你做得好好！</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const auraStoryUnlocked = getAuraStoryUnlocked();
  const miniGameConfig = user?.id ? getMiniGameConfig(user.id) : null;
  const [sealStates, setSealStates] = useState<boolean[]>(getSealStates);
  const [helperDone, setHelperDoneState] = useState(getHelperDone);
  const [completedIds, setCompletedIds] = useState<Set<string>>(getCompletedIds);
  const [dreamChapters, setDreamChapters] = useState<boolean[]>(getDreamChapters);
  const [forestStories, setForestStories] = useState<boolean[]>(getForestStoryStates);
  const [forestExpanded, setForestExpanded] = useState(true);
  const [practiceExpanded, setPracticeExpanded] = useState(true);
  const [dreamExpanded, setDreamExpanded] = useState(true);
  const [showVoicePractice, setShowVoicePractice] = useState(false);
  const [showPracticeSidebar, setShowPracticeSidebar] = useState(false);

  useEffect(() => {
    setCompletedIds(getCompletedIds());
    const interval = setInterval(() => setCompletedIds(getCompletedIds()), 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSealComplete = useCallback((index: number) => {
    const newStates = [...sealStates];
    newStates[index] = true;
    setSealStates(newStates);
    persistSeals(newStates);
  }, [sealStates]);

  const handleHelperComplete = useCallback(() => {
    setHelperDoneState(true);
    setHelperDone();
  }, []);

  const handleDreamChapterComplete = useCallback((index: number) => {
    const newStates = [...dreamChapters];
    newStates[index] = true;
    setDreamChapters(newStates);
    persistDreamChapters(newStates);
  }, [dreamChapters]);

  const handleForestStoryComplete = useCallback((index: number) => {
    const newStates = [...forestStories];
    newStates[index] = true;
    setForestStories(newStates);
    persistForestStories(newStates);
  }, [forestStories]);

  useEffect(() => { setSealStates(getSealStates()); }, []);

  const sealsLit = sealStates.filter(Boolean).length;
  const dreamLit = dreamChapters.filter(Boolean).length;
  const handleStart = useCallback((exerciseId: string) => navigate(`/practice/${exerciseId}`), [navigate]);

  return (
    <div className="min-h-full bg-gradient-to-br from-pink-50 via-sky-50 via-purple-50/30 to-emerald-50">
      {/* Animated colourful background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-pink-300/30 to-purple-400/20 blur-3xl animate-[floatBlob_12s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-300/25 to-rose-400/20 blur-3xl animate-[floatBlob_16s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-cyan-300/20 to-blue-400/15 blur-3xl animate-[floatBlob_14s_ease-in-out_infinite_4s]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-300/20 to-teal-400/15 blur-3xl animate-[floatBlob_18s_ease-in-out_infinite_1s]" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-gradient-to-bl from-violet-300/20 to-fuchsia-400/15 blur-3xl animate-[floatBlob_15s_ease-in-out_infinite_3s]" />
      </div>

      <FadeIn>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 md:px-6 md:py-6">

        {/* ═══ Welcome Banner ═══ */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 via-sky-50 to-emerald-50 border border-amber-200/40 shadow-md px-5 py-4 md:px-6 md:py-5 flex items-center gap-4 md:gap-6 card-3d">
          <div className="flex-shrink-0 relative">
            <img src={pipiParrot} alt="皮皮" className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-[0_4px_12px_rgba(251,191,36,0.35)] animate-[float_3s_ease-in-out_infinite]" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 md:h-6 md:w-6">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
              <span className="relative inline-flex h-full w-full items-center justify-center rounded-full bg-amber-400 text-[10px] md:text-xs font-bold text-amber-950">
                <Mic className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </span>
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-black text-amber-800"
              style={{
                textShadow: "0 1px 0 rgba(255,255,255,0.9), 0 2px 0 rgba(251,191,36,0.3), 0 3px 8px rgba(0,0,0,0.08)",
                animation: "textFloat 3s ease-in-out infinite",
              }}>歡迎回來！</h2>
            <p className="text-sm md:text-base text-amber-700/80 mt-0.5"
              style={{ animation: "textFloat 3s ease-in-out infinite 0.3s" }}>準備好今日嘅語音練習未？</p>
          </div>
          <button type="button" onClick={() => setShowVoicePractice(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200">
            <Mic className="w-4 h-4" />
            同我講嘢
          </button>
          <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-amber-200/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-sky-200/20 blur-2xl" />
        </div>

        {/* ═══ Road Map + Practice Sidebar Toggle ═══ */}
        <div className="flex gap-3">
          <div className="flex-1">
            <RoadMapView
              helperDone={helperDone}
              forestStories={forestStories}
              sealsLit={sealsLit}
              completedIds={completedIds}
              dreamLit={dreamLit}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPracticeSidebar(true)}
            className="self-start shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
            aria-label="開啟練習助手"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* ═══ 1. 森林故事任務 ═══ */}
        <section aria-labelledby="forest-heading" className="shadow-lg shadow-cyan-900/10 rounded-xl"
          style={{ perspective: "800px" }}>
          <button type="button" onClick={() => setForestExpanded((v) => !v)}
            className="w-full flex items-center justify-between rounded-t-xl bg-gradient-to-r from-cyan-900 to-emerald-900 px-5 py-3.5 text-left transition-transform duration-300 hover:scale-[1.01]"
            style={{ boxShadow: "0 0 24px -6px rgba(34,211,238,0.25)", transformStyle: "preserve-3d" }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" style={{ animation: "sparkle 2s ease-in-out infinite" }} />
              <h2 id="forest-heading" className="font-display text-lg font-bold text-white"
                style={{
                  textShadow: "0 1px 0 rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.3)",
                  animation: "textFloat 3s ease-in-out infinite",
                }}>森林故事任務</h2>
              {auraStoryUnlocked && <span className="text-[11px] font-medium text-cyan-300 bg-cyan-400/20 px-2.5 py-0.5 rounded-full"
                style={{ animation: "popIn 0.5s ease-out" }}>已解鎖</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-cyan-200/70">{sealsLit}/3 印記</span>
              <ChevronRight className={`w-4 h-4 text-white transition-transform duration-300 ${forestExpanded ? "rotate-90" : ""}`} />
            </div>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${forestExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="rounded-b-xl border-x-2 border-b-2 border-cyan-900/30 bg-white card-3d">
              <div className="relative h-40 md:h-52 overflow-hidden bg-slate-950">
                <AuraPortalScene />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="font-display text-2xl md:text-3xl font-black text-transparent mb-3"
                      style={{
                        backgroundImage: "linear-gradient(180deg, #fef3c7 0%, #fbbf24 50%, #b45309 100%)",
                        WebkitBackgroundClip: "text", backgroundClip: "text",
                        WebkitTextStroke: "0.5px rgba(120, 53, 15, 0.9)",
                        filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.6)) drop-shadow(0 0 16px rgba(252,211,77,0.4))",
                        animation: "textFloat 4s ease-in-out infinite",
                        transformStyle: "preserve-3d",
                      }}>
                      靈光故事
                    </h3>
                    <p className="text-sm font-bold tracking-wide text-cyan-100/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">森林故事任務</p>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
                  <button type="button" onClick={() => auraStoryUnlocked && navigate("/aura-story")} disabled={!auraStoryUnlocked}
                    className="relative flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full focus-visible:outline-none group hover:scale-110 hover:rotate-6 active:scale-95 transition-all duration-300"
                    style={{ transformStyle: "preserve-3d" }}
                    aria-label="開啟靈光故事互動森林">
                    <span aria-hidden="true" className="absolute inset-0 rounded-full border-[4px] border-amber-300/90 shadow-[0_0_20px_rgba(252,211,77,0.4)]"
                      style={{ background: "conic-gradient(from 0deg, #fbbf24, #fde68a, #b45309, #fbbf24)" }} />
                    <span aria-hidden="true" className="absolute inset-1.5 rounded-full"
                      style={{ background: "radial-gradient(circle at 40% 35%, #bae6fd 0%, #0ea5e9 55%, #1e3a8a 100%)", boxShadow: "inset 0 0 20px rgba(255,255,255,0.4), 0 0 30px rgba(34,211,238,0.5)" }} />
                    <span className="relative z-10 text-lg md:text-xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">Open</span>
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {!helperDone && <HelperExercise onComplete={handleHelperComplete} />}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-500" style={{ animation: "sparkle 2s ease-in-out infinite" }} />
                    <span className="text-sm font-bold text-ink text-3d">森林故事</span>
                    <span className="text-xs text-slate">{forestStories.filter(Boolean).length}/3</span>
                  </div>
                  {forestStories.some(Boolean) && <div className="mb-2 h-1.5 rounded-full bg-mist overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500" style={{ width: `${(forestStories.filter(Boolean).length / 3) * 100}%` }} />
                  </div>}
                  <div className="space-y-2">
                    {FOREST_STORIES.map((story, idx) => (
                      <ForestStoryCard key={story.id} story={story} index={idx} completed={forestStories} helperDone={helperDone} onComplete={handleForestStoryComplete} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Gamepad2 className="w-4 h-4 text-sky-600" style={{ animation: "sparkle 2.5s ease-in-out infinite 0.3s" }} />
                      <span className="text-sm font-bold text-ink text-3d">森林印記</span>
                      <span className="text-xs text-slate">{sealsLit}/3</span>
                    </div>
                    {sealsLit === 3 && <span className="text-xs font-medium text-mint flex items-center gap-1 bg-mint/10 px-2 py-0.5 rounded-full"><Sparkles className="w-3 h-3" />全部點亮</span>}
                  </div>
                  {sealsLit < 3 && <div className="mb-2 h-1.5 rounded-full bg-mist overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-mint transition-all duration-500" style={{ width: `${(sealsLit / 3) * 100}%` }} /></div>}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {MINIGAMES.filter((g) => isQuizGameEnabled(miniGameConfig, g.id)).map((game, idx) => <SealGame key={game.id} game={game} sealIndex={idx} sealStates={sealStates} onComplete={handleSealComplete} />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 1.5 海盜藏寶圖 3D 學習 ═══ */}
        <section className="shadow-lg shadow-amber-900/10 rounded-xl" style={{ perspective: "800px" }}>
          <button
            type="button"
            onClick={() => navigate("/pirate-treasure-map")}
            className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-800 px-5 py-4 text-left shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/30 backdrop-blur">
                <Map className="h-6 w-6 text-amber-100" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-bold text-white" style={{ textShadow: "0 1px 0 rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.3)" }}>
                  海盜藏寶圖 3D 學習
                </h2>
                <p className="text-sm text-amber-100/80">探索 3D 藏寶圖，解鎖粵語聲調、聲母、韻母挑戰</p>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-100" />
            </div>
          </button>
        </section>

        {/* ═══ 2. 皮皮練習 ═══ */}
        <section aria-labelledby="practice-heading" className="shadow-lg shadow-sky-900/10 rounded-xl"
          style={{ perspective: "800px" }}>
          <button type="button" onClick={() => setPracticeExpanded((v) => !v)}
            className="w-full flex items-center justify-between rounded-t-xl bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-3.5 text-left shadow-md transition-all duration-300 hover:scale-[1.01]"
            style={{ transformStyle: "preserve-3d", backgroundSize: "200% 200%", animation: "gradientShift 6s ease infinite" }}>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-200" style={{ animation: "sparkle 2.5s ease-in-out infinite 0.5s" }} />
              <h2 id="practice-heading" className="font-display text-lg font-bold text-white"
                style={{
                  textShadow: "0 1px 0 rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.3)",
                  animation: "textFloat 3s ease-in-out infinite 0.5s",
                }}>皮皮練習</h2>
            </div>
            <ChevronRight className={`w-4 h-4 text-white transition-transform duration-300 ${practiceExpanded ? "rotate-90" : ""}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${practiceExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="rounded-b-xl border-x-2 border-b-2 border-sky-200 bg-white p-4 space-y-4 card-3d">
              {PRACTICE_ISLANDS.map((island) => {
                const islandCompleted = island.exercises.filter((e) => completedIds.has(e.id)).length;
                return (
                  <div key={island.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-ink text-base">{island.labelZh}</span>
                      <span className="text-xs text-slate">{island.phonemes}</span>
                      <span className="text-xs text-slate ml-auto">{islandCompleted}/{island.exercises.length}</span>
                    </div>
                    <div className="space-y-2">
                      {island.exercises.map((ex) => {
                        const unlocked = !ex.requires || completedIds.has(ex.requires);
                        return <ExerciseRow key={ex.id} exercise={ex} unlocked={unlocked} onStart={handleStart} />;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ 3. 皮皮夢話歷險 ═══ */}
        <section aria-labelledby="dream-heading" className="shadow-lg shadow-purple-900/10 rounded-xl"
          style={{ perspective: "800px" }}>
          <button type="button" onClick={() => setDreamExpanded((v) => !v)}
            className="w-full flex items-center justify-between rounded-t-xl bg-gradient-to-r from-purple-700 to-indigo-800 px-5 py-3.5 text-left shadow-md transition-all duration-300 hover:scale-[1.01]"
            style={{ transformStyle: "preserve-3d", backgroundSize: "200% 200%", animation: "gradientShift 8s ease infinite" }}>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-200" style={{ animation: "sparkle 2s ease-in-out infinite 1s" }} />
              <h2 id="dream-heading" className="font-display text-lg font-bold text-white"
                style={{
                  textShadow: "0 1px 0 rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.3)",
                  animation: "textFloat 3s ease-in-out infinite 1s",
                }}>皮皮夢話歷險</h2>
              <span className="text-xs text-purple-200/80">{dreamLit}/12 章節</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-white transition-transform duration-300 ${dreamExpanded ? "rotate-90" : ""}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${dreamExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="rounded-b-xl border-x-2 border-b-2 border-purple-200 bg-white card-3d">
              <div className="relative bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 px-5 py-6 text-center overflow-hidden"
                style={{ backgroundSize: "200% 200%", animation: "gradientShift 10s ease infinite" }}>
                <div className="pointer-events-none absolute inset-0 opacity-20">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="absolute rounded-full"
                      style={{
                        width: `${6 + (i % 4) * 5}px`, height: `${6 + (i % 4) * 5}px`,
                        left: `${5 + (i * 11) % 90}%`, top: `${10 + (i * 23) % 80}%`,
                        opacity: 0.2 + (i % 5) * 0.12,
                        backgroundColor: ["#fbbf24", "#a78bfa", "#34d399", "#f472b6", "#60a5fa"][i % 5],
                        animation: `textFloat ${3 + (i % 3)}s ease-in-out infinite ${i * 0.3}s`,
                      }} />
                  ))}
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/80 mb-1"
                  style={{ animation: "textFloat 3.5s ease-in-out infinite 0.2s" }}>12 章電影式粵語練習</p>
                <p className="text-sm text-purple-200/70 mb-4 max-w-md mx-auto"
                  style={{ animation: "textFloat 3.5s ease-in-out infinite 0.6s" }}>每章有動畫故事片、語音提示、AI 聲線克隆練習</p>
                <button type="button" onClick={() => navigate("/aura-journey")}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-bold text-amber-950 shadow-lg shadow-amber-400/30 hover:bg-amber-300 transition-all active:scale-95">
                  <Play className="w-4 h-4 fill-current" /> 開始歷險
                </button>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-purple-200/60">
                  <span>{dreamLit}/12 章完成</span>
                  <span className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-purple-400 transition-all duration-500" style={{ width: `${(dreamLit / 12) * 100}%` }} />
                  </span>
                </div>
              </div>
              <div className="px-4 py-4 space-y-3">
                <p className="text-sm font-bold text-ink flex items-center gap-2 text-3d">
                  <BookOpen className="w-4 h-4 text-purple-500" style={{ animation: "sparkle 2s ease-in-out infinite 0.7s" }} />
                  章節預覽
                </p>
                {auraJourneyScenes.map((scene, idx) => {
                  const isDone = dreamChapters[idx];
                  return (
                    <div key={idx}
                      className={`rounded-xl border-2 p-4 transition-all hover:shadow-sm card-3d ${isDone ? "border-mint/40 bg-gradient-to-r from-mint/5 to-emerald-50" : "border-mist bg-white hover:border-purple-200"}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${isDone ? "bg-mint text-white" : "bg-purple-100 text-purple-700"}`}>
                          {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-ink">{scene.title}</p>
                          <p className="text-xs text-slate">{scene.subtitle}</p>
                          <p className="text-xs text-slate/60 italic mt-1 line-clamp-2">🎬 {scene.cinematicPrompt}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">🎯 {scene.therapistGoal}</span>
                            <button type="button" onClick={() => speakCantonese(scene.voiceText)}
                              className="text-[11px] text-purple-600 font-medium hover:text-purple-800 transition-colors inline-flex items-center gap-1">
                              <Volume2 className="w-3 h-3" /> 聽範例
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

      </div>
      </FadeIn>

      {/* Voice practice modal */}
      {showVoicePractice && <VoicePracticeModal onClose={() => setShowVoicePractice(false)} />}

      {/* Practice sidebar */}
      <PracticeSidebar isOpen={showPracticeSidebar} onClose={() => setShowPracticeSidebar(false)} />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes textFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes sparkle { 0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); } 50% { opacity: 0.6; transform: scale(1.2) rotate(15deg); } }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .card-3d { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease; transform-style: preserve-3d; }
        .card-3d:hover { transform: translateY(-4px) rotateX(2deg) scale(1.01); box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15); }
        .text-3d { text-shadow: 0 1px 0 rgba(255,255,255,0.6), 0 2px 0 rgba(0,0,0,0.08), 0 3px 8px rgba(0,0,0,0.06); }
        
        /* Unified typography for student dashboard */
        .font-display, .font-body {
          font-family: var(--font-family-base, 'Inter', 'Noto Sans HK', -apple-system, sans-serif);
        }
        
        /* Unified color mappings */
        .text-ink { color: var(--color-text-primary, #0f172a); }
        .text-slate { color: var(--color-text-secondary, #475569); }
        .text-mist { color: var(--color-text-muted, #64748b); }
        .bg-cloud { background-color: var(--color-bg-page, #f8fafc); }
        .bg-mist { background-color: var(--color-bg-muted, #e2e8f0); }
        .border-mist { border-color: var(--color-border-default, #e2e8f0); }
        .text-sky-400, .text-cyan-400 { color: var(--color-primary, #2563eb); }
        .text-mint, .text-emerald-400 { color: var(--color-success, #10b981); }
        .text-sunshine, .text-amber-400 { color: var(--color-warning, #f59e0b); }
        .text-coral, .text-red-400 { color: var(--color-error, #ef4444); }
        .bg-sky-400 { background-color: var(--color-primary, #2563eb); }
        .bg-mint { background-color: var(--color-success, #10b981); }
        .bg-sunshine { background-color: var(--color-warning, #f59e0b); }
        .bg-coral { background-color: var(--color-error, #ef4444); }
      `}</style>
    </div>
  );
}
