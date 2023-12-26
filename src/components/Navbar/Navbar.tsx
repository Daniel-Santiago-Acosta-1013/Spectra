import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.scss';

const Navbar: React.FC = () => {
    return (
        <nav className="Navbar">
            <div className="logo">
                <img src="public/spectra-icon-no-background.svg" alt="Spectra Logo" />
            </div>
            <div className="nav-links">
                <Link to="/">Encrypt</Link>
                <Link to="/decrypt">Decrypt</Link>
            </div>
        </nav>
    );
};

export default Navbar;
