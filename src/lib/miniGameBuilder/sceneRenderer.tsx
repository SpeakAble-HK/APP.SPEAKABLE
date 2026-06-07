import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import {
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  ConeGeometry,
  TorusGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  Color,
  type Mesh,
} from "three";
import type { SceneConfig, SceneObject, ParticleConfig } from "./types";

function AnimatedMesh({ object }: { object: SceneObject }) {
  const meshRef = useRef<Mesh>(null);
  const startPos = useMemo(() => ({ x: object.position[0], y: object.position[1], z: object.position[2] }), [object.position[0], object.position[1], object.position[2]]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const speed = object.animationSpeed ?? 1;
    const amp = object.animationAmplitude ?? 0.5;

    switch (object.animation) {
      case "float":
        meshRef.current.position.y = startPos.y + Math.sin(t * speed) * amp;
        break;
      case "rotate":
        meshRef.current.rotation.y = t * speed;
        meshRef.current.rotation.x = Math.sin(t * speed * 0.5) * 0.2;
        break;
      case "pulse": {
        const s = 1 + Math.sin(t * speed * 2) * amp;
        meshRef.current.scale.setScalar(s);
        break;
      }
      case "orbit": {
        const r = object.orbitRadius ?? 2;
        const cx = object.orbitCenter?.[0] ?? 0;
        const cz = object.orbitCenter?.[2] ?? 0;
        meshRef.current.position.x = cx + Math.cos(t * speed) * r;
        meshRef.current.position.z = cz + Math.sin(t * speed) * r;
        meshRef.current.position.y = startPos.y;
        break;
      }
    }
  });

  const geometry = useMemo(() => {
    switch (object.type) {
      case "sphere":
        return new SphereGeometry(object.radius ?? 0.5, object.radialSegments ?? 32, 32);
      case "box":
        return new BoxGeometry(...(object.dimensions ?? [1, 1, 1]));
      case "cylinder":
        return new CylinderGeometry(
          object.radiusTop ?? 0.5,
          object.radiusBottom ?? 0.5,
          object.height ?? 1,
          object.radialSegments ?? 32,
        );
      case "cone":
        return new ConeGeometry(object.radius ?? 0.5, object.height ?? 1, object.radialSegments ?? 32);
      case "torus":
        return new TorusGeometry(object.radius ?? 0.5, object.tube ?? 0.2, 16, object.radialSegments ?? 64);
      case "plane":
        return new PlaneGeometry(object.dimensions?.[0] ?? 1, object.dimensions?.[1] ?? 1);
    }
  }, [object.type, object.radius, object.radiusTop, object.radiusBottom, object.height, object.dimensions?.[0], object.dimensions?.[1], object.tube, object.radialSegments]);

  const scale = object.scale ?? 1;
  const sc = typeof scale === "number" ? [scale, scale, scale] : scale;

  return (
    <mesh
      ref={meshRef}
      position={object.position}
      scale={sc as [number, number, number]}
      geometry={geometry}
    >
      <meshStandardMaterial
        color={object.color}
        emissive={object.emissive ? new Color(object.emissive) : undefined}
        emissiveIntensity={object.emissiveIntensity ?? 0}
        metalness={object.metalness ?? 0.2}
        roughness={object.roughness ?? 0.6}
        opacity={object.opacity ?? 1}
        transparent={(object.opacity ?? 1) < 1}
        wireframe={object.wireframe}
      />
    </mesh>
  );
}

function ParticleEffect({ config }: { config: ParticleConfig }) {
  const color = new Color(config.color);
  const spread = config.spread ?? 8;
  const speed = config.speed ?? 0.5;
  const size = config.size ?? (config.type === "stars" ? 2 : config.type === "bubbles" ? 4 : 3);

  if (config.type === "sparkles") {
    return <Sparkles count={config.count} scale={spread} size={size} speed={speed} color={color} />;
  }

  if (config.type === "bubbles") {
    return (
      <>
        {Array.from({ length: Math.min(config.count, 20) }).map((_, i) => {
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * spread;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * r, -2 + Math.random() * 4, Math.sin(a) * r]}
            >
              <sphereGeometry args={[0.08 + Math.random() * 0.15, 8, 8]} />
              <meshStandardMaterial
                color={color}
                transparent
                opacity={0.4 + Math.random() * 0.3}
              />
            </mesh>
          );
        })}
      </>
    );
  }

  return null;
}

export function SceneRenderer({ config }: { config: SceneConfig }) {
  return (
    <>
      {config.objects.map((obj, i) => (
        <AnimatedMesh key={`obj-${i}`} object={obj} />
      ))}
      {config.particles && <ParticleEffect config={config.particles} />}
    </>
  );
}
