export default function ParentInsightsPage() {
  // Mock data - would come from API
  const insights = {
    weeklyPracticeMinutes: 45,
    weeklyGoal: 60,
    topImprovedSound: '/n/',
    currentFocusSound: '/l/',
    streakDays: 5,
    recentGameResults: [
      { gameName: 'Phoneme Pairs', date: '2026-06-11', stars: 8, fatigueFlag: false },
      { gameName: 'Tone Match', date: '2026-06-10', stars: 6, fatigueFlag: true },
      { gameName: 'PiPi Dialogue', date: '2026-06-09', stars: 10, fatigueFlag: false },
    ],
    therapistNote: 'Great progress on nasal sounds! Continue practicing /l/ in isolation.',
    suggestedHomeActivity: 'Practice saying "lion" and "lake" together at breakfast',
    nextScheduledSession: '2026-06-13T10:00:00Z',
  };

  return (
    <div className="parent-insights p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Child's Progress</h1>

      <div className="insights-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <div className="insight-card p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Weekly Practice</h2>
          <div className="progress-ring-container flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {insights.weeklyPracticeMinutes}
              </div>
              <div className="text-gray-600">/ {insights.weeklyGoal} min</div>
            </div>
          </div>
        </div>

        {/* Sound Focus */}
        <div className="insight-card p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Sound Focus</h2>
          <div className="space-y-3">
            <div className="focus-item">
              <span className="label">Currently practicing:</span>
              <span className="value font-bold">{insights.currentFocusSound}</span>
            </div>
            <div className="focus-item">
              <span className="label">Most improved:</span>
              <span className="value font-bold text-green-600">
                {insights.topImprovedSound}
              </span>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="insight-card p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Practice Streak</h2>
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-500">
              {insights.streakDays}
            </div>
            <div className="text-gray-600">days in a row!</div>
          </div>
        </div>

        {/* Recent Games */}
        <div className="insight-card p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Recent Games</h2>
          <div className="space-y-2">
            {insights.recentGameResults.map((result, index) => (
              <div key={index} className="game-result flex justify-between items-center">
                <span>{result.gameName}</span>
                <div className="flex items-center space-x-2">
                  <span className="stars">⭐ {result.stars}</span>
                  {result.fatigueFlag && (
                    <span className="fatigue-badge text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Rest Day
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Therapist Note */}
        {insights.therapistNote && (
          <div className="insight-card p-6 border rounded-lg md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Message from Therapist</h2>
            <p className="text-gray-700 italic">{insights.therapistNote}</p>
          </div>
        )}

        {/* Home Activity */}
        <div className="insight-card p-6 border rounded-lg md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Suggested Home Activity</h2>
          <p className="text-gray-700">{insights.suggestedHomeActivity}</p>
        </div>
      </div>
    </div>
  );
}
