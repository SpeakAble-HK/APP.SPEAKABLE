import type { AttemptRecord } from "@/types/learningData";

export function exportAttemptsAsJson(attempts: AttemptRecord[]): string {
  return JSON.stringify({ exported_at: new Date().toISOString(), attempts }, null, 2);
}

export function exportAttemptsAsCsv(attempts: AttemptRecord[]): string {
  const header = "attempt_id,lesson_id,timestamp,accuracy_score,flags";
  const lines = attempts.map((a) =>
    [
      a.attempt_id,
      a.lesson_id,
      a.timestamp,
      String(a.accuracy_score),
      a.phoneme_flags.join("|"),
    ].join(",")
  );
  return [header, ...lines].join("\n");
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
