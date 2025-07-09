import { Box, CircularProgress, Container } from '@mui/material';
import { useState } from 'react';
import { useThemeToggle } from '../App';
import BottomNav from './BottomNav';
import Content from './Content';
import FAB from './FAB';
import Header from './Header';

const TABS = ['home', 'explore', 'people', 'connect', 'community'];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showOptions, setShowOptions] = useState(false);
  const { isDark, toggleTheme } = useThemeToggle();

  // Mock user/profile data
  const name = 'User';
  const profileImage = 'https://ui-avatars.com/api/?name=User';
  const profileData = {};

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: isDark ? '#1C1C1E' : '#F8F9FA', minHeight: '100vh', position: 'relative' }}>
      <Header
        name={name}
        profileImage={profileImage}
        isDarkTheme={isDark}
        showOptions={showOptions}
        setShowOptions={setShowOptions}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        profileData={profileData}
        activeTab={activeTab}
      />
      <Content isDarkTheme={isDark} activeTab={activeTab} />
      <FAB isDarkTheme={isDark} onClick={() => alert('Create new post')} />
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} isDarkTheme={isDark} />
    </Box>
  );
} 