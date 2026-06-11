import { useCallback, useEffect, useState } from "react";
import { isoDateString, isYesterdayOf } from "@/shared/lib/streakWindow";

const STREAK_KEY = "speakable-learning-streak-v1";

interface StreakState {
  lastActiveDate: string;
  currentStreak: number;
}

function load(): StreakState {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw) as StreakState;
  } catch {}
  return { lastActiveDate: "", currentStreak: 0 };
}

function save(s: StreakState) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(s));
}

/** Call when the learner completes meaningful practice (lesson, station, etc.). */
export function recordLearningActivity(): StreakState {
  const today = isoDateString();
  const prev = load();
  if (prev.lastActiveDate === today) {
    return prev;
  }
  let nextStreak = 1;
  if (prev.lastActiveDate && isYesterdayOf(today, prev.lastActiveDate)) {
    nextStreak = prev.currentStreak + 1;
  }
  const next: StreakState = { lastActiveDate: today, currentStreak: nextStreak };
  save(next);
  return next;
}

export function useLearningStreak() {
  const [state, setState] = useState<StreakState>(load);

  useEffect(() => {
    setState(load());
  }, []);

  const refresh = useCallback(() => {
    setState(load());
  }, []);

  const bump = useCallback(() => {
    const next = recordLearningActivity();
    setState(next);
    return next;
  }, []);

  return { ...state, refresh, bump };
}
