
import React from 'react';
// Tailwind CSS only, no custom CSS
import SyaliStudio from '../../../src/components/SyaliStudio';

const AuraStory: React.FC = () => {
  return (
    <div className="max-w-[1400px] mx-auto relative z-10 p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 bg-clip-text text-transparent mb-2 drop-shadow-[0_0_60px_rgba(168,85,247,0.5)] tracking-tight leading-tight">
          ✨ Aura 故事 ✨
        </h1>
        <p className="text-lg text-white/80 font-medium tracking-wide">
          閱讀同學習嘅奇妙冒險
        </p>
      </div>
      {/* Accessibility bar, chapter grid, video player, parent portal, etc. will be migrated here */}

      {/* Syali Studio Practice UI Integration */}
      <div className="my-10">
        <SyaliStudio />
      </div>
    </div>
  );
};

export default AuraStory;
