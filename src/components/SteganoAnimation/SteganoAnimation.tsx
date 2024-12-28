import React from 'react';
import './SteganoAnimation.css';

export const SteganoAnimation: React.FC = () => {
  const pixels = Array(16).fill(0);
  
  return (
    <div className="stegano-animation">
      <div className="original-image">
        <div className="pixel-grid">
          {pixels.map((_, i) => (
            <div key={`original-${i}`} className="pixel" />
          ))}
        </div>
      </div>
      
      <div className="binary-data">
        <div className="binary-stream">
          10110101
        </div>
      </div>
      
      <div className="encoded-image">
        <div className="pixel-grid">
          {pixels.map((_, i) => (
            <div key={`encoded-${i}`} className="pixel encoded" />
          ))}
        </div>
      </div>
    </div>
  );
};
