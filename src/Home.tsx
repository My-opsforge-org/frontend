import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div
      className="home"
      style={{
        backgroundImage: "url('/park-background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100vw'
      }}
    >
      <nav className="home-navbar">
        <div className="home-navbar-left">
          <span className="home-logo">Go Tripping</span>
        </div>
        <div className="home-navbar-right">
          <Link to="/login" className="home-nav-btn home-login-btn">Log in</Link>
          <Link to="/people" className="home-nav-btn home-signup-btn">People</Link>
          <Link to="/explore" className="home-nav-btn">Explore</Link>
          <Link to="/community" className="home-nav-btn">Community</Link>
        </div>
      </nav>

      <main className="home-main-section">
        <h1 className="home-main-title">Welcome to Go Tripping</h1>
        <p className="home-main-message">
          Explore top destinations near you and chat with fellow travelers!
        </p>
      </main>
    </div>
  );
};

export default Home;
