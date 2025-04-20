import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeClassName = "text-white font-semibold border-b-2 border-purple-400";
  const inactiveClassName = "text-gray-300 hover:text-white transition-colors";
  const linkBaseClasses = "text-sm md:text-base py-1";

  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `${linkBaseClasses} ${isActive ? activeClassName : inactiveClassName}`;

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `block py-2 px-4 text-lg ${isActive ? 'text-purple-300 font-semibold bg-gray-700' : 'text-gray-200 hover:bg-gray-700'}`;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-50 border-b border-gray-700">
      <nav className="container mx-auto px-4 py-3 max-w-7xl flex justify-between items-center">
        <Link to="/" className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          Spectra
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <NavLink to="/" className={navLinkClasses} end>
            Codificar / Decodificar
          </NavLink>
          <NavLink to="/how-it-works" className={navLinkClasses}>
            Cómo Funciona la Esteganografía
          </NavLink>
        </div>
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="text-gray-300 hover:text-white focus:outline-none">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gray-800 bg-opacity-95 backdrop-blur-sm shadow-xl border-t border-gray-700 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-2">
            <NavLink
              to="/"
              className={mobileNavLinkClasses}
              onClick={toggleMobileMenu}
              end
            >
              Codificar / Decodificar
            </NavLink>
            <NavLink
              to="/how-it-works"
              className={mobileNavLinkClasses}
              onClick={toggleMobileMenu}
            >
              Cómo Funciona la Esteganografía
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}; 