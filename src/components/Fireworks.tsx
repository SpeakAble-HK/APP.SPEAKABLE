import React, { useRef, useEffect } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';

export default function Fireworks({ trigger }) {
  const ref = useRef();

  useEffect(() => {
    if (trigger && ref.current) {
      ref.current({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fbbf24', '#f472b6', '#34d399']
      });
    }
  }, [trigger]);

  return (
    <ReactCanvasConfetti
      refConfetti={ref}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0
      }}
    />
  );
}
