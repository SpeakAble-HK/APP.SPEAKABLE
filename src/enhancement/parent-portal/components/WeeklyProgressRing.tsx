interface WeeklyProgressRingProps {
  practiceMinutes: number;
  weeklyGoal: number;
}

export function WeeklyProgressRing({
  practiceMinutes,
  weeklyGoal,
}: WeeklyProgressRingProps) {
  const percentage = weeklyGoal
    ? Math.min((practiceMinutes / weeklyGoal) * 100, 100)
    : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" className="text-surface-container" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold">{practiceMinutes}</div>
        <div className="text-xs text-on-surface-variant">/ {weeklyGoal} min</div>
      </div>
    </div>
  );
}
