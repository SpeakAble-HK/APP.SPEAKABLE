import React from 'react';

export const AnimatedBubbles: React.FC = () => (
  <div className="bubbles-container pointer-events-none fixed inset-0 z-10 overflow-hidden">
    {[...Array(10)].map((_, i) => (
      <div key={i} className={`bubble bubble-${i + 1}`}></div>
    ))}
  </div>
);
