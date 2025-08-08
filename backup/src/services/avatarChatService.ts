import { API_BASE_URL_chat } from '../api';

export interface AvatarChatMessage {
  id: string;
  characterName: string;
  userMessage: string;
  characterResponse: string;
  timestamp: Date;
  userId: string;
}

export interface AvatarChatRequest {
  characterName: string;
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface AvatarChatResponse {
  success: boolean;
  data: AvatarChatMessage;
}

export interface CharacterInfo {
  name: string;
  personality: {
    systemPrompt: string;
    temperature: number;
  };
}

export interface AvailableCharacter {
  name: string;
  available: boolean;
}

export class AvatarChatService {
  // Send message to character
  static async sendMessageToCharacter(
    characterName: string,
    message: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<AvatarChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL_chat}/avatar-chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterName,
          message,
          conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message to character:', error);
      throw error;
    }
  }

  // Get available characters
  static async getAvailableCharacters(): Promise<{ success: boolean; data: AvailableCharacter[] }> {
    try {
      const response = await fetch(`${API_BASE_URL_chat}/avatar-chat/characters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting available characters:', error);
      throw error;
    }
  }

  // Get character info
  static async getCharacterInfo(characterName: string): Promise<{ success: boolean; data: CharacterInfo }> {
    try {
      const response = await fetch(`${API_BASE_URL_chat}/avatar-chat/characters/${encodeURIComponent(characterName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting character info:', error);
      throw error;
    }
  }
} 