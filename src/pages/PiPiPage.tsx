import { useState, useEffect, useCallback, useMemo, useRef, Suspense, type PointerEvent as ReactPointerEvent } from "react";
import { Component, type ReactNode } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Canvas, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, useFBX, useGLTF } from "@react-three/drei";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import * as THREE from "three";

interface ShopItem {
  id: string;
  name: string;
  cost: number;
  emoji: string;
}

interface FoodItem extends ShopItem {
  restore: number;
}

type DecorationAssetType = "gltf" | "fbx" | "dae";

interface DecorationItem extends ShopItem {
  assetType: DecorationAssetType;
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: number;
}

type DraggingDecoration = {
  itemId: string;
  x: number;
  y: number;
  startedAtX: number;
  startedAtY: number;
  isOverRoom: boolean;
};

type DecorationPlacement = {
  id: string;
  position: [number, number, number];
};

const HUNGER_MAX = 100;
const PIPI_FLYING_HOME_IMAGE = "/assets/pipi-flying-home.jpeg";
const STORAGE_KEY = "pipi-shop-owned";
const SPENT_KEY = "pipi-spent-points";
const HUNGER_KEY = "pipi-hunger";
const PLACED_DECORATIONS_KEY = "pipi-placed-decorations";

const outfits: ShopItem[] = [
  { id: "pirate", name: "海盜帽", cost: 100, emoji: "🏴‍☠️" },
  { id: "crown", name: "皇冠", cost: 200, emoji: "👑" },
  { id: "scarf", name: "紅頸巾", cost: 150, emoji: "🧣" },
  { id: "glasses", name: "太陽眼鏡", cost: 75, emoji: "🕶️" },
  { id: "cape", name: "英雄披風", cost: 300, emoji: "🦸" },
  { id: "tophat", name: "禮帽", cost: 250, emoji: "🎩" },
];

const decorations: DecorationItem[] = [
  {
    id: "dining-chair",
    name: "餐椅",
    cost: 0,
    emoji: "🪑",
    assetType: "gltf",
    url: "/assets/pipi-room/dining-desk-chair.gltf",
    position: [-2.25, -0.6, 1.5],
    rotation: [0, 0.85, 0],
    scale: 2.4,
  },
  {
    id: "office-table",
    name: "書枱",
    cost: 0,
    emoji: "🧰",
    assetType: "gltf",
    url: "/assets/pipi-room/office-table/office-table.gltf",
    position: [0.35, -0.65, 1.2],
    rotation: [0, -0.2, 0],
    scale: 2.1,
  },
  {
    id: "utensils",
    name: "餐具",
    cost: 0,
    emoji: "🍴",
    assetType: "gltf",
    url: "/assets/pipi-room/utensils.gltf",
    position: [1.65, -0.52, 1.45],
    rotation: [0, -0.25, 0],
    scale: 3.8,
  },
  {
    id: "double-bed",
    name: "雙人床",
    cost: 0,
    emoji: "🛏️",
    assetType: "fbx",
    url: "/assets/pipi-room/double-bed/double-bed.fbx",
    position: [-1.25, -0.78, -1.1],
    rotation: [0, 0.25, 0],
    scale: 0.013,
  },
  {
    id: "flower-glider",
    name: "花花滑翔傘",
    cost: 0,
    emoji: "🌼",
    assetType: "dae",
    url: "/assets/pipi-room/flower-glider/wing_flower.dae",
    position: [1.45, 1.25, -0.35],
    rotation: [0.15, -0.35, 0],
    scale: 0.018,
  },
];

const accessories: ShopItem[] = [
  { id: "bunny", name: "兔耳仔", cost: 600, emoji: "🐰" },
  { id: "headband", name: "頭帶", cost: 1200, emoji: "🎀" },
];

const foods: FoodItem[] = [
  { id: "apple", name: "蘋果", cost: 25, emoji: "🍎", restore: 15 },
  { id: "rice", name: "飯", cost: 40, emoji: "🍚", restore: 22 },
  { id: "banana", name: "香蕉", cost: 35, emoji: "🍌", restore: 20 },
  { id: "fish", name: "魚", cost: 55, emoji: "🐟", restore: 30 },
  { id: "corn", name: "粟米", cost: 30, emoji: "🌽", restore: 18 },
  { id: "bento", name: "便當", cost: 80, emoji: "🍱", restore: 45 },
];

