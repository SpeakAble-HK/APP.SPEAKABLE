import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, useFBX, useGLTF } from '@react-three/drei';
type WorldMap3DProps = {
  cameraLanded?: boolean;
  selectedModality?: string | null;
  disableInteraction?: boolean;
  featureResult?: string | null;
  calibrationData?: Record<string, unknown> | null;
  voiceCloneData?: Record<string, unknown> | null;
};

function ForestGLTFModel() {
  const gltf = useGLTF('/assets/o_donkey_forest_river.gltf');
  return <primitive object={gltf.scene} scale={[0.1, 0.1, 0.1]} />;
}

function BirdhouseInteriorModel() {
  const interior = useFBX('/assets/inhouse-livingroom/InteriorTest.fbx');
  return <primitive object={interior} position={[0, -0.35, 0]} rotation={[0, 0.1, 0]} scale={0.04} />;
}

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 8, 14);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

export default function WorldMap3D({
  cameraLanded,
  selectedModality,
  disableInteraction,
  featureResult,
  calibrationData,
  voiceCloneData,
}: WorldMap3DProps) {
  void cameraLanded;

  return (
    <div
      className="worldmap3d-bg"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 960,
        aspectRatio: '4 / 3',
        margin: '0 auto',
        background: '#000',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 32px #0003',
        minHeight: 480,
      }}
    >
      <Canvas
        camera={{ position: [0, 8, 14], fov: 50 }}
        style={{ width: '100%', height: '100%', display: 'block', background: '#000' }}
        shadows
      >
        <ambientLight intensity={1.0} />
        <directionalLight
          position={[20, 40, 20]}
          intensity={2.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <ForestGLTFModel />
        <BirdhouseInteriorModel />
        <Stars radius={60} depth={80} count={3000} factor={6} fade />
        <OrbitControls enablePan enableZoom enableRotate enabled={!disableInteraction} />
        <CameraSetup />
      </Canvas>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          background: 'rgba(255,255,255,0.95)',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: '0 -2px 12px #0002',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '12px 0',
          zIndex: 20,
        }}
      >
        <button style={{ background: 'none', border: 'none', fontSize: 22, color: '#0099CC', fontWeight: 'bold', cursor: 'pointer' }}>🏠 首頁</button>
        <button style={{ background: 'none', border: 'none', fontSize: 22, color: '#16a34a', fontWeight: 'bold', cursor: 'pointer' }}>🗺️ 地圖</button>
        <button style={{ background: 'none', border: 'none', fontSize: 22, color: '#f59e42', fontWeight: 'bold', cursor: 'pointer' }}>⭐ 任務</button>
        <button style={{ background: 'none', border: 'none', fontSize: 22, color: '#a855f7', fontWeight: 'bold', cursor: 'pointer' }}>⚙️ 設定</button>
      </div>

      {selectedModality && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            background: 'rgba(255,255,255,0.9)',
            borderRadius: 12,
            padding: '8px 20px',
            fontWeight: 'bold',
            color: '#0099CC',
            fontSize: 18,
            zIndex: 5,
          }}
        >
          模式：{selectedModality}
        </div>
      )}

      {featureResult && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 20,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 12,
            padding: '8px 20px',
            fontWeight: 'bold',
            color: '#16a34a',
            fontSize: 16,
            zIndex: 5,
            boxShadow: '0 2px 8px #16a34a22',
          }}
        >
          {featureResult}
        </div>
      )}

      {calibrationData && (
        <div
          style={{
            position: 'absolute',
            top: 100,
            left: 20,
            background: '#e0f7fa',
            borderRadius: 8,
            padding: '6px 14px',
            fontSize: 13,
            zIndex: 5,
          }}
        >
          校準：{JSON.stringify(calibrationData)}
        </div>
      )}

      {voiceCloneData && (
        <div
          style={{
            position: 'absolute',
            top: 140,
            left: 20,
            background: '#f3e8ff',
            borderRadius: 8,
            padding: '6px 14px',
            fontSize: 13,
            zIndex: 5,
          }}
        >
          聲音複製：{JSON.stringify(voiceCloneData)}
        </div>
      )}
    </div>
  );
}
