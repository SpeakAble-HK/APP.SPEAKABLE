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
    <div className="w-full max-w-[1100px] mx-auto flex flex-col">
      {!compactHeader && <h2 className="mb-3 font-bold text-lg sm:text-xl">皮皮旅程</h2>}
      <p className="mb-3 text-slate-600 font-semibold text-sm sm:text-base">
        目前分數：{score}｜連勝：{streak}（最佳 {bestStreak}）｜錯誤次數：{mistakes}｜歷險印記：{progressLabel}
      </p>
      {lastRoundPoints !== null && (
        <p className="mb-2 text-gray-800 text-sm">
          上一題得分：{lastRoundPoints}（{lastRoundBreakdown}）
        </p>
      )}
      {!compactHeader && (
        <p className="mb-4 text-slate-600 text-sm sm:text-base">
          皮皮小幫手會先幫你準備好，再帶你進入皮皮旅程。跟住發光歷險印記完成廣東話發音挑戰，答啱就會推進到下一站。
        </p>
      )}
      <div
        className="flex items-center gap-2 mb-3 px-2.5 py-2 rounded-lg border border-dashed border-sky-300 bg-sky-50 w-fit"
      >
        <span className="text-xs font-bold text-blue-900 uppercase">管理員</span>
        <label htmlFor="audio-take-select" className="text-sm text-gray-800">音檔版本</label>
        <select
          id="audio-take-select"
          aria-label="音檔版本選擇"
          value={audioTake}
          onChange={(event) => handleAudioTakeChange(event.target.value as AudioTakeKey)}
          className="border border-sky-300 rounded-lg px-2 py-1.5 bg-white text-sm"
        >
          {Object.entries(audioTakeMap).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div className={`rounded-xl p-3 border ${auraStoryUnlocked ? "border-sky-200 bg-cyan-50" : "border-slate-200 bg-slate-50"}`}>
          <button
            type="button"
            onClick={() => navigate("/aura-story")}
            disabled={!auraStoryUnlocked}
            className={`float-right rounded-lg px-3 py-2 font-bold transition-colors ${
              auraStoryUnlocked
                ? "bg-sky-600 text-white hover:bg-sky-700 cursor-pointer"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            Open
          </button>
          <strong>{auraStoryUnlocked ? "靈光故事（已點亮）" : "靈光故事（未點亮）"}</strong>
          <div className="mt-1.5 text-slate-600 text-sm">{auraStoryUnlocked ? "森林故事任務已解鎖。" : "等待治療師解鎖。"}</div>
        </div>
        <div className={`rounded-xl p-3 border ${auraJourneyUnlocked ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`}>
          <button
            type="button"
            onClick={() => navigate("/aura-journey")}
            disabled={!auraJourneyUnlocked}
            className={`float-right rounded-lg px-3 py-2 font-bold transition-colors ${
              auraJourneyUnlocked
                ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            Open
          </button>
          <strong>{auraJourneyUnlocked ? "皮皮旅程（已點亮）" : "皮皮旅程（未點亮）"}</strong>
          <div className="mt-1.5 text-slate-600 text-sm">
            {auraJourneyUnlocked ? "皮皮小幫手已經準備好，十二章互動旅程已解鎖。" : "等待治療師解鎖，之後由皮皮小幫手帶你出發。"}
          </div>
        </div>
      </div>

      <div
        className="order-first relative w-full aspect-[16/9] sm:aspect-[16/7] min-h-[260px] sm:min-h-[300px] max-h-[min(480px,calc(100vh-180px))] mb-4 rounded-2xl overflow-hidden border border-black/10 bg-[#dff9d5] shadow-[0_12px_36px_rgba(2,132,199,0.2)]"
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
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-[130px] sm:w-[150px] lg:w-[170px] rounded-xl border ${
                isSelected ? "border-2 border-amber-500" : "border border-white/80"
              } bg-white/92 ${
                isSelected ? "shadow-[0_14px_30px_rgba(120,53,15,0.26)]" : "shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
              } p-2 sm:p-2.5 z-[5]`}
            >
              <button
                type="button"
                onClick={() => setActiveMiniGameId(game.id)}
                aria-pressed={isSelected}
                className="w-full flex items-center gap-1.5 sm:gap-2 border-none bg-transparent text-gray-800 font-extrabold text-left cursor-pointer p-0 text-xs sm:text-sm"
              >
                <span
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full grid place-items-center shrink-0 ${
                    isSelected ? "bg-amber-500" : "bg-sky-500"
                  } text-white`}
                >
                  <Gamepad2 size={15} className="sm:w-4 sm:h-4" />
                </span>
                <span className="leading-tight">{game.name}</span>
              </button>
              <select
                value={selectedLevel}
                onChange={(event) => {
                  setActiveMiniGameId(game.id);
                  setSelectedDifficulty((prev) => ({ ...prev, [game.id]: event.target.value }));
                }}
                aria-label={`${game.name} 難度選擇`}
                className="mt-2 w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-xs"
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
                className={`mt-2 w-full rounded-lg px-2 py-1.5 sm:py-2 text-xs font-extrabold transition-colors ${
                  canStartMiniGames
                    ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                {canStartMiniGames ? "開始" : "完成地圖後開放"}
              </button>
            </div>
          );
        })}

        {activeMiniGameSession && (
          <div
            className="absolute right-3 sm:right-4 bottom-20 sm:bottom-24 w-[min(260px,calc(100%-24px))] sm:w-[min(280px,calc(100%-28px))] rounded-xl border border-green-600/35 bg-green-50/94 shadow-[0_14px_30px_rgba(15,23,42,0.2)] p-3 z-[7]"
          >
            <strong className="block text-green-900 mb-1 text-sm">
              {activeMiniGameSession.name}
            </strong>
            <div className="text-green-800 text-xs sm:text-sm mb-2.5">
              Mock dev 已開放：{activeMiniGameSession.level}
            </div>
            <button
              type="button"
              onClick={() => setActiveMiniGameSession(null)}
              className="border-none rounded-lg bg-green-700 text-white px-2.5 py-1.5 sm:py-2 text-xs font-extrabold cursor-pointer hover:bg-green-800 transition-colors"
            >
              收起
            </button>
          </div>
        )}

        <div
          className="absolute left-3 right-3 sm:left-4 sm:right-4 bottom-3 flex gap-2 items-center overflow-x-auto p-2.5 sm:p-3 rounded-xl border border-white/70 bg-white/90 shadow-[0_10px_28px_rgba(15,23,42,0.18)] z-[6]"
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
          className="absolute right-3 sm:right-4 top-3 sm:top-4 w-[min(220px,calc(100%-24px))] sm:w-[min(250px,calc(100%-28px))] rounded-xl border border-white/70 bg-white/88 p-2.5 sm:p-3 text-slate-600 text-xs shadow-[0_10px_28px_rgba(15,23,42,0.16)] z-[5]"
        >
          <strong className="block mb-1.5 text-slate-900 text-sm">原版 Speakable 小遊戲</strong>
          {legacyGames.map((item) => (
            <div key={item} className="mb-1">{item}</div>
          ))}
        </div>
      </div>

      {showChallenge && <PhoneticChallenge data={checkpoints[currentCheckpoint]} onResult={handleChallengeResult} />}

      {completed && <div className="text-green-700 font-bold text-sm sm:text-base">恭喜你！你完成咗皮皮旅程主線任務，總分 {score}。</div>}
    </div>
  );
};

export default TreasureMap;
