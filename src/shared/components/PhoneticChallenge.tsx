import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getVoiceSample } from '@/shared/hooks/useVoiceSampleStore';

export type PhoneticChallengeData = {
  id: number;
  category: 'tone' | 'initial' | 'final';
  type: 'multiple-choice' | 'text-input' | 'audio-tone';
  question: string;
  options?: string[];
  answer: string;
  hint?: string;
  explanation?: string;
  audioText?: string;
  audioUrl?: string;
};

export type PhoneticChallengeResult = {
  correct: boolean;
  elapsedMs: number;
};

type Props = {
  data: PhoneticChallengeData;
  onResult: (result: PhoneticChallengeResult) => void;
};

async function pcGetAuthToken(): Promise<string> {
  let { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.session?.access_token) throw new Error("No session");
    session = data.session;
  }
  return session.access_token;
}

async function pcCallASR(audioBlob: Blob): Promise<string> {
  const token = await pcGetAuthToken();
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const fd = new FormData();
  fd.append('audio', audioBlob, 'recording.webm');
  fd.append('language', 'yue');
  const res = await fetch(`${projectUrl}/functions/v1/asr`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: fd,
  });
  if (!res.ok) throw new Error(`ASR failed (${res.status})`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'ASR failed');
  return (data.result as [string, string | null][])
    .map(([char]) => char)
    .join('');
}

