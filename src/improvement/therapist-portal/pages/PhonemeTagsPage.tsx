import { useState } from "react";
import PortalShell from "@/shared/components/PortalShell";
import { PhonemeTagger } from "../components/PhonemeTagger";
import { savePhonemeTags } from "@/lib/api/assignments";
import type { PhonemeTarget } from "@/lib/minigame-sdk/types";

export default function PhonemeTagsPage() {
  const [learnerId, setLearnerId] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSave = async (phonemes: PhonemeTarget[]) => {
    if (!learnerId.trim()) {
      setStatus("Enter a learner ID first.");
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await savePhonemeTags(
        learnerId.trim(),
        phonemes.map((p) => p.symbol),
      );
      setStatus(`Saved ${phonemes.length} target(s).`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalShell width="default" sidebarOffsetLg={72}>
      <h1 className="text-2xl font-bold mb-2">Phoneme Targets</h1>
      <p className="text-on-surface-variant mb-6">
        Tag priority phonemes for a learner. These feed the adaptive game engine.
      </p>

      <label className="block mb-6">
        <span className="text-sm font-medium">Learner ID</span>
        <input
          value={learnerId}
          onChange={(e) => setLearnerId(e.target.value)}
          placeholder="learner uuid"
          className="mt-1 w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-2.5"
        />
      </label>

      <PhonemeTagger onSave={handleSave} saving={saving} />

      {status && (
        <p className="mt-4 text-sm text-on-surface-variant">{status}</p>
      )}
    </PortalShell>
  );
}
