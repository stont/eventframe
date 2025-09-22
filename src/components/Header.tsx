import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-left">
        {/* The main logo now links to the Attending page */}
        <NavLink to="/" className="logo-link">
          <img src="/logo.png" alt="GEF Mixer Logo" className="logo" />
          <span className="header-title"></span>
        </NavLink>
      </div>
      <nav className="header-nav">
        {/* Links updated to match the new routes */}
       <NavLink to="/" end>Home</NavLink>
        {/*<NavLink to="/gallery" end>Gallery</NavLink>*/}
      </nav>
    </header>
  );
};

export default Header;
