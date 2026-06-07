/**
 * StoryVerse — Core Story Engine
 *
 * Manages:
 *   - Scene navigation (next/prev/branch)
 *   - Mission evaluation (success/almost/needs_practice)
 *   - Branching logic (based on mission results)
 *   - Progress tracking (scenes, chapters, worlds)
 *   - Adaptive difficulty (auto-adjust based on performance)
 *   - Reward distribution (stickers, badges, XP)
 *
 * Integrates with UtteranceAnalysis (Phase 0.1) for speech mission evaluation.
 */

import type {
  StoryWorld,
  StoryChapter,
  StoryScene,
  StoryProgress,
  ChapterProgress,
  SceneProgress,
  MissionAttempt,
  MissionResult,
  MissionSuccessCriteria,
  SceneBranch,
  StoryDifficulty,
  AdaptiveStoryConfig,
  StoryEvent,
  SceneId,
  ChapterId,
  MissionId,
} from "@/types/storyverse";
import type { UtteranceAnalysis } from "@/types/utteranceAnalysis";
import { DEFAULT_ADAPTIVE_CONFIG, DEFAULT_SUCCESS_CRITERIA } from "@/types/storyverse";

// ─── Engine State ────────────────────────────────────────────────────────────

export interface StoryEngineState {
  world: StoryWorld;
  currentChapterId: ChapterId;
  currentSceneId: SceneId;
  progress: StoryProgress;
  adaptiveConfig: AdaptiveStoryConfig;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  currentDifficulty: StoryDifficulty;
  events: StoryEvent[];
}

// ─── Engine Actions ──────────────────────────────────────────────────────────

export type StoryEngineAction =
  | { type: "ENTER_SCENE"; sceneId: SceneId }
  | { type: "START_MISSION"; missionId: MissionId }
  | { type: "SUBMIT_ATTEMPT"; attempt: MissionAttempt }
  | { type: "NAVIGATE_TO_SCENE"; sceneId: SceneId }
  | { type: "ADJUST_DIFFICULTY"; newDifficulty: StoryDifficulty; reason: string }
  | { type: "COMPLETE_CHAPTER"; chapterId: ChapterId }
  | { type: "COMPLETE_WORLD" }
  | { type: "RESET_PROGRESS" };

// ─── Engine Class ────────────────────────────────────────────────────────────

export class StoryEngine {
  private state: StoryEngineState;

  constructor(world: StoryWorld, initialProgress?: StoryProgress) {
    const firstChapter = world.chapters[0];
    const firstScene = firstChapter?.scenes.find((s) => s.id === firstChapter.entry_scene_id) || firstChapter?.scenes[0];

    this.state = {
      world,
      currentChapterId: firstChapter?.id || "",
      currentSceneId: firstScene?.id || "",
      progress: initialProgress || this.createEmptyProgress(world),
      adaptiveConfig: DEFAULT_ADAPTIVE_CONFIG,
      consecutiveSuccesses: 0,
      consecutiveFailures: 0,
      currentDifficulty: firstChapter?.difficulty || "easy",
      events: [],
    };
  }

  // ─── State Accessors ─────────────────────────────────────────────────────

  getState(): StoryEngineState {
    return { ...this.state };
  }

  getCurrentScene(): StoryScene | undefined {
    const chapter = this.getCurrentChapter();
    return chapter?.scenes.find((s) => s.id === this.state.currentSceneId);
  }

  getCurrentChapter(): StoryChapter | undefined {
    return this.state.world.chapters.find((c) => c.id === this.state.currentChapterId);
  }

  getProgress(): StoryProgress {
    return { ...this.state.progress };
  }

  // ─── Scene Navigation ────────────────────────────────────────────────────

