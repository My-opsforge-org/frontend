import { Box, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { useThemeToggle } from '../App';
import BottomNav from './BottomNav';
import Content from './Content';
import Header from './Header';
import { API_BASE_URL } from '../api';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showOptions, setShowOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark, toggleTheme } = useThemeToggle();
  const [name, setName] = useState('User');
  const [profileImage, setProfileImage] = useState('https://ui-avatars.com/api/?name=User');
  const [profileData, setProfileData] = useState({});
  const [questLocation, setQuestLocation] = useState('');
  const [questRadius, setQuestRadius] = useState(5);

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
      <Box 
        sx={{
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: isDark 
            ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark 
              ? 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
              : 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
            pointerEvents: 'none',
          }
        }}
      >
        <CircularProgress 
          sx={{ 
            color: '#6366f1',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }} 
        />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        position: 'relative',
        background: isDark 
          ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark 
            ? 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
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
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLocationChange={setQuestLocation}
        onRadiusChange={setQuestRadius}
        onProfileUpdate={(newProfile: any) => {
          setProfileData(newProfile);
          setName(newProfile.name || 'User');
          setProfileImage(newProfile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(newProfile.name || 'User')}`);
        }}
      />
      <Content 
        isDarkTheme={isDark} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        searchQuery={searchQuery}
        questLocation={questLocation}
        questRadius={questRadius}
      />
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} isDarkTheme={isDark} />
    </Box>
  );
} 