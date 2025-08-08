import CommunityContent from './CommunityContent';
import ChatContent from './ChatContent';
import ExploreContent from './ExploreContent';
import HomeContent from './HomeContent';
import AvatarsContent from './AvatarsContent';
import Profile from './Profile';

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
      return <HomeContent isDarkTheme={isDarkTheme} />;
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