  enterScene(sceneId: SceneId): StoryScene | undefined {
    const scene = this.findScene(sceneId);
    if (!scene) return undefined;

    this.state.currentSceneId = sceneId;
    this.state.currentChapterId = scene.chapter_id;

    // Update progress
    const chapterProgress = this.getChapterProgress(scene.chapter_id);
    if (chapterProgress) {
      const sceneProgress = this.getSceneProgress(sceneId, chapterProgress);
      if (sceneProgress.status === "locked") {
        sceneProgress.status = "unlocked";
      }
    }

    this.addEvent({ type: "scene_enter", scene_id: sceneId, timestamp: new Date().toISOString() });

    return scene;
  }

  getNextScene(): StoryScene | undefined {
    const currentScene = this.getCurrentScene();
    if (!currentScene) return undefined;

    // Find the "always" branch or first branch
    const alwaysBranch = currentScene.branches.find((b) => b.condition === "always");
    if (alwaysBranch) {
      return this.findScene(alwaysBranch.next_scene_id);
    }

    return undefined;
  }

  navigateToScene(sceneId: SceneId): StoryScene | undefined {
    const scene = this.findScene(sceneId);
    if (!scene) return undefined;

    this.state.currentSceneId = sceneId;
    this.state.currentChapterId = scene.chapter_id;

    this.addEvent({ type: "scene_exit", scene_id: this.state.currentSceneId, timestamp: new Date().toISOString() });
    this.addEvent({ type: "scene_enter", scene_id: sceneId, timestamp: new Date().toISOString() });

    return scene;
  }

  // ─── Mission Evaluation ──────────────────────────────────────────────────

  evaluateMission(analysis: UtteranceAnalysis, criteria: MissionSuccessCriteria): MissionResult {
    const overall = analysis.scores.overall;
    const toneAccuracy = analysis.scores.tone_accuracy;
    const articulation = analysis.scores.articulation;

    // Check if any timing deviation exceeds threshold
    const timingDeviations = analysis.phonemes
      .filter((p) => p.timing_deviation_ms !== undefined)
      .map((p) => Math.abs(p.timing_deviation_ms!));
    const maxDeviation = timingDeviations.length > 0 ? Math.max(...timingDeviations) : 0;

    // Check low confidence
    const hasLowConfidence = analysis.syllables.some((s) => s.is_low_confidence);

    // Evaluate against criteria
    const passesOverall = overall >= criteria.min_overall_accuracy;
    const passesTone = toneAccuracy >= criteria.min_tone_accuracy;
    const passesArticulation = articulation >= criteria.min_articulation_score;
    const passesTiming = maxDeviation <= criteria.max_timing_deviation_ms;
    const passesConfidence = !hasLowConfidence || criteria.allow_low_confidence;

    if (passesOverall && passesTone && passesArticulation && passesTiming && passesConfidence) {
      return "success";
    }

    // Check if "almost" (within 10% of threshold)
    const almostThreshold = 0.1;
    const almostOverall = overall >= criteria.min_overall_accuracy - almostThreshold;
    const almostTone = toneAccuracy >= criteria.min_tone_accuracy - almostThreshold;
    const almostArticulation = articulation >= criteria.min_articulation_score - almostThreshold;

    if (almostOverall && almostTone && almostArticulation) {
      return "almost";
    }

    return "needs_practice";
  }

