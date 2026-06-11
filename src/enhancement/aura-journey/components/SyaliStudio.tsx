import React, { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Play, RotateCcw, Sparkles, StopCircle } from "lucide-react";
import "./SyaliStudio.css";

type StarterWord = {
  id: "maa" | "baa";
  word: string;
  jyutping: string;
  prompt: string;
  modelLine: string;
  baseScore: number;
};

type AnalysisResult = {
  userAccuracy: number;
  cloneAccuracy: number;
  tone: number;
  clarity: number;
};

const STARTER_WORDS: StarterWord[] = [
  {
    id: "maa",
    word: "媽媽",
    jyutping: "maa1 maa1",
    prompt: "雙唇輕輕合埋，聲音保持平穩。",
    modelLine: "皮皮會用你把聲示範「媽媽」，再俾你聽返。",
    baseScore: 82,
  },
  {
    id: "baa",
    word: "巴士",
    jyutping: "baa1 si2",
    prompt: "開頭 b 音要清楚，第二個字聲調要向上。",
    modelLine: "皮皮會用你把聲示範「巴士」，再同原聲比較。",
    baseScore: 76,
  },
];

function clampScore(value: number) {
  return Math.max(55, Math.min(98, value));
}

export default function SyaliStudio() {
  const [selectedWordId, setSelectedWordId] = useState<StarterWord["id"]>("maa");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [cloneReady, setCloneReady] = useState(false);
  const [status, setStatus] = useState("揀一個詞語，錄低你把聲，皮皮就會做示範回放。");
  const [attempts, setAttempts] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [recorderSupported, setRecorderSupported] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const selectedWord = useMemo(
    () => STARTER_WORDS.find((word) => word.id === selectedWordId) ?? STARTER_WORDS[0],
    [selectedWordId],
  );

  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, [recordedUrl]);

  const createMockAnalysis = () => {
    const attemptBoost = Math.min(attempts * 2, 8);
    const wordOffset = selectedWord.id === "maa" ? 4 : -1;
    const userAccuracy = clampScore(selectedWord.baseScore + attemptBoost + wordOffset);
    const cloneAccuracy = clampScore(userAccuracy + 8);

    setAnalysis({
      userAccuracy,
      cloneAccuracy,
      tone: clampScore(userAccuracy - 3),
      clarity: clampScore(userAccuracy + 2),
    });
  };

  const handleWordSelect = (wordId: StarterWord["id"]) => {
    setSelectedWordId(wordId);
    setCloneReady(false);
    setAnalysis(null);
    setStatus("新詞語已準備好，按錄音開始收集聲音樣本。");
  };

  const startRecording = async () => {
    setCloneReady(false);
    setAnalysis(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecorderSupported(false);
      setStatus("呢個瀏覽器未開到錄音；而家會用模擬聲音樣本繼續測試流程。");
      setAttempts((count) => count + 1);
      window.setTimeout(() => {
        setCloneReady(true);
        createMockAnalysis();
        setStatus("人工智能模型已完成模擬分析，可以睇準確度同聽回放。");
      }, 900);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        setAttempts((count) => count + 1);
        setStatus("人工智能模型處理緊聲音樣本，同步建立皮皮回放。");

        window.setTimeout(() => {
          setCloneReady(true);
          createMockAnalysis();
          setStatus("皮皮示範已準備好，可以聽返你把聲同模型回放。");
        }, 900);
      };

      recorder.start();
      setIsRecording(true);
      setStatus(`錄音中：請清楚講「${selectedWord.word}」。`);
    } catch {
      setStatus("未能開啟咪高峰；請檢查瀏覽器錄音權限。");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const playAudio = (mode: "original" | "clone") => {
    if (mode === "clone") {
      setStatus(`皮皮用你把聲示範：「${selectedWord.word}」。目前係開發模擬回放。`);
    }

    if (!recordedUrl) {
      setStatus("未有錄音樣本；先錄一次聲再聽返。");
      return;
    }

    const audio = new Audio(recordedUrl);
    void audio.play();
  };

  const resetSession = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setCloneReady(false);
    setAnalysis(null);
    setIsRecording(false);
    setStatus("已重設，揀詞語再錄一次。");
  };

  return (
    <div className="syali-studio-root">
      <div className="syali-header">
        <h1>皮皮小幫手</h1>
        <h2>用兩個廣東話詞語建立聲音樣本，聽返人工智能模型示範。</h2>
      </div>

      <div className="syali-main">
        <div className="syali-left-panel">
          <div className="syali-card">
            <h3>選擇開聲詞語</h3>
            <p>先用兩個短詞收集聲音特徵，方便皮皮做聲音複製同準確度比較。</p>
            <div className="starter-word-grid">
              {STARTER_WORDS.map((word) => (
                <button
                  key={word.id}
                  type="button"
                  className={selectedWordId === word.id ? "active" : ""}
                  onClick={() => handleWordSelect(word.id)}
                >
                  <span>{word.word}</span>
                  <small>{word.jyutping}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="syali-card">
            <h3>皮皮提示</h3>
            <p>{selectedWord.prompt}</p>
            <div className="model-note">{selectedWord.modelLine}</div>
          </div>
        </div>

        <div className="syali-card syali-practice">
          <h3>聲音複製練習</h3>
          <p>呢個開發版本唔用嘴型偵測，只測試錄音、人工智能模型分析、皮皮回放同準確度流程。</p>

          <div className="ai-model-panel">
            <Sparkles size={34} aria-hidden="true" />
            <div>
              <div className="ai-model-title">人工智能模型準備中</div>
              <div className="ai-model-word">{selectedWord.word}</div>
              <div className="ai-model-subtitle">{selectedWord.jyutping}</div>
            </div>
          </div>

          <div className="recording-controls">
            <button
              type="button"
              className={`speak-btn${isRecording ? " listening" : ""}`}
              onClick={isRecording ? stopRecording : startRecording}
              aria-label={isRecording ? "停止錄音" : "開始錄音"}
            >
              {isRecording ? <StopCircle size={34} /> : <Mic size={34} />}
            </button>
            <p>{status}</p>
          </div>

          <div className="playback-actions">
            <button type="button" onClick={() => playAudio("original")} disabled={!recordedUrl}>
              <Play size={18} />
              聽返原聲
            </button>
            <button type="button" onClick={() => playAudio("clone")} disabled={!cloneReady && recorderSupported}>
              <Sparkles size={18} />
              聽皮皮示範
            </button>
            <button type="button" onClick={resetSession}>
              <RotateCcw size={18} />
              重新錄音
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{analysis ? `${analysis.userAccuracy}%` : "--"}</div>
              <div className="stat-label">原聲準確度</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{analysis ? `${analysis.cloneAccuracy}%` : "--"}</div>
              <div className="stat-label">皮皮示範匹配</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{analysis ? `${analysis.tone}%` : "--"}</div>
              <div className="stat-label">聲調</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{analysis ? `${analysis.clarity}%` : "--"}</div>
              <div className="stat-label">清晰度</div>
            </div>
          </div>

          <div className="parallel-analysis">
            <strong>並行檢測</strong>
            <span>原聲樣本同皮皮示範會同時送入模型比較，方便你之後接駁真正 AI 準確度 API。</span>
          </div>
        </div>
      </div>
    </div>
  );
}
