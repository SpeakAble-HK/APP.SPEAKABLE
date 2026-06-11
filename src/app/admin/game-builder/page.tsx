import { useState } from 'react';
import { PhonemeTagger } from '../../components/therapist/PhonemeTagger';
import { createAssignment, getGameTemplates } from '../../lib/minigame-sdk/assignment';

export default function GameBuilderPage() {
  const [step, setStep] = useState(1);
  const [selectedPhonemes, setSelectedPhonemes] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [difficultyLevel, setDifficultyLevel] = useState(2);
  const [passThreshold, setPassThreshold] = useState(0.7);
  const [learnerIds, setLearnerIds] = useState<string[]>([]);

  const gameTemplates = getGameTemplates();

  const handlePublish = async () => {
    const config = {
      therapistId: 'current-therapist-id', // Would come from auth context
      learnerIds,
      gameId: selectedGame,
      phonemeTargets: selectedPhonemes,
      difficultyLevel,
      passThreshold,
      scheduledFor: new Date().toISOString(),
    };

    try {
      await createAssignment(config);
      alert('Assignment published successfully!');
      setStep(1);
    } catch (error) {
      console.error('Failed to publish assignment:', error);
      alert('Failed to publish assignment');
    }
  };

  return (
    <div className="game-builder p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Therapist Game Builder</h1>

      <div className="steps mb-8">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <button
            key={s}
            className={`step ${s === step ? 'active' : ''} ${
              s < step ? 'completed' : ''
            }`}
            onClick={() => setStep(s)}
          >
            Step {s}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="step-content">
          <h2 className="text-xl font-semibold mb-4">Target Sounds</h2>
          <PhonemeTagger
            learnerId="current-learner"
            onSave={(phonemes) => {
              setSelectedPhonemes(phonemes.map((p) => p.symbol));
              setStep(2);
            }}
          />
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <h2 className="text-xl font-semibold mb-4">Game Template</h2>
          <div className="game-grid grid grid-cols-2 gap-4">
            {gameTemplates.map((template) => (
              <button
                key={template.gameId}
                className={`game-card p-4 border rounded ${
                  selectedGame === template.gameId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
                onClick={() => {
                  setSelectedGame(template.gameId);
                  setStep(3);
                }}
              >
                <h3 className="font-bold">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step-content">
          <h2 className="text-xl font-semibold mb-4">Configure</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Difficulty Level: {difficultyLevel}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-2">
                Pass Threshold: {Math.round(passThreshold * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="0.9"
                step="0.05"
                value={passThreshold}
                onChange={(e) => setPassThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <button onClick={() => setStep(4)} className="btn-primary">
              Next: Assign Learners
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="step-content">
          <h2 className="text-xl font-semibold mb-4">Assign Learners</h2>
          <p className="mb-4">Select learners to assign this game to:</p>
          <div className="learner-list space-y-2 mb-4">
            {/* Mock learner list - would come from API */}
            {['learner-1', 'learner-2', 'learner-3'].map((id) => (
              <label key={id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={learnerIds.includes(id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setLearnerIds([...learnerIds, id]);
                    } else {
                      setLearnerIds(learnerIds.filter((l) => l !== id));
                    }
                  }}
                />
                <span>{id}</span>
              </label>
            ))}
          </div>
          <button
            onClick={() => setStep(5)}
            disabled={learnerIds.length === 0}
            className="btn-primary"
          >
            Next: Preview
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="step-content">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="preview-card p-4 border rounded bg-gray-50">
            <p><strong>Game:</strong> {selectedGame}</p>
            <p><strong>Phonemes:</strong> {selectedPhonemes.join(', ')}</p>
            <p><strong>Difficulty:</strong> {difficultyLevel}</p>
            <p><strong>Pass Threshold:</strong> {Math.round(passThreshold * 100)}%</p>
            <p><strong>Learners:</strong> {learnerIds.length}</p>
          </div>
          <button onClick={() => setStep(6)} className="btn-primary mt-4">
            Next: Publish
          </button>
        </div>
      )}

      {step === 6 && (
        <div className="step-content">
          <h2 className="text-xl font-semibold mb-4">Publish</h2>
          <p className="mb-4">
            Ready to publish this assignment to {learnerIds.length} learner(s)?
          </p>
          <div className="flex space-x-4">
            <button onClick={handlePublish} className="btn-primary">
              Publish Assignment
            </button>
            <button onClick={() => setStep(1)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