  submitMissionAttempt(attempt: MissionAttempt): {
    result: MissionResult;
    nextSceneId?: SceneId;
    rewardsEarned?: StoryScene["reward"];
  } {
    const currentScene = this.getCurrentScene();
    if (!currentScene?.mission) {
      return { result: "needs_practice" };
    }

    // Record attempt
    const chapterProgress = this.getChapterProgress(currentScene.chapter_id);
    if (chapterProgress) {
      const sceneProgress = this.getSceneProgress(currentScene.id, chapterProgress);
      sceneProgress.attempts.push(attempt);

      // Update best score
      if (!sceneProgress.best_score || attempt.scores.overall > sceneProgress.best_score) {
        sceneProgress.best_score = attempt.scores.overall;
      }

      // Mark complete if success
      if (attempt.result === "success") {
        sceneProgress.status = "completed";
        sceneProgress.completed_at = new Date().toISOString();

        // Award reward
        if (currentScene.reward) {
          sceneProgress.rewards_earned.push(currentScene.reward.id);
        }
      }
    }

    // Update consecutive counters
    if (attempt.result === "success") {
      this.state.consecutiveSuccesses++;
      this.state.consecutiveFailures = 0;
    } else {
      this.state.consecutiveFailures++;
      this.state.consecutiveSuccesses = 0;
    }

    this.addEvent({ type: "mission_attempt", attempt, timestamp: new Date().toISOString() });
    this.addEvent({ type: "mission_complete", mission_id: attempt.mission_id, result: attempt.result, timestamp: new Date().toISOString() });

    // Determine next scene based on branching
    const branch = this.selectBranch(currentScene.branches, attempt.result);
    const nextSceneId = branch?.next_scene_id;

    // Check for adaptive difficulty adjustment
    this.checkAdaptiveDifficulty();

    return {
      result: attempt.result,
      nextSceneId,
      rewardsEarned: attempt.result === "success" ? currentScene.reward : undefined,
    };
  }

  // ─── Branching Logic ─────────────────────────────────────────────────────

  selectBranch(branches: SceneBranch[], result: MissionResult): SceneBranch | undefined {
    // Priority: exact match > almost > needs_practice > always
    const exactMatch = branches.find((b) => b.condition === result);
    if (exactMatch) return exactMatch;

    // Fallback to "always"
    return branches.find((b) => b.condition === "always");
  }

  // ─── Adaptive Difficulty ─────────────────────────────────────────────────

  private checkAdaptiveDifficulty() {
    if (!this.state.adaptiveConfig.enable_adaptive_difficulty) return;

    const { upgrade_after_consecutive_successes, downgrade_after_consecutive_failures } =
      this.state.adaptiveConfig.difficulty_adjustment_threshold;

    // Upgrade difficulty
    if (this.state.consecutiveSuccesses >= upgrade_after_consecutive_successes) {
      const newDifficulty = this.getHarderDifficulty(this.state.currentDifficulty);
      if (newDifficulty !== this.state.currentDifficulty) {
        this.addEvent({
          type: "difficulty_adjusted",
          from: this.state.currentDifficulty,
          to: newDifficulty,
          reason: `${this.state.consecutiveSuccesses} consecutive successes`,
          timestamp: new Date().toISOString(),
        });
        this.state.currentDifficulty = newDifficulty;
        this.state.consecutiveSuccesses = 0;
      }
    }

    // Downgrade difficulty
    if (this.state.consecutiveFailures >= downgrade_after_consecutive_failures) {
      const newDifficulty = this.getEasierDifficulty(this.state.currentDifficulty);
      if (newDifficulty !== this.state.currentDifficulty) {
        this.addEvent({
          type: "difficulty_adjusted",
          from: this.state.currentDifficulty,
          to: newDifficulty,
          reason: `${this.state.consecutiveFailures} consecutive failures`,
          timestamp: new Date().toISOString(),
        });
        this.state.currentDifficulty = newDifficulty;
        this.state.consecutiveFailures = 0;
      }
    }
  }

  private getHarderDifficulty(current: StoryDifficulty): StoryDifficulty {
    if (current === "easy") return "medium";
    if (current === "medium") return "hard";
    return "hard";
  }

  private getEasierDifficulty(current: StoryDifficulty): StoryDifficulty {
    if (current === "hard") return "medium";
    if (current === "medium") return "easy";
    return "easy";
  }

  // ─── Progress Tracking ───────────────────────────────────────────────────

