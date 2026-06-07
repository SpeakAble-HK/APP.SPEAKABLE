import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landingAnimations.css';

function SpeakAbleCurve3D() {
  // SVG curve with animated stroke
  return (
    <svg width="320" height="80" viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 70 Q 160 10 310 70"
        stroke="#38bdf8"
        strokeWidth="8"
        fill="none"
        className="animate-curve"
      />
    </svg>
  );
}

export default function LoginVideo() {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleVideoEnd = () => setShowLogin(true);

  // Mock authentication for dev
  const handleAuth = (e) => {
    e.preventDefault();
    // Simulate async login
    setTimeout(() => navigate('/mission-confirm'), 800);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <video
        src="/assets/hero_video.mp4"
        autoPlay
        onEnded={handleVideoEnd}
        className="w-full h-full object-cover"
        style={{ aspectRatio: '16/9' }}
      />
      {showLogin && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 animate-fade-in">
          <div className="mb-8 animate-logo-fade-in flex flex-col items-center">
            <img src="/assets/speakable_hk_logo.png" alt="SpeakAble HK" className="w-64 h-auto mb-2" />
            <SpeakAbleCurve3D />
          </div>
          <form
            className="bg-white bg-opacity-90 rounded-xl p-8 shadow-xl flex flex-col gap-4 animate-pop-in"
            onSubmit={handleAuth}
          >
            <input type="text" placeholder="Username" className="p-2 rounded border" required />
            <input type="password" placeholder="Password" className="p-2 rounded border" required />
            <button type="submit" className="bg-sky-500 text-white px-6 py-2 rounded-full font-bold">
              Log in
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
