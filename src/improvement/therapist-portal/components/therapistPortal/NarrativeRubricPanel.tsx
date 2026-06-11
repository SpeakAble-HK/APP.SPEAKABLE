import React, { useMemo, useState } from "react";
import {
  RUBRIC_DOMAINS,
  RUBRIC_ELEMENTS,
  RUBRIC_MAX,
  elementsByDomain,
  computeNarrativeProfile,
  scoreBand,
  suggestScoresFromEvidence,
  type RubricScores,
  type RubricElement,
} from "@/data/narrativeAssessment";

interface Props {
  studentName?: string;
  /** evidenceKey -> 0..1 performance (mini-game accuracy, journey signals) */
  evidence?: Record<string, number>;
  initialScores?: RubricScores;
  saving?: boolean;
  usingFallback?: boolean;
  onSave?: (scores: RubricScores, evidence: Record<string, number>, notes: string) => void;
}

const SCALE = [0, 1, 2, 3, 4];

function bandColor(band: string): string {
  switch (band) {
    case "Advanced": return "#059669";
    case "Proficient": return "#0ea5e9";
    case "Developing": return "#f59e0b";
    default: return "#ef4444";
  }
}

export const NarrativeRubricPanel: React.FC<Props> = ({
  studentName,
  evidence = {},
  initialScores,
  saving,
  usingFallback,
  onSave,
}) => {
  const [scores, setScores] = useState<RubricScores>(initialScores ?? {});
  const [notes, setNotes] = useState("");
  const [activeElement, setActiveElement] = useState<string | null>(null);

  const result = useMemo(() => computeNarrativeProfile(scores), [scores]);

  const setScore = (id: string, value: number) =>
    setScores((prev) => ({ ...prev, [id]: value }));

  const applySuggestions = () => {
    const suggested = suggestScoresFromEvidence(evidence);
    setScores((prev) => ({ ...suggested, ...prev, ...suggested }));
  };

  const hasEvidence = Object.keys(evidence).length > 0;

  const renderElement = (el: RubricElement) => {
    const current = scores[el.id];
    const isOpen = activeElement === el.id;
    return (
      <div key={el.id} style={{
        border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, marginBottom: 8, background: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
              {el.labelZh} <span style={{ color: "#64748b", fontWeight: 500 }}>· {el.label}</span>
              {el.saltCode && (
                <span style={{ marginLeft: 6, fontSize: 10, color: "#94a3b8", background: "#f1f5f9", padding: "1px 6px", borderRadius: 6 }}>
                  {el.saltCode}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{el.descriptionZh}</div>
          </div>
          <button
            type="button"
            onClick={() => setActiveElement(isOpen ? null : el.id)}
            style={{ fontSize: 11, color: "#0ea5e9", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            {isOpen ? "收起評分準則" : "查看評分準則"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {SCALE.map((s) => {
            const selected = current === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setScore(el.id, s)}
                title={el.levels[s]?.zh}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, cursor: "pointer",
                  border: selected ? "2px solid #0ea5e9" : "1px solid #cbd5e1",
                  background: selected ? "#0ea5e9" : "#f8fafc",
                  color: selected ? "#fff" : "#334155",
                  fontWeight: 700, fontSize: 14,
                }}
              >
                {s}
              </button>
            );
          })}
        </div>

        {isOpen && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#475569", display: "grid", gap: 4 }}>
            {el.levels.map((lvl) => (
              <div key={lvl.score} style={{
                display: "flex", gap: 8, padding: "4px 8px", borderRadius: 6,
                background: current === lvl.score ? "#e0f2fe" : "transparent",
              }}>
                <span style={{ fontWeight: 700, color: "#0ea5e9", minWidth: 14 }}>{lvl.score}</span>
                <span>{lvl.zh}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "inherit" }}>
      {/* Header / score summary */}
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
        gap: 12, padding: 16, borderRadius: 14, background: "#0f172a", color: "#fff", marginBottom: 16,
      }}>
        <div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>敘事評估檔案 · Narrative Assessment Profile</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{studentName ?? "學生"}</div>
          <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 2 }}>
            已評 {result.completedElements}/{result.totalElements} 項
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>整體敘事能力 Total Proficiency</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: bandColor(result.band) }}>
            {result.totalProficiency.toFixed(0)}<span style={{ fontSize: 14, color: "#64748b" }}>/100</span>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 700, color: "#fff", background: bandColor(result.band),
            padding: "2px 10px", borderRadius: 999,
          }}>
            {result.bandZh} · {result.band}
          </span>
        </div>
      </div>

      {/* Domain bars */}
      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        {RUBRIC_DOMAINS.map((d) => {
          const dr = result.domainResults.find((r) => r.domain === d.id)!;
          const { band } = scoreBand(dr.percent);
          return (
            <div key={d.id}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#475569", marginBottom: 2 }}>
                <span style={{ fontWeight: 600 }}>{d.labelZh} <span style={{ color: "#94a3b8" }}>({Math.round(d.weight * 100)}%)</span></span>
                <span>{dr.percent.toFixed(0)}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                <div style={{ width: `${dr.percent}%`, height: "100%", background: bandColor(band), transition: "width .3s" }} />
              </div>
            </div>
          );
        })}
      </div>

      {hasEvidence && (
        <button
          type="button"
          onClick={applySuggestions}
          style={{
            marginBottom: 14, padding: "8px 14px", borderRadius: 8, border: "1px dashed #0ea5e9",
            background: "#f0f9ff", color: "#0369a1", fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}
        >
          ✨ 由遊戲／旅程數據自動建議評分（可再修改）
        </button>
      )}

      {/* Domains */}
      {RUBRIC_DOMAINS.map((d) => (
        <div key={d.id} style={{ marginBottom: 18 }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
            {d.labelZh} <span style={{ color: "#94a3b8", fontWeight: 500 }}>· {d.label}</span>
          </h4>
          {elementsByDomain(d.id).map(renderElement)}
        </div>
      ))}

      {/* Notes + save */}
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
        治療師評語 Therapist Notes
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="觀察、優勢、下一步目標……"
        style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13, resize: "vertical", boxSizing: "border-box" }}
      />

      {usingFallback && (
        <p style={{ fontSize: 11, color: "#b45309", marginTop: 8 }}>
          ⚠️ 暫時儲存喺本機（未連上資料庫）。連線後會同步。
        </p>
      )}

      <button
        type="button"
        disabled={saving || result.completedElements === 0}
        onClick={() => onSave?.(scores, evidence, notes)}
        style={{
          marginTop: 12, width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
          background: result.completedElements === 0 ? "#94a3b8" : "#059669",
          color: "#fff", fontWeight: 700, fontSize: 15, cursor: result.completedElements === 0 ? "not-allowed" : "pointer",
        }}
      >
        {saving ? "儲存中…" : "儲存敘事評估"}
      </button>
    </div>
  );
};
