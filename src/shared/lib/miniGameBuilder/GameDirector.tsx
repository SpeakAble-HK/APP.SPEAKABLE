import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import type { MiniGameBlueprint } from "./types";
import { SelectCorrectGame, DragSortGame, ToneWheelGame, RepeatAfterGame, MatchPairGame, MinimalPairDashGame } from "./mechanics";
import { SceneRenderer } from "./sceneRenderer";
import { SCENE_CAMERA } from "./sceneGenerator";

interface Props {
  blueprint: MiniGameBlueprint;
  onScore: (correct: number, total: number, timing: number[]) => void;
  onExit: () => void;
}

function MechanicPanel({ blueprint, onScore, onExit }: Props) {
  switch (blueprint.mechanic.type) {
    case "select-correct":
      return <SelectCorrectGame blueprint={blueprint} onScore={onScore} onExit={onExit} />;
    case "drag-sort":
      return <DragSortGame blueprint={blueprint} onScore={onScore} onExit={onExit} />;
    case "tone-wheel":
      return <ToneWheelGame blueprint={blueprint} onScore={onScore} onExit={onExit} />;
    case "repeat-after":
      return <RepeatAfterGame blueprint={blueprint} onScore={onScore} onExit={onExit} />;
    case "match-pair":
      return <MatchPairGame blueprint={blueprint} onScore={onScore} onExit={onExit} />;
    case "minimal-pair-dash":
      return <MinimalPairDashGame blueprint={blueprint} onScore={onScore} onExit={onExit} />;
    default:
      return (
        <div className="flex items-center justify-center h-full p-8">
          <p className="text-on-surface-variant">未知遊戲類型: {blueprint.mechanic.type}</p>
        </div>
      );
  }
}

export function GameDirector({ blueprint, onScore, onExit }: Props) {
  const sceneConfig = blueprint.sceneConfig;
  const hasScene = sceneConfig && sceneConfig.objects && sceneConfig.objects.length > 0;
  const cam = SCENE_CAMERA[blueprint.scene.environment] ?? SCENE_CAMERA.forest;

  if (!hasScene) {
    return (
      <div className="h-full">
        <MechanicPanel blueprint={blueprint} onScore={onScore} onExit={onExit} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <Canvas
          camera={{ position: cam.position, fov: cam.fov }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
          style={{ background: sceneConfig.background }}
        >
          <color attach="background" args={[sceneConfig.background]} />
          {sceneConfig.fog && <fog attach="fog" args={sceneConfig.fog} />}
          {sceneConfig.ambientLight && (
            <ambientLight color={sceneConfig.ambientLight.color} intensity={sceneConfig.ambientLight.intensity} />
          )}
          {sceneConfig.directionalLight && (
            <directionalLight
              position={sceneConfig.directionalLight.position}
              color={sceneConfig.directionalLight.color}
              intensity={sceneConfig.directionalLight.intensity}
            />
          )}
          {sceneConfig.pointLight && (
            <pointLight
              position={sceneConfig.pointLight.position}
              color={sceneConfig.pointLight.color}
              intensity={sceneConfig.pointLight.intensity}
            />
          )}
          <SceneRenderer config={sceneConfig} />
        </Canvas>
      </div>
      <div className="relative z-10 h-full overflow-y-auto">
        <MechanicPanel blueprint={blueprint} onScore={onScore} onExit={onExit} />
      </div>
    </div>
  );
}
