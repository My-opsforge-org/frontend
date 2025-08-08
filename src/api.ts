// Backend Node.js API Configuration (Port 5002)
export const API_BASE_URL = 'http://localhost:5002/api';

// Legacy reference for backward compatibility (will be removed in future versions)
export const API_BASE_URL_chat = 'http://localhost:5002/api';

// Environment-based configuration
const getApiBaseUrl = () => {
  // Check if we're in production or have a specific environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default to localhost:5002 for development
  return 'http://localhost:5002/api';
};

// Export the dynamic API base URL
export const getApiUrl = () => getApiBaseUrl();

// API Endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  PROFILE: '/users/profile',
  
  // Users
  USERS: '/users',
  USER_PROFILE: (id: number) => `/users/${id}`,
  USER_FOLLOWERS: (id: number) => `/users/${id}/followers`,
  USER_FOLLOWING: (id: number) => `/users/${id}/following`,
  FOLLOW_USER: (id: number) => `/users/${id}/follow`,
  UNFOLLOW_USER: (id: number) => `/users/${id}/unfollow`,
  
  // Communities
  COMMUNITIES: '/communities',
  COMMUNITY_DETAILS: (id: number) => `/communities/${id}`,
  COMMUNITY_MEMBERS: (id: number) => `/communities/${id}/members`,
  COMMUNITY_POSTS: (id: number) => `/communities/${id}/posts`,
  JOIN_COMMUNITY: (id: number) => `/communities/${id}/join`,
  LEAVE_COMMUNITY: (id: number) => `/communities/${id}/leave`,
  
  // Posts
  POSTS: '/posts',
  POST_DETAILS: (id: number) => `/posts/${id}`,
  POST_LIKE: (id: number) => `/posts/${id}/like`,
  POST_BOOKMARK: (id: number) => `/posts/${id}/bookmark`,
  POST_COMMENTS: (id: number) => `/posts/${id}/comments`,
  
  // Comments
  COMMENTS: '/comments',
  COMMENT_DETAILS: (id: number) => `/comments/${id}`,
  
  // Reactions
  REACTIONS: '/reactions',
  
  // Bookmarks
  BOOKMARKS: '/bookmarks',
  
  // Feed
  FEED: '/feed',
  
  // Explore
  EXPLORE_GEOCODE: '/explore/geocode',
  EXPLORE_PLACES: '/explore/places',
  
  // Avatar
  AVATARS: '/avatar',
  AVATAR_CHAT: '/avatar/chat',
  
  // Chat
  CHAT_SEND: '/chat/send',
  CHAT_HISTORY: (userId1: number, userId2: number) => `/chat/history/${userId1}/${userId2}`,
  CHAT_CONVERSATIONS: (userId: number) => `/chat/conversations/${userId}`,
  CHAT_READ: (userId1: number, userId2: number) => `/chat/read/${userId1}/${userId2}`,
  CHAT_UNREAD: (userId: number) => `/chat/unread/${userId}`,
  
  // Progress
  USER_PROGRESS: '/progress',
  USER_PROGRESS_COMPLETE_LEVEL: '/progress/complete-level',
  USER_PROGRESS_LEVEL_PROGRESS: '/progress/level-progress',
  USER_PROGRESS_LEADERBOARD: '/progress/leaderboard',
  
  // Health and Testing
  HEALTH: '/health',
  TEST_DB: '/test-db',
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
