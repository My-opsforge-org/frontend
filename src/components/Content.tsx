import CommunityContent from './CommunityContent';
import ChatContent from './ChatContent';
import ExploreContent from './ExploreContent';
import HomeContent from './HomeContent';
import PeopleContent from './PeopleContent';
import Profile from './Profile';

export default function Content({ isDarkTheme, activeTab, setActiveTab }: {
  isDarkTheme: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  switch (activeTab) {
    case 'home':
      return <HomeContent isDarkTheme={isDarkTheme} />;
    case 'explore':
      return <ExploreContent isDarkTheme={isDarkTheme} />;
    case 'people':
      return <PeopleContent isDarkTheme={isDarkTheme} />;
    case 'connect':
      return <ChatContent isDarkTheme={isDarkTheme} />;
    case 'community':
      return <CommunityContent isDarkTheme={isDarkTheme} />;
    case 'profile':
      return <Profile isDarkTheme={isDarkTheme} onBack={() => setActiveTab('home')} />;
    default:
      return <HomeContent isDarkTheme={isDarkTheme} />;
  }
} 