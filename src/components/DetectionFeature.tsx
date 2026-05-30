
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile } from "@/lib/userProfileStore";
import "../App.css";

// Simulate an async API call for Detection
export default function DetectionFeature({ onComplete }: { onComplete: (result: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setResult(null);
    try {
      const user = getUserProfile();
      // Insert a new pronunciation_results row for this user (dummy data)
      const { error } = await supabase.from('pronunciation_results').insert({
        user_id: user.user_id,
        intended_phonemes: [],
        intended_text: 'test',
        spoken_phonemes: [],
      });
      if (error) {
        setResult('Error: ' + error.message);
      } else {
        setResult('Detection Complete! No issues found.');
      }
    } catch (e: any) {
      setResult('Error: ' + (e?.message || 'Unknown error'));
    }
    setLoading(false);
  };

  return (
    <div className="detection-feature">
      <h2 className="detection-title">🕵️ Detection</h2>
      <p className="detection-desc">Start the detection process. (Replace with your real UI/API)</p>
      {!result ? (
        <button className="detection-btn" onClick={handleStart} disabled={loading}>
          {loading ? 'Detecting...' : 'Start Detection'}
        </button>
      ) : (
        <>
          <div className="detection-result">{result}</div>
          <button className="detection-btn" onClick={() => onComplete(result)}>Continue</button>
        </>
      )}
    </div>
  );
}
