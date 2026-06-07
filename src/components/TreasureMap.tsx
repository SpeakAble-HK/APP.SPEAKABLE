import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Checkpoint from "./Checkpoint";
import EnchantedForestMapScene from "./EnchantedForestMapScene";
import PhoneticChallenge, { PhoneticChallengeData, PhoneticChallengeResult } from "./PhoneticChallenge";
import { Gamepad2 } from "lucide-react";
import { getMiniGameConfig, isQuizGameEnabled } from "@/lib/miniGameConfigStore";
import {
  getAuraJourneyUnlocked,
  getAuraStoryUnlocked,
  isDevMockStudent,
} from "@/lib/therapistMissionConfig";
import pipiMascotUrl from "@/assets/pipi-mascot.png";
import styles from "./TreasureMap.module.css";

type AudioTakeKey = "default" | "rr" | "lh" | "set68";

const audioTakeMap: Record<AudioTakeKey, { label: string; maa1: string; maa5: string }> = {
  default: {
    label: "預設（69_h / 67_L）",
    maa1: "/assets/audio/cantonese/maa1.wav",
    maa5: "/assets/audio/cantonese/maa5.wav",
  },
  rr: {
    label: "替代 RR（69_R / 67_R）",
    maa1: "/assets/audio/cantonese/maa1_take_rr.wav",
    maa5: "/assets/audio/cantonese/maa5_take_rr.wav",
  },
  lh: {
    label: "替代 LH（69_L / 67_h）",
    maa1: "/assets/audio/cantonese/maa1_take_lh.wav",
    maa5: "/assets/audio/cantonese/maa5_take_lh.wav",
  },
  set68: {
    label: "替代 68（68_h / 68_L）",
    maa1: "/assets/audio/cantonese/maa1_take_68.wav",
    maa5: "/assets/audio/cantonese/maa5_take_68.wav",
  },
};

const buildCheckpoints = (audioTake: AudioTakeKey): PhoneticChallengeData[] => [
  {
    id: 1,
    category: "tone",
    type: "audio-tone",
    question: "聽音後揀聲調：『maa1』",
    options: ["1", "2", "3", "4", "5", "6"],
    answer: "1",
    hint: "高平調。按播放鍵聽清楚先答。",
    explanation: "maa1 係粵語第一聲，高而平。",
    audioText: "媽，一聲",
    audioUrl: audioTakeMap[audioTake].maa1,
  },
  {
    id: 2,
    category: "tone",
    type: "audio-tone",
    question: "聽音後揀聲調：『maa5』",
    options: ["2", "3", "4", "5", "6"],
    answer: "5",
    hint: "低升調。",
    audioText: "馬，五聲",
    audioUrl: audioTakeMap[audioTake].maa5,
  },
  {
    id: 3,
    category: "initial",
    type: "multiple-choice",
    question: "『爸』（baa1）嘅聲母係乜？",
    options: ["b", "p", "m", "f"],
    answer: "b",
    explanation: "Jyutping 中 baa1 以 b 作為聲母。",
  },
  {
    id: 4,
    category: "initial",
    type: "text-input",
    question: "請輸入『書』（syu1）嘅聲母。",
    answer: "s",
    hint: "諗吓 syu1 開頭個輔音。",
  },
  {
    id: 5,
    category: "final",
    type: "multiple-choice",
    question: "『光』（gwong1）嘅韻母係？",
    options: ["ong", "ung", "aang", "ing"],
    answer: "ong",
    hint: "去除聲母 gw。",
  },
  {
    id: 6,
    category: "tone",
    type: "multiple-choice",
    question: "『食』（sik6）係第幾聲？",
    options: ["1", "2", "3", "4", "5", "6"],
    answer: "6",
  },
];

const checkpointMapMarkers = [
  { left: "16%", top: "60%" },
  { left: "28%", top: "48%" },
  { left: "41%", top: "59%" },
  { left: "55%", top: "51%" },
  { left: "70%", top: "58%" },
  { left: "84%", top: "49%" },
];

const miniGames = [
  { id: "game-tone", name: "聲調快拍", levels: ["初級", "中級", "高級"], left: "20%", top: "24%" },
  { id: "game-mouth", name: "口型對對碰", levels: ["初級", "中級", "高級"], left: "49%", top: "27%" },
  { id: "game-rhythm", name: "節奏跟讀賽", levels: ["初級", "中級", "高級"], left: "68%", top: "24%" },
];

const legacyGames = ["原版：拼音挑戰", "原版：節奏模仿", "原版：聲調追蹤"];

