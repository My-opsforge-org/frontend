import CommunityContent from './CommunityContent';
import ChatContent from './ChatContent';
import ExploreContent from './ExploreContent';
import HomeContent from './HomeContent';
import PeopleContent from './PeopleContent';

export default function Content({ isDarkTheme, activeTab }: {
  isDarkTheme: boolean;
  activeTab: string;
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
    default:
      return <HomeContent isDarkTheme={isDarkTheme} />;
  }
} 