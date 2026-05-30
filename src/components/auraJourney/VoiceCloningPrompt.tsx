import React from 'react';

interface VoiceCloningPromptProps {
  prompt: string;
  onRecord: () => void;
  onSkip: () => void;
  recording: boolean;
}

export const VoiceCloningPrompt: React.FC<VoiceCloningPromptProps> = ({ prompt, onRecord, onSkip, recording }) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-black bg-opacity-70">
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
      <h2 className="text-xl font-bold mb-4 text-gray-900">{prompt}</h2>
      <button
        className={`px-6 py-2 rounded-full font-bold text-white ${recording ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
        onClick={onRecord}
        disabled={recording}
      >
        {recording ? 'Recording...' : 'Start Recording'}
      </button>
      <button className="ml-4 px-4 py-2 rounded text-gray-700 bg-gray-200 hover:bg-gray-300" onClick={onSkip} disabled={recording}>
        Skip
      </button>
    </div>
  </div>
);
