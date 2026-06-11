import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useFBX, useGLTF } from '@react-three/drei';
import type { Group } from 'three';
import badgeModelUrl from '@/assets/A23DMOD_GLTF.optimized.glb';

type BadgeModelProps = {
  url?: string;
  type?: 'gltf' | 'fbx';
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
};

type AnimatedModelProps = Required<Pick<BadgeModelProps, 'scale' | 'position' | 'rotation'>> & {
  model: Group;
};

function AnimatedModel({ model, scale, position, rotation }: AnimatedModelProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;

    const baseX = rotation[0];
    const baseY = rotation[1];
    const baseZ = rotation[2];
    const idleFloat = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;

    groupRef.current.rotation.x += ((hovered ? baseX - 0.12 : baseX + 0.02) - groupRef.current.rotation.x) * 0.08;
    groupRef.current.rotation.y += ((baseY + state.clock.elapsedTime * 0.22) - groupRef.current.rotation.y) * 0.08;
    groupRef.current.rotation.z += ((hovered ? baseZ + 0.09 : baseZ + idleFloat * 0.4) - groupRef.current.rotation.z) * 0.08;
    groupRef.current.position.y = position[1] + (hovered ? 0.08 : idleFloat);
    groupRef.current.position.x = position[0];
    groupRef.current.position.z = position[2];
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={model} dispose={null} />
    </group>
  );
}

function GltfBadgeModel({ url, scale = 2.1, position = [0, 0, 0], rotation = [0, 0, 0] }: BadgeModelProps) {
  const { scene } = useGLTF(url ?? badgeModelUrl);
  return <AnimatedModel model={scene as unknown as Group} scale={scale} position={position} rotation={rotation} />;
}

function FbxBadgeModel({ url, scale = 2.1, position = [0, 0, 0], rotation = [0, 0, 0] }: BadgeModelProps) {
  const fbx = useFBX(url ?? badgeModelUrl);
  return <AnimatedModel model={fbx as unknown as Group} scale={scale} position={position} rotation={rotation} />;
}

export function BadgeModel(props: BadgeModelProps) {
  if (props.type === 'fbx') {
    return <FbxBadgeModel {...props} />;
  }
  return <GltfBadgeModel {...props} />;
}
