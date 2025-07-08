import React from 'react';
import Header from './Header';
import NavBar from './NavBar';

const Home: React.FC = () => {
  return (
    <div>
      <Header />
      <NavBar />
      <main className="home-main-content">
        <h2 className="home-main-title">Welcome to Go Tripping</h2>
        <p className="home-main-message">
          Start by selecting a province and a radius to find interesting spots near you.
        </p>
      </main>
    </div>
  );
};

export default Home; 