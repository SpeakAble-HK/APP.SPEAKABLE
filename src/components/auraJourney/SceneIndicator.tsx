import React from 'react';

interface SceneIndicatorProps {
  title: string;
  visible: boolean;
}

export const SceneIndicator: React.FC<SceneIndicatorProps> = ({ title, visible }) => (
  <div className={`scene-indicator fixed top-12 left-10 z-30 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
    <div className="scene-label text-xs font-semibold tracking-widest uppercase bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">✨ Now Playing</div>
    <div className="scene-name text-lg font-bold bg-gradient-to-r from-yellow-400 to-yellow-100 bg-clip-text text-transparent">{title}</div>
  </div>
);
