export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  participants: string[];
  isGroup: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
};

export const formatMessageTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const generateMessageId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
};

export const formatDateHeader = (date: Date): string => {
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};

export const groupMessagesByDate = (messages: Message[]): { [key: string]: Message[] } => {
  const grouped: { [key: string]: Message[] } = {};
  
  messages.forEach(message => {
    const dateKey = message.timestamp.toDateString();
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(message);
  });
  
  return grouped;
};

export const sortConversations = (conversations: Conversation[]): Conversation[] => {
  return conversations.sort((a, b) => {
    // Sort by unread count first (higher unread count first)
    if (a.unreadCount !== b.unreadCount) {
      return b.unreadCount - a.unreadCount;
    }
    // Then sort by last message time (most recent first)
    return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
  });
};

export const searchConversations = (conversations: Conversation[], query: string): Conversation[] => {
  if (!query.trim()) return conversations;
  
  const lowercaseQuery = query.toLowerCase();
  return conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(lowercaseQuery) ||
    conversation.lastMessage.toLowerCase().includes(lowercaseQuery)
  );
};

export const markConversationAsRead = (
  conversations: Conversation[],
  conversationId: string
): Conversation[] => {
  return conversations.map(conv =>
    conv.id === conversationId
      ? { ...conv, unreadCount: 0 }
      : conv
  );
};

export const updateConversationLastMessage = (
  conversations: Conversation[],
  conversationId: string,
  message: string
): Conversation[] => {
  return conversations.map(conv =>
    conv.id === conversationId
      ? { 
          ...conv, 
          lastMessage: message, 
          lastMessageTime: new Date(),
          unreadCount: 0 // Mark as read when user sends a message
        }
      : conv
  );
};

export const createNewConversation = (
  name: string,
  isGroup: boolean = false,
  participants: string[] = []
): Conversation => {
  return {
    id: generateMessageId(),
    name,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=007AFF&color=fff`,
    lastMessage: '',
    lastMessageTime: new Date(),
    unreadCount: 0,
    isOnline: false,
    participants,
    isGroup
  };
};

export const createNewMessage = (
  text: string,
  sender: string,
  type: 'text' | 'image' | 'file' = 'text',
  fileUrl?: string,
  fileName?: string
): Message => {
  return {
    id: generateMessageId(),
    text,
    sender,
    timestamp: new Date(),
    isRead: false,
    type,
    fileUrl,
    fileName
  };
};

// Mock data generators for development
export const generateMockConversations = (): Conversation[] => {
  return [
    {
      id: '1',
      name: 'John Doe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=007AFF&color=fff',
      lastMessage: 'Hey, how are you doing?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
      unreadCount: 2,
      isOnline: true,
      participants: ['1', 'me'],
      isGroup: false
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=FF6B6B&color=fff',
      lastMessage: 'The trip was amazing!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
      unreadCount: 0,
      isOnline: false,
      participants: ['2', 'me'],
      isGroup: false
    },
    {
      id: '3',
      name: 'Travel Group',
      avatar: 'https://ui-avatars.com/api/?name=Travel+Group&background=4ECDC4&color=fff',
      lastMessage: 'Mike: Planning for next weekend',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
      unreadCount: 5,
      isOnline: true,
      participants: ['1', '2', '3', 'me'],
      isGroup: true
    }
  ];
};

export const generateMockMessages = (conversationId: string): Message[] => {
  const baseTime = Date.now() - 1000 * 60 * 30; // 30 minutes ago
  
  return [
    {
      id: '1',
      text: 'Hey, how are you doing?',
      sender: conversationId,
      timestamp: new Date(baseTime),
      isRead: true,
      type: 'text'
    },
    {
      id: '2',
      text: 'I\'m doing great! Just got back from a trip to Paris.',
      sender: 'me',
      timestamp: new Date(baseTime + 1000 * 60 * 5),
      isRead: true,
      type: 'text'
    },
    {
      id: '3',
      text: 'That sounds amazing! How was it?',
      sender: conversationId,
      timestamp: new Date(baseTime + 1000 * 60 * 10),
      isRead: true,
      type: 'text'
    },
    {
      id: '4',
      text: 'It was incredible! The food, the culture, everything was perfect.',
      sender: 'me',
      timestamp: new Date(baseTime + 1000 * 60 * 15),
      isRead: true,
      type: 'text'
    }
  ];
}; 