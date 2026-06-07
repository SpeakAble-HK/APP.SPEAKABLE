// Utility for mission popup session tracking
export function shouldShowMissionPopup(): boolean {
  try {
    return !localStorage.getItem("speakable-mission-popup-shown");
  } catch {
    return true;
  }
}

export function setMissionPopupShown() {
  try {
    localStorage.setItem("speakable-mission-popup-shown", "1");
  } catch {}
}
