import { API_BASE_URL_chat } from '../api';
import { Message, Conversation } from '../components/ChatUtils';
import io from 'socket.io-client';

export interface ChatApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface NodeMessage {
  id: string;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  age: number | null;
  gender: string | null;
  sun_sign: string | null;
  interests: string[];
  location: { lat: number; lng: number } | null;
  createdAt: string;
  updatedAt: string;
  followers_count: number;
  following_count: number;
}

export class ChatService {
  private static socket: any = null;

  // Initialize Socket.IO connection
  static initializeSocket(): any {
    if (this.socket) {
      return this.socket;
    }

    const token = localStorage.getItem('access_token');
    
    if (!token) {
      return null;
    }

    try {
      this.socket = io('http://localhost:5001', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        // Socket connected successfully
      });

      this.socket.on('disconnect', () => {
        // Socket disconnected
      });

      this.socket.on('connect_error', (error: any) => {
        // Socket connection error
      });

      this.socket.on('receive_message', (message: any) => {
        // Received message via Socket.IO
      });

      return this.socket;
    } catch (error) {
      return null;
    }
  }

  // Get socket instance
  static getSocket(): any {
    if (!this.socket) {
      return this.initializeSocket();
    }
    return this.socket;
  }

  // Join a chat room
  static joinChatRoom(userId1: number, userId2: number): void {
    const socket = this.getSocket();
    if (socket) {
      const roomId = [userId1, userId2].sort().join('_');
      socket.emit('join_room', roomId);
    }
  }

  // Listen for incoming messages
  static onReceiveMessage(callback: (message: NodeMessage) => void): void {
    const socket = this.getSocket();
    if (socket) {
      socket.on('receive_message', (message: NodeMessage) => {
        callback(message);
      });
    }
  }

  // Send message via Socket.IO (in addition to HTTP)
  static sendMessageRealtime(senderId: number, receiverId: number, content: string): void {
    const socket = this.getSocket();
    if (socket) {
      const roomId = [senderId, receiverId].sort().join('_');
      socket.emit('send_message', {
        roomId,
        receiverId,
        content
      });
    }
  }

  // Get current user ID from token
  static getCurrentUserId(): number | null {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      return null;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const userId = payload.id || payload.userId || payload.sub || payload.user_id;
      
      if (userId) {
        const numericUserId = Number(userId);
        return numericUserId;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  // Get chat history between current user and another user
  static async getChatHistory(otherUserId: number, limit: number = 50, before?: string): Promise<ChatApiResponse<Message[]>> {
    try {
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      let url = `${API_BASE_URL_chat}/chat/history/${currentUserId}/${otherUserId}?limit=${limit}`;
      if (before) {
        url += `&before=${before}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const nodeMessages: NodeMessage[] = await response.json();
      
      // Convert Node.js message format to frontend format
      const messages: Message[] = nodeMessages.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender_id === currentUserId ? 'me' : 'other',
        timestamp: new Date(msg.createdAt || Date.now()),
        isRead: msg.is_read || false,
        type: 'text'
      }));

      return { success: true, data: messages };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send a new message
  static async sendMessage(receiverId: number, content: string): Promise<ChatApiResponse<Message>> {
    try {
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const requestBody = {
        receiverId,
        content
      };

      const response = await fetch(`${API_BASE_URL_chat}/chat/send`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message: ${response.status} ${errorText}`);
      }

      const responseData = await response.json();
      
      // Handle the backend response format which has a data wrapper
      const nodeMessage: NodeMessage = responseData.data || responseData;
      
      // Convert to frontend format
      const message: Message = {
        id: nodeMessage.id,
        text: nodeMessage.content || '',
        sender: 'me',
        timestamp: new Date(nodeMessage.createdAt || Date.now()),
        isRead: nodeMessage.is_read || false,
        type: 'text'
      };

      return { success: true, data: message };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Mark messages as read
  static async markAsRead(otherUserId: number): Promise<ChatApiResponse<void>> {
    try {
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL_chat}/chat/read/${currentUserId}/${otherUserId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get unread message count
  static async getUnreadCount(): Promise<ChatApiResponse<number>> {
    try {
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL_chat}/chat/unread/${currentUserId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get unread count');
      }

      const data = await response.json();
      return { success: true, data: data.unreadCount };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Delete a message
  static async deleteMessage(messageId: string): Promise<ChatApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL_chat}/chat/message/${messageId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get conversations list (this would need to be implemented on the backend)
  // For now, we'll return an empty array as the Node.js backend doesn't have this endpoint
  static async getConversations(): Promise<ChatApiResponse<Conversation[]>> {
    try {
      const currentUserId = this.getCurrentUserId();
      
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL_chat}/chat/conversations/${currentUserId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch conversations: ${response.status} ${errorText}`);
      }

      const backendConversations = await response.json();
      
      // Convert backend conversation format to frontend format
      const conversations: Conversation[] = backendConversations.map((conv: any) => ({
        id: conv.id.toString(),
        name: conv.name,
        avatar: conv.avatar || '',
        lastMessage: conv.lastMessage,
        lastMessageTime: new Date(conv.timestamp),
        unreadCount: conv.unreadCount,
        isOnline: false, // Default to false since we don't track online status
        participants: [conv.id.toString(), 'me'],
        isGroup: false // Default to false since we're only handling direct messages
      }));

      return { success: true, data: conversations };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get messages for a specific conversation (alias for getChatHistory)
  static async getMessages(otherUserId: number): Promise<ChatApiResponse<Message[]>> {
    return this.getChatHistory(otherUserId);
  }

  // Create a new conversation (not applicable for direct messaging)
  static async createConversation(
    name: string,
    participants: string[],
    isGroup: boolean = false
  ): Promise<ChatApiResponse<Conversation>> {
    // This is not applicable for the current Node.js backend structure
    return { 
      success: false, 
      error: 'Conversation creation not supported in current backend' 
    };
  }

  // Upload file for chat (not implemented in Node.js backend)
  static async uploadFile(
    conversationId: string,
    file: File,
    type: 'image' | 'file'
  ): Promise<ChatApiResponse<{ fileUrl: string; fileName: string }>> {
    return { 
      success: false, 
      error: 'File upload not implemented in current backend' 
    };
  }

  // Search conversations (not implemented in Node.js backend)
  static async searchConversations(query: string): Promise<ChatApiResponse<Conversation[]>> {
    return { 
      success: false, 
      error: 'Search not implemented in current backend' 
    };
  }

  // Get online users (not implemented in Node.js backend)
  static async getOnlineUsers(): Promise<ChatApiResponse<string[]>> {
    return { 
      success: false, 
      error: 'Online users not implemented in current backend' 
    };
  }

  // Test simple POST endpoint
  static async testSimplePost(): Promise<ChatApiResponse<boolean>> {
    try {
      const testData = {
        test: "data",
        message: "hello"
      };
      
      const response = await fetch(`${API_BASE_URL_chat}/test-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data: true };
      } else {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test POST request to chat endpoint
  static async testPostRequest(): Promise<ChatApiResponse<boolean>> {
    try {
      const testData = {
        receiverId: 1,
        content: "test message"
      };
      
      const response = await fetch(`${API_BASE_URL_chat}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(testData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
      }
      
      return { success: true, data: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test authentication token
  static async testAuthToken(): Promise<ChatApiResponse<boolean>> {
    try {
      const currentUserId = this.getCurrentUserId();
      
      if (!currentUserId) {
        return { success: false, error: 'No user ID found in token' };
      }

      // Try to access a protected endpoint
      const response = await fetch(`${API_BASE_URL_chat}/users`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        return { success: true, data: true };
      } else {
        const errorText = await response.text();
        return { success: false, error: `Auth failed: ${response.status} ${errorText}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test chat endpoint accessibility
  static async testChatEndpoint(): Promise<ChatApiResponse<boolean>> {
    try {
      const response = await fetch(`${API_BASE_URL_chat}/chat/send`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return { success: true, data: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test backend connection
  static async testConnection(): Promise<ChatApiResponse<boolean>> {
    try {
      const response = await fetch(`${API_BASE_URL_chat}/test-db`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data: true };
      } else {
        return { success: false, error: `Backend not accessible: ${response.status}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get all users
  static async getAllUsers(): Promise<ChatApiResponse<User[]>> {
    try {
      const response = await fetch(`${API_BASE_URL_chat}/users`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const users: User[] = await response.json();
      return { success: true, data: users };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
} 