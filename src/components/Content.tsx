import { Box } from '@mui/material';
import CommunityContent from './CommunityContent';
import ChatContent from './ChatContent';
import ExploreContent from './ExploreContent';
import HomeContent from './HomeContent';
import AvatarsContent from './AvatarsContent';
import Profile from './Profile';
import HomeGrid from './HomeGrid';

export default function Content({ isDarkTheme, activeTab, setActiveTab, searchQuery, questLocation, questRadius }: {
  isDarkTheme: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery?: string;
  questLocation?: string;
  questRadius?: number;
}) {
  switch (activeTab) {
    case 'home':
      return (
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2, md: 3 },
            px: { xs: 1, md: 1.5 },
            pb: { xs: 10, md: 12 },
            pt: 0,
            maxWidth: 1920,
            mx: 'auto',
            gridTemplateColumns: {
              xs: '1fr',
              md: '65% 35%',
              lg: '65% 35%',
              xl: '65% 35%',
            },
            alignItems: 'start',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <HomeContent isDarkTheme={isDarkTheme} />
          </Box>
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'sticky',
              top: 0,
              alignSelf: 'start',
              maxHeight: 'calc(100vh - 96px)',
              overflowY: 'auto',
              pb: { md: 8 },
            }}
          >
            <HomeGrid isDarkTheme={isDarkTheme} setActiveTab={setActiveTab} layout="sidebar" searchQuery={searchQuery} />
          </Box>
        </Box>
      );
    case 'explore':
      return <ExploreContent isDarkTheme={isDarkTheme} questLocation={questLocation} questRadius={questRadius} />;
    case 'avatars':
      return <AvatarsContent isDarkTheme={isDarkTheme} searchQuery={searchQuery} />;
    case 'connect':
      return <ChatContent isDarkTheme={isDarkTheme} searchQuery={searchQuery} />;
    case 'community':
      return <CommunityContent isDarkTheme={isDarkTheme} searchQuery={searchQuery} />;
    case 'profile':
      return <Profile isDarkTheme={isDarkTheme} onBack={() => setActiveTab('home')} />;
    default:
      return <HomeContent isDarkTheme={isDarkTheme} />;
  }
} 