  private createEmptyProgress(world: StoryWorld): StoryProgress {
    const chapters: Record<ChapterId, ChapterProgress> = {};

    for (const chapter of world.chapters) {
      const scenes: Record<SceneId, SceneProgress> = {};
      for (const scene of chapter.scenes) {
        scenes[scene.id] = {
          scene_id: scene.id,
          status: "locked",
          attempts: [],
          rewards_earned: [],
        };
      }

      chapters[chapter.id] = {
        chapter_id: chapter.id,
        status: "locked",
        scenes,
        completion_pct: 0,
      };
    }

    // Unlock first chapter
    if (world.chapters[0]) {
      chapters[world.chapters[0].id].status = "unlocked";
      // Unlock entry scene
      const entryScene = world.chapters[0].entry_scene_id;
      if (entryScene && chapters[world.chapters[0].id].scenes[entryScene]) {
        chapters[world.chapters[0].id].scenes[entryScene].status = "unlocked";
      }
    }

    return {
      world_id: world.id,
      child_id: "",
      chapters,
      total_xp_earned: 0,
      total_stickers: 0,
      total_badges: 0,
      streak_days: 0,
    };
  }

  private getChapterProgress(chapterId: ChapterId): ChapterProgress | undefined {
    return this.state.progress.chapters[chapterId];
  }

  private getSceneProgress(sceneId: SceneId, chapterProgress: ChapterProgress): SceneProgress {
    if (!chapterProgress.scenes[sceneId]) {
      chapterProgress.scenes[sceneId] = {
        scene_id: sceneId,
        status: "locked",
        attempts: [],
        rewards_earned: [],
      };
    }
    return chapterProgress.scenes[sceneId];
  }

  private findScene(sceneId: SceneId): StoryScene | undefined {
    for (const chapter of this.state.world.chapters) {
      const scene = chapter.scenes.find((s) => s.id === sceneId);
      if (scene) return scene;
    }
    return undefined;
  }

  private addEvent(event: StoryEvent) {
    this.state.events.push(event);
  }

  // ─── Chapter/World Completion ────────────────────────────────────────────

  checkChapterCompletion(chapterId: ChapterId): boolean {
    const chapterProgress = this.getChapterProgress(chapterId);
    if (!chapterProgress) return false;

    const chapter = this.state.world.chapters.find((c) => c.id === chapterId);
    if (!chapter) return false;

    // Check if all mission scenes are completed
    const missionScenes = chapter.scenes.filter((s) => s.type === "mission");
    const allCompleted = missionScenes.every((s) => {
      const sceneProgress = chapterProgress.scenes[s.id];
      return sceneProgress?.status === "completed";
    });

    if (allCompleted) {
      chapterProgress.status = "completed";
      chapterProgress.completed_at = new Date().toISOString();
      this.addEvent({ type: "chapter_complete", chapter_id: chapterId, timestamp: new Date().toISOString() });

      // Unlock next chapter
      const currentIndex = this.state.world.chapters.findIndex((c) => c.id === chapterId);
      const nextChapter = this.state.world.chapters[currentIndex + 1];
      if (nextChapter && this.state.progress.chapters[nextChapter.id]) {
        this.state.progress.chapters[nextChapter.id].status = "unlocked";
      }
    }

    return allCompleted;
  }

  checkWorldCompletion(): boolean {
    const allChaptersCompleted = this.state.world.chapters.every((c) => {
      const progress = this.state.progress.chapters[c.id];
      return progress?.status === "completed";
    });

    if (allChaptersCompleted) {
      this.addEvent({ type: "world_complete", world_id: this.state.world.id, timestamp: new Date().toISOString() });
    }

    return allChaptersCompleted;
  }

  // ─── Utility ─────────────────────────────────────────────────────────────

  resetProgress() {
    this.state.progress = this.createEmptyProgress(this.state.world);
    this.state.consecutiveSuccesses = 0;
    this.state.consecutiveFailures = 0;
    this.state.currentDifficulty = this.state.world.chapters[0]?.difficulty || "easy";
    this.state.events = [];
  }

  getEvents(): StoryEvent[] {
    return [...this.state.events];
  }
}
