import type { LearnerSegment, UserProfile } from "@/types/learningData";

const KEY = "speakable-user-profile-v1";

const defaultProfile: UserProfile = {
  user_id: "local",
  consent_given: true,
};

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultProfile, ...JSON.parse(raw) } as UserProfile;
  } catch {}
  return { ...defaultProfile };
}

export function setUserProfile(patch: Partial<UserProfile>) {
  const next = { ...getUserProfile(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function setLearnerSegment(segment: LearnerSegment) {
  setUserProfile({ user_type: segment });
}

export function setConsentGiven(value: boolean) {
  setUserProfile({ consent_given: value });
}
