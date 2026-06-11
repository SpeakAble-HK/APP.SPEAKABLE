import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { getMiniGameConfig, isAdaptGameEnabled } from "@/shared/lib/miniGameConfigStore";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Sparkles, useGLTF, Html } from "@react-three/drei";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Mesh,
  Points,
  Vector3,
} from "three";
import { ArrowLeft, Sparkles as SparklesIcon } from "lucide-react";
import PhoneticChallenge, {
  type PhoneticChallengeData,
  type PhoneticChallengeResult,
} from "@/shared/components/PhoneticChallenge";
import GameLauncher from "@/shared/components/forest-games/GameLauncher";
import type { GameId } from "@/shared/components/forest-games/ForestGameTypes";
import { GameDirector } from "@/shared/lib/miniGameBuilder/GameDirector";
import type { MiniGameBlueprint } from "@/shared/lib/miniGameBuilder/types";
import { MaterialIcon } from "@/shared/components/MaterialIcon";

const STORAGE_KEY = "speakable-ai-blueprints";

/* ------------------------------------------------------------------ */
/* Hotspot data                                                        */
/* ------------------------------------------------------------------ */

type ChallengeHotspot = {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
  kind: "challenge";
  challenge: PhoneticChallengeData;
};

type GameHotspot = {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
  kind: "game";
  gameId: GameId;
};

type AiGameHotspot = {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
  kind: "ai-game";
};

type Hotspot = ChallengeHotspot | GameHotspot | AiGameHotspot;

const HOTSPOTS: Hotspot[] = [
  {
    id: "portal",
    label: "靈光之門",
    position: [0, 3.2, 0],
    color: "#22d3ee",
    kind: "challenge",
    challenge: {
      id: 1,
      category: "tone",
      type: "multiple-choice",
      question: "哪一個是「媽」的聲調？",
      options: ["第一聲", "第二聲", "第三聲", "第四聲"],
      answer: "第一聲",
      hint: "高平調",
      explanation: "「媽」是高平調（第一聲）。",
    },
  },
  {
    id: "pipi",
    label: "皮皮的回音",
    position: [6, 1.5, -2],
    color: "#fde68a",
    kind: "challenge",
    challenge: {
      id: 2,
      category: "initial",
      type: "text-input",
      question: "請輸入「波」的聲母。",
      answer: "b",
      hint: "雙唇音",
      explanation: "「波」的聲母是 b。",
    },
  },
  {
    id: "mushroom",
    label: "光暈蘑菇",
    position: [-6, 0.3, 4],
    color: "#a78bfa",
    kind: "challenge",
    challenge: {
      id: 3,
      category: "final",
      type: "audio-tone",
      question: "聽聽聲音，這個音的韻母是？",
      audioText: "媽",
      answer: "a",
      hint: "開口大",
      explanation: "「媽」的韻母是 a。",
    },
  },
  {
    id: "water-park",
    label: "水上樂園",
    position: [5, 0.5, 6],
    color: "#38bdf8",
    kind: "game",
    gameId: "water-park",
  },
  {
    id: "maze",
    label: "迷宮大冒險",
    position: [-5, 0.5, -5],
    color: "#818cf8",
    kind: "game",
    gameId: "maze",
  },
  {
    id: "fruit-ninja",
    label: "水果忍者",
    position: [8, 0.5, -4],
    color: "#fb7185",
    kind: "game",
    gameId: "fruit-ninja",
  },
  {
    id: "catch-fly",
    label: "捉飛蟲",
    position: [-7, 0.5, -2],
    color: "#65a30d",
    kind: "game",
    gameId: "catch-fly",
  },
  {
    id: "ai-game",
    label: "AI 遊戲",
    position: [0, -1.2, 8],
    color: "#f472b6",
    kind: "ai-game",
  },
];

/* ------------------------------------------------------------------ */
/* Pipi character (ported from zip)                                    */
/* ------------------------------------------------------------------ */

