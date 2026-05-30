
import React from 'react';
import './AuraStory.css';
import SyaliStudio from '../../../src/components/SyaliStudio';

const AuraStory: React.FC = () => {
  return (
    <div className="aura-container">
      <div className="aura-header">
        <h1 className="aura-header-title">✨ Aura 故事 ✨</h1>
        <p className="aura-header-subtitle">閱讀同學習嘅奇妙冒險</p>
      </div>
      {/* Accessibility bar, chapter grid, video player, parent portal, etc. will be migrated here */}

      {/* Syali Studio Practice UI Integration */}
      <div style={{ margin: '40px 0' }}>
        <SyaliStudio />
      </div>
    </div>
  );
};

export default AuraStory;
