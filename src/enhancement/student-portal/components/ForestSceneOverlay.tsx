import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

const GLTF_MODEL_URL = "/assets/forest/forest.optimized.glb";
const FBX_MODEL_URL = "/assets/forest/forest.fbx";

function ForestModel() {
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const [loadedSource, setLoadedSource] = useState<"gltf" | "fbx" | "none">("none");

  const fitModelToFrame = (root: THREE.Object3D) => {
    const bounds = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);

    root.position.sub(center);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 4.2;
    const fitScale = targetSize / maxDimension;
    root.scale.setScalar(fitScale);

    root.rotation.set(0, Math.PI / 7, 0);
    root.position.y -= size.y * fitScale * 0.15;
  };

  useEffect(() => {
    let isActive = true;
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    gltfLoader.setDRACOLoader(dracoLoader);
    const fbxLoader = new FBXLoader();

    gltfLoader.load(
      GLTF_MODEL_URL,
      (gltf) => {
        if (!isActive) return;
        const root = gltf.scene;
        root.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        fitModelToFrame(root);
        setModel(root);
        setLoadedSource("gltf");
      },
      undefined,
      () => {
        fbxLoader.load(
          FBX_MODEL_URL,
          (fbx) => {
            if (!isActive) return;
            fbx.traverse((node) => {
              if ((node as THREE.Mesh).isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
              }
            });
            fitModelToFrame(fbx);
            setModel(fbx);
            setLoadedSource("fbx");
          },
          undefined,
          () => {
            if (!isActive) return;
            setModel(null);
            setLoadedSource("none");
          }
        );
      }
    );

    return () => {
      isActive = false;
      dracoLoader.dispose();
    };
  }, []);

  if (!model) {
    return (
      <Html center>
        <div
          style={{
            background: "rgba(20,83,45,0.82)",
            color: "#f0fdf4",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          Waiting for forest model
        </div>
      </Html>
    );
  }

  return <primitive object={model} />;
}

export default function ForestSceneOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        left: "5.5%",
        top: "17%",
        width: "35%",
        height: "42%",
        borderRadius: 26,
        overflow: "hidden",
        pointerEvents: "none",
        background: "radial-gradient(circle at 50% 45%, rgba(34,197,94,0.18), rgba(21,128,61,0.42))",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18), 0 16px 32px rgba(20,83,45,0.18)",
      }}
    >
      <Canvas camera={{ position: [0, 3.5, 6], fov: 38 }} shadows gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[6, 8, 5]} intensity={1.4} castShadow />
        <directionalLight position={[-4, 5, -5]} intensity={0.4} color="#86efac" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
          <circleGeometry args={[4.8, 48]} />
          <meshStandardMaterial color="#65a30d" transparent opacity={0.7} />
        </mesh>
        <ForestModel />
      </Canvas>
    </div>
  );
}