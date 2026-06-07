import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import {
  SphereGeometry,
  BoxGeometry,
  CylinderGeometry,
  ConeGeometry,
  TorusGeometry,
  MeshStandardMaterial,
  Color,
  type Mesh,
} from "three";
import type { GameId } from "./ForestGameTypes";

function UnderwaterScene() {
  const fishRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (fishRef.current) {
      fishRef.current.position.x = Math.sin(t * 0.4) * 2.5;
      fishRef.current.position.z = Math.cos(t * 0.3) * 2;
      fishRef.current.rotation.y = -t * 0.4;
    }
  });

  return (
    <>
      <ambientLight color="#4a9eff" intensity={0.5} />
      <directionalLight position={[5, 10, 5]} color="#88ccff" intensity={0.3} />
      <pointLight position={[0, 3, 0]} color="#66bbff" intensity={0.4} decay={2} />

      {Array.from({ length: 30 }).map((_, i) => {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 5;
        return (
          <mesh
            key={`bubble-${i}`}
            position={[Math.cos(a) * r, -2 + Math.random() * 6, Math.sin(a) * r]}
          >
            <sphereGeometry args={[0.04 + Math.random() * 0.1, 8, 8]} />
            <meshStandardMaterial color="#aaddff" transparent opacity={0.2 + Math.random() * 0.2} />
          </mesh>
        );
      })}

      <group ref={fishRef}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshStandardMaterial color="#ff8844" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0.35, 0, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.2, 0.3, 8]} />
          <meshStandardMaterial color="#ff8844" />
        </mesh>
        <mesh position={[-0.05, 0.15, 0.2]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      {Array.from({ length: 3 }).map((_, i) => (
        <mesh key={`coral-${i}`} position={[-2.5 + i * 2.5, -1.2, -2 + Math.sin(i) * 1.5]}>
          <cylinderGeometry args={[0.15, 0.4, 1.2, 8]} />
          <meshStandardMaterial color={i === 0 ? "#ff6688" : i === 1 ? "#ff8844" : "#cc44aa"} />
        </mesh>
      ))}

      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`seaweed-${i}`} position={[-3 + i * 1.5, -1, -1.5 + Math.cos(i) * 1]}>
          <coneGeometry args={[0.08, 0.6 + Math.random() * 0.4, 6]} />
          <meshStandardMaterial color="#22cc88" transparent opacity={0.7} />
        </mesh>
      ))}

      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#1a5a3a" />
      </mesh>

      <fog attach="fog" args={["#0a3050", 3, 8]} />
    </>
  );
}

function CastleScene() {
  return (
    <>
      <ambientLight color="#443366" intensity={0.3} />
      <directionalLight position={[2, 5, 3]} color="#8866aa" intensity={0.2} />

      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <pointLight
            key={`torch-${i}`}
            position={[Math.cos(angle) * 3, 0.5, Math.sin(angle) * 3]}
            color="#ff8844"
            intensity={0.3 + Math.random() * 0.1}
            decay={3}
          />
        );
      })}

      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={`pillar-${i}`} position={[Math.cos(angle) * 2.8, 0, Math.sin(angle) * 2.8]}>
            <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
            <meshStandardMaterial color="#665544" roughness={0.9} />
          </mesh>
        );
      })}

      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`arch-${i}`} position={[-1.5 + i, 0.8, -2.5]}>
          <torusGeometry args={[0.5, 0.08, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#887766" roughness={0.8} />
        </mesh>
      ))}

      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#332244" />
      </mesh>

      <Sparkles count={30} scale={6} size={1.5} speed={0.2} color="#aa88ff" />

      <fog attach="fog" args={["#1a1133", 2, 6]} />
    </>
  );
}

