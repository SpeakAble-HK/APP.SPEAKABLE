import { Canvas } from "@react-three/fiber";
import type { SceneConfig } from "./types";
import { SceneRenderer } from "./sceneRenderer";

interface Props {
  config: SceneConfig;
  height?: number;
}

export default function ScenePreview({ config, height = 160 }: Props) {
  if (!config || !config.objects || config.objects.length === 0) return null;

  return (
    <div style={{ width: "100%", height, borderRadius: 12, overflow: "hidden", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 3, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        style={{ background: config.background }}
      >
        <color attach="background" args={[config.background]} />
        {config.fog && <fog attach="fog" args={config.fog} />}
        {config.ambientLight && (
          <ambientLight color={config.ambientLight.color} intensity={config.ambientLight.intensity} />
        )}
        {config.directionalLight && (
          <directionalLight
            position={config.directionalLight.position}
            color={config.directionalLight.color}
            intensity={config.directionalLight.intensity}
          />
        )}
        {config.pointLight && (
          <pointLight
            position={config.pointLight.position}
            color={config.pointLight.color}
            intensity={config.pointLight.intensity}
          />
        )}
        <SceneRenderer config={config} />
      </Canvas>
    </div>
  );
}
