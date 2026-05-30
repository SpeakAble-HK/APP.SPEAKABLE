import React, { useState } from 'react';
import './SyaliStudio.css';

// Simple syllable splitter (demo only)
function splitSyllables(word: string) {
  if (word.toLowerCase() === 'butterfly') return 'but - ter - fly';
  if (word.toLowerCase() === 'elephant') return 'el - e - phant';
  if (!word) return '';
  return word.replace(/(.{2})/g, '$1 - ').replace(/ - $/, '');
}

const PRACTICE_WORDS = {
  easy: 'SUN',
  medium: 'GARDEN',
  hard: 'ELEPHANT',
};

export default function SyaliStudio() {
  const [word, setWord] = useState('');
  const [syllables, setSyllables] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [practiceLevel, setPracticeLevel] = useState<'easy'|'medium'|'hard'>('hard');
  const [listening, setListening] = useState(false);
  const [speakStatus, setSpeakStatus] = useState('');
  const [stats, setStats] = useState({ correct: 0, attempts: 0, lipsync: 0 });

  // Handlers
  const handleSplit = () => setSyllables(splitSyllables(word));
  const handlePracticeLevel = (level: 'easy'|'medium'|'hard') => setPracticeLevel(level);
  const handleCamera = () => setCameraOn(true);
  const handleSpeak = () => {
    if (listening) {
      setListening(false);
      setSpeakStatus('處理緊...');
      setTimeout(() => setSpeakStatus(''), 1500);
      setStats(s => ({ ...s, attempts: s.attempts + 1, correct: s.correct + 1 }));
    } else {
      setListening(true);
      setSpeakStatus('聆聽中...');
    }
  };

  // Accuracy calculation
  const accuracy = stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0;

  return (
    <div className="syali-studio-root">
      <div className="syali-header">
        <h1>🎤 Syali Studio</h1>
        <h2>同 Aura 隊長一齊練習分音節 🐾</h2>
      </div>
      <div className="syali-main">
        <div className="syali-left-panel">
          <div className="syali-card">
            <h3>📝 分音節小助手</h3>
            <p>輸入一個單詞，Aura 隊長會幫你分開音節！</p>
            <div className="syali-input-group">
              <input value={word} onChange={e => setWord(e.target.value)} placeholder="請輸入一個單詞" />
              <button onClick={handleSplit}>分音節</button>
            </div>
            <div className="syllable-output">{syllables}</div>
          </div>
        </div>
        <div className="syali-card syali-practice">
          <h3>🎯 開聲練習！</h3>
          <p>開鏡睇下自己嘴型，練習發音！</p>
          <div className={`camera-view${cameraOn ? ' active' : ''}`}> 
            {!cameraOn ? (
              <div>
                <h4>AI 嘴型鏡</h4>
                <button onClick={handleCamera}>開鏡</button>
                <p>撳「開鏡」就可以見到自己！<br/>AI 會追蹤你嘴型</p>
              </div>
            ) : (
              <div className="tracking-text">👄 AI 追蹤緊你嘴型！</div>
            )}
          </div>
          <h4>選擇練習難度：</h4>
          <div className="practice-levels">
            <button className={practiceLevel==='easy'?'active':''} onClick={()=>handlePracticeLevel('easy')}>簡單<br/><small>SUN</small></button>
            <button className={practiceLevel==='medium'?'active':''} onClick={()=>handlePracticeLevel('medium')}>中等<br/><small>GARDEN</small></button>
            <button className={practiceLevel==='hard'?'active':''} onClick={()=>handlePracticeLevel('hard')}>困難<br/><small>ELEPHANT</small></button>
          </div>
          <div className="practice-word-area">
            <p>練習呢個單詞：</p>
            <div className="practice-word-display">{PRACTICE_WORDS[practiceLevel]}</div>
            <button className={`speak-btn${listening?' listening':''}`} onClick={handleSpeak}>
              <span className="speak-btn-icon">🎤</span>
            </button>
            <p>{speakStatus || '\u00A0'}</p>
          </div>
          <div className="stats-grid">
            <div className="stat-item"><div className="stat-value">{stats.correct}</div><div className="stat-label">正確</div></div>
            <div className="stat-item"><div className="stat-value">{stats.attempts}</div><div className="stat-label">嘗試</div></div>
            <div className="stat-item"><div className="stat-value">{accuracy}%</div><div className="stat-label">準確率</div></div>
            <div className="stat-item"><div className="stat-value">{stats.lipsync}%</div><div className="stat-label">嘴型同步</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
