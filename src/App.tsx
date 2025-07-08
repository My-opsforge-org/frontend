import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import Explore from './Explore';
import People from './People';
import Community from './Community';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<'home' | 'explore' | 'people' | 'community'>('home');
  const [activeForm, setActiveForm] = useState<'login' | 'register' | null>(null);

  const goHome = () => {
    setActivePage('home');
    setActiveForm(null);
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#ff69b4', color: '#fff', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
        <h1>Go Tripping</h1>
        <p>Explore top destinations near you and chat with fellow travelers!</p>
      </header>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={goHome} style={buttonStyle}>Home</button>
          <button onClick={() => setActivePage('community')} style={buttonStyle}>Community</button>
        </div>
        <div>
          <button onClick={() => setActivePage('people')} style={buttonStyle}>People</button>
          <button onClick={() => setActivePage('explore')} style={buttonStyle}>Explore</button>
          <button onClick={() => setActiveForm('login')} style={buttonStyle}>Login</button>
          <button onClick={() => setActiveForm('register')} style={buttonStyle}>Register</button>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        {activePage === 'home' && !activeForm && (
          <>
            <h2>Welcome to Go Tripping</h2>
            <p>Start by selecting a province and a radius to find interesting spots near you.</p>
          </>
        )}

        {activePage === 'community' && <Community />}
        {activePage === 'explore' && <Explore />}
        {activePage === 'people' && <People />}
        {activeForm === 'login' && (
          <>
            <Login />
            <BackCloseRow goHome={goHome} />
          </>
        )}
        {activeForm === 'register' && (
          <>
            <Register />
            <BackCloseRow goHome={goHome} />
          </>
        )}
      </main>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  color: '#000',
  border: '2px solid black',
  padding: '8px 16px',
  borderRadius: '5px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

function BackCloseRow({ goHome }: { goHome: () => void }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <button onClick={goHome} style={{ ...buttonStyle, marginRight: '10px' }}>Back</button>
      <button onClick={goHome} style={buttonStyle}>Close</button>
    </div>
  );
}

export default App;
