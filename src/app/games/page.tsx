export default function GamesIndexPage() {
  const games = [
    { id: 'phoneme-pairs', name: 'Phoneme Pairs', path: '/games/phoneme-pairs' },
    { id: 'tone-match', name: 'Tone Match', path: '/games/tone-match' },
    { id: 'syllable-timer', name: 'Syllable Timer', path: '/games/syllable-timer' },
    { id: 'story-collect', name: 'Story Collect', path: '/games/story-collect' },
    { id: 'pipi-dialogue', name: 'PiPi Dialogue', path: '/games/pipi-dialogue' },
  ];

  return (
    <div className="games-index p-8">
      <h1 className="text-3xl font-bold mb-6">Mini Games</h1>
      <div className="game-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <a
            key={game.id}
            href={game.path}
            className="game-card p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{game.name}</h2>
            <p className="text-gray-600">Click to play</p>
          </a>
        ))}
      </div>
    </div>
  );
}
