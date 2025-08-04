# Chat Feature Documentation

## Overview
The chat feature provides a comprehensive messaging system with modern UI design, supporting both individual and group conversations. The implementation includes real-time messaging capabilities, file sharing, and a responsive design that works seamlessly with the existing dark/light theme system.

## Components

### ChatContent.tsx
The main chat component that handles:
- Conversation list display
- Individual chat conversations
- Message sending and receiving
- Search functionality
- New conversation creation
- Real-time updates

**Key Features:**
- Responsive design with dark/light theme support
- Search conversations by name or message content
- Create new conversations
- Mark conversations as read
- File upload support (images and documents)
- Message status indicators (sent, delivered, read)
- Online/offline status for contacts

### MessageBubble.tsx
A reusable component for rendering individual messages with:
- Different message types (text, image, file)
- Read status indicators
- File download functionality
- Responsive design
- Theme-aware styling

### ChatUtils.ts
Utility functions and types for chat functionality:
- Message and Conversation interfaces
- Time formatting utilities
- Message grouping by date
- Conversation sorting and filtering
- Mock data generators for development

## Avatar Chat Feature

### Overview
The avatar chat feature allows users to have conversations with inspiring historical figures and personalities. When a user clicks on an avatar in the Avatars panel, they can start a chat session with that avatar.

### Components

#### AvatarsContent.tsx
- Main component for displaying the avatar selection panel
- Shows a grid of available avatars with their images, names, and quotes
- Clicking an avatar opens a detail dialog with options to:
  - View avatar information
  - Start a chat session

#### AvatarChat.tsx
- Full-screen chat interface for conversations with avatars
- Features:
  - Real-time messaging with avatar personalities
  - Typing indicators
  - Auto-scroll to latest messages
  - Responsive design with dark/light theme support
  - Avatar-specific responses based on their quotes and personalities

### How to Use

1. Navigate to the Avatars tab in the main navigation
2. Click on any avatar to view their details
3. Click "Start Chat" to begin a conversation
4. Type your message and press Enter or click the send button
5. The avatar will respond with personality-appropriate messages
6. Click the back arrow or close button to exit the chat

### Technical Details

- Uses Material-UI components for consistent styling
- Integrates with existing MessageBubble component for message display
- Supports both dark and light themes
- Responsive design that works on mobile and desktop
- Simulates realistic typing delays for better UX

### Avatar Personalities

Each avatar has a unique personality based on their historical quotes and achievements. The chat system generates contextual responses that reflect the avatar's character and wisdom.

## Features

### 1. Conversation Management
- **List View**: Display all conversations with last message, timestamp, and unread count
- **Search**: Filter conversations by name or message content
- **Create New**: Add new conversations with custom names
- **Sorting**: Conversations sorted by unread count and last message time

### 2. Messaging
- **Real-time**: Send and receive messages instantly
- **Message Types**: Support for text, images, and files
- **Status Indicators**: Visual feedback for message delivery and read status
- **Auto-scroll**: Automatically scroll to latest messages
- **Keyboard Support**: Send messages with Enter key

### 3. File Sharing
- **Images**: Display images inline with preview
- **Documents**: File attachments with download functionality
- **Upload**: Drag and drop or click to upload files

### 4. User Experience
- **Responsive Design**: Works on mobile and desktop
- **Theme Support**: Seamless dark/light theme integration
- **Loading States**: Visual feedback during operations
- **Error Handling**: Graceful error handling with user feedback

## API Integration

### ChatService.ts
The service layer provides API integration for:
- Fetching conversations and messages
- Sending messages
- Creating conversations
- File uploads
- Search functionality
- Online status management

**Endpoints:**
- `GET /chat/conversations` - Get all conversations
- `GET /chat/conversations/:id/messages` - Get conversation messages
- `POST /chat/conversations/:id/messages` - Send a message
- `POST /chat/conversations` - Create new conversation
- `POST /chat/conversations/:id/read` - Mark as read
- `DELETE /chat/conversations/:id` - Delete conversation
- `POST /chat/conversations/:id/upload` - Upload file
- `GET /chat/conversations/search` - Search conversations
- `GET /chat/online-users` - Get online users

## Usage

### Basic Implementation
```tsx
import ChatContent from './components/ChatContent';

function App() {
  return (
    <ChatContent isDarkTheme={isDarkTheme} />
  );
}
```

### With API Integration
```tsx
import { ChatService } from './services/chatService';

// Get conversations
const response = await ChatService.getConversations();
if (response.success) {
  setConversations(response.data);
}

// Send message
const messageResponse = await ChatService.sendMessage(conversationId, {
  text: 'Hello!',
  sender: 'me',
  type: 'text'
});
```

## Styling

The chat components use Material-UI with custom styling that adapts to the theme:
- **Light Theme**: Clean white backgrounds with blue accents
- **Dark Theme**: Dark backgrounds with proper contrast
- **Responsive**: Mobile-first design with breakpoints
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live messaging
2. **Push Notifications**: Browser notifications for new messages
3. **Voice Messages**: Audio recording and playback
4. **Video Calls**: Integration with video calling features
5. **Message Reactions**: Emoji reactions to messages
6. **Message Threading**: Reply to specific messages
7. **Message Search**: Search within conversations
8. **Message Encryption**: End-to-end encryption
9. **Message Translation**: Automatic translation support
10. **Chat Bots**: AI-powered chat assistance

## Development

### Mock Data
The chat feature includes comprehensive mock data for development:
- Sample conversations with different types
- Mock messages with various content
- Online/offline status simulation
- File attachment examples

### Testing
- Unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for API calls
- E2E tests for user workflows

## Dependencies

- **Material-UI**: UI components and theming
- **React**: Core framework
- **TypeScript**: Type safety
- **Date-fns**: Date manipulation utilities

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance

- Virtual scrolling for large message lists
- Lazy loading of images and files
- Efficient re-rendering with React.memo
- Optimized bundle size with code splitting 