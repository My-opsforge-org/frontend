import { API_BASE_URL_chat } from '../api';

export interface Community {
  id: number;
  name: string;
  description: string;
  is_member?: boolean;
}

export interface CommunityMember {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  age?: number;
  gender?: string;
  sun_sign?: string;
  interests: string[];
  joinedAt: string;
}

export interface CommunityMembersResponse {
  community: {
    id: number;
    name: string;
    description: string;
    memberCount: number;
  };
  members: CommunityMember[];
}

export interface CommunityWithLastMessage {
  id: number;
  name: string;
  description: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  lastMessageSender: string | null;
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

  async getUserCommunitiesWithLastMessages(): Promise<CommunityWithLastMessage[]> {
    const response = await fetch(`${API_BASE_URL_chat}/communities/user/with-messages`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user communities');
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

const communityService = new CommunityService();
export default communityService;
