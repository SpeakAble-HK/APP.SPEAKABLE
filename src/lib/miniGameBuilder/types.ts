export type MechanicType =
  | "select-correct"       // Pick correct answer from N options
  | "match-pair"          // Match spoken word to one of N pictures/words
  | "drag-sort"          // Drag items into correct phoneme category
  | "repeat-after"       // Listen and repeat, scored by phoneme accuracy
  | "tone-wheel"        // Spin a wheel and say the word with correct tone
  | "minimal-pair-dash" // Race to identify minimal pairs
  ;

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface PhonemeTarget {
  type: "initial" | "final" | "tone";
  phonemes: string[];
}

export interface ChallengeItem {
  id: string;
  text: string;              // Chinese character(s)
  jyutping: string;          // Full jyutping
  correctAnswer: string;     // The correct answer text
  options: string[];         // All options (including correct)
  difficulty: DifficultyLevel;
  hint?: string;
}

export interface MechanicConfig {
  type: MechanicType;
  timeLimitSec: number;
  itemsPerRound: number;
  roundsPerGame: number;
  showScore: boolean;
  showTimer: boolean;
  allowRetry: boolean;
  passThreshold: number;     // 0-1 accuracy required
}

export interface SceneObject {
  type: "sphere" | "box" | "cylinder" | "cone" | "torus" | "plane";
  position: [number, number, number];
  color: string;
  scale?: number | [number, number, number];
  radius?: number;
  radiusTop?: number;
  radiusBottom?: number;
  height?: number;
  dimensions?: [number, number, number];
  tube?: number;
  radialSegments?: number;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  wireframe?: boolean;
  animation?: "float" | "rotate" | "pulse" | "orbit";
  animationSpeed?: number;
  animationAmplitude?: number;
  orbitCenter?: [number, number, number];
  orbitRadius?: number;
}

export interface ParticleConfig {
  type: "sparkles" | "bubbles" | "stars" | "fireflies";
  count: number;
  color: string;
  spread?: number;
  speed?: number;
  size?: number;
}

export interface SceneConfig {
  background: string;
  fog?: [number, number];
  ambientLight?: { color: string; intensity: number };
  directionalLight?: { color: string; intensity: number; position: [number, number, number] };
  pointLight?: { color: string; intensity: number; position: [number, number, number] };
  objects: SceneObject[];
  particles?: ParticleConfig;
}

export interface Scene3DConfig {
  environment: string;       // "forest" | "underwater" | "space" | "room" | "desert"
  background_color?: string;
  camera_position?: [number, number, number];
  props?: string[];          // 3D model paths to place in scene
  particleEffect?: "sparkles" | "bubbles" | "stars" | "none";
  ambientColor?: string;
}

export interface PatientPhonemeInfo {
  phoneme: string;
  accuracy: number;
  trend: "improving" | "stable" | "declining";
  confusions: string[];
  fatigueDelta: number;
}

export interface PatientContext {
  patientId: string;
  name: string;
  phonemeProfiles: PatientPhonemeInfo[];
  overallAccuracy: number;
  fatigueWarnings: string[];
  fatiguedAtMinute: number | null;
  recommendations?: {
    exerciseType: string;
    targetPhonemes: string[];
    difficulty: string;
  }[];
}

export interface UIStyle {
  cardStyle: "rounded" | "bubble" | "door" | "card" | "emoji" | "minimal";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily?: string;
  showCharacter: boolean;
  showJyutping: boolean;
}

export interface RewardConfig {
  onCorrect: "confetti" | "sparkle" | "zoom" | "check" | "none";
  onStreak: "badge" | "stars" | "combo_text" | "none";
  onComplete: "fireworks" | "trophy" | "curtain" | "summary" | "none";
}

export interface MiniGameBlueprint {
  id: string;
  name: string;
  description: string;
  phonemeTargets: PhonemeTarget[];
  mechanic: MechanicConfig;
  scene: Scene3DConfig;
  sceneConfig?: SceneConfig;
  sceneCode?: string;
  ui: UIStyle;
  rewards: RewardConfig;
  challenges: ChallengeItem[];
  adaptationRules: {
    difficultyMultiplier: number;
    fatigueThresholdSec: number;
    adaptiveDifficulty: boolean;
  };
  generatedBy: "ai" | "template" | "manual";
  createdAt: string;
}
