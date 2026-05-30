export const ProgressBar: React.FC<{ step: 0|1|2|3|4 }> = ({ step }) => (
  <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
    {[1,2,3,4].map((i) => (
      <div key={i} style={{
        flex: 1, height: 8, borderRadius: 4,
        background: i <= step ? "#38BDF8" : "#1E293B",
      }}/>
    ))}
  </div>
);
