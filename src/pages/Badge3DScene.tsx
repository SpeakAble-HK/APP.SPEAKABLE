import React, { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { BadgeModel } from '../components/BadgeModel';
import Fireworks from '../components/Fireworks';

function playUnlockSound() {
  const audio = new Audio('/assets/sounds/badge-unlock.mp3');
  audio.play();
}

// Example unlockedBadges: ['office-table', 'dining-chair', 'utensils']
export default function Badge3DScene({ unlockedBadges = [] }) {
  const badgeModels = useMemo(
    () => [
      { key: 'office-table', position: [0, 0.1, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: 2.2 },
      { key: 'dining-chair', position: [2.3, 0, -0.4] as [number, number, number], rotation: [0, -0.5, 0] as [number, number, number], scale: 2.0 },
      { key: 'utensils', position: [-2.3, -0.05, -0.2] as [number, number, number], rotation: [0, 0.5, 0] as [number, number, number], scale: 1.95 },
    ],
    []
  );

  const [showFireworks, setShowFireworks] = useState(false);
  const [lastUnlocked, setLastUnlocked] = useState(null);

  useEffect(() => {
    playUnlockSound();
  }, []);

  useEffect(() => {
    if (unlockedBadges.length > 0) {
      const newBadge = unlockedBadges[unlockedBadges.length - 1];
      if (newBadge !== lastUnlocked) {
        setLastUnlocked(newBadge);
        setShowFireworks(true);
        playUnlockSound();
        setTimeout(() => setShowFireworks(false), 2000);
      }
    }
  }, [unlockedBadges]);

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Canvas camera={{ position: [0, 2, 7], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 7]} intensity={1} />
        {badgeModels.map(
          (badge) =>
            unlockedBadges.includes(badge.key) && (
              <BadgeModel
                key={badge.key}
                url={badge.url}
                position={badge.position}
                rotation={badge.rotation}
                scale={badge.scale}
                type={badge.type}
              />
            )
        )}
      </Canvas>
      <Fireworks trigger={showFireworks} />
    </div>
  );
}
