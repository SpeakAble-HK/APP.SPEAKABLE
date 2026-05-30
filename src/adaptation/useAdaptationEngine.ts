// src/adaptation/useAdaptationEngine.ts
// React hook to use the adaptation engine in Speakable
import { useEffect, useRef } from 'react';
import AuraAdaptiveSystem from './AuraAdaptiveSystem';
import { getUserProfile, setUserProfile } from '@/lib/userProfileStore';

export function useAdaptationEngine() {
  const engineRef = useRef<AuraAdaptiveSystem | null>(null);

  useEffect(() => {
    // Load or initialize adaptation engine with user profile
    const profile = getUserProfile();
    engineRef.current = new AuraAdaptiveSystem(profile);
  }, []);

  // Update adaptation profile after a mini-game or AI detection event
  function updateProfile(metrics: Partial<ReturnType<AuraAdaptiveSystem['getDefaultProfile']>>) {
    if (!engineRef.current) return;
    const newProfile = { ...engineRef.current.profile, ...metrics };
    engineRef.current.profile = newProfile;
    setUserProfile(newProfile);
    engineRef.current.save?.(); // Save to localStorage if available
  }

  // Get adaptation settings for a specific game
  function getGameSettings(game: 'waterPark' | 'maze' | 'fruitNinja' | 'catchFly') {
    if (!engineRef.current) return null;
    switch (game) {
      case 'waterPark':
        return engineRef.current.getWaterParkSettings();
      case 'maze':
        return engineRef.current.getMazeSettings();
      case 'fruitNinja':
        return engineRef.current.getFruitNinjaSettings();
      case 'catchFly':
        return engineRef.current.getCatchTheFlySettings();
      default:
        return null;
    }
  }

  // Get adaptation profile summary
  function getProfileSummary() {
    return engineRef.current?.getProfileSummary() || null;
  }

  // Generate adaptation report
  function generateAdaptationReport() {
    return engineRef.current?.generateAdaptationReport() || null;
  }

  return {
    updateProfile,
    getGameSettings,
    getProfileSummary,
    generateAdaptationReport,
  };
}
