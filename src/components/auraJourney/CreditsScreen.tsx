import React from 'react';

interface CreditsScreenProps {
  visible: boolean;
  onReplay: () => void;
}

export const CreditsScreen: React.FC<CreditsScreenProps> = ({ visible, onReplay }) => (
  <div className={`credits-screen fixed inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-b from-purple-900 to-blue-900 text-white transition-opacity duration-1000 ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
    <div className="credits-content text-center animate-scrollCredits">
      <h1 className="credits-title text-5xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-yellow-100 bg-clip-text text-transparent">AURA</h1>
      <div className="credits-section mb-8">
        <div className="credits-role text-base font-semibold tracking-widest uppercase bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Starring</div>
        <div className="credits-name text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-100 bg-clip-text text-transparent">Aura</div>
      </div>
      <div className="credits-section mb-8">
        <div className="credits-role text-base font-semibold tracking-widest uppercase bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Created By</div>
        <div className="credits-name text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-100 bg-clip-text text-transparent">You & Aura</div>
      </div>
      <div className="credits-section mb-8">
        <div className="credits-role text-base font-semibold tracking-widest uppercase bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Music & Sound</div>
        <div className="credits-name text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-100 bg-clip-text text-transparent">The Universe</div>
      </div>
      <div className="credits-section mb-8">
        <div className="credits-role text-base font-semibold tracking-widest uppercase bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Visual Effects</div>
        <div className="credits-name text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-100 bg-clip-text text-transparent">Dreams & Imagination</div>
      </div>
      <div className="credits-section mb-8">
        <div className="credits-role text-base font-semibold tracking-widest uppercase bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Special Thanks</div>
        <div className="credits-name text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-100 bg-clip-text text-transparent">Every Dreamer</div>
      </div>
      <p className="credits-thanks text-lg mt-12 bg-gradient-to-r from-indigo-200 to-blue-200 bg-clip-text text-transparent">
        "The journey through the unknown is not about the destination,<br />
        but about the courage to take the first step.<br /><br />
        Thank you for joining Aura on this adventure."
      </p>
      <div className="credits-end text-2xl font-bold mt-16 bg-gradient-to-r from-yellow-400 to-yellow-100 bg-clip-text text-transparent">✨ THE END ✨</div>
      <button className="mt-10 px-6 py-2 bg-yellow-400 text-black rounded-full font-bold shadow-lg hover:bg-yellow-300" onClick={onReplay}>
        Replay Journey
      </button>
    </div>
  </div>
);