type TabId = "outfits" | "decorations" | "accessories" | "food";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "outfits", label: "裝扮", emoji: "👕" },
  { id: "decorations", label: "家居", emoji: "🏠" },
  { id: "accessories", label: "配件", emoji: "🎮" },
  { id: "food", label: "食物", emoji: "🍽️" },
];

function getEarnedXp(): number {
  try {
    const progress = JSON.parse(sessionStorage.getItem("lesson_progress") || "{}");
    return Object.values(progress).reduce((sum: number, value: any) => sum + (value.xp_earned || 0), 0) as number;
  } catch {
    return 0;
  }
}

function loadSpent(): number {
  try {
    return parseInt(localStorage.getItem(SPENT_KEY) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function loadHunger(): number {
  try {
    const raw = localStorage.getItem(HUNGER_KEY);
    if (raw === null) return HUNGER_MAX;
    const value = parseInt(raw, 10);
    if (Number.isNaN(value)) return HUNGER_MAX;
    return Math.min(HUNGER_MAX, Math.max(0, value));
  } catch {
    return HUNGER_MAX;
  }
}

function isKnownDecoration(id: string) {
  return decorations.some((item) => item.id === id);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDecorationDropPosition(item: DecorationItem, clientX: number, clientY: number, roomRect: DOMRect): [number, number, number] {
  const xRatio = clamp((clientX - roomRect.left) / roomRect.width, 0.08, 0.92);
  const yRatio = clamp((clientY - roomRect.top) / roomRect.height, 0.14, 0.9);

  return [
    (xRatio - 0.5) * 5.4,
    item.position[1],
    (yRatio - 0.5) * 4.8,
  ];
}

function loadPlacedDecorations(): DecorationPlacement[] {
  try {
    const saved = localStorage.getItem(PLACED_DECORATIONS_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry): DecorationPlacement | null => {
        if (typeof entry === "string") {
          const item = decorations.find((decoration) => decoration.id === entry);
          return item ? { id: item.id, position: item.position } : null;
        }

        if (
          entry &&
          typeof entry.id === "string" &&
          isKnownDecoration(entry.id) &&
          Array.isArray(entry.position) &&
          entry.position.length === 3 &&
          entry.position.every((value: unknown) => typeof value === "number" && Number.isFinite(value))
        ) {
          return { id: entry.id, position: entry.position as [number, number, number] };
        }

        return null;
      })
      .filter(Boolean) as DecorationPlacement[];
  } catch {
    return [];
  }
}

class BirdhouseErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="h-64 w-full rounded-md overflow-hidden bg-gradient-to-br from-sky-100 via-cyan-100 to-amber-100 flex items-center justify-center">
          <p className="text-xs text-slate text-center px-4">
            暫時載入唔到皮皮屋企 3D 內景
            <br />
            請稍後再試。
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function prepareModelObject(object: THREE.Object3D) {
  const clone = object.clone(true);
  clone.traverse((node) => {
    if (!(node as THREE.Mesh).isMesh) return;
    const mesh = node as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
  return clone;
}

function BirdhouseInteriorModel() {
  const interior = useFBX("/assets/inhouse-livingroom/InteriorTest.fbx");

  const colorfulInterior = useMemo(() => {
    const clone = interior.clone(true);
    const palette = ["#ff8fab", "#ffd166", "#7bdff2", "#b8f2e6", "#cdb4db", "#bde0fe", "#fdffb6", "#a7f3d0"];
    let paletteIndex = 0;

    clone.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;

      const mesh = node as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        if (!(material as THREE.MeshStandardMaterial).color) return;

        const standardMat = material as THREE.MeshStandardMaterial;
        const hasTextureMap = Boolean(standardMat.map);

        if (hasTextureMap) {
          standardMat.color.offsetHSL(0.02, 0.18, 0.12);
        } else {
          standardMat.color.set(palette[paletteIndex % palette.length]);
        }

        standardMat.roughness = Math.min(0.92, Math.max(0.38, standardMat.roughness ?? 0.65));
        standardMat.metalness = Math.max(0, (standardMat.metalness ?? 0) * 0.2);
        standardMat.emissive.set("#fff7ad");
        standardMat.emissiveIntensity = 0.045;
        standardMat.needsUpdate = true;
        paletteIndex += 1;
      });
    });

    return clone;
  }, [interior]);

  return <primitive object={colorfulInterior} position={[0, -0.35, 0]} rotation={[0, 0.1, 0]} scale={0.04} />;
}

function GLTFDecorationModel({ item }: { item: DecorationItem }) {
  const gltf = useGLTF(item.url);
  const scene = useMemo(() => prepareModelObject(gltf.scene), [gltf.scene]);
  return <primitive object={scene} />;
}

function FBXDecorationModel({ item }: { item: DecorationItem }) {
  const fbx = useFBX(item.url);
  const scene = useMemo(() => prepareModelObject(fbx), [fbx]);
  return <primitive object={scene} />;
}

function DAEDecorationModel({ item }: { item: DecorationItem }) {
  const collada = useLoader(ColladaLoader, item.url);
  const scene = useMemo(() => prepareModelObject(collada.scene), [collada.scene]);
  return <primitive object={scene} />;
}

function DraggableDecorationProp({
  item,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  item: DecorationItem;
  isDragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, position: [number, number, number]) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl, size } = useThree();
  const [hovered, setHovered] = useState(false);
  const lastPosRef = useRef<[number, number, number]>(item.position);

  useEffect(() => {
    if (!isDragging) return;

    const canvas = gl.domElement;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.82);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const intersect = new THREE.Vector3();

    const handleMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / size.width) * 2 - 1;
      pointer.y = -(e.clientY / size.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(plane, intersect)) {
        const pos: [number, number, number] = [intersect.x, item.position[1], intersect.z];
        lastPosRef.current = pos;
        if (groupRef.current) {
          groupRef.current.position.set(pos[0], pos[1], pos[2]);
        }
      }
    };

    const handleUp = () => {
      onDragEnd(item.id, lastPosRef.current);
    };

    canvas.style.cursor = "grabbing";
    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerup", handleUp, { once: true });
    canvas.addEventListener("pointercancel", handleUp, { once: true });

    return () => {
      canvas.style.cursor = "";
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerup", handleUp);
      canvas.removeEventListener("pointercancel", handleUp);
    };
  }, [isDragging, camera, gl, size, item.id, item.position, onDragEnd]);

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      onDragStart(item.id);
    },
    [item.id, onDragStart]
  );

  return (
    <group ref={groupRef} position={item.position} rotation={item.rotation ?? [0, 0, 0]}>
      <group scale={item.scale}>
        {item.assetType === "gltf" && <GLTFDecorationModel item={item} />}
        {item.assetType === "fbx" && <FBXDecorationModel item={item} />}
        {item.assetType === "dae" && <DAEDecorationModel item={item} />}
      </group>
      <mesh
        onPointerDown={handlePointerDown}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {(hovered || isDragging) && (
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.8, 32]} />
          <meshBasicMaterial
            color={isDragging ? "#f59e0b" : "#38bdf8"}
            transparent
            opacity={0.35}
          />
        </mesh>
      )}
      <Html center distanceFactor={7} position={[0, 1.1, 0]} style={{ pointerEvents: "none" }}>
        <span className="rounded-pill bg-white/90 px-2 py-1 text-[10px] font-medium text-ink shadow-sm">
          {item.name}
        </span>
      </Html>
    </group>
  );
}

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(1.8, 5.4, 9.4);
    camera.lookAt(0, -0.2, 0.6);
  }, [camera]);
  return null;
}

