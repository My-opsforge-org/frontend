import { Box, CircularProgress, Container } from '@mui/material';
import { useState, useEffect } from 'react';
import { useThemeToggle } from '../App';
import BottomNav from './BottomNav';
import Content from './Content';
import FAB from './FAB';
import Header from './Header';
import { API_BASE_URL } from '../api';

const TABS = ['home', 'explore', 'people', 'connect', 'community'];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showOptions, setShowOptions] = useState(false);
  const { isDark, toggleTheme } = useThemeToggle();
  const [name, setName] = useState('User');
  const [profileImage, setProfileImage] = useState('https://ui-avatars.com/api/?name=User');
  const [profileData, setProfileData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setName(data.name || 'User');
          setProfileImage(data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}`);
          setProfileData(data);
        } else {
          setName('User');
          setProfileImage('https://ui-avatars.com/api/?name=User');
          setProfileData({});
        }
      } catch (err) {
        setName('User');
        setProfileImage('https://ui-avatars.com/api/?name=User');
        setProfileData({});
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
        onProfileUpdate={(newProfile: any) => {
          setProfileData(newProfile);
          setName(newProfile.name || 'User');
          setProfileImage(newProfile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(newProfile.name || 'User')}`);
        }}
      />
      <Content isDarkTheme={isDark} activeTab={activeTab} />
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} isDarkTheme={isDark} />
    </Box>
  );
} 