const PhoneticChallenge: React.FC<Props> = ({ data, onResult }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [asrLoading, setAsrLoading] = useState(false);
  const [asrText, setAsrText] = useState<string | null>(null);
  const [vcLoading, setVcLoading] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    const interval = window.setInterval(() => {
      if (!submitted) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, [data.id, submitted]);

  const normalizeAnswer = (value: string) => value.trim().toLowerCase();

  const playAudioPrompt = async () => {
    try {
      if (data.audioUrl) {
        setIsPlayingAudio(true);
        const audio = new Audio(data.audioUrl);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => setIsPlayingAudio(false);
        await audio.play();
        return;
      }

      const text = data.audioText || data.question;
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-HK';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const handleStartASR = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/webm' });
        setAsrLoading(true);
        try {
          const transcript = await pcCallASR(blob);
          setAsrText(transcript);
          if (data.type === 'text-input') {
            setInputValue(transcript);
          } else {
            const matched = (data.options || []).find(
              (opt) => transcript.includes(opt) || opt.includes(transcript)
            );
            if (matched) setSelected(matched);
          }
        } catch {
          setAsrText('辨識失敗');
        } finally {
          setAsrLoading(false);
        }
      };
      mr.start();
      setIsRecording(true);
      setAsrText(null);
    } catch {
      setAsrText('無法存取麥克風');
    }
  };

  const handleStopASR = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleVoiceCloneSpeak = async () => {
    setVcLoading(true);
    try {
      const sample = await getVoiceSample('sample1');
      const text = data.audioText || data.question;
      if (!sample) {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'zh-HK';
          u.rate = 0.8;
          window.speechSynthesis.speak(u);
        }
        return;
      }
      const token = await pcGetAuthToken();
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const fd = new FormData();
      fd.append('text', text);
      fd.append('prompt_text', text);
      fd.append('prompt_audio', sample, 'voice-sample.webm');
      const res = await fetch(`${projectUrl}/functions/v1/voice-clone`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: fd,
      });
      if (!res.ok) throw new Error('voice-clone failed');
      const respData = await res.json();
      if (!respData.audio_base64 || !respData.content_type) throw new Error('No audio');
      const raw = atob(respData.audio_base64);
      const u8 = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
      const audioBlob = new Blob([u8], { type: respData.content_type });
      const url = URL.createObjectURL(audioBlob);
      const a = new Audio(url);
      a.onended = () => URL.revokeObjectURL(url);
      a.onerror = () => URL.revokeObjectURL(url);
      await a.play();
    } catch {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(data.audioText || data.question);
        u.lang = 'zh-HK';
        u.rate = 0.8;
        window.speechSynthesis.speak(u);
      }
    } finally {
      setVcLoading(false);
    }
  };

  const handleSubmit = () => {
    const answer = data.type === 'text-input' ? inputValue : selected || '';
    const correct = normalizeAnswer(answer) === normalizeAnswer(data.answer);
    const finalElapsedMs = Date.now() - startedAtRef.current;
    setElapsedMs(finalElapsedMs);
    setIsCorrect(correct);
    setSubmitted(true);
    onResult({ correct, elapsedMs: finalElapsedMs });
  };

  const isChoiceType = data.type === 'multiple-choice' || data.type === 'audio-tone';
  const categoryLabel =
    data.category === 'tone' ? '聲調' : data.category === 'initial' ? '聲母' : '韻母';

  return (
    <div className="border border-blue-500 rounded-xl p-4 sm:p-5 my-4">
      <div className="mb-2 text-xs text-gray-700 uppercase font-semibold">
        {categoryLabel}挑戰
      </div>
      <div className="mb-3 text-sm sm:text-base">{data.question}</div>

      {data.type === 'audio-tone' && (
        <button
          onClick={playAudioPrompt}
          disabled={submitted}
          className="bg-sky-500 text-white border-none rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 cursor-pointer mb-2.5 font-semibold text-sm sm:text-base hover:bg-sky-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
        >
          {isPlayingAudio ? '播放中...' : '播放聲調音檔'}
        </button>
      )}

      {isChoiceType ? (
        <div className="flex gap-2 sm:gap-3 mb-3 flex-wrap">
          {(data.options || []).map((opt) => (
            <button
              key={opt}
              className={`border border-blue-500 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 cursor-pointer font-medium text-sm sm:text-base transition-colors min-h-[44px] ${
                selected === opt
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelected(opt)}
              disabled={submitted}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={submitted}
          placeholder="請輸入答案"
          className="w-full max-w-sm border border-blue-500 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 mb-3 text-sm sm:text-base min-h-[44px] disabled:opacity-50"
        />
      )}

      <div className="mb-2 text-gray-600 text-sm">
        用時：{(elapsedMs / 1000).toFixed(1)}秒
      </div>

      {data.hint && !submitted && (
        <div className="mb-3 text-gray-600 text-sm">{data.hint}</div>
      )}

      <div className="flex gap-2 sm:gap-3 mb-3 flex-wrap items-center">
        <button
          onClick={isRecording ? handleStopASR : handleStartASR}
          disabled={submitted || asrLoading}
          className={`border-none rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 cursor-pointer font-bold text-sm sm:text-base transition-colors min-h-[48px] ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {asrLoading ? '辨識中...' : isRecording ? '⏹ 停止' : '🎤 語音作答'}
        </button>
        <button
          onClick={handleVoiceCloneSpeak}
          disabled={submitted || vcLoading}
          className="bg-violet-500 text-white border-none rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 cursor-pointer font-bold text-sm sm:text-base hover:bg-violet-600 transition-colors min-h-[48px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {vcLoading ? '載入中...' : '🔊 語音複製'}
        </button>
        <button
          onClick={playAudioPrompt}
          disabled={submitted}
          className="bg-sky-500 text-white border-none rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 cursor-pointer font-bold text-sm sm:text-base hover:bg-sky-600 transition-colors min-h-[48px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPlayingAudio ? '播放中...' : '▶ 播放'}
        </button>
      </div>

      {asrText && (
        <div className="mb-3 text-sm text-blue-800 bg-blue-50 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg">
          語音辨識結果：{asrText}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={(isChoiceType ? !selected : !inputValue.trim()) || submitted}
        className="bg-blue-500 text-white border-none rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 font-bold text-sm sm:text-base hover:bg-blue-600 transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        提交
      </button>
      {submitted && (
        <>
          <div className={`mt-2 font-semibold text-sm sm:text-base ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '答啱啦！' : `未答中，正確答案：${data.answer}`}
          </div>
          {data.explanation && (
            <div className="mt-1 text-gray-700 text-sm">{data.explanation}</div>
          )}
        </>
      )}
    </div>
  );
};

export default PhoneticChallenge;