function PiPiBirdhouseScene({
  placedItems,
  dragging3DId,
  on3DDragStart,
  on3DDragEnd,
}: {
  placedItems: DecorationItem[];
  dragging3DId: string | null;
  on3DDragStart: (id: string) => void;
  on3DDragEnd: (id: string, position: [number, number, number]) => void;
}) {
  const isDragging = dragging3DId !== null;

  return (
    <Canvas camera={{ position: [1.8, 5.4, 9.4], fov: 48 }} shadows gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={["#fef3c7"]} />
      <fog attach="fog" args={["#fef3c7", 9, 24]} />
      <ambientLight intensity={1.45} />
      <hemisphereLight intensity={1.0} color="#f0f9ff" groundColor="#fed7aa" />
      <directionalLight
        position={[14, 26, 16]}
        intensity={1.75}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-6, 5, 4]} intensity={1.35} color="#fb7185" />
      <pointLight position={[6, 4, -3]} intensity={1.15} color="#38bdf8" />
      <pointLight position={[0, 6, 4]} intensity={0.9} color="#fde047" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.82, 0]} receiveShadow>
        <circleGeometry args={[7, 50]} />
        <meshStandardMaterial color="#fde68a" transparent opacity={0.66} />
      </mesh>
      <Suspense fallback={null}>
        <BirdhouseInteriorModel />
        {placedItems.map((item) => (
          <DraggableDecorationProp
            key={item.id}
            item={item}
            isDragging={dragging3DId === item.id}
            onDragStart={on3DDragStart}
            onDragEnd={on3DDragEnd}
          />
        ))}
      </Suspense>
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        enabled={!isDragging}
        target={[0, -0.2, 0.6]}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
        panSpeed={0.45}
        minDistance={4.2}
        maxDistance={13}
        minPolarAngle={0.55}
        maxPolarAngle={1.42}
      />
      <CameraSetup />
    </Canvas>
  );
}