function PipiCharacter() {
  const groupRef = useRef<Group>(null);
  const wingLeftRef = useRef<Mesh>(null);
  const wingRightRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = 6 + Math.sin(t * 1.5) * 1.4;
      const angle = t * 0.4;
      groupRef.current.position.x = Math.cos(angle) * 6;
      groupRef.current.position.z = Math.sin(angle) * 6 - 2;
      groupRef.current.rotation.y = -angle + Math.PI / 2;
    }
    if (wingLeftRef.current && wingRightRef.current) {
      const flap = Math.sin(t * 8) * 0.5;
      wingLeftRef.current.rotation.z = flap;
      wingRightRef.current.rotation.z = -flap;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color={new Color(0xffdd00)} emissive={new Color(0xffaa00)} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color={new Color(0xffdd00)} emissive={new Color(0xffaa00)} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.2, 1.1, 0.5]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0.2, 1.1, 0.5]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0, 0.8, 0.7]}>
        <coneGeometry args={[0.22, 0.36, 16]} />
        <meshStandardMaterial color={new Color(0xff6600)} />
      </mesh>
      <mesh ref={wingLeftRef} position={[-0.6, 0.3, 0]}>
        <boxGeometry args={[0.3, 1.1, 0.2]} />
        <meshStandardMaterial color={new Color(0x00ccff)} emissive={new Color(0x0099ff)} emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={wingRightRef} position={[0.6, 0.3, 0]}>
        <boxGeometry args={[0.3, 1.1, 0.2]} />
        <meshStandardMaterial color={new Color(0x00ccff)} emissive={new Color(0x0099ff)} emissiveIntensity={0.8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.4, 24, 24]} />
        <meshStandardMaterial
          color={new Color(0xffdd00)}
          emissive={new Color(0xffaa00)}
          emissiveIntensity={0.3}
          transparent
          opacity={0.18}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Portal (ported from zip)                                            */
/* ------------------------------------------------------------------ */