function NightSkyScene() {
  const fruitsRef = useRef<Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    fruitsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const offset = i * 1.2;
      const phase = ((t + offset) % 3) / 3;
      mesh.position.x = -3 + phase * 6;
      mesh.position.y = -0.8 + Math.sin(phase * Math.PI) * 2.2;
      mesh.rotation.x = t * 1.5 + i;
      mesh.rotation.z = t * 2 + i;
    });
  });

  return (
    <>
      <ambientLight color="#111133" intensity={0.3} />
      <directionalLight position={[0, 5, 5]} color="#4455aa" intensity={0.2} />

      <mesh position={[3.5, 1.8, -3]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ffeecc" emissive="#ffdd88" emissiveIntensity={0.5} />
      </mesh>

      {["#ff4444", "#ff8800", "#ffcc00", "#44cc44", "#4488ff", "#cc44ff"].map((color, i) => (
        <mesh
          key={`fruit-${i}`}
          ref={(el) => { if (el) fruitsRef.current[i] = el; }}
          position={[-3, -0.8, -1 + Math.random() * 2]}
        >
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.2} />
        </mesh>
      ))}

      <Sparkles count={60} scale={8} size={1.5} speed={0.3} color="#ffffff" />

      <fog attach="fog" args={["#0a0a1a", 3, 7]} />
    </>
  );
}

function MeadowScene() {
  const insectsRef = useRef<Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    insectsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const speed = 0.5 + i * 0.15;
      const radius = 0.8 + i * 0.3;
      mesh.position.x = Math.sin(t * speed + i * 1.5) * radius;
      mesh.position.z = Math.cos(t * speed * 0.7 + i * 2) * radius;
      mesh.position.y = 0.2 + Math.sin(t * speed * 1.3 + i) * 0.3;
      mesh.rotation.y = t * speed;
    });
  });

  return (
    <>
      <ambientLight color="#88cc66" intensity={0.6} />
      <directionalLight position={[5, 8, 5]} color="#ffeedd" intensity={0.4} />
      <hemisphereLight args={["#88dd66", "#442200", 0.3]} />

      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#336622" />
      </mesh>

      {Array.from({ length: 6 }).map((_, i) => {
        const colors = ["#ff6699", "#ffcc00", "#ff8844", "#cc66ff", "#66ccff", "#ff4466"];
        return (
          <group key={`flower-${i}`} position={[-1.8 + i * 0.7, -0.2, -1.5 + Math.sin(i) * 1.2]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.02, 0.04, 0.3, 6]} />
              <meshStandardMaterial color="#336633" />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={colors[i % colors.length]} />
            </mesh>
          </group>
        );
      })}

      {Array.from({ length: 4 }).map((_, i) => {
        const toneColors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
        return (
          <mesh
            key={`insect-${i}`}
            ref={(el) => { if (el) insectsRef.current[i] = el; }}
            position={[0, 0.2, 0]}
          >
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color={toneColors[i]} emissive={toneColors[i]} emissiveIntensity={0.3} />
          </mesh>
        );
      })}

      {Array.from({ length: 20 }).map((_, i) => {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 4;
        return (
          <mesh key={`pollen-${i}`} position={[Math.cos(a) * r, 0.1 + Math.random() * 1.5, Math.sin(a) * r]}>
            <sphereGeometry args={[0.015, 4, 4]} />
            <meshStandardMaterial color="#ffdd88" transparent opacity={0.4} />
          </mesh>
        );
      })}

      <fog attach="fog" args={["#336622", 3, 8]} />
    </>
  );
}

function SceneContent({ gameId }: { gameId: GameId }) {
  switch (gameId) {
    case "water-park":
      return <UnderwaterScene />;
    case "maze":
      return <CastleScene />;
    case "fruit-ninja":
      return <NightSkyScene />;
    case "catch-fly":
      return <MeadowScene />;
  }
}

interface Props {
  gameId: GameId;
  children: React.ReactNode;
}

export function ForestSceneBackdrop({ gameId, children }: Props) {
  const bgMap: Record<GameId, string> = {
    "water-park": "#0a3050",
    "maze": "#1a1133",
    "fruit-ninja": "#0a0a1a",
    "catch-fly": "#1a3a15",
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 400 }}>
      <div className="absolute inset-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0.5, 4], fov: 60 }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
          style={{ background: bgMap[gameId] }}
        >
          <SceneContent gameId={gameId} />
        </Canvas>
      </div>
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
