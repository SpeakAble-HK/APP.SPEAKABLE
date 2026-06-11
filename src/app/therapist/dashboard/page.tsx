export default function TherapistDashboardPage() {
  // Mock data - would come from API
  const learners = [
    {
      id: 'learner-1',
      name: 'Student A',
      accuracy: 0.75,
      durability: 0.70,
      generalization: 0.65,
      engagementScore: 72,
    },
    {
      id: 'learner-2',
      name: 'Student B',
      accuracy: 0.85,
      durability: 0.80,
      generalization: 0.75,
      engagementScore: 82,
    },
  ];

  return (
    <div className="therapist-dashboard p-8">
      <h1 className="text-3xl font-bold mb-6">Therapist Dashboard</h1>

      <div className="learners-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        {learners.map((learner) => (
          <div key={learner.id} className="learner-card p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{learner.name}</h2>

            {/* Engagement Score Gauge */}
            <div className="engagement-gauge mb-4">
              <div className="gauge-container flex items-center justify-center">
                <svg width="120" height="120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={
                      learner.engagementScore >= 75
                        ? '#10b981'
                        : learner.engagementScore >= 50
                        ? '#f59e0b'
                        : '#ef4444'
                    }
                    strokeWidth="10"
                    strokeDasharray={`${(learner.engagementScore / 100) * 314} 314`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="gauge-text absolute text-center">
                  <div className="text-2xl font-bold">{learner.engagementScore}</div>
                  <div className="text-xs text-gray-600">Engagement</div>
                </div>
              </div>
            </div>

            {/* Metric Breakdown */}
            <div className="metric-breakdown space-y-2">
              <div className="metric-row flex justify-between">
                <span>Accuracy</span>
                <span className="font-bold">{Math.round(learner.accuracy * 100)}%</span>
              </div>
              <div className="metric-row flex justify-between">
                <span>Durability</span>
                <span className="font-bold">{Math.round(learner.durability * 100)}%</span>
              </div>
              <div className="metric-row flex justify-between">
                <span>Generalization</span>
                <span className="font-bold">
                  {Math.round(learner.generalization * 100)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
