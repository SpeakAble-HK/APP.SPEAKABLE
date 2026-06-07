
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile } from "@/lib/userProfileStore";
import styles from "./FeatureModal.module.css";

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
        setResult('偵測失敗：' + error.message);
      } else {
        setResult('偵測完成！系統已記錄你嘅發音結果。');
      }
    } catch (e: any) {
      setResult('偵測失敗：' + (e?.message || '未知錯誤'));
    }
    setLoading(false);
  };

  return (
    <div className={styles["detection-feature"]}>
      <h2 className={styles["detection-title"]}>🕵️ AI 發音偵測</h2>
      <p className={styles["detection-desc"]}>開始進行發音偵測，分析你嘅粵語發音表現。</p>
      {!result ? (
        <button className={styles["detection-btn"]} onClick={handleStart} disabled={loading}>
          {loading ? '偵測中...' : '開始偵測'}
        </button>
      ) : (
        <>
          <div className={styles["detection-result"]}>{result}</div>
          <button className={styles["detection-btn"]} onClick={() => onComplete(result)}>完成並返回</button>
        </>
      )}
    </div>
  );
}
