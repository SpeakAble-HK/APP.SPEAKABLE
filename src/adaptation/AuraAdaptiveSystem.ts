// src/adaptation/AuraAdaptiveSystem.ts
// Minimal in-tree implementation of the adaptation engine. The original
// engine lives outside this repo; this stub keeps the hook contract stable
// (constructable class with the methods useAdaptationEngine consumes) so
// components don't crash when the external module isn't available.

const STORAGE_KEY = 'aura.adaptive.profile.v1';

export interface AuraProfile {
  accuracy: number;
  reactionTimeMs: number;
  fatigue: number;
  streak: number;
  difficulty: number; // 0..1
  [key: string]: unknown;
}

export class AuraAdaptiveSystem {
  profile: AuraProfile;

  constructor(profile?: Partial<AuraProfile> | null) {
    this.profile = { ...this.getDefaultProfile(), ...(profile ?? {}) };
  }

  getDefaultProfile(): AuraProfile {
    return {
      accuracy: 0.7,
      reactionTimeMs: 800,
      fatigue: 0,
      streak: 0,
      difficulty: 0.5,
    };
  }

  save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch {
      /* ignore storage errors */
    }
  }

  private scale(base: number, min = 0.3, max = 1.5): number {
    const d = Math.max(0, Math.min(1, this.profile.difficulty));
    return Math.max(min, Math.min(max, base * (0.5 + d)));
  }

  getWaterParkSettings() {
    return { flowSpeed: this.scale(1), targetCount: Math.round(this.scale(4, 2, 8)) };
  }

  getMazeSettings() {
    return { complexity: this.scale(1), timeLimitSec: Math.round(60 / this.scale(1, 0.5, 2)) };
  }

  getFruitNinjaSettings() {
    return { spawnRate: this.scale(1), fruitSpeed: this.scale(1) };
  }

  getCatchTheFlySettings() {
    return { flySpeed: this.scale(1), flyCount: Math.round(this.scale(3, 1, 6)) };
  }

  getProfileSummary() {
    return { ...this.profile };
  }

  generateAdaptationReport() {
    return {
      profile: { ...this.profile },
      generatedAt: new Date().toISOString(),
    };
  }
}

export default AuraAdaptiveSystem;
