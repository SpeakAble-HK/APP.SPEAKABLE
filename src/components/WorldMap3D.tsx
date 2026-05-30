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

export default function WorldMap3D() {
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
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
}
