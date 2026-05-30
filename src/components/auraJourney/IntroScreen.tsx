import React from 'react';

interface IntroScreenProps {
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => (
  <div className="intro-screen fixed inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-b from-purple-900 to-blue-900 text-white">
    <div className="studio-logo mb-12 text-lg tracking-widest uppercase">✨ AuraLab Pictures Presents ✨</div>
    <h1 className="movie-title text-6xl font-bold mb-4">AURA</h1>
    <p className="movie-subtitle text-2xl mb-8">Journey Through the Unknown</p>
    <button className="start-prompt text-xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent animate-pulse" onClick={onStart}>
      — Tap anywhere to begin —
    </button>
  </div>
);
