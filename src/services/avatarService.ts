import { API_BASE_URL_chat } from '../api';

export interface AvatarItem {
  name: string;
  image_url: string;
  quote: string;
  description: string;
}

export interface AvatarApiResponse {
  success: boolean;
  message: string;
  data: AvatarItem[];
  count: number;
}

export class AvatarService {
  // Get all avatars
  static async getAvatars(): Promise<AvatarApiResponse> {
    try {
      console.log('Making API call to:', `${API_BASE_URL_chat}/avatars`); // Debug log
      const response = await fetch(`${API_BASE_URL_chat}/avatars`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status); // Debug log
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching avatars:', error);
      throw error;
    }
  }
} 