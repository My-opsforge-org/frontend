import { API_BASE_URL } from '../api';

export interface UserProgress {
  id: number;
  userId: number;
  level: number;
  totalXP: number;
  placesDiscovered: number;
  achievements: string[];
  completedLevels: number[];
  currentLevelProgress: Record<number, number>;
  lastPlayedAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  avatarUrl?: string;
  totalXP: number;
  placesDiscovered: number;
  level: number;
  achievements: string[];
}

export interface LevelCompletionData {
  levelId: number;
  xpReward: number;
  placesFound: number;
}

export interface LevelProgressData {
  levelId: number;
  currentProgress: number;
}

class UserProgressService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getUserProgress(): Promise<UserProgress> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-progress`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user progress');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  async updateUserProgress(progress: Partial<UserProgress>): Promise<UserProgress> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-progress`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(progress)
      });

      if (!response.ok) {
        throw new Error('Failed to update user progress');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  async completeLevel(levelData: LevelCompletionData): Promise<UserProgress> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-progress/complete-level`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(levelData)
      });

      if (!response.ok) {
        throw new Error('Failed to complete level');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error completing level:', error);
      throw error;
    }
  }

  async updateLevelProgress(progressData: LevelProgressData): Promise<{ levelId: number; currentProgress: number; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-progress/level-progress`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(progressData)
      });

      if (!response.ok) {
        throw new Error('Failed to update level progress');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating level progress:', error);
      throw error;
    }
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-progress/leaderboard`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
}

export default new UserProgressService(); 