/** Calendar-day streak with explicit “yesterday” check (design §1.5). */

export function isoDateString(d: Date = new Date()): string {
  return d.toISOString().split("T")[0];
}

export function addDaysIso(iso: string, delta: number): string {
  const d = new Date(iso + "T12:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().split("T")[0];
}

export function isYesterdayOf(todayIso: string, candidateIso: string): boolean {
  return addDaysIso(todayIso, -1) === candidateIso;
}
