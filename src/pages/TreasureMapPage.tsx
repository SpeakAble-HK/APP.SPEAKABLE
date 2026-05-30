import React, { useState } from "react";
import WorldMap3D from "@/components/WorldMap3D";
import AICloningFeature from "@/components/AICloningFeature";
import DetectionFeature from "@/components/DetectionFeature";

export default function TreasureMapPage() {
  const [modality, setModality] = useState<string | null>(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [cameraLanded, setCameraLanded] = useState(false);
  const [featureResult, setFeatureResult] = useState<string | null>(null);

  // Handler for selecting a modality
  const handleSelect = (mod: string) => {
    setModality(mod);
    setShowFeatureModal(true);
  };

  // Handler for closing the feature modal and landing the camera
  const handleFeatureModalComplete = (result: string) => {
    setFeatureResult(result);
    setShowFeatureModal(false);
    setTimeout(() => setCameraLanded(true), 300);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Modal overlay for modality selection */}
      {!modality && (
        <div style={{
          position: 'absolute', zIndex: 10, inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: 'white', borderRadius: 24, padding: 40, minWidth: 320, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <h2 style={{ fontSize: 28, color: '#0099CC', marginBottom: 16 }}>Choose Your Modality</h2>
            <p style={{ color: '#444', marginBottom: 32 }}>Before you begin your adventure, select a mode:</p>
            <button onClick={() => handleSelect('AI Cloning')} style={{ margin: 8, padding: '16px 32px', fontSize: 18, borderRadius: 12, border: 'none', background: '#22c55e', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 8px #22c55e44' }}>🧬 AI Cloning</button>
            <button onClick={() => handleSelect('Detection')} style={{ margin: 8, padding: '16px 32px', fontSize: 18, borderRadius: 12, border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 8px #3b82f644' }}>🕵️ Detection</button>
          </div>
        </div>
      )}

      {/* Feature modal for selected modality */}
      {showFeatureModal && (
        <div style={{
          position: 'absolute', zIndex: 20, inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: 'white', borderRadius: 24, padding: 40, minWidth: 340, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            {modality === 'AI Cloning' ? (
              <AICloningFeature onComplete={handleFeatureModalComplete} />
            ) : (
              <DetectionFeature onComplete={handleFeatureModalComplete} />
            )}
          </div>
        </div>
      )}

      {/* Pass cameraLanded, modality, and featureResult to WorldMap3D */}
      <WorldMap3D
        cameraLanded={!!cameraLanded}
        selectedModality={modality}
        disableInteraction={!cameraLanded}
        featureResult={featureResult}
      />
    </div>
  );
}
