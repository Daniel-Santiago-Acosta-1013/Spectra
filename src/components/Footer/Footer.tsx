import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 mt-12 py-4 shadow-inner">
      <div className="container mx-auto px-4 max-w-7xl text-center text-gray-400 text-xs md:text-sm">
        <p>
          &copy; {currentYear} Spectra | Creado por [Your Name/Organization Here]
        </p>
      </div>
    </footer>
  );
}; 