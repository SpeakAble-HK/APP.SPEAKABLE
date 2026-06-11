import React from 'react';
import Badge3DScene from './Badge3DScene';
import { getUnlockedBadges } from '../utils/badgeUnlocks';

// Example: Replace with your real user mission state
const userMissions = ['mission_office', 'mission_chair', 'mission_utensils'];

export default function BadgeSystemPage() {
  const unlockedBadges = getUnlockedBadges(userMissions);
  return (
    <div>
      <h2>PiPi Badge System 3D World</h2>
      <Badge3DScene unlockedBadges={unlockedBadges} />
    </div>
  );
}
