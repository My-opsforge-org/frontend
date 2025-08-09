import { API_BASE_URL_chat } from '../api';
import io from 'socket.io-client';

export interface CommunityMessage {
  id: string;
  content: string;
  sender_id: number;
  community_id: number;
  is_read: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: number;
    name: string;
    avatarUrl: string;
  };
}

export interface CommunityChatResponse {
  success: boolean;
  data?: CommunityMessage[];
  error?: string;
}

export class CommunityChatService {
  private static socket: any = null;
  private static messageCallbacks: ((message: CommunityMessage) => void)[] = [];

  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

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
      // Get backend URL from environment variable or default to backend IP
      const backendUrl = process.env.REACT_APP_BASE_URL?.replace('/api', '') || 
                        process.env.REACT_APP_BACKEND_URL || 
                        'http://4.206.104.171:5002';
      
      this.socket = io(backendUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false
      });

      this.socket.on('connect', () => {
        console.log('Community chat socket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Community chat socket disconnected');
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('Community chat socket connection error:', error);
      });

      this.socket.on('receive_community_message', (message: CommunityMessage) => {
        console.log('Received community message via socket:', message);
        // Notify all registered callbacks
        this.messageCallbacks.forEach((callback) => {
          callback(message);
        });
      });

      return this.socket;
    } catch (error) {
      console.error('Error initializing socket:', error);
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

  // Subscribe to community messages
  static subscribeToCommunityMessages(callback: (message: CommunityMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  // Unsubscribe from community messages
  static unsubscribeFromCommunityMessages(callback: (message: CommunityMessage) => void): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  // Join a community chat room
  static joinCommunityRoom(communityId: number): void {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('join_community_room', communityId);
    }
  }

  // Leave a community chat room
  static leaveCommunityRoom(communityId: number): void {
    const socket = this.getSocket();
    if (socket) {
      const roomId = `community_${communityId}`;
      socket.emit('leave_room', roomId);
    }
  }

  // Get community chat history
  static async getCommunityChatHistory(communityId: number, limit: number = 50): Promise<CommunityChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL_chat}/community-chat/${communityId}/messages?limit=${limit}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch community chat history');
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send a message to a community
  static async sendCommunityMessage(communityId: number, content: string): Promise<CommunityChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL_chat}/community-chat/message`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          communityId,
          content
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        if (response.status === 403) {
          throw new Error('Not a member of the community');
        }
        throw new Error('Failed to send community message');
      }

      const data = await response.json();
      
      return {
        success: true,
        data: [data]
      };
    } catch (error) {
      console.error('Error sending community message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get unread message count for a user in a community
  static async getCommunityUnreadCount(communityId: number, userId: number): Promise<{ unreadCount: number }> {
    const response = await fetch(`${API_BASE_URL_chat}/community-chat/${communityId}/unread-count/${userId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get unread count');
    }

    return response.json();
  }

  // Mark all messages as read for a user in a community
  static async markCommunityMessagesAsRead(communityId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL_chat}/community-chat/${communityId}/mark-read`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark messages as read');
    }
  }

  // Delete a message from a community chat
  static async deleteCommunityMessage(messageId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL_chat}/community-chat/message/${messageId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete message');
    }
  }

  // Get current user ID from token
  static getCurrentUserId(): number | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload.sub, 10);
    } catch (error) {
      return null;
    }
  }
}

