import React, { useEffect, useRef, useState } from 'react';

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

const PhoneticChallenge: React.FC<Props> = ({ data, onResult }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

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
    <div style={{ border: '1px solid #2196f3', borderRadius: 8, padding: 16, margin: '16px 0' }}>
      <div style={{ marginBottom: 8, fontSize: 12, color: '#2d3748', textTransform: 'uppercase' }}>
        {categoryLabel}挑戰
      </div>
      <div style={{ marginBottom: 8 }}>{data.question}</div>

      {data.type === 'audio-tone' && (
        <button
          onClick={playAudioPrompt}
          disabled={submitted}
          style={{
            background: '#0ea5e9',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 12px',
            cursor: submitted ? 'not-allowed' : 'pointer',
            marginBottom: 10,
          }}
        >
          {isPlayingAudio ? '播放中...' : '播放聲調音檔'}
        </button>
      )}

      {isChoiceType ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          {(data.options || []).map((opt) => (
            <button
              key={opt}
              style={{
                background: selected === opt ? '#2196f3' : '#eee',
                color: selected === opt ? '#fff' : '#333',
                border: '1px solid #2196f3',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer',
              }}
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
          style={{
            width: '100%',
            maxWidth: 320,
            border: '1px solid #2196f3',
            borderRadius: 6,
            padding: '8px 10px',
            marginBottom: 8,
          }}
        />
      )}

      <div style={{ marginBottom: 8, color: '#4b5563', fontSize: 13 }}>
        用時：{(elapsedMs / 1000).toFixed(1)}秒
      </div>

      {data.hint && !submitted && (
        <div style={{ marginBottom: 8, color: '#4a5568', fontSize: 13 }}>提示：{data.hint}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={(isChoiceType ? !selected : !inputValue.trim()) || submitted}
        style={{ background: '#2196f3', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px' }}
      >
        提交
      </button>
      {submitted && (
        <>
          <div style={{ marginTop: 8, color: isCorrect ? 'green' : 'red' }}>
            {isCorrect ? '答啱啦！' : `未答中，正確答案：${data.answer}`}
          </div>
          {data.explanation && (
            <div style={{ marginTop: 4, color: '#2d3748', fontSize: 13 }}>{data.explanation}</div>
          )}
        </>
      )}
    </div>
  );
};

export default PhoneticChallenge;
