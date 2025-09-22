import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1>Welcome to the #GEF Mixer</h1>
        <p>Capture and share your favorite moments from the event in real-time. Click the '+' button to add your photos to the gallery!</p>
      </div>
    </div>
  );
};

export default Hero;
