import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// 校準數據型別
const calibrationFields = [
  { key: 'avgTapDurationMs', label: '平均點擊時長 (毫秒)' },
  { key: 'avgJitterPx', label: '平均抖動 (像素)' },
  { key: 'avgPressure', label: '平均壓力' },
  { key: 'responseLatencyMs', label: '反應延遲 (毫秒)' },
  { key: 'inhibitionErrors', label: '抑制錯誤次數' },
  { key: 'gazeAccuracyPx', label: '注視準確度 (像素)' },
  { key: 'visualProcessingSpeed', label: '視覺處理速度' },
];

const therapistCalibration = {
  name: '黃治療師',
  profile: {
    avgTapDurationMs: 120,
    avgJitterPx: 5,
    avgPressure: 0.7,
    responseLatencyMs: 320,
    inhibitionErrors: 0,
    gazeAccuracyPx: 18,
    visualProcessingSpeed: '快',
  },
  voiceCloneReady: true,
};

const TherapistCalibration: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [text, setText] = useState('請輸入校準語音對白（例如：你好，我是黃治療師）');
  const [status, setStatus] = useState<'idle'|'uploading'|'success'|'error'>('idle');
  const [message, setMessage] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleVoiceClone = async () => {
    if (!audioFile || !text.trim()) {
      setMessage('請上傳音訊檔案並輸入對白');
      setStatus('error');
      return;
    }
    setStatus('uploading');
    setMessage('語音複製中，請稍候...');
    try {
      const formData = new FormData();
      formData.append('prompt_audio', audioFile);
      formData.append('text', text);
      formData.append('prompt_text', text);
      // 自動取得 Supabase token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) {
        setStatus('error');
        setMessage('無法取得登入權杖，請重新登入。');
        return;
      }
      const token = sessionData.session.access_token;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/voice-clone`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.audio_base64) {
        const voiceCloneUrl = `data:${data.content_type};base64,${data.audio_base64}`;
        setAudioUrl(voiceCloneUrl);
        // 上傳審計紀錄
        const { data: user } = await supabase.auth.getUser();
        const userId = user?.user?.id || '';
        await supabase.from('calibration_audit').insert({
          user_id: userId,
          therapist_name: therapistCalibration.name,
          calibration_profile: therapistCalibration.profile,
          voice_clone_url: voiceCloneUrl,
        });
        setStatus('success');
        setMessage('語音複製成功！已記錄校準審計，可用於學生練習及個人化校準。');
      } else {
        setStatus('error');
        setMessage(data.error || '語音複製失敗，請重試。');
      }
    } catch (e) {
      setStatus('error');
      setMessage('語音複製失敗，請檢查網絡或稍後再試。');
    }
  };

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6366f1', marginBottom: 12 }}>🧑‍⚕️ 治療師校準數據</h2>
      <p style={{ color: '#6b7280', marginBottom: 8 }}>本校準數據作為語音複製及學生校準的黃金標準。</p>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px #e5e7eb', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>治療師：{therapistCalibration.name}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
          <tbody>
            {calibrationFields.map(f => (
              <tr key={f.key}>
                <td style={{ padding: 8, color: '#64748b', width: 180 }}>{f.label}</td>
                <td style={{ padding: 8 }}>{therapistCalibration.profile[f.key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginBottom: 12 }}>
          <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files?.[0] || null)} />
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={2}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <button
          style={{ background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer' }}
          onClick={handleVoiceClone}
          disabled={status === 'uploading'}
        >
          {status === 'uploading' ? '語音複製中...' : '啟用語音複製（黃金標準）'}
        </button>
        {message && (
          <div style={{ marginTop: 16, color: status === 'success' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{message}</div>
        )}
        {audioUrl && (
          <audio controls src={audioUrl} style={{ marginTop: 12, width: '100%' }} />
        )}
      </div>
    </section>
  );
};

export default TherapistCalibration;
