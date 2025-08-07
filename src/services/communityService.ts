import { API_BASE_URL_chat } from '../api';

export interface CommunityMember {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  age: number | null;
  gender: string | null;
  sun_sign: string | null;
  interests: string[];
  joinedAt: string;
}

export interface Community {
  id: number;
  name: string;
  description: string;
  memberCount: number;
}

export interface CommunityMembersResponse {
  community: Community;
  members: CommunityMember[];
}

class CommunityService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getCommunityMembers(communityId: number): Promise<CommunityMembersResponse> {
    const response = await fetch(`${API_BASE_URL_chat}/communities/${communityId}/members`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch community members');
    }

    return response.json();
  }

  async joinCommunity(communityId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL_chat}/communities/${communityId}/join`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to join community');
    }
  }

  async leaveCommunity(communityId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL_chat}/communities/${communityId}/leave`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to leave community');
    }
  }
}

export default new CommunityService();
