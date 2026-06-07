const AURA_STORY_KEY = "speakable-aura-story-unlocked";
const AURA_JOURNEY_KEY = "speakable-aura-journey-unlocked";
const VOICE_WORD_KEY = "speakable-voice-clone-word";
const MODULATION_SESSION_KEY = "speakable-modulation-session";
const MISSION_UNLOCK_CHIME_KEY = "speakable-mission-unlock-chime-enabled";
const DEV_PROFILE_KEY = "speakable-user-profile-v1";

export function isDevMockStudent(): boolean {
  if (!import.meta.env.DEV) return false;

  try {
    const profileRaw = localStorage.getItem(DEV_PROFILE_KEY);
    if (!profileRaw) return false;

    const profile = JSON.parse(profileRaw) as { user_id?: string; username?: string };
    return profile.user_id === "mock-student-001" || profile.username === "dev_student";
  } catch {
    return false;
  }
}

function readBoolean(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeBoolean(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    // Ignore storage failure in private mode.
  }
}

export function getAuraStoryUnlocked(): boolean {
  if (isDevMockStudent()) return true;
  return readBoolean(AURA_STORY_KEY);
}

export function setAuraStoryUnlocked(value: boolean): void {
  writeBoolean(AURA_STORY_KEY, value);
}

export function getAuraJourneyUnlocked(): boolean {
  if (isDevMockStudent()) return true;
  return readBoolean(AURA_JOURNEY_KEY);
}

export function setAuraJourneyUnlocked(value: boolean): void {
  writeBoolean(AURA_JOURNEY_KEY, value);
}

export function getVoiceCloneWord(): string {
  try {
    return localStorage.getItem(VOICE_WORD_KEY) || "媽媽";
  } catch {
    return "媽媽";
  }
}

export function setVoiceCloneWord(word: string): void {
  try {
    localStorage.setItem(VOICE_WORD_KEY, word);
  } catch {
    // Ignore storage failure.
  }
}

export function getModulationSession(): string {
  try {
    return localStorage.getItem(MODULATION_SESSION_KEY) || "session-1";
  } catch {
    return "session-1";
  }
}

export function setModulationSession(sessionId: string): void {
  try {
    localStorage.setItem(MODULATION_SESSION_KEY, sessionId);
  } catch {
    // Ignore storage failure.
  }
}

export function getMissionUnlockChimeEnabled(): boolean {
  try {
    const value = localStorage.getItem(MISSION_UNLOCK_CHIME_KEY);
    if (value === null) return true;
    return value === "1";
  } catch {
    return true;
  }
}

export function setMissionUnlockChimeEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(MISSION_UNLOCK_CHIME_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore storage failure.
  }
}