function PortalMesh() {
  const portalRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (portalRef.current) {
      portalRef.current.rotation.z += 0.004;
      portalRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
    }
    if (ringRef.current) {
      const s = 1 + Math.sin(t * 2) * 0.08;
      ringRef.current.scale.set(s, s, 1);
    }
  });

  return (
    <group position={[0, 3, 0]}>
      <mesh ref={ringRef}>
        <torusGeometry args={[3.5, 0.3, 16, 100]} />
        <meshStandardMaterial color="#4da6ff" emissive="#0066ff" emissiveIntensity={2} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={portalRef} position={[0, 0, 0.1]}>
        <cylinderGeometry args={[3, 3, 0.5, 64, 8]} />
        <meshStandardMaterial color="#0066ff" emissive="#0099ff" emissiveIntensity={3} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.2]}>
        <torusGeometry args={[2.5, 0.2, 16, 100]} />
        <meshStandardMaterial
          color="#00ccff"
          emissive="#00ffff"
          emissiveIntensity={2.5}
          transparent
          opacity={0.6}
          blending={AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, 0, 0.3]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#0099ff" emissive="#00ffff" emissiveIntensity={4} transparent opacity={0.4} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 3.5;
        const z = Math.sin(angle) * 3.5;
        return (
          <mesh key={`root-${i}`} position={[x, 0, z]}>
            <boxGeometry args={[0.4, 5, 0.4]} />
            <meshStandardMaterial color="#3d2817" emissive="#4da6ff" emissiveIntensity={0.5} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Particles (ported from zip)                                         */
/* ------------------------------------------------------------------ */

function ParticleSystem() {
  const pointsRef = useRef<Points>(null);
  const count = 500;

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 40;
      pos[i + 1] = Math.random() * 20 - 5;
      pos[i + 2] = (Math.random() - 0.5) * 40;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const arr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] += Math.sin(clock.getElapsedTime() + i) * 0.01;
      if (arr[i + 1] > 20) arr[i + 1] = -5;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += 0.0001;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry attach="geometry" {...geometry} />
      <pointsMaterial size={0.15} color="#4da6ff" sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Forest GLTF + procedural extras                                     */
/* ------------------------------------------------------------------ */

function ForestModel() {
  const { scene } = useGLTF("/assets/enchanted-forest/o_donkey_forest_river.gltf");
  return <primitive object={scene} position={[0, -2, -4]} scale={1.2} />;
}

function GlowingFlora() {
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = 9;
        return (
          <mesh key={`moss-${i}`} position={[Math.cos(a) * r, -1.8, Math.sin(a) * r]}>
            <cylinderGeometry args={[1.6, 2, 0.5, 24]} />
            <meshStandardMaterial color="#00ff88" emissive="#00aa44" emissiveIntensity={0.7} />
          </mesh>
        );
      })}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const r = 7;
        return (
          <group key={`mush-${i}`} position={[Math.cos(a) * r, -1.5, Math.sin(a) * r]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.2, 0.8, 8]} />
              <meshStandardMaterial color="#8b6f47" />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial color="#00ccff" emissive="#0099ff" emissiveIntensity={1.1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Hotspot marker                                                      */
/* ------------------------------------------------------------------ */

function HotspotMarker({
  hotspot,
  onClick,
}: {
  hotspot: Hotspot;
  onClick: (h: Hotspot) => void;
}) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      const s = 1 + Math.sin(t * 3 + hotspot.position[0]) * 0.15;
      ref.current.scale.set(s, s, s);
    }
  });
  return (
    <group position={hotspot.position}>
      <mesh
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          onClick(hotspot);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial
          color={hotspot.color}
          emissive={hotspot.color}
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>
      <Html distanceFactor={12} position={[0, 1.1, 0]} center>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-cyan-100 ring-1 ring-cyan-300/60 backdrop-blur">
          {hotspot.label}
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Camera rig: WASD + drag look + touch joystick                       */
/* ------------------------------------------------------------------ */

type MoveState = { f: number; b: number; l: number; r: number; yaw: number; pitch: number };

function CameraRig({
  moveRef,
  joystickRef,
}: {
  moveRef: React.MutableRefObject<MoveState>;
  joystickRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const { camera } = useThree();
  const tmpForward = useMemo(() => new Vector3(), []);
  const tmpRight = useMemo(() => new Vector3(), []);

  useFrame((_, delta) => {
    const m = moveRef.current;
    const j = joystickRef.current;

    // Apply yaw / pitch
    camera.rotation.order = "YXZ";
    camera.rotation.y = m.yaw;
    camera.rotation.x = m.pitch;

    // Forward / right vectors flat on Y
    tmpForward.set(-Math.sin(m.yaw), 0, -Math.cos(m.yaw));
    tmpRight.set(Math.cos(m.yaw), 0, -Math.sin(m.yaw));

    const speed = 8 * delta;
    const fwd = m.f - m.b + -j.y;
    const strafe = m.r - m.l + j.x;

    camera.position.addScaledVector(tmpForward, fwd * speed);
    camera.position.addScaledVector(tmpRight, strafe * speed);

    // Clamp Y so you don't fly through the ground
    if (camera.position.y < 1.5) camera.position.y = 1.5;
    if (camera.position.y > 14) camera.position.y = 14;
  });

  return null;
}

/* ------------------------------------------------------------------ */
/* Loading screen                                                      */
/* ------------------------------------------------------------------ */

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0e27]">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
        <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-cyan-400 animate-pulse" />
      </div>
      <p className="mt-6 text-lg font-bold text-cyan-100 animate-pulse">進入魔法森林...</p>
      <p className="mt-2 text-sm text-cyan-200/60">正在載入 3D 場景</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas loading fallback                                             */
/* ------------------------------------------------------------------ */

function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="h-12 w-12 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
        <p className="text-sm text-cyan-100">載入中...</p>
      </div>
    </Html>
  );
}

/* ------------------------------------------------------------------ */
/* Main experience component                                           */
/* ------------------------------------------------------------------ */

