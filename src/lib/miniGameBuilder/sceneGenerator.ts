import type { SceneConfig, SceneObject, ParticleConfig, PhonemeTarget, DifficultyLevel } from "./types";

interface EnvTheme {
  background: string;
  fog: [number, number];
  ambient: { color: string; intensity: number };
  directional: { color: string; intensity: number; position: [number, number, number] };
  pointLight: { color: string; intensity: number; position: [number, number, number] };
  palette: string[];
  particleCfg: ParticleConfig;
  cameraHeight: number;
  cameraDistance: number;
  objectCount: number;
}

const THEMES: Record<string, EnvTheme> = {
  forest: {
    background: "#0a3d2e",
    fog: [5, 25],
    ambient: { color: "#4a7c6f", intensity: 0.5 },
    directional: { color: "#ffd700", intensity: 0.7, position: [5, 10, 5] },
    pointLight: { color: "#4da6ff", intensity: 1.5, position: [0, 3, 0] },
    palette: ["#2d7a3d", "#3d8a5a", "#4a9f6a", "#6bae3d", "#1d5a2d"],
    particleCfg: { type: "sparkles", count: 60, color: "#4da6ff", spread: 10, speed: 0.3 },
    cameraHeight: 3,
    cameraDistance: 8,
    objectCount: 10,
  },
  underwater: {
    background: "#0a2a4a",
    fog: [5, 28],
    ambient: { color: "#1a4a7a", intensity: 0.4 },
    directional: { color: "#88ccff", intensity: 0.5, position: [3, 6, 5] },
    pointLight: { color: "#00aaff", intensity: 2, position: [0, 1, 0] },
    palette: ["#1a6a9a", "#2a8aba", "#3a9aba", "#5abaee", "#0a5a8a"],
    particleCfg: { type: "bubbles", count: 30, color: "#88ddff", spread: 6, speed: 0.4, size: 4 },
    cameraHeight: 2,
    cameraDistance: 7,
    objectCount: 12,
  },
  space: {
    background: "#050510",
    fog: [10, 50],
    ambient: { color: "#222244", intensity: 0.2 },
    directional: { color: "#ffffff", intensity: 0.3, position: [0, 5, 5] },
    pointLight: { color: "#8866ff", intensity: 2, position: [0, 0, 0] },
    palette: ["#ff4466", "#44ff88", "#4488ff", "#ffdd44", "#ff44ff", "#44ffff"],
    particleCfg: { type: "stars", count: 80, color: "#ffffff", spread: 15, speed: 0.2, size: 2 },
    cameraHeight: 2,
    cameraDistance: 10,
    objectCount: 14,
  },
  room: {
    background: "#f0e8d8",
    fog: [8, 20],
    ambient: { color: "#ffe0b0", intensity: 0.7 },
    directional: { color: "#ffffff", intensity: 0.6, position: [3, 8, 4] },
    pointLight: { color: "#ffcc88", intensity: 1.2, position: [2, 2, 1] },
    palette: ["#c49a6c", "#a0784c", "#e8c8a0", "#8b7355", "#d4b080"],
    particleCfg: { type: "sparkles", count: 30, color: "#ffcc88", spread: 6, speed: 0.2 },
    cameraHeight: 3,
    cameraDistance: 7,
    objectCount: 8,
  },
  desert: {
    background: "#c8a050",
    fog: [10, 35],
    ambient: { color: "#e8c878", intensity: 0.6 },
    directional: { color: "#ffcc66", intensity: 0.9, position: [5, 12, 5] },
    pointLight: { color: "#ff8844", intensity: 1.5, position: [0, 2, 0] },
    palette: ["#c49a6c", "#b8895a", "#d4a868", "#e8c878", "#a07848"],
    particleCfg: { type: "sparkles", count: 40, color: "#ffcc66", spread: 8, speed: 0.25 },
    cameraHeight: 3,
    cameraDistance: 9,
    objectCount: 10,
  },
};

function randomInCircle(radius: number): [number, number] {
  const a = Math.random() * Math.PI * 2;
  const r = Math.random() * radius;
  return [Math.cos(a) * r, Math.sin(a) * r];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildSceneObjects(theme: EnvTheme, count: number, target?: PhonemeTarget): SceneObject[] {
  const objects: SceneObject[] = [];
  const shapes: SceneObject["type"][] = ["sphere", "box", "cylinder", "cone", "torus"];

  for (let i = 0; i < count; i++) {
    const shape = pick(shapes);
    const color = pick(theme.palette);
    const [x, z] = randomInCircle(5);
    const y = -1 + Math.random() * 3;
    const anims: SceneObject["animation"][] = ["float", "rotate", "pulse", "orbit"];
    const anim = Math.random() > 0.4 ? pick(anims) : undefined;

    const base: SceneObject = {
      type: shape,
      position: [x, y, z],
      color,
      animation: anim,
      animationSpeed: 0.3 + Math.random() * 0.8,
      animationAmplitude: 0.2 + Math.random() * 0.4,
      metalness: Math.random() * 0.4,
      roughness: 0.3 + Math.random() * 0.5,
      opacity: 0.7 + Math.random() * 0.3,
    };

    if (anim === "orbit") {
      base.orbitRadius = 1.5 + Math.random() * 2;
      base.orbitCenter = [x, y, z];
    }

    switch (shape) {
      case "sphere":
        base.radius = 0.2 + Math.random() * 0.5;
        break;
      case "box":
        base.dimensions = [0.3 + Math.random() * 0.6, 0.3 + Math.random() * 0.8, 0.3 + Math.random() * 0.6];
        break;
      case "cylinder":
      case "cone":
        base.radius = 0.2 + Math.random() * 0.4;
        base.height = 0.4 + Math.random() * 0.8;
        break;
      case "torus":
        base.radius = 0.3 + Math.random() * 0.5;
        base.tube = 0.08 + Math.random() * 0.15;
        break;
    }

    if (Math.random() > 0.6) {
      base.emissive = color;
      base.emissiveIntensity = 0.2 + Math.random() * 0.5;
    }

    objects.push(base);
  }

  return objects;
}

export function generateSceneConfig(
  environment: string,
  _targets: PhonemeTarget[],
  difficulty: DifficultyLevel,
  _target?: PhonemeTarget,
): SceneConfig {
  const theme = THEMES[environment] ?? THEMES.forest;
  const mult = difficulty === "easy" ? 0.7 : difficulty === "hard" ? 1.3 : 1;
  const count = Math.round(theme.objectCount * mult);

  return {
    background: theme.background,
    fog: theme.fog,
    ambientLight: theme.ambient,
    directionalLight: theme.directional,
    pointLight: theme.pointLight,
    objects: buildSceneObjects(theme, count),
    particles: {
      ...theme.particleCfg,
      count: Math.round((theme.particleCfg.count ?? 50) * mult),
    },
  };
}

export const SCENE_CAMERA: Record<string, { position: [number, number, number]; fov: number }> = {
  forest: { position: [0, 3, 8], fov: 50 },
  underwater: { position: [0, 2, 7], fov: 55 },
  space: { position: [0, 2, 10], fov: 45 },
  room: { position: [0, 3, 7], fov: 50 },
  desert: { position: [0, 3, 9], fov: 50 },
};
