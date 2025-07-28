import { API_BASE_URL } from '../api';
import { Message, Conversation } from '../components/ChatUtils';

export interface ChatApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ChatService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get all conversations for the current user
  static async getConversations(): Promise<ChatApiResponse<Conversation[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get messages for a specific conversation
  static async getMessages(conversationId: string): Promise<ChatApiResponse<Message[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send a new message
  static async sendMessage(
    conversationId: string, 
    message: Omit<Message, 'id' | 'timestamp' | 'isRead'>
  ): Promise<ChatApiResponse<Message>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Create a new conversation
  static async createConversation(
    name: string,
    participants: string[],
    isGroup: boolean = false
  ): Promise<ChatApiResponse<Conversation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          name,
          participants,
          isGroup
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Mark conversation as read
  static async markAsRead(conversationId: string): Promise<ChatApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/read`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to mark conversation as read');
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Delete a conversation
  static async deleteConversation(conversationId: string): Promise<ChatApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Upload file for chat
  static async uploadFile(
    conversationId: string,
    file: File,
    type: 'image' | 'file'
  ): Promise<ChatApiResponse<{ fileUrl: string; fileName: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Search conversations
  static async searchConversations(query: string): Promise<ChatApiResponse<Conversation[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to search conversations');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get online users
  static async getOnlineUsers(): Promise<ChatApiResponse<string[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/online-users`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch online users');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
} 