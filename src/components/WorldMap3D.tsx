import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// Example island positions and marker data
type Marker = {
  id: string;
  position: [number, number, number];
  label: string;
  icon: string;
  onClick?: () => void;
};

const markers: Marker[] = [
  {
    id: 'cooking',
    position: [-6, 0, 4],
    label: '🍳 Cooking Mama',
    icon: 'https://img.icons8.com/color/96/chef-hat.png',
  },
  {
    id: 'space',
    position: [0, 0, 8],
    label: '🚀 Space Mountain',
    icon: 'https://img.icons8.com/color/96/rocket.png',
  },
  {
    id: 'kart',
    position: [7, 0, -2],
    label: '🏎️ Aura Kart',
    icon: 'https://img.icons8.com/color/96/racing-car.png',
  },
  // Add more markers as needed
];

function Island({ position, color = '#4FD3E0' }: { position: [number, number, number]; color?: string }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function MarkerBillboard({ marker }: { marker: Marker }) {
  // Billboard effect: always face camera
  const ref = useRef<THREE.Mesh>(null!);
  useEffect(() => {
    // Optionally animate or pulse
  }, []);
  return (
    <group position={marker.position}>
      <mesh ref={ref} onClick={marker.onClick}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color="#fff" emissive="#ff6b6b" emissiveIntensity={0.2} />
      </mesh>
      {/* Icon as sprite */}
      <sprite scale={[1.2, 1.2, 1]} position={[0, 1, 0]}>
        <spriteMaterial attach="material" map={new THREE.TextureLoader().load(marker.icon)} />
      </sprite>
      {/* Label */}
      <Html position={[0, 2, 0]} center style={{ pointerEvents: 'none', color: '#2c3e50', fontWeight: 'bold', background: 'white', borderRadius: 8, padding: '2px 8px', fontSize: 14 }}>{marker.label}</Html>
    </group>
  );
}

type WorldMap3DProps = {
  cameraLanded?: boolean;
  selectedModality?: string | null;
  disableInteraction?: boolean;
  featureResult?: string | null;
};

import { useThree } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';

const FIRST_MARKER_POS = markers[0]?.position || [0, 0, 0];

function CameraAnimator({ landed }: { landed: boolean }) {
  const { camera } = useThree();
  // Animate camera to first marker when landed
  useEffect(() => {
    if (!landed) return;
    // Animate from current to target
    let frame: number;
    const start = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const end = { x: FIRST_MARKER_POS[0], y: 5, z: FIRST_MARKER_POS[2] + 8 };
    let t = 0;
    function animate() {
      t += 0.03;
      if (t > 1) t = 1;
      camera.position.x = start.x + (end.x - start.x) * t;
      camera.position.y = start.y + (end.y - start.y) * t;
      camera.position.z = start.z + (end.z - start.z) * t;
      camera.lookAt(FIRST_MARKER_POS[0], FIRST_MARKER_POS[1], FIRST_MARKER_POS[2]);
      if (t < 1) {
        frame = requestAnimationFrame(animate);
      }
    }
    animate();
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line
  }, [landed]);
  return null;
}

export default function WorldMap3D({ cameraLanded = false, selectedModality, disableInteraction = false, featureResult }: WorldMap3DProps) {
  return (
    <div className="worldmap3d-bg">
      <Canvas camera={{ position: [0, 10, 20], fov: 50 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
        {/* Ocean surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
          <circleGeometry args={[15, 64]} />
          <meshStandardMaterial color="#0099CC" transparent opacity={0.85} />
        </mesh>
        {/* Islands */}
        {markers.map((marker) => (
          <Island key={marker.id} position={marker.position} />
        ))}
        {/* Markers */}
        {markers.map((marker) => (
          <MarkerBillboard key={marker.id} marker={marker} />
        ))}
        {/* Stars and controls */}
        <Stars radius={40} depth={50} count={2000} factor={4} fade />
        <OrbitControls enablePan enableZoom enableRotate enabled={!disableInteraction} />
        <CameraAnimator landed={cameraLanded} />
      </Canvas>
      {/* Optionally show selected modality as overlay */}
      {selectedModality && (
        <div style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: '8px 20px', fontWeight: 'bold', color: '#0099CC', fontSize: 18, zIndex: 5 }}>
          Modality: {selectedModality}
        </div>
      )}
      {featureResult && (
        <div style={{ position: 'absolute', top: 60, left: 20, background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '8px 20px', fontWeight: 'bold', color: '#16a34a', fontSize: 16, zIndex: 5, boxShadow: '0 2px 8px #16a34a22' }}>
          {featureResult}
        </div>
      )}
    </div>
  );
}
