import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import Home from './Home';
import Explore from './Explore';
import People from './People';
import Community from './Community';
import Login from './Login';
import Register from './Register';
import './Home.css'; // Make sure this is imported

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/people" element={<People />} />
        <Route path="/community" element={<Community />} />
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/register" element={<RegisterWrapper />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

// Reusable button style for <Link>
const linkButtonStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  color: '#000',
  border: '2px solid black',
  padding: '8px 16px',
  borderRadius: '5px',
  fontWeight: 'bold',
  textDecoration: 'none',
  marginLeft: '10px'
};

// Wrappers for login/register with back/close buttons
const LoginWrapper: React.FC = () => (
  <>
    <Login onSwitchToRegister={() => window.location.href = '/register'} />
    <BackCloseRow />
  </>
);

const RegisterWrapper: React.FC = () => (
  <>
    <Register onSwitchToLogin={() => window.location.href = '/login'} />
    <BackCloseRow />
  </>
);

const BackCloseRow: React.FC = () => (
  <div style={{ marginTop: '20px' }}>
    <Link to="/" style={{ ...linkButtonStyle, marginRight: '10px' }}>Back</Link>
    <Link to="/" style={linkButtonStyle}>Close</Link>
  </div>
);

export default App;