type TreasureMapProps = {
  compactHeader?: boolean;
};

const TreasureMap: React.FC<TreasureMapProps> = ({ compactHeader = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const miniGameConfig = user?.id ? getMiniGameConfig(user.id) : null;
  const visibleMiniGames = miniGames.filter((g) => isQuizGameEnabled(miniGameConfig, g.id));
  const [audioTake, setAudioTake] = useState<AudioTakeKey>("default");
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastRoundPoints, setLastRoundPoints] = useState<number | null>(null);
  const [lastRoundBreakdown, setLastRoundBreakdown] = useState<string>("");
  const [pipiJumpKey, setPipiJumpKey] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Record<string, string>>({});
  const [activeMiniGameId, setActiveMiniGameId] = useState(visibleMiniGames[0]?.id ?? miniGames[0].id);
  const [activeMiniGameSession, setActiveMiniGameSession] = useState<{ name: string; level: string } | null>(null);
  const checkpoints = useMemo(() => buildCheckpoints(audioTake), [audioTake]);

  const auraStoryUnlocked = getAuraStoryUnlocked();
  const auraJourneyUnlocked = getAuraJourneyUnlocked();
  const mockDevMiniGamesUnlocked = isDevMockStudent();

  const progressLabel = useMemo(() => `${currentCheckpoint + 1}/${checkpoints.length}`, [checkpoints.length, currentCheckpoint]);
  const currentMarker = checkpointMapMarkers[currentCheckpoint] ?? checkpointMapMarkers[0];
  const canStartMiniGames = completed || mockDevMiniGamesUnlocked;

  const getSpeedBonus = (elapsedMs: number) => {
    if (elapsedMs <= 4000) return 15;
    if (elapsedMs <= 8000) return 8;
    if (elapsedMs <= 12000) return 3;
    return 0;
  };

  const handleCheckpointClick = (index: number) => {
    if (index !== currentCheckpoint || completed) {
      return;
    }
    setShowChallenge(true);
  };

  const handleAudioTakeChange = (nextTake: AudioTakeKey) => {
    setAudioTake(nextTake);
    // Reset run to keep progress and scoring fair while A/B testing clips.
    setCurrentCheckpoint(0);
    setShowChallenge(false);
    setCompleted(false);
    setScore(0);
    setMistakes(0);
    setStreak(0);
    setBestStreak(0);
    setLastRoundPoints(null);
    setLastRoundBreakdown("");
    setPipiJumpKey(0);
  };

  const handleChallengeResult = ({ correct, elapsedMs }: PhoneticChallengeResult) => {
    setShowChallenge(false);

    if (correct) {
      const nextStreak = streak + 1;
      const streakBonus = nextStreak * 4;
      const speedBonus = getSpeedBonus(elapsedMs);
      const roundPoints = 10 + streakBonus + speedBonus;

      setScore((prev) => prev + roundPoints);
      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
      setLastRoundPoints(roundPoints);
      setLastRoundBreakdown(`+10 基礎分，+${streakBonus} 連勝分，+${speedBonus} 速度分`);

      if (currentCheckpoint < checkpoints.length - 1) {
        setPipiJumpKey((prev) => prev + 1);
        setCurrentCheckpoint((prev) => prev + 1);
      } else {
        setCompleted(true);
      }
      return;
    }

    setMistakes((prev) => prev + 1);
    setStreak(0);
    setLastRoundPoints(0);
    setLastRoundBreakdown("答錯：連勝已重設");
  };

  return (
    <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      {!compactHeader && <h2 style={{ marginBottom: 12, fontWeight: 700 }}>皮皮旅程</h2>}
      <p style={{ marginBottom: 12, color: "#334155", fontWeight: 600 }}>
        目前分數：{score}｜連勝：{streak}（最佳 {bestStreak}）｜錯誤次數：{mistakes}｜歷險印記：{progressLabel}
      </p>
      {lastRoundPoints !== null && (
        <p style={{ marginBottom: 10, color: "#1f2937", fontSize: 14 }}>
          上一題得分：{lastRoundPoints}（{lastRoundBreakdown}）
        </p>
      )}
      {!compactHeader && (
        <p style={{ marginBottom: 14, color: "#334155" }}>
          皮皮小幫手會先幫你準備好，再帶你進入皮皮旅程。跟住發光歷險印記完成廣東話發音挑戰，答啱就會推進到下一站。
        </p>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          padding: "8px 10px",
          borderRadius: 10,
          border: "1px dashed #93c5fd",
          background: "#eff6ff",
          width: "fit-content",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1e3a8a", textTransform: "uppercase" }}>管理員</span>
        <label htmlFor="audio-take-select" style={{ fontSize: 14, color: "#1f2937" }}>音檔版本</label>
        <select
          id="audio-take-select"
          aria-label="音檔版本選擇"
          value={audioTake}
          onChange={(event) => handleAudioTakeChange(event.target.value as AudioTakeKey)}
          style={{ border: "1px solid #93c5fd", borderRadius: 8, padding: "6px 8px", background: "#fff" }}
        >
          {Object.entries(audioTakeMap).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 14, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div style={{ borderRadius: 12, padding: 12, border: "1px solid #bae6fd", background: auraStoryUnlocked ? "#ecfeff" : "#f8fafc" }}>
          <button
            type="button"
            onClick={() => navigate("/aura-story")}
            disabled={!auraStoryUnlocked}
            style={{ float: "right", border: "none", borderRadius: 10, padding: "8px 12px", background: auraStoryUnlocked ? "#0284c7" : "#cbd5e1", color: auraStoryUnlocked ? "#fff" : "#64748b", fontWeight: 700, cursor: auraStoryUnlocked ? "pointer" : "not-allowed" }}
          >
            Open
          </button>
          <strong>{auraStoryUnlocked ? "靈光故事（已點亮）" : "靈光故事（未點亮）"}</strong>
          <div style={{ marginTop: 6, color: "#475569" }}>{auraStoryUnlocked ? "森林故事任務已解鎖。" : "等待治療師解鎖。"}</div>
        </div>
        <div style={{ borderRadius: 12, padding: 12, border: "1px solid #bbf7d0", background: auraJourneyUnlocked ? "#f0fdf4" : "#f8fafc" }}>
          <button
            type="button"
            onClick={() => navigate("/aura-journey")}
            disabled={!auraJourneyUnlocked}
            style={{ float: "right", border: "none", borderRadius: 10, padding: "8px 12px", background: auraJourneyUnlocked ? "#16a34a" : "#cbd5e1", color: auraJourneyUnlocked ? "#fff" : "#64748b", fontWeight: 700, cursor: auraJourneyUnlocked ? "pointer" : "not-allowed" }}
          >
            Open
          </button>
          <strong>{auraJourneyUnlocked ? "皮皮旅程（已點亮）" : "皮皮旅程（未點亮）"}</strong>
          <div style={{ marginTop: 6, color: "#475569" }}>
            {auraJourneyUnlocked ? "皮皮小幫手已經準備好，十二章互動旅程已解鎖。" : "等待治療師解鎖，之後由皮皮小幫手帶你出發。"}
          </div>
        </div>
      </div>

      <div
        style={{
          order: -1,
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 6",
          minHeight: 280,
          maxHeight: "min(430px, calc(100vh - 150px))",
          marginBottom: 18,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.08)",
          background: "#dff9d5",
          boxShadow: "0 12px 36px rgba(2, 132, 199, 0.2)",
        }}
      >
        <EnchantedForestMapScene />

        <div
          key={`pipi-marker-${pipiJumpKey}`}
          aria-hidden="true"
          className={`${styles.pipiMarker} ${pipiJumpKey > 0 ? styles.pipiJump : ""}`}
          style={{
            position: "absolute",
            left: currentMarker.left,
            top: currentMarker.top,
          }}
        >
          <img className={styles.pipiImage} src={pipiMascotUrl} alt="" />
        </div>

        {checkpointMapMarkers.map((marker, idx) => {
          const isActive = idx === currentCheckpoint;
          const isDone = idx < currentCheckpoint;
          const markerClassName = [
            styles.checkpointGlow,
            isDone ? styles.checkpointDone : isActive ? styles.checkpointActive : styles.checkpointLocked,
          ].join(" ");
          return (
            <button
              key={`map-marker-${idx}`}
              type="button"
              aria-label={`歷險印記 ${idx + 1}`}
              onClick={() => handleCheckpointClick(idx)}
              disabled={!isActive || completed}
              className={markerClassName}
              style={{
                position: "absolute",
                left: marker.left,
                top: marker.top,
                transform: "translate(-50%, -50%)",
                cursor: isActive && !completed ? "pointer" : "default",
              }}
            />
          );
        })}

        {visibleMiniGames.map((game) => {
          const isSelected = activeMiniGameId === game.id;
          const selectedLevel = selectedDifficulty[game.id] || game.levels[0];

          return (
            <div
              key={game.id}
              style={{
                position: "absolute",
                left: game.left,
                top: game.top,
                transform: "translate(-50%, -50%)",
                width: 150,
                borderRadius: 12,
                border: isSelected ? "2px solid #f59e0b" : "1px solid rgba(255,255,255,0.78)",
                background: "rgba(255,255,255,0.92)",
                boxShadow: isSelected ? "0 14px 30px rgba(120, 53, 15, 0.26)" : "0 8px 20px rgba(15, 23, 42, 0.18)",
                padding: 10,
                zIndex: 5,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveMiniGameId(game.id)}
                aria-pressed={isSelected}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  border: "none",
                  background: "transparent",
                  color: "#1f2937",
                  fontWeight: 800,
                  textAlign: "left",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    background: isSelected ? "#f59e0b" : "#0ea5e9",
                    color: "#fff",
                  }}
                >
                  <Gamepad2 size={17} />
                </span>
                <span style={{ lineHeight: 1.2 }}>{game.name}</span>
              </button>
              <select
                value={selectedLevel}
                onChange={(event) => {
                  setActiveMiniGameId(game.id);
                  setSelectedDifficulty((prev) => ({ ...prev, [game.id]: event.target.value }));
                }}
                aria-label={`${game.name} 難度選擇`}
                style={{
                  marginTop: 8,
                  width: "100%",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  padding: "6px 8px",
                  background: "#fff",
                  fontSize: 12,
                }}
              >
                {game.levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!canStartMiniGames) return;
                  setActiveMiniGameId(game.id);
                  setActiveMiniGameSession({ name: game.name, level: selectedLevel });
                }}
                disabled={!canStartMiniGames}
                style={{
                  marginTop: 8,
                  width: "100%",
                  border: "none",
                  borderRadius: 8,
                  padding: "7px 9px",
                  background: canStartMiniGames ? "#16a34a" : "#cbd5e1",
                  color: canStartMiniGames ? "#fff" : "#64748b",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: canStartMiniGames ? "pointer" : "not-allowed",
                }}
              >
                {canStartMiniGames ? "開始" : "完成地圖後開放"}
              </button>
            </div>
          );
        })}

        {activeMiniGameSession && (
          <div
            style={{
              position: "absolute",
              right: 14,
              bottom: 88,
              width: "min(280px, calc(100% - 28px))",
              borderRadius: 14,
              border: "1px solid rgba(22, 163, 74, 0.35)",
              background: "rgba(240,253,244,0.94)",
              boxShadow: "0 14px 30px rgba(15, 23, 42, 0.2)",
              padding: 12,
              zIndex: 7,
            }}
          >
            <strong style={{ display: "block", color: "#14532d", marginBottom: 4 }}>
              {activeMiniGameSession.name}
            </strong>
            <div style={{ color: "#166534", fontSize: 13, marginBottom: 10 }}>
              Mock dev 已開放：{activeMiniGameSession.level}
            </div>
            <button
              type="button"
              onClick={() => setActiveMiniGameSession(null)}
              style={{
                border: "none",
                borderRadius: 8,
                background: "#15803d",
                color: "#fff",
                padding: "7px 10px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              收起
            </button>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: 12,
            display: "flex",
            gap: 8,
            alignItems: "center",
            overflowX: "auto",
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.72)",
            background: "rgba(255,255,255,0.9)",
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.18)",
            zIndex: 6,
          }}
        >
          {checkpoints.map((cp, idx) => (
            <Checkpoint
              key={cp.id}
              active={idx === currentCheckpoint}
              completed={idx < currentCheckpoint}
              onClick={() => handleCheckpointClick(idx)}
              label={`歷險印記 ${idx + 1}`}
              compact
            />
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            right: 14,
            top: 14,
            width: "min(250px, calc(100% - 28px))",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.7)",
            background: "rgba(255,255,255,0.88)",
            padding: "10px 12px",
            color: "#334155",
            fontSize: 12,
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.16)",
            zIndex: 5,
          }}
        >
          <strong style={{ display: "block", marginBottom: 6, color: "#0f172a" }}>原版 Speakable 小遊戲</strong>
          {legacyGames.map((item) => (
            <div key={item} style={{ marginBottom: 4 }}>{item}</div>
          ))}
        </div>
      </div>

      {showChallenge && <PhoneticChallenge data={checkpoints[currentCheckpoint]} onResult={handleChallengeResult} />}

      {completed && <div style={{ color: "#1b7f3a", fontWeight: 700 }}>恭喜你！你完成咗皮皮旅程主線任務，總分 {score}。</div>}
    </div>
  );
};

export default TreasureMap;
