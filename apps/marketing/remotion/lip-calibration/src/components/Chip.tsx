export const Chip: React.FC<{ label: string; tone?: "idle"|"detect"|"calibrate"|"pass"|"retry" }>
= ({ label, tone = "detect" }) => {
  const colors = {
    idle:      "#475569",
    detect:    "#38BDF8",
    calibrate: "#F59E0B",
    pass:      "#22C55E",
    retry:     "#EF4444",
  } as const;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "10px 18px", borderRadius: 16,
      background: "rgba(15,23,42,0.85)",
      border: `2px solid ${colors[tone]}`,
      color: "#E2E8F0", fontSize: 28, fontWeight: 600,
    }}>
      <span style={{ width: 10, height: 10, borderRadius: 5, background: colors[tone] }} />
      {label}
    </div>
  );
};
