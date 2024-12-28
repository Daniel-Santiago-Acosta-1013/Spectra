import React from 'react';

interface SteganoSectionProps {
  title: string;
  content: string;
  animationClass: string;
  delay: number;
}

export const SteganoSection: React.FC<SteganoSectionProps> = ({
  title,
  content,
  animationClass,
  delay
}) => {
  return (
    <div 
      className={`guide-section ${animationClass}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <h3 className="guide-title">{title}</h3>
      <div className="guide-content">
        {content.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
};