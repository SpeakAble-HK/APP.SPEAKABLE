import type { AttemptRecord } from "@/types/learningData";

/** Pluggable persistence for attempts / progress (design §2.12). */
export interface LearningStorage {
  saveAttempt(entry: AttemptRecord): void;
  listAttempts(): AttemptRecord[];
  clearAttempts(): void;
}

const LOCAL_ATTEMPTS_KEY = "speakable-learning-attempts-v1";

function readAttempts(): AttemptRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_ATTEMPTS_KEY);
    if (raw) return JSON.parse(raw) as AttemptRecord[];
  } catch {}
  return [];
}

function writeAttempts(rows: AttemptRecord[]) {
  localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(rows));
}

export function createLocalLearningStorage(): LearningStorage {
  return {
    saveAttempt(entry: AttemptRecord) {
      const rows = readAttempts();
      rows.push(entry);
      writeAttempts(rows);
    },
    listAttempts() {
      return readAttempts();
    },
    clearAttempts() {
      localStorage.removeItem(LOCAL_ATTEMPTS_KEY);
    },
  };
}

export const defaultLearningStorage = createLocalLearningStorage();
