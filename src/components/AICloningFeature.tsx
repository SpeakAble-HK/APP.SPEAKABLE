
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile } from "@/lib/userProfileStore";
import { getVoiceCloneWord } from "@/lib/therapistMissionConfig";
import styles from "./FeatureModal.module.css";

// Simulate an async API call for AI Cloning
export default function AICloningFeature({ onComplete }: { onComplete: (result: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const voiceWord = getVoiceCloneWord();

  const handleStart = async () => {
    setLoading(true);
    setResult(null);
    try {
      const user = getUserProfile();
      // Insert a new voice_profiles row for this user
      const { error } = await supabase.from('voice_profiles').insert({ user_id: user.user_id });
      if (error) {
        setResult('聲線複製失敗：' + error.message);
      } else {
        setResult(`聲線複製完成！已根據「${voiceWord}」建立你嘅語音樣本。`);
      }
    } catch (e: any) {
      setResult('聲線複製失敗：' + (e?.message || '未知錯誤'));
    }
    setLoading(false);
  };

  return (
    <div className={styles["ai-cloning-feature"]}>
      <h2 className={styles["ai-cloning-title"]}>🧬 Voice Cloning 聲線複製</h2>
      <p className={styles["ai-cloning-desc"]}>治療師已設定練習字詞：{voiceWord}</p>
      {!result ? (
        <button className={styles["ai-cloning-btn"]} onClick={handleStart} disabled={loading}>
          {loading ? '複製中...' : '開始聲線複製'}
        </button>
      ) : (
        <>
          <div className={styles["ai-cloning-result"]}>{result}</div>
          <button className={styles["ai-cloning-btn"]} onClick={() => onComplete(result)}>完成並返回</button>
        </>
      )}
    </div>
  );
}
