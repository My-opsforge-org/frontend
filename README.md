# Go Tripping Frontend

A modern React TypeScript frontend for the Go Tripping application, designed to work with the Node.js backend.

## 🚀 Features

- **Modern React**: Built with React 18 and TypeScript
- **Material-UI**: Beautiful, responsive UI components
- **Real-time Chat**: Socket.IO integration for live messaging
- **Social Features**: Posts, comments, reactions, communities
- **Exploration**: Location-based place discovery
- **AI Integration**: Avatar chat system
- **Progress Tracking**: User progress and gamification
- **Theme Support**: Dark/light theme toggle
- **Responsive Design**: Mobile-first approach

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend Node.js server running on port 5002

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   **For Local Development:**
   Copy the example file and configure your local environment:
   ```bash
   cp env.local.example .env.local
   # Edit .env.local with your actual API keys and configuration
   ```
   
   **For Production:**
   All environment variables are configured through GitHub Secrets in the deployment workflow.
   
   **Required Environment Variables:**
   - `REACT_APP_BASE_URL` - Backend API base URL
   - `REACT_APP_BACKEND_URL` - Backend server URL
   - `REACT_APP_GOOGLE_MAPS_API_KEY` - Google Maps API key
   - `REACT_APP_GOOGLE_PLACES_API_KEY` - Google Places API key
   - `REACT_APP_FIREBASE_API_KEY` - Firebase API key
   - `REACT_APP_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
   - `REACT_APP_FIREBASE_PROJECT_ID` - Firebase project ID
   - And other Firebase configuration variables

4. **Start the development server**
   ```bash
   npm start
   ```

## 🏃‍♂️ Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the app for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🔌 API Integration

The frontend is configured to use the Backend_node (port 5002) for all API endpoints.

### API Configuration

The main API configuration is in `src/api.ts`:

```typescript
// Backend Node.js API Configuration (Port 5002)
export const API_BASE_URL = 'http://localhost:5002/api';

// API Endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/users/profile',
  
  // Users
  USERS: '/users',
  USER_PROFILE: (id: number) => `/users/${id}`,
  
  // Communities
  COMMUNITIES: '/communities',
  COMMUNITY_DETAILS: (id: number) => `/communities/${id}`,
  
  // Posts
  POSTS: '/posts',
  POST_DETAILS: (id: number) => `/posts/${id}`,
  
  // Chat
  CHAT_SEND: '/chat/send',
  CHAT_HISTORY: (userId1: number, userId2: number) => `/chat/history/${userId1}/${userId2}`,
  
  // Explore
  EXPLORE_GEOCODE: '/explore/geocode',
  EXPLORE_PLACES: '/explore/places',
  
  // And more...
};
```

### Key Endpoints

- **Authentication**: `/api/login`, `/api/register`, `/api/logout`
- **Users**: `/api/users`, `/api/users/profile`
- **Communities**: `/api/communities`
- **Posts**: `/api/posts`
- **Chat**: `/api/chat`
- **Explore**: `/api/explore`
- **Avatar**: `/api/avatar`
- **Progress**: `/api/progress`

## 🎨 UI Components

### Core Components

- **Header**: Navigation and user profile
- **BottomNav**: Mobile navigation
- **ChatContent**: Real-time chat interface
- **CommunityContent**: Community management
- **ExploreContent**: Location-based exploration
- **HomeContent**: Feed and posts
- **Profile**: User profiles and settings

### Theme Support

The application supports both light and dark themes:

```typescript
// Theme toggle hook
const { isDark, toggleTheme } = useThemeToggle();

// Usage in components
<Box sx={{ 
  background: isDark ? '#1a1a2e' : '#f8fafc',
  color: isDark ? 'white' : 'black'
}}>
```

## 🔐 Authentication

The frontend uses JWT tokens for authentication:

```typescript
// Login
const response = await fetch(`${API_BASE_URL}/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Store token
localStorage.setItem('access_token', data.access_token);

// Use token in requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

## 💬 Real-time Chat

Socket.IO integration for real-time messaging:

```typescript
// Initialize socket connection
const socket = io('http://localhost:5002', {
  auth: { token: jwtToken }
});

// Send message
socket.emit('private_message', {
  receiverId: userId,
  content: message
});

// Receive message
socket.on('private_message', (message) => {
  // Handle incoming message
});
```

## 🗺️ Exploration Features

Location-based features using Google Places API:

```typescript
// Geocode address
const geocodeResponse = await fetch(
  `${API_BASE_URL}/explore/geocode?address=${encodeURIComponent(address)}`
);

// Get nearby places
const placesResponse = await fetch(
  `${API_BASE_URL}/explore/places?lat=${lat}&lng=${lng}&radius=${radius}`
);
```

## 🤖 AI Avatar Chat

Integration with OpenAI for AI-powered conversations:

```typescript
// Send message to avatar
const response = await fetch(`${API_BASE_URL}/avatar/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    characterName: 'Elon Musk',
    message: 'Hello!',
    conversationHistory: []
  })
});
```

## 📊 Progress Tracking

User progress and gamification system:

```typescript
// Get user progress
const progress = await fetch(`${API_BASE_URL}/progress`);

// Complete level
const completion = await fetch(`${API_BASE_URL}/progress/complete-level`, {
  method: 'POST',
  body: JSON.stringify({ levelId: 1, xpReward: 100 })
});
```

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your hosting service**
   - Netlify, Vercel, or any static hosting service
   - Configure environment variables for production

3. **Environment Variables for Production**
   ```bash
   REACT_APP_API_URL=https://your-backend-domain.com/api
   REACT_APP_SOCKET_URL=https://your-backend-domain.com
   ```

## 🔧 Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header
│   ├── ChatContent.tsx # Chat interface
│   ├── ExploreContent.tsx # Exploration features
│   └── ...
├── services/           # API services
│   ├── chatService.ts  # Chat functionality
│   ├── avatarService.ts # Avatar features
│   └── ...
├── api.ts             # API configuration
└── App.tsx           # Main application
```

### Adding New Features

1. **Create new component** in `src/components/`
2. **Add API service** in `src/services/` if needed
3. **Update API endpoints** in `src/api.ts`
4. **Add routing** in `App.tsx` if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
