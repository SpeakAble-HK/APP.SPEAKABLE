import { useState, useEffect } from "react";
import { Gamepad2, Volume2, Mic2, Waves, Trees, Sparkles } from "lucide-react";
import styles from "@/pages/TherapistPortalPage.module.css";
import {
  getMiniGameConfig, setMiniGameConfig,
  GAME_LABELS, GAME_EMOJIS, DIFFICULTY_LABELS,
  type Difficulty, type MiniGameConfig, type GameId,
} from "@/lib/miniGameConfigStore";

interface Props {
  studentId: string;
  studentName: string;
}

const ACCENT_BLUE = "#2563eb";
const ACCENT_GREEN = "#10b981";
const ACCENT_AMBER = "#f59e0b";

const QUIZ_GAMES: GameId[] = ["game-tone", "game-mouth", "game-rhythm"];
const ADAPT_GAMES: GameId[] = ["water-park", "maze", "fruit-ninja", "catch-fly"];

export default function MiniGameConfigPanel({ studentId, studentName }: Props) {
  const [config, setConfig] = useState<MiniGameConfig>(() => getMiniGameConfig(studentId));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(getMiniGameConfig(studentId));
    setSaved(false);
  }, [studentId]);

  const updateQuizGame = (gameId: GameId, patch: Partial<{ enabled: boolean; difficulty: Difficulty }>) => {
    setConfig((prev) => ({
      ...prev,
      quizGames: { ...prev.quizGames, [gameId]: { ...prev.quizGames[gameId as keyof typeof prev.quizGames], ...patch } },
    }));
    setSaved(false);
  };

  const updateAdaptGame = (gameId: GameId, patch: Partial<{ enabled: boolean; difficulty: Difficulty }>) => {
    setConfig((prev) => ({
      ...prev,
      adaptationGames: { ...prev.adaptationGames, [gameId]: { ...prev.adaptationGames[gameId as keyof typeof prev.adaptationGames], ...patch } },
    }));
    setSaved(false);
  };

  const togglePhoneme = (field: "initials" | "finals" | "tones") => {
    setConfig((prev) => ({
      ...prev,
      phonemeFocus: { ...prev.phonemeFocus, [field]: !prev.phonemeFocus[field] },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setMiniGameConfig(studentId, config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>
          <Gamepad2 size={18} color={ACCENT_BLUE} />
          {studentName} 小遊戲設定
        </h2>
      </div>

      {/* ─── Quiz games ─── */}
      <p className={styles.gameConfigSectionTitle} style={{ marginBottom: 8 }}>
        <Sparkles size={14} color={ACCENT_BLUE} style={{ verticalAlign: "middle", marginRight: 6 }} />
        印記問答遊戲
      </p>
      <div className={styles.gameConfigGrid}>
        {QUIZ_GAMES.map((gid) => {
          const game = config.quizGames[gid as keyof typeof config.quizGames];
          return (
            <div key={gid} className={styles.gameConfigCard}>
              <div className={styles.gameConfigHeader}>
                <span style={{ fontSize: 20 }}>{GAME_EMOJIS[gid]}</span>
                <span className={styles.gameConfigName}>{GAME_LABELS[gid]}</span>
              </div>
              <label className={styles.gameConfigToggle}>
                <input type="checkbox" checked={game.enabled} onChange={(e) => updateQuizGame(gid, { enabled: e.target.checked })} />
                <span>啟用</span>
              </label>
              <div className={styles.gameConfigDiffRow}>
                <span className={styles.gameConfigDiffLabel}>難度</span>
                <select
                  className={styles.gameConfigSelect}
                  value={game.difficulty}
                  onChange={(e) => updateQuizGame(gid, { difficulty: e.target.value as Difficulty })}
                  disabled={!game.enabled}
                >
                  {(["basic", "intermediate", "challenge"] as const).map((d) => (
                    <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Adaptation games ─── */}
      <p className={styles.gameConfigSectionTitle} style={{ marginBottom: 8, marginTop: 20 }}>
        <Trees size={14} color={ACCENT_GREEN} style={{ verticalAlign: "middle", marginRight: 6 }} />
        言語治療歷奇遊戲（聽聲辨字訓練）
      </p>
      <div className={styles.gameConfigGrid}>
        {ADAPT_GAMES.map((gid) => {
          const game = config.adaptationGames[gid as keyof typeof config.adaptationGames];
          return (
            <div key={gid} className={styles.gameConfigCard}>
              <div className={styles.gameConfigHeader}>
                <span style={{ fontSize: 20 }}>{GAME_EMOJIS[gid]}</span>
                <span className={styles.gameConfigName}>{GAME_LABELS[gid]}</span>
              </div>
              <label className={styles.gameConfigToggle}>
                <input type="checkbox" checked={game.enabled} onChange={(e) => updateAdaptGame(gid, { enabled: e.target.checked })} />
                <span>啟用</span>
              </label>
              <div className={styles.gameConfigDiffRow}>
                <span className={styles.gameConfigDiffLabel}>難度</span>
                <select
                  className={styles.gameConfigSelect}
                  value={game.difficulty}
                  onChange={(e) => updateAdaptGame(gid, { difficulty: e.target.value as Difficulty })}
                  disabled={!game.enabled}
                >
                  {(["basic", "intermediate", "challenge"] as const).map((d) => (
                    <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Phoneme focus ─── */}
      <div className={styles.gameConfigSection} style={{ marginTop: 20 }}>
        <p className={styles.gameConfigSectionTitle}>
          <Volume2 size={14} color={ACCENT_AMBER} style={{ verticalAlign: "middle", marginRight: 6 }} />
          語音焦點
        </p>
        <p className={styles.gameConfigDesc}>選擇要喺遊戲中重點訓練嘅語音範疇：</p>
        <div className={styles.gameConfigPhonemeRow}>
          {([
            { key: "initials" as const, label: "聲母", icon: <Mic2 size={14} /> },
            { key: "finals" as const, label: "韻母", icon: <Waves size={14} /> },
            { key: "tones" as const, label: "聲調", icon: <Volume2 size={14} /> },
          ]).map(({ key, label, icon }) => (
            <label key={key} className={`${styles.gameConfigChip} ${config.phonemeFocus[key] ? styles.gameConfigChipActive : ""}`}>
              <input type="checkbox" checked={config.phonemeFocus[key]} onChange={() => togglePhoneme(key)} style={{ display: "none" }} />
              {icon}
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button className={styles.addBtn} onClick={handleSave} type="button" style={{ marginTop: 16 }}>
        <Gamepad2 size={16} />
        儲存小遊戲設定
      </button>
      {saved && <p className={styles.statusSuccess} style={{ marginTop: 12, marginBottom: 0 }}>已儲存遊戲設定！</p>}
    </div>
  );
}