export default function EnchantedForestExperience() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const miniGameConfig = user?.id ? getMiniGameConfig(user.id) : null;
  const visibleHotspots = useMemo(() =>
    HOTSPOTS.filter((h) => {
      if (h.kind !== "game") return true;
      return isAdaptGameEnabled(miniGameConfig, h.gameId);
    }),
    [miniGameConfig]
  );

  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [showAiPicker, setShowAiPicker] = useState(false);
  const [aiBlueprint, setAiBlueprint] = useState<MiniGameBlueprint | null>(null);
  const [aiPlaying, setAiPlaying] = useState(false);

  const savedBlueprints = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as MiniGameBlueprint[] : [];
    } catch {
      return [];
    }
  }, [showAiPicker]);

  const moveRef = useRef<MoveState>({ f: 0, b: 0, l: 0, r: 0, yaw: 0, pitch: -0.1 });
  const joystickRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  /* Keyboard */
  useEffect(() => {
    const setKey = (e: KeyboardEvent, v: number) => {
      const m = moveRef.current;
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          m.f = v;
          break;
        case "KeyS":
        case "ArrowDown":
          m.b = v;
          break;
        case "KeyA":
        case "ArrowLeft":
          m.l = v;
          break;
        case "KeyD":
        case "ArrowRight":
          m.r = v;
          break;
      }
    };
    const down = (e: KeyboardEvent) => setKey(e, 1);
    const up = (e: KeyboardEvent) => setKey(e, 0);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  /* Mouse drag look */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    const m = moveRef.current;
    m.yaw -= dx * 0.004;
    m.pitch -= dy * 0.004;
    if (m.pitch > 0.9) m.pitch = 0.9;
    if (m.pitch < -0.9) m.pitch = -0.9;
  };
  const onPointerUp = () => {
    dragRef.current.active = false;
  };

  /* Touch joystick */
  const joyOuterRef = useRef<HTMLDivElement>(null);
  const joyKnobRef = useRef<HTMLDivElement>(null);
  const joyStateRef = useRef<{ id: number | null; cx: number; cy: number }>({
    id: null,
    cx: 0,
    cy: 0,
  });
  const joyStart = (e: React.TouchEvent) => {
    const rect = joyOuterRef.current!.getBoundingClientRect();
    joyStateRef.current = {
      id: e.changedTouches[0].identifier,
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
    };
  };
  const joyMove = (e: React.TouchEvent) => {
    const st = joyStateRef.current;
    if (st.id === null) return;
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier !== st.id) continue;
      const dx = t.clientX - st.cx;
      const dy = t.clientY - st.cy;
      const max = 40;
      const len = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, len / max);
      const nx = (dx / len) * k;
      const ny = (dy / len) * k;
      joystickRef.current.x = nx;
      joystickRef.current.y = ny;
      if (joyKnobRef.current) {
        joyKnobRef.current.style.transform = `translate(${nx * max}px, ${ny * max}px)`;
      }
    }
  };
  const joyEnd = () => {
    joyStateRef.current.id = null;
    joystickRef.current.x = 0;
    joystickRef.current.y = 0;
    if (joyKnobRef.current) joyKnobRef.current.style.transform = `translate(0px, 0px)`;
  };

  const handleResult = (h: ChallengeHotspot) => (r: PhoneticChallengeResult) => {
    if (r.correct && !completed.includes(h.id)) {
      setCompleted((c) => [...c, h.id]);
    }
    setTimeout(() => setActiveHotspot(null), 900);
  };

  const handleGameComplete = (gameId: string) => {
    if (!completed.includes(gameId)) {
      setCompleted((c) => [...c, gameId]);
    }
    setActiveGame(null);
  };

  // Simulate loading time for the 3D scene
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e27]">
      <div
        ref={canvasWrapperRef}
        className="absolute inset-0"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ touchAction: "none" }}
      >
        <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }} shadows>
          <PerspectiveCamera makeDefault position={[0, 6, 16]} fov={60} />
          <ambientLight intensity={0.6} color={new Color(0x6b5b95)} />
          <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
          <pointLight position={[0, 5, 0]} intensity={2} color={new Color(0x4da6ff)} distance={30} />
          <color attach="background" args={["#0a0e27"]} />
          <fog attach="fog" args={["#0a0e27", 8, 60]} />

          <Suspense fallback={<CanvasLoader />}>
            <ForestModel />
            <GlowingFlora />
            <PortalMesh />
            <PipiCharacter />
            <ParticleSystem />
            <Sparkles count={100} scale={[20, 20, 20]} size={3} speed={0.5} color={new Color(0x4da6ff)} />

            {visibleHotspots.map((h) =>
              completed.includes(h.id) ? null : <HotspotMarker key={h.id} hotspot={h} onClick={(h) => {
                if (h.kind === "ai-game") {
                  setShowAiPicker(true);
                } else if (h.kind === "game") {
                  setActiveGame(h.gameId);
                } else {
                  setActiveHotspot(h);
                }
              }} />
            )}
          </Suspense>

          <CameraRig moveRef={moveRef} joystickRef={joystickRef} />
        </Canvas>
      </div>

      {/* Top HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 md:p-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-slate-900/70 px-4 py-2 text-sm font-bold text-cyan-100 backdrop-blur transition hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          返回
        </button>

        <div className="pointer-events-none rounded-full border border-amber-300/60 bg-slate-900/70 px-4 py-2 text-sm font-bold text-amber-200 backdrop-blur">
          <SparklesIcon className="mr-1 inline h-4 w-4" aria-hidden="true" />
          已完成 {completed.length} / {visibleHotspots.length}
        </div>
      </div>

      {/* Bottom instructions */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
        <div className="rounded-full border border-cyan-300/30 bg-slate-900/70 px-4 py-2 text-center text-xs font-semibold text-cyan-100/90 backdrop-blur md:text-sm">
          <span className="hidden md:inline">WASD / 方向鍵移動 · 拖曳畫面轉視角 · 點擊發光點開始挑戰</span>
          <span className="md:hidden">左下搖桿移動 · 拖曳畫面轉視角 · 點發光點挑戰</span>
        </div>
      </div>

      {/* Touch joystick (mobile only) */}
      <div
        ref={joyOuterRef}
        onTouchStart={joyStart}
        onTouchMove={joyMove}
        onTouchEnd={joyEnd}
        onTouchCancel={joyEnd}
        className="absolute bottom-20 left-6 z-10 h-32 w-32 rounded-full border-2 border-cyan-300/40 bg-slate-900/40 backdrop-blur md:hidden"
        style={{ touchAction: "none" }}
        aria-label="移動搖桿"
      >
        <div
          ref={joyKnobRef}
          className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/80 shadow-lg ring-2 ring-cyan-100/60"
        />
      </div>

      {/* Challenge modal overlay */}
      {activeHotspot && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveHotspot(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border-2 border-cyan-400/60 bg-slate-900 p-5 shadow-[0_0_60px_-10px_rgba(34,211,238,0.7)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-cyan-100">{activeHotspot.label}</h2>
              <button
                type="button"
                onClick={() => setActiveHotspot(null)}
                className="rounded-full px-3 py-1 text-sm font-bold text-cyan-200 hover:bg-slate-800"
                aria-label="關閉"
              >
                ✕
              </button>
            </div>
            <div className="rounded-xl bg-white p-4">
              <PhoneticChallenge data={activeHotspot.challenge} onResult={handleResult(activeHotspot)} />
            </div>
          </div>
        </div>
      )}

      {/* Game modal */}
      {activeGame && (
        <GameLauncher
          gameId={activeGame}
          onClose={() => setActiveGame(null)}
          onComplete={handleGameComplete}
        />
      )}

      {/* AI blueprint picker */}
      {showAiPicker && !aiPlaying && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => { setShowAiPicker(false); setAiBlueprint(null); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl border-2 border-pink-400/60 bg-slate-900 p-5 shadow-[0_0_60px_-10px_rgba(244,114,182,0.7)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-pink-100">AI 遊戲工坊</h2>
              <button
                type="button"
                onClick={() => { setShowAiPicker(false); setAiBlueprint(null); }}
                className="rounded-full px-3 py-1 text-sm font-bold text-pink-200 hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {savedBlueprints.length === 0 ? (
              <div className="py-8 text-center">
                <MaterialIcon icon="auto_awesome" className="text-4xl text-pink-300 mb-2" filled />
                <p className="text-pink-100/70 text-sm">尚未建立 AI 遊戲</p>
                <p className="text-pink-100/50 text-xs mt-1">請到「遊戲工坊」頁面生成遊戲</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {savedBlueprints.map((bp) => (
                  <button
                    key={bp.id}
                    onClick={() => { setAiBlueprint(bp); setAiPlaying(true); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center shrink-0">
                      <MaterialIcon
                        icon={bp.mechanic.type === "select-correct" ? "quiz" : "swap_driving_apps_wheel"}
                        className="text-lg text-pink-300"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-pink-100 truncate">{bp.name}</p>
                      <p className="text-xs text-pink-200/50 truncate">
                        {bp.phonemeTargets.map(t => t.phonemes.join("/")).join(", ")}
                        {" · "}
                        {bp.challenges.length} 題
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI game playing */}
      {aiBlueprint && aiPlaying && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 p-4"
          onClick={() => { setAiPlaying(false); setAiBlueprint(null); }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border-2 border-pink-400/60 bg-slate-900 shadow-[0_0_80px_-10px_rgba(244,114,182,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-pink-400/20">
              <span className="font-bold text-pink-100">{aiBlueprint.name}</span>
              <button
                onClick={() => { setAiPlaying(false); setAiBlueprint(null); }}
                className="rounded-full px-3 py-1 text-sm font-bold text-pink-200 hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="h-[420px] md:h-[500px]">
              <GameDirector
                blueprint={aiBlueprint}
                onScore={() => {}}
                onExit={() => { setAiPlaying(false); setAiBlueprint(null); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
