import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyEntry {
  week: string;
  completed: number;
  total: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as WeeklyEntry;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13,
    }}>
      <p style={{ margin: 0, color: "#64748b" }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontWeight: 600, color: "#2563eb" }}>{d.completed} / {d.total} 完成</p>
    </div>
  );
};

export default function LessonCompletionChart({ studentId }: { studentId: string }) {
  const [data, setData] = useState<WeeklyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setData([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      const { data: rows } = await supabase
        .from("lesson_progress")
        .select("created_at, completed")
        .eq("user_id", studentId);

      if (cancelled) return;

      if (!rows || rows.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      const weekMap = new Map<string, { completed: number; total: number }>();

      for (const row of rows) {
        if (!row.created_at) continue;
        const d = new Date(row.created_at);
        const dayOfWeek = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
        if (isNaN(monday.getTime())) continue;

        const weekKey = monday.toISOString().slice(0, 10);
        const entry = weekMap.get(weekKey) || { completed: 0, total: 0 };
        entry.total++;
        if (row.completed) entry.completed++;
        weekMap.set(weekKey, entry);
      }

      const sorted = Array.from(weekMap.entries()).sort(([a], [b]) => a.localeCompare(b));
      const chartData = sorted.slice(-10).map(([week, counts]) => ({
        week: week.slice(5),
        completed: counts.completed,
        total: counts.total,
      }));

      setData(chartData);
      setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [studentId]);

  if (loading) {
    return (
      <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 14 }}>
        載入中...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 14 }}>
        暫無課程數據
      </div>
    );
  }

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="completed"
            fill="#2563eb"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
            name="完成"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
