import { usePhonemeAnalytics } from "@/hooks/usePhonemeAnalytics";

function heatColor(accuracy: number): string {
  if (accuracy >= 80) return "#10b981";
  if (accuracy >= 60) return "#3b82f6";
  if (accuracy >= 40) return "#f59e0b";
  return "#ef4444";
}

function heatBg(accuracy: number): string {
  if (accuracy >= 80) return "#ecfdf5";
  if (accuracy >= 60) return "#eff6ff";
  if (accuracy >= 40) return "#fffbeb";
  return "#fef2f2";
}

export default function PhonemeHeatmap({ studentId }: { studentId: string }) {
  const { phonemeStats, loading } = usePhonemeAnalytics(studentId);

  if (loading) {
    return (
      <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 14 }}>
        載入中...
      </div>
    );
  }

  if (phonemeStats.length === 0) {
    return (
      <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 14 }}>
        暫無語音數據
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10,
      }}>
        {phonemeStats.map((stat) => (
          <div key={stat.label} style={{
            background: heatBg(stat.accuracy),
            border: `1px solid ${heatColor(stat.accuracy)}40`,
            borderRadius: 10, padding: "14px 12px", textAlign: "center",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#334155" }}>{stat.label}</p>
            <p style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color: heatColor(stat.accuracy) }}>
              {stat.accuracy}%
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>
              {stat.count} 次紀錄
            </p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12, fontSize: 11, color: "#64748b" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "#10b981" }} /> 優秀 (≥80%)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "#3b82f6" }} /> 良好 (60-79%)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "#f59e0b" }} /> 一般 (40-59%)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "#ef4444" }} /> 需改進 (&lt;40%)
        </span>
      </div>
    </div>
  );
}
