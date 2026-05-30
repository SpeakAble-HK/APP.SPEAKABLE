
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile } from "@/lib/userProfileStore";
import "../App.css";

// Simulate an async API call for AI Cloning
export default function AICloningFeature({ onComplete }: { onComplete: (result: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setResult(null);
    try {
      const user = getUserProfile();
      // Insert a new voice_profiles row for this user
      const { error } = await supabase.from('voice_profiles').insert({ user_id: user.user_id });
      if (error) {
        setResult('Error: ' + error.message);
      } else {
        setResult('AI Cloning Complete! Your avatar is ready.');
      }
    } catch (e: any) {
      setResult('Error: ' + (e?.message || 'Unknown error'));
    }
    setLoading(false);
  };

  return (
    <div className="ai-cloning-feature">
      <h2 className="ai-cloning-title">🧬 AI Cloning</h2>
      <p className="ai-cloning-desc">Start the AI cloning process. (Replace with your real UI/API)</p>
      {!result ? (
        <button className="ai-cloning-btn" onClick={handleStart} disabled={loading}>
          {loading ? 'Cloning...' : 'Start Cloning'}
        </button>
      ) : (
        <>
          <div className="ai-cloning-result">{result}</div>
          <button className="ai-cloning-btn" onClick={() => onComplete(result)}>Continue</button>
        </>
      )}
    </div>
  );
}
