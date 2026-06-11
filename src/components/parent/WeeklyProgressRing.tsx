export interface WeeklyProgressRingProps {
  practiceMinutes: number;
  weeklyGoal: number;
}

export function WeeklyProgressRing({
  practiceMinutes,
  weeklyGoal,
}: WeeklyProgressRingProps) {
  const percentage = Math.min((practiceMinutes / weeklyGoal) * 100, 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="weekly-progress-ring">
      <svg width="100" height="100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="progress-text">
        <div className="minutes">{practiceMinutes}</div>
        <div className="goal">/ {weeklyGoal} min</div>
      </div>
    </div>
  );
}
