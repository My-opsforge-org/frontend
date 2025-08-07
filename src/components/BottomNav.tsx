import GroupsIcon from '@mui/icons-material/Groups';
import HomeIcon from '@mui/icons-material/Home';
import AvatarIcon from '@mui/icons-material/AccountCircle';
import PublicIcon from '@mui/icons-material/Public';
import ChatIcon from '@mui/icons-material/Chat';
import { BottomNavigation, BottomNavigationAction, Paper, Box } from '@mui/material';

const TABS = [
  { label: 'Home', value: 'home', icon: <HomeIcon /> },
  { label: 'Explore', value: 'explore', icon: <PublicIcon /> },
  { label: 'Companions', value: 'avatars', icon: <AvatarIcon /> },
  { label: 'Chat', value: 'connect', icon: <ChatIcon /> },
  { label: 'Community', value: 'community', icon: <GroupsIcon /> },
];

export default function BottomNav({ activeTab, setActiveTab, isDarkTheme }: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkTheme: boolean;
}) {
  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100vw',
        borderRadius: '24px 24px 0 0',
        background: isDarkTheme 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
        boxShadow: isDarkTheme
          ? '0 -8px 32px rgba(0, 0, 0, 0.4)'
          : '0 -8px 32px rgba(0, 0, 0, 0.1)',
        border: isDarkTheme
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        zIndex: 1300,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDarkTheme
            ? 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }
      }}
      elevation={6}
    >
      <BottomNavigation
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        showLabels
        sx={{
          borderRadius: '24px 24px 0 0',
          bgcolor: 'transparent',
          minHeight: 80,
          pt: 1,
          pb: 2,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '8px 12px',
            color: isDarkTheme ? '#9ca3af' : '#6b7280',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&.Mui-selected': {
              color: isDarkTheme ? '#6366f1' : '#6366f1',
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 600,
                fontSize: '0.75rem',
                opacity: 1,
              },
              '& .MuiSvgIcon-root': {
                transform: 'scale(1.2)',
                filter: isDarkTheme 
                  ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))'
                  : 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))',
              }
            },
            '&:hover': {
              color: isDarkTheme ? '#818cf8' : '#4f46e5',
              transform: 'translateY(-2px)',
              '& .MuiSvgIcon-root': {
                transform: 'scale(1.1)',
              }
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 500,
              opacity: 0.8,
              transition: 'all 0.3s ease',
            },
            '& .MuiSvgIcon-root': {
              fontSize: '1.5rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }
          },
        }}
      >
        {TABS.map(tab => (
          <BottomNavigationAction
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={tab.icon}
            sx={{
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: activeTab === tab.value ? 20 : 0,
                height: 3,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: activeTab === tab.value ? 1 : 0,
              }
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
} 