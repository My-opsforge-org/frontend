import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    top: '180px', // Position below the navigation buttons
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '25px',
    padding: '12px 20px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '45px',
    fontSize: '13px',
    zIndex: 998,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const hoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Go Tripping header with pink background */}
      <div style={{ 
        width: '100%', 
        backgroundColor: '#ff69b4',
        color: '#000',
        padding: '1.5rem',
        textAlign: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000
      }}>
        <h1>Go Tripping</h1>
      </div>
      
      {/* Home button */}
      <Link 
        to="/" 
        style={{ 
          ...buttonStyle, 
          left: '40px',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #ee5a24 0%, #ff6b6b 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
        }}
      >
        Home
      </Link>
      
      {/* Login button */}
      <Link 
        to="/login" 
        style={{ 
          ...buttonStyle, 
          left: '180px',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        }}
      >
        Login
      </Link>
      
      {/* Chat button */}
      <Link 
        to="/chat" 
        style={{ 
          ...buttonStyle, 
          left: '320px',
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          color: '#333'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #fed6e3 0%, #a8edea 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
        }}
      >
        Chat
      </Link>
      
      {/* People button */}
      <Link 
        to="/people" 
        style={{ 
          ...buttonStyle, 
          left: '460px',
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          color: '#333'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #fcb69f 0%, #ffecd2 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';
        }}
      >
        People
      </Link>
      
      {/* Explore button */}
      <Link 
        to="/explore" 
        style={{ 
          ...buttonStyle, 
          left: '600px',
          background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #fecfef 0%, #ff9a9e 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
        }}
      >
        Explore
      </Link>
      
      {/* Community button */}
      <Link 
        to="/community" 
        style={{ 
          ...buttonStyle, 
          left: '740px',
          background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #fbc2eb 0%, #a18cd1 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)';
        }}
      >
        Community
      </Link>
      
      {/* Main content */}
      <div style={{ padding: '2rem', textAlign: 'center', marginTop: '220px' }}>
        <h2>Welcome to Go Tripping</h2>
        <p>Start by selecting a province and a radius to find interesting spots near you.</p>
      </div>
    </div>
  );
}

export default Home; 