import React from 'react';
import { SteganoAnimation } from '../components/SteganoAnimation/SteganoAnimation';
import { SteganoGuide } from '../components/SteganoGuide/SteganoGuide';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8 text-center text-purple-300">
        Cómo Funciona la Esteganografía
      </h2>
      <div className="bg-gray-800 rounded-lg p-4 md:p-8 shadow-xl mb-8 md:mb-12">
        <SteganoGuide />
      </div>
      <div className="bg-gray-800 rounded-lg p-4 md:p-8 shadow-xl">
         <SteganoAnimation />
      </div>
    </div>
  );
}; 