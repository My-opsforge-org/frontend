import React from 'react';

const NavBar: React.FC = () => (
  <nav className="nav-bar">
    <div className="nav-group nav-left">
      <button className="nav-btn">Home</button>
      <button className="nav-btn">Community</button>
    </div>
    <div className="nav-group nav-right">
      <button className="nav-btn">People</button>
      <button className="nav-btn">Explore</button>
      <button className="nav-btn">Login</button>
      <button className="nav-btn">Register</button>
    </div>
  </nav>
);

export default NavBar; 