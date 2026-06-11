import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTrendData } from "@/shared/hooks/useTrendData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13,
    }}>
      <p style={{ margin: 0, color: "#64748b" }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontWeight: 600, color: payload[0].color }}>{payload[0].value}% 準確率</p>
    </div>
  );
};

export default function AccuracyTrendChart({ studentId }: { studentId: string }) {
  const { trend, loading } = useTrendData(studentId);

  if (loading) {
    return (
      <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 14 }}>
        載入中...
      </div>
    );
  }

  if (trend.length === 0 || trend.every((p) => p.accuracy === 0)) {
    return (
      <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 14 }}>
        暫無數據
      </div>
    );
  }

  const hasData = trend.some((p) => p.accuracy > 0);

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickFormatter={(val: string) => val.slice(5)}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            domain={hasData ? [0, 100] : [0, 100]}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
