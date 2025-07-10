import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import PublicIcon from '@mui/icons-material/Public';
import ChatIcon from '@mui/icons-material/Chat';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';

const TABS = [
  { label: 'Home', value: 'home', icon: <HomeIcon /> },
  { label: 'Explore', value: 'explore', icon: <PublicIcon /> },
  { label: 'People', value: 'people', icon: <PeopleIcon /> },
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
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        bgcolor: isDarkTheme ? '#23272f' : '#fff',
        zIndex: 1300,
      }}
      elevation={6}
    >
      <BottomNavigation
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        showLabels
        sx={{
          borderRadius: '20px 20px 0 0',
          bgcolor: 'transparent',
          minHeight: 64,
        }}
      >
        {TABS.map(tab => (
          <BottomNavigationAction
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={tab.icon}
            sx={{
              color: isDarkTheme ? '#b0b8c1' : '#4a4a4a',
              '&.Mui-selected': {
                color: isDarkTheme ? '#90caf9' : '#1976d2',
              },
              fontWeight: 500,
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
} 