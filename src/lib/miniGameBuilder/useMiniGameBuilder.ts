import { useState, useCallback } from "react";
import type { MiniGameBlueprint, DifficultyLevel, PhonemeTarget, MechanicType } from "./types";
import { generateBlueprint, generateBlueprintFromDescription } from "./blueprintGenerator";

const STORAGE_KEY = "speakable-ai-blueprints";

function loadBlueprints(): MiniGameBlueprint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBlueprints(bps: MiniGameBlueprint[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bps));
  } catch { /* noop */ }
}

export function useMiniGameBuilder() {
  const [blueprints, setBlueprints] = useState<MiniGameBlueprint[]>(loadBlueprints);
  const [currentBlueprint, setCurrentBlueprint] = useState<MiniGameBlueprint | null>(null);
  const [generating, setGenerating] = useState(false);

  const generate = useCallback((description: string, difficulty: DifficultyLevel, mechanicType?: MechanicType) => {
    setGenerating(true);
    const bp = generateBlueprintFromDescription(description, difficulty, undefined, mechanicType);
    setCurrentBlueprint(bp);
    setBlueprints((prev) => {
      const next = [bp, ...prev];
      saveBlueprints(next);
      return next;
    });
    setGenerating(false);
    return bp;
  }, []);

  const generateFromTarget = useCallback((id: string, target: PhonemeTarget, difficulty: DifficultyLevel, name?: string, mechanicType?: MechanicType) => {
    setGenerating(true);
    const bp = generateBlueprint(id, target, difficulty, name, undefined, undefined, mechanicType);
    setCurrentBlueprint(bp);
    setBlueprints((prev) => {
      const next = [bp, ...prev];
      saveBlueprints(next);
      return next;
    });
    setGenerating(false);
    return bp;
  }, []);

  const remove = useCallback((id: string) => {
    setBlueprints((prev) => {
      const next = prev.filter((b) => b.id !== id);
      saveBlueprints(next);
      return next;
    });
    if (currentBlueprint?.id === id) setCurrentBlueprint(null);
  }, [currentBlueprint]);

  const confirmDraft = useCallback((bp: MiniGameBlueprint) => {
    setBlueprints((prev) => {
      if (prev.some((b) => b.id === bp.id)) return prev;
      const next = [bp, ...prev];
      saveBlueprints(next);
      return next;
    });
    setCurrentBlueprint(bp);
  }, []);

  const clear = useCallback(() => {
    setBlueprints([]);
    setCurrentBlueprint(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    blueprints,
    currentBlueprint,
    generating,
    setCurrentBlueprint,
    generate,
    generateFromTarget,
    confirmDraft,
    remove,
    clear,
  };
}
