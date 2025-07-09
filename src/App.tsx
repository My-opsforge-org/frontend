import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import React, { createContext, useContext, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Profile from './components/Profile';
import Register from './components/Register';

// Theme context for toggling dark/light mode
const ThemeToggleContext = createContext({ toggleTheme: () => {}, isDark: true });
export const useThemeToggle = () => useContext(ThemeToggleContext);

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const toggleTheme = () => {
    setIsDarkTheme((prev) => {
      localStorage.setItem('theme', !prev ? 'dark' : 'light');
      return !prev;
    });
  };

  const theme = createTheme({
    palette: {
      mode: isDarkTheme ? 'dark' : 'light',
      primary: { main: '#007AFF' },
    },
  });

  return (
    <ThemeToggleContext.Provider value={{ toggleTheme, isDark: isDarkTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ThemeToggleContext.Provider>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default App;