useGLTF.preload("/assets/pipi-room/dining-desk-chair.gltf");
useGLTF.preload("/assets/pipi-room/office-table/office-table.gltf");
useGLTF.preload("/assets/pipi-room/utensils.gltf");

export default function PiPiPage() {
  const roomRef = useRef<HTMLDivElement>(null);
  const suppressNextClickRef = useRef(false);
  const [showRoomReveal, setShowRoomReveal] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("outfits");
  const [activeDecorationId, setActiveDecorationId] = useState<string>(decorations[0].id);
  const [placedDecorations, setPlacedDecorations] = useState<DecorationPlacement[]>(loadPlacedDecorations);
  const [draggingDecoration, setDraggingDecoration] = useState<DraggingDecoration | null>(null);
  const [dragging3DId, setDragging3DId] = useState<string | null>(null);
  const [ownedItems, setOwnedItems] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });
  const [spent, setSpent] = useState(loadSpent);
  const [hunger, setHunger] = useState(loadHunger);

  const earned = getEarnedXp();
  const points = Math.max(0, earned - spent);
  const placedItems = useMemo(
    () =>
      placedDecorations
        .map((placement) => {
          const item = decorations.find((decoration) => decoration.id === placement.id);
          return item ? { ...item, position: placement.position } : null;
        })
        .filter(Boolean) as DecorationItem[],
    [placedDecorations]
  );
  const draggingItem = useMemo(
    () => decorations.find((item) => item.id === draggingDecoration?.itemId),
    [draggingDecoration?.itemId]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ownedItems]));
  }, [ownedItems]);
  useEffect(() => {
    localStorage.setItem(SPENT_KEY, String(spent));
  }, [spent]);
  useEffect(() => {
    localStorage.setItem(HUNGER_KEY, String(hunger));
  }, [hunger]);
  useEffect(() => {
    localStorage.setItem(PLACED_DECORATIONS_KEY, JSON.stringify(placedDecorations));
  }, [placedDecorations]);
  useEffect(() => {
    const timer = window.setTimeout(() => setShowRoomReveal(false), 1450);
    return () => window.clearTimeout(timer);
  }, []);

  const placeDecoration = useCallback((itemId: string, position?: [number, number, number]) => {
    const item = decorations.find((decoration) => decoration.id === itemId);
    if (!item) return;
    setActiveDecorationId(itemId);
    setPlacedDecorations((current) => {
      const nextPlacement = { id: itemId, position: position ?? item.position };
      const exists = current.some((placement) => placement.id === itemId);
      return exists
        ? current.map((placement) => (placement.id === itemId ? nextPlacement : placement))
        : [...current, nextPlacement];
    });
    toast.success(`已將${item.name}放入皮皮屋企`);
  }, []);

  const handle3DDragStart = useCallback((id: string) => {
    setDragging3DId(id);
  }, []);

  const handle3DDragEnd = useCallback((id: string, position: [number, number, number]) => {
    setDragging3DId(null);
    setPlacedDecorations((current) => {
      const exists = current.some((p) => p.id === id);
      return exists
        ? current.map((p) => (p.id === id ? { id, position } : p))
        : [...current, { id, position }];
    });
    const item = decorations.find((d) => d.id === id);
    if (item) toast.success(`已移動${item.name}位置`);
  }, []);

  useEffect(() => {
    if (!draggingDecoration) return;

    const handlePointerMove = (event: PointerEvent) => {
      const roomRect = roomRef.current?.getBoundingClientRect();
      const isOverRoom = roomRect
        ? event.clientX >= roomRect.left &&
          event.clientX <= roomRect.right &&
          event.clientY >= roomRect.top &&
          event.clientY <= roomRect.bottom
        : false;

      setDraggingDecoration((current) =>
        current
          ? {
              ...current,
              x: event.clientX,
              y: event.clientY,
              isOverRoom,
            }
          : current
      );
    };

    const handlePointerUp = (event: PointerEvent) => {
      const roomRect = roomRef.current?.getBoundingClientRect();
      const isOverRoom = roomRect
        ? event.clientX >= roomRect.left &&
          event.clientX <= roomRect.right &&
          event.clientY >= roomRect.top &&
          event.clientY <= roomRect.bottom
        : false;
      const moved =
        Math.abs(event.clientX - draggingDecoration.startedAtX) > 8 ||
        Math.abs(event.clientY - draggingDecoration.startedAtY) > 8;

      if (isOverRoom || moved) {
        suppressNextClickRef.current = true;
        window.setTimeout(() => {
          suppressNextClickRef.current = false;
        }, 0);
      }

      if (isOverRoom) {
        const item = decorations.find((decoration) => decoration.id === draggingDecoration.itemId);
        if (item && roomRect) {
          placeDecoration(draggingDecoration.itemId, getDecorationDropPosition(item, event.clientX, event.clientY, roomRect));
        }
      }

      setDraggingDecoration(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingDecoration, placeDecoration]);

  const startDecorationDrag = useCallback((item: DecorationItem, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    setActiveDecorationId(item.id);
    setDraggingDecoration({
      itemId: item.id,
      x: event.clientX,
      y: event.clientY,
      startedAtX: event.clientX,
      startedAtY: event.clientY,
      isOverRoom: false,
    });
  }, []);

  const handleBuy = useCallback(
    (item: ShopItem) => {
      if (points < item.cost || ownedItems.has(item.id)) return;
      setSpent((current) => current + item.cost);
      setOwnedItems((prev) => new Set([...prev, item.id]));
      toast.success(`已解鎖${item.name}`);
    },
    [points, ownedItems]
  );

  const handleBuyFood = useCallback(
    (item: FoodItem) => {
      if (points < item.cost) return;
      if (hunger >= HUNGER_MAX) {
        toast.info("皮皮已經好飽");
        return;
      }
      const next = Math.min(HUNGER_MAX, hunger + item.restore);
      const delta = next - hunger;
      if (delta <= 0) return;
      setSpent((current) => current + item.cost);
      setHunger(next);
      toast.success(`皮皮食咗${item.name}，飽食度 +${delta}`);
    },
    [points, hunger]
  );

  const items = activeTab === "outfits" ? outfits : activeTab === "accessories" ? accessories : activeTab === "food" ? foods : decorations;

  return (
    <div className="min-h-full bg-cloud">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="font-display text-h3 font-medium text-ink flex items-center gap-2">🦜 皮皮</h1>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="inline-flex items-center gap-1.5 bg-[#FFF6E0] border border-[#FFE9B5] px-3 py-1.5 rounded-pill">
              <span className="text-sunshine text-[15px]">⭐</span>
              <span className="text-small font-medium text-ink tabular-nums">{points} XP</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-[#FFE8E0] border border-[#FFD4C5] px-3 py-1.5 rounded-pill">
              <span className="text-coral text-[15px]">🍗</span>
              <span className="text-small font-medium text-ink tabular-nums">
                {hunger}/{HUNGER_MAX}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-small text-slate">飽食度</span>
            <span className="text-small font-medium text-ink tabular-nums">
              {hunger}/{HUNGER_MAX}
            </span>
          </div>
          <div className="h-3 w-full rounded-pill bg-mist overflow-hidden">
            <div
              className="h-full rounded-pill bg-gradient-to-r from-coral to-sunshine transition-all duration-300 ease-out"
              style={{ width: `${(hunger / HUNGER_MAX) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border-[0.5px] border-mist p-3">
          <BirdhouseErrorBoundary>
            <div
              ref={roomRef}
              className={`relative h-[min(54vh,430px)] min-h-80 w-full rounded-md overflow-hidden bg-gradient-to-br from-rose-100 via-sky-100 to-amber-100 transition-all duration-200 ${
                draggingDecoration
                  ? draggingDecoration.isOverRoom
                    ? "ring-4 ring-amber-300 shadow-[0_0_36px_rgba(251,191,36,0.55)]"
                    : "ring-2 ring-sky-200"
                  : ""
              }`}
              onDragOver={(event) => event.preventDefault()}
              onDragEnter={(event) => {
                event.preventDefault();
                if (!draggingDecoration) return;
                setDraggingDecoration((current) => (current ? { ...current, isOverRoom: true } : current));
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setDraggingDecoration((current) => (current ? { ...current, isOverRoom: false } : current));
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                const droppedId = event.dataTransfer.getData("text/plain") || activeDecorationId;
                const item = decorations.find((decoration) => decoration.id === droppedId);
                const roomRect = roomRef.current?.getBoundingClientRect();
                if (item && roomRect) {
                  placeDecoration(droppedId, getDecorationDropPosition(item, event.clientX, event.clientY, roomRect));
                }
                setDraggingDecoration(null);
              }}
            >
              <PiPiBirdhouseScene
                placedItems={placedItems}
                dragging3DId={dragging3DId}
                on3DDragStart={handle3DDragStart}
                on3DDragEnd={handle3DDragEnd}
              />
              {showRoomReveal && (
                <div className="pipi-room-reveal pointer-events-none absolute inset-0 z-10">
                  <img src={PIPI_FLYING_HOME_IMAGE} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              {draggingDecoration && (
                <div
                  className={`pointer-events-none absolute inset-x-5 top-5 rounded-md px-4 py-3 text-center text-sm font-bold shadow-lg transition-colors ${
                    draggingDecoration.isOverRoom ? "bg-amber-200 text-amber-950" : "bg-white/92 text-sky-900"
                  }`}
                >
                  {draggingDecoration.isOverRoom ? "放手就會擺入皮皮屋企" : "拖到呢個客廳範圍再放手"}
                </div>
              )}
              {placedItems.length === 0 && !draggingDecoration && (
                <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-md bg-white/90 px-3 py-2 text-center text-xs font-medium text-slate shadow-sm">
                  選一件發光家居，拖入屋企做裝飾。
                </div>
              )}
            </div>
          </BirdhouseErrorBoundary>
          <div className="mt-2 text-center text-xs text-slate">皮皮屋企（3D 內景）</div>
        </div>

        <div className="flex bg-white rounded-lg border-[0.5px] border-mist p-1 gap-0.5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[4.5rem] py-2.5 rounded-md text-xs sm:text-small font-medium transition-all whitespace-nowrap px-1 ${
                activeTab === tab.id ? "bg-sky-400 text-white shadow-sm" : "text-slate hover:text-ink"
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {activeTab === "decorations" &&
            decorations.map((item) => {
              const active = activeDecorationId === item.id;
              const placed = placedDecorations.some((placement) => placement.id === item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  draggable={false}
                  onPointerDown={(event) => startDecorationDrag(item, event)}
                  onDragStart={(event) => {
                    setActiveDecorationId(item.id);
                    setDraggingDecoration({
                      itemId: item.id,
                      x: event.clientX,
                      y: event.clientY,
                      startedAtX: event.clientX,
                      startedAtY: event.clientY,
                      isOverRoom: false,
                    });
                    event.dataTransfer.setData("text/plain", item.id);
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => {
                    if (suppressNextClickRef.current) return;
                    active ? placeDecoration(item.id) : setActiveDecorationId(item.id);
                  }}
                  onDoubleClick={() => placeDecoration(item.id)}
                  className={`bg-white rounded-md p-3 border text-center transition-all focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:outline-none ${
                    active
                      ? "cursor-grabbing border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.35),0_14px_30px_rgba(14,165,233,0.18)] -translate-y-0.5"
                      : "cursor-grab border-mist hover:border-sky-400 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                  }`}
                  style={{ touchAction: "none" }}
                >
                  <span className="text-3xl block mb-1">{item.emoji}</span>
                  <p className="text-[11px] font-medium text-ink mb-1">{item.name}</p>
                  <span className={`text-[10px] font-medium ${placed ? "text-mint" : "text-slate"}`}>
                    {placed ? "已放入" : active ? "發光中，再按放入" : "可拖入"}
                  </span>
                </button>
              );
            })}

          {activeTab === "food" &&
            foods.map((item) => {
              const full = hunger >= HUNGER_MAX;
              const canAfford = points >= item.cost;
              const disabled = full || !canAfford;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !disabled && handleBuyFood(item)}
                  disabled={disabled}
                  className={`bg-white rounded-md p-3 border text-center transition-all focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:outline-none ${
                    disabled ? "border-mist opacity-50" : "border-mist hover:border-sky-400 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                  }`}
                >
                  <span className="text-3xl block mb-1">{item.emoji}</span>
                  <p className="text-[11px] font-medium text-ink mb-1">{item.name}</p>
                  <p className="text-[10px] text-slate mb-1">+{item.restore} 飽食</p>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-ink bg-[#FFF6E0] px-2 py-0.5 rounded-pill">
                    ⭐ {item.cost}
                  </span>
                </button>
              );
            })}

          {activeTab !== "food" &&
            activeTab !== "decorations" &&
            items.map((item) => {
              const owned = ownedItems.has(item.id);
              const canAfford = points >= item.cost;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !owned && canAfford && handleBuy(item)}
                  disabled={owned || !canAfford}
                  className={`bg-white rounded-md p-3 border text-center transition-all focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:outline-none ${
                    owned
                      ? "border-mint/50 bg-[#E8F7F3]"
                      : canAfford
                        ? "border-mist hover:border-sky-400 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                        : "border-mist opacity-50"
                  }`}
                >
                  <span className="text-3xl block mb-1">{item.emoji}</span>
                  <p className="text-[11px] font-medium text-ink mb-1">{item.name}</p>
                  {owned ? (
                    <span className="text-[10px] font-medium text-mint flex items-center justify-center gap-0.5">
                      <Check className="h-3 w-3" /> 已擁有
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-ink bg-[#FFF6E0] px-2 py-0.5 rounded-pill">
                      ⭐ {item.cost}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>
      {draggingDecoration && draggingItem && (
        <div
          className="pointer-events-none fixed z-[90] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-lg border-2 border-amber-300 bg-white/95 px-4 py-3 shadow-2xl"
          style={{ left: draggingDecoration.x, top: draggingDecoration.y }}
        >
          <span className="text-5xl leading-none drop-shadow-sm">{draggingItem.emoji}</span>
          <span className="mt-1 rounded-pill bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-950">
            {draggingItem.name}
          </span>
        </div>
      )}
    </div>
  );
}
