import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const MODEL_PATH = "/assets/pirate-treasure-map/";
const MTL_FILE = "14059_Pirate_Treasure_map_Scroll_v1_L1.mtl";
const OBJ_FILE = "14059_Pirate_Treasure_map_Scroll_v1_L1.obj";

function fitModelToPreview(root: THREE.Object3D) {
  const bounds = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);

  root.position.sub(center);
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  root.scale.setScalar(3.5 / maxDimension);
  root.rotation.set(-0.18, -0.58, 0.04);
}

function PirateModel() {
  const groupRef = useRef<THREE.Group>(null);
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
          fitModelToPreview(object);
          setModel(object);
        });
      },
      undefined,
      () => {
        const objLoader = new OBJLoader();
        objLoader.setPath(MODEL_PATH);
        objLoader.load(OBJ_FILE, (object) => {
          if (!isActive) return;
          fitModelToPreview(object);
          setModel(object);
        });
      }
    );

    return () => {
      isActive = false;
    };
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.12;
  });

  if (!model) {
    return (
      <Html center>
        <div style={{ borderRadius: 10, background: "rgba(255,255,255,0.86)", padding: "8px 10px", fontSize: 12, fontWeight: 700 }}>
          Loading map
        </div>
      </Html>
    );
  }

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

export default function PirateTreasureMapPreview() {
  return (
    <div
      style={{
        height: 220,
        borderRadius: 16,
        overflow: "hidden",
        background: "linear-gradient(180deg, #fef3c7 0%, #dbeafe 100%)",
        border: "1px solid rgba(180, 83, 9, 0.28)",
        marginBottom: 16,
      }}
    >
      <Canvas camera={{ position: [0, 0.8, 5.4], fov: 38 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={1.4} />
        <directionalLight position={[3, 5, 5]} intensity={1.8} />
        <directionalLight position={[-5, 2, -3]} intensity={0.55} color="#fde68a" />
        <Suspense fallback={null}>
          <PirateModel />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}
