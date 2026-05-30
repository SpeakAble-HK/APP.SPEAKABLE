import React from 'react';

interface ChapterCardProps {
  chapter: string;
  title: string;
  subtitle: string;
  visible: boolean;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, title, subtitle, visible }) => (
  <div className={`chapter-card fixed inset-0 flex flex-col items-center justify-center z-40 transition-opacity duration-1000 ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
    <div className="chapter-number mb-4 text-lg font-semibold tracking-widest uppercase bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{chapter}</div>
    <h2 className="chapter-title text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-100 bg-clip-text text-transparent">{title}</h2>
    <p className="chapter-subtitle text-lg bg-gradient-to-r from-indigo-200 to-blue-200 bg-clip-text text-transparent">{subtitle}</p>
  </div>
);
