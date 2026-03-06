import React from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div>
      <h1>Welcome to SpeakAbleHK</h1>
      <div className="feature-card">
        <Link to="/pronunciation">Echo Speech</Link>
      </div>
      <div className="feature-card">
        <Link to="/feature1">Feature 1</Link>
      </div>
      <div className="feature-card">
        <Link to="/feature2">Feature 2</Link>
      </div>
      <div className="feature-card">
        <Link to="/feature3">Feature 3</Link>
      </div>
    </div>
  );
};

export default Index;