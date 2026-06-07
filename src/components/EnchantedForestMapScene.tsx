import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const FOREST_MODEL_URL = "/assets/enchanted-forest/o_donkey_forest_river.gltf";

function ForestModel() {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(FOREST_MODEL_URL);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.04;
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

export default function EnchantedForestMapScene() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
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
          <ForestModel />
        </Suspense>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.62, 0]} receiveShadow>
          <circleGeometry args={[8, 64]} />
          <meshStandardMaterial color="#74c365" transparent opacity={0.42} />
        </mesh>
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06)), radial-gradient(circle at 22% 35%, rgba(255,244,171,0.34), transparent 24%)",
        }}
      />
    </div>
  );
}

useGLTF.preload(FOREST_MODEL_URL);
