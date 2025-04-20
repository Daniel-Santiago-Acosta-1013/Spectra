import React from 'react';
import { SteganoAnimation } from '../components/SteganoAnimation/SteganoAnimation';
import { SteganoGuide } from '../components/SteganoGuide/SteganoGuide';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl space-y-12">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Descifrando la Esteganografía
          </h1>
          <p className="text-lg md:text-xl text-gray-400">
            Cómo ocultamos secretos a plena vista dentro de las imágenes.
          </p>
        </div>

        {/* Explanation Section */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 md:p-10 ring-1 ring-white ring-opacity-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-purple-300">
            La Guía Detallada
          </h2>
          <SteganoGuide />
        </div>

        {/* Animation Section */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 md:p-10 ring-1 ring-white ring-opacity-10">
           <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-purple-300">
            Visualización del Proceso
          </h2>
          <SteganoAnimation />
        </div>
      </div>
    </div>
  );
}; 