import CommunityContent from './CommunityContent';
import ChatContent from './ChatContent';
import ExploreContent from './ExploreContent';
import HomeContent from './HomeContent';
import AvatarsContent from './AvatarsContent';
import Profile from './Profile';

export default function Content({ isDarkTheme, activeTab, setActiveTab, searchQuery }: {
  isDarkTheme: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery?: string;
}) {
  switch (activeTab) {
    case 'home':
      return <HomeContent isDarkTheme={isDarkTheme} />;
    case 'explore':
      return <ExploreContent isDarkTheme={isDarkTheme} />;
    case 'avatars':
      return <AvatarsContent isDarkTheme={isDarkTheme} />;
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