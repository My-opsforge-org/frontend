import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  TextField,
  IconButton,
  Paper,
  Badge,
  Chip,
  InputAdornment,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Videocam as VideoIcon,
  Call as CallIcon,
  ArrowBack as ArrowBackIcon,
  MoreHoriz as MoreHorizIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';
import { 
  Message, 
  Conversation, 
  formatTime, 
  createNewMessage,
  updateConversationLastMessage,
  markConversationAsRead,
  searchConversations,
  sortConversations
} from './ChatUtils';
import { ChatService, User } from '../services/chatService';
import { API_BASE_URL } from '../api';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile';
import CommunityService, { CommunityWithLastMessage } from '../services/communityService';
import CommunityMessageModal from './CommunityMessageModal';
import { CommunityChatService, CommunityMessage } from '../services/communityChatService';

// Extended User interface to include follow status
interface ExtendedUser extends User {
  is_following?: boolean;
}

interface ChatUser {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chat-tabpanel-${index}`}
      aria-labelledby={`chat-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ChatContent({ isDarkTheme, searchQuery }: { isDarkTheme: boolean; searchQuery?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [communities, setCommunities] = useState<CommunityWithLastMessage[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState<{[userId: number]: boolean}>({});
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({open: false, message: '', severity: 'success'});
  const [currentUserId, setCurrentUserId] = useState<number|null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number|null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityWithLastMessage | null>(null);
  const [communityMessageModalOpen, setCommunityMessageModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load conversations and users on component mount
  useEffect(() => {
    loadConversations();
    loadUsers();
    loadCommunities();
    loadCurrentUser();
    
    // Check if user came from search field and switch to "All Users" tab
    const searchClicked = localStorage.getItem('searchClicked');
    if (searchClicked === 'true') {
      setTabValue(1); // Switch to "All Users" tab
      localStorage.removeItem('searchClicked'); // Clear the flag
    }
  }, [loadCurrentUser, loadUsers, loadConversations, loadCommunities]);

  // Initialize Socket.IO connection when component mounts
  useEffect(() => {
    ChatService.initializeSocket();
    
          // Listen for real-time messages globally (for all conversations)
      ChatService.onReceiveMessage((nodeMessage) => {
        console.log('Received message via Socket.IO:', nodeMessage);
        const currentUserId = ChatService.getCurrentUserId();
        
        // Don't add messages sent by the current user
        if (nodeMessage.sender_id === currentUserId) {
          console.log('Skipping own message');
          return;
        }
        
        // Don't add empty messages
        if (!nodeMessage.content || nodeMessage.content.trim() === '') {
          console.log('Skipping empty message');
          return;
        }
        
        console.log('Processing incoming message from user:', nodeMessage.sender_id);
        
        // Update conversations list for incoming messages
        setConversations(prev => {
          // Find the sender user in our users list
          const senderUser = users.find(user => user.id === nodeMessage.sender_id);
          
          if (senderUser) {
            const conversationId = nodeMessage.sender_id.toString();
            const existingConversation = prev.find(conv => conv.id === conversationId);
            
            if (existingConversation) {
              // Update existing conversation
              return prev.map(conv => 
                conv.id === conversationId 
                  ? { 
                      ...conv, 
                      lastMessage: nodeMessage.content,
                      lastMessageTime: new Date(),
                      unreadCount: conv.unreadCount + 1 // Increment unread count
                    }
                  : conv
              );
            } else {
              // Create new conversation
              const newConversation: Conversation = {
                id: conversationId,
                name: senderUser.name || senderUser.email,
                avatar: senderUser.avatarUrl || '',
                lastMessage: nodeMessage.content,
                lastMessageTime: new Date(),
                unreadCount: 1,
                isOnline: false,
                participants: [conversationId, 'me'],
                isGroup: false
              };
              return [newConversation, ...prev];
            }
          }
          
          return prev;
        });
      });

    // Initialize CommunityChatService socket and listen for community messages
    CommunityChatService.initializeSocket();
    
    // Listen for real-time community messages
    const handleCommunityMessage = (communityMessage: CommunityMessage) => {
      console.log('Received community message:', communityMessage);
      const currentUserId = CommunityChatService.getCurrentUserId();
      
      // Don't update if it's the current user's message
      if (communityMessage.sender_id === currentUserId) {
        console.log('Skipping own message');
        return;
      }
      
      // Don't update if message is empty
      if (!communityMessage.content || communityMessage.content.trim() === '') {
        console.log('Skipping empty message');
        return;
      }
      
      // Don't increment unread count if user is currently in the community chat modal
      const isCurrentlyInCommunityChat = communityMessageModalOpen && selectedCommunity?.id === communityMessage.community_id;
      console.log('Is currently in community chat:', isCurrentlyInCommunityChat);
      
      // Update communities list for incoming messages
      setCommunities(prev => {
        const communityIndex = prev.findIndex(comm => comm.id === communityMessage.community_id);
        
        if (communityIndex !== -1) {
          const updatedCommunities = [...prev];
          const community = updatedCommunities[communityIndex];
          
          // Update the community with new message and increment unread count only if not currently viewing
          updatedCommunities[communityIndex] = {
            ...community,
            lastMessage: communityMessage.content,
            lastMessageTime: new Date(communityMessage.createdAt).toISOString(),
            unreadCount: isCurrentlyInCommunityChat ? community.unreadCount : community.unreadCount + 1,
            lastMessageSender: communityMessage.sender?.name || 'Unknown User'
          };
          
          console.log('Updated community:', updatedCommunities[communityIndex]);
          
          // Sort communities by last message time (most recent first)
          return updatedCommunities.sort((a, b) => {
            return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
          });
        } else {
          console.log('Community not found in list:', communityMessage.community_id);
        }
        
        return prev;
      });
    };

    // Subscribe to community messages
    CommunityChatService.subscribeToCommunityMessages(handleCommunityMessage);

    // Cleanup function
    return () => {
      CommunityChatService.unsubscribeFromCommunityMessages(handleCommunityMessage);
    };
  }, [users, communityMessageModalOpen, selectedCommunity]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  // Load messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id);
      
      // Mark conversation as read when opened
      setConversations(prev => markConversationAsRead(prev, selectedUser.id.toString()));
      
      // Join chat room for real-time messaging
      const currentUserId = ChatService.getCurrentUserId();
      if (currentUserId) {
        ChatService.joinChatRoom(currentUserId, selectedUser.id);
      }
      
      // Listen for real-time messages for the currently selected user
      const handleSelectedUserMessage = (nodeMessage: any) => {
        console.log('Selected user message handler:', nodeMessage);
        const currentUserId = ChatService.getCurrentUserId();
        
        // Don't add messages sent by the current user
        if (nodeMessage.sender_id === currentUserId) {
          console.log('Skipping own message in selected user handler');
          return;
        }
        
        // Don't add empty messages
        if (!nodeMessage.content || nodeMessage.content.trim() === '') {
          console.log('Skipping empty message in selected user handler');
          return;
        }
        
        // Only handle messages for the currently selected user
        if (nodeMessage.sender_id === selectedUser.id || nodeMessage.receiver_id === selectedUser.id) {
          console.log('Processing message for selected user:', selectedUser.id);
          
          // Convert Node.js message format to frontend format
          const message: Message = {
            id: nodeMessage.id,
            text: nodeMessage.content,
            sender: nodeMessage.sender_id === currentUserId ? 'me' : 'other',
            timestamp: new Date(nodeMessage.createdAt || Date.now()),
            isRead: nodeMessage.is_read || false,
            type: 'text'
          };
          
          // Check if message already exists to avoid duplicates
          setMessages(prev => {
            const messageExists = prev.some(existingMsg => 
              existingMsg.text === message.text && 
              existingMsg.sender === message.sender &&
              Math.abs(existingMsg.timestamp.getTime() - message.timestamp.getTime()) < 5000 // Within 5 seconds
            );
            
            if (messageExists) {
              console.log('Message already exists, skipping');
              return prev;
            }
            
            console.log('Adding new message to selected user chat');
            const newMessages = [...prev, message];
            return newMessages;
          });
        } else {
          console.log('Message not for selected user. Sender:', nodeMessage.sender_id, 'Receiver:', nodeMessage.receiver_id, 'Selected:', selectedUser.id);
        }
      };
      
      // Add listener for selected user messages
      ChatService.onReceiveMessage(handleSelectedUserMessage);
      
      // Cleanup function to remove listener when selectedUser changes
      return () => {
        // Note: Socket.IO doesn't have a direct way to remove specific listeners
        // The global listener will handle all messages, so this is mainly for organization
      };
    }
  }, [selectedUser]);

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }
      // Get current user id from profile
      const profileRes = await fetch(`${API_BASE_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (profileRes.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login', { replace: true });
        return;
      }
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setCurrentUserId(profileData.id);
      }
    } catch (err) {
      console.error('Error loading current user:', err);
    }
  };

  const loadConversations = async () => {
    setConversationsLoading(true);
    try {
      const response = await ChatService.getConversations();
      
      if (response.success && Array.isArray(response.data)) {
        setConversations(sortConversations(response.data));
      } else {
        setConversations([]); // Defensive: always set to array
      }
    } catch (error) {
      setConversations([]); // Defensive: always set to array
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUsers([]);
        setUsersLoading(false);
        return;
      }
      // Try to fetch all users by setting a very high per_page value
      const response = await fetch(`${API_BASE_URL}/users?per_page=10000`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login', { replace: true });
        return;
      }
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      setUsers([]); // Defensive: always set to array
    } finally {
      setUsersLoading(false);
    }
  };

  const loadCommunities = async () => {
    setCommunitiesLoading(true);
    try {
      const communitiesData = await CommunityService.getUserCommunitiesWithLastMessages();
      setCommunities(communitiesData);
    } catch (error) {
      setCommunities([]);
    } finally {
      setCommunitiesLoading(false);
    }
  };

  const handleCommunitySelect = async (community: CommunityWithLastMessage) => {
    setSelectedCommunity(community);
    setCommunityMessageModalOpen(true);
    
    // Mark messages as read when entering the community chat
    if (community.unreadCount > 0) {
      try {
        await CommunityChatService.markCommunityMessagesAsRead(community.id);
        
        // Update the local state to reset unread count
        setCommunities(prev => {
          const updatedCommunities = prev.map(comm => 
            comm.id === community.id 
              ? { ...comm, unreadCount: 0 }
              : comm
          );
          return updatedCommunities;
        });
      } catch (error) {
        console.error('Failed to mark community messages as read:', error);
      }
    }
  };

  const handleCommunityMessageSent = () => {
    // Update the selected community's last message and reset unread count
    if (selectedCommunity) {
      setCommunities(prev => {
        const updatedCommunities = prev.map(comm => 
          comm.id === selectedCommunity.id 
            ? {
                ...comm,
                lastMessage: 'You sent a message', // This will be updated when we reload
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0, // Reset unread count for current user
                lastMessageSender: 'You'
              }
            : comm
        );
        
        // Sort communities by last message time (most recent first)
        return updatedCommunities.sort((a, b) => {
          return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        });
      });
    }
    
    // Also reload communities to get the actual message content
    loadCommunities();
  };

  const loadMessages = async (userId: number) => {
    setLoading(true);
    try {
      const response = await ChatService.getChatHistory(userId);
      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        setMessages([]);
      }
    } catch (error) {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: number) => {
    setFollowLoading((prev) => ({ ...prev, [userId]: true }));
    setSnackbar({open: false, message: '', severity: 'success'});
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setSnackbar({open: true, message: 'Not authenticated. Please log in.', severity: 'error'});
        setFollowLoading((prev) => ({ ...prev, [userId]: false }));
        return;
      }
      const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers((prev) => prev.map(u => u.id === userId ? { ...u, is_following: true } : u));
        setSnackbar({open: true, message: data.message || 'Followed successfully!', severity: 'success'});
      } else {
        setSnackbar({open: true, message: data.error || data.message || 'Failed to follow user', severity: 'error'});
      }
    } catch (err) {
      setSnackbar({open: true, message: 'Network error', severity: 'error'});
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId: number) => {
    setFollowLoading((prev) => ({ ...prev, [userId]: true }));
    setSnackbar({open: false, message: '', severity: 'success'});
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setSnackbar({open: true, message: 'Not authenticated. Please log in.', severity: 'error'});
        setFollowLoading((prev) => ({ ...prev, [userId]: false }));
        return;
      }
      const response = await fetch(`${API_BASE_URL}/users/${userId}/unfollow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers((prev) => prev.map(u => u.id === userId ? { ...u, is_following: false } : u));
        setSnackbar({open: true, message: data.message || 'Unfollowed successfully!', severity: 'success'});
      } else {
        setSnackbar({open: true, message: data.error || data.message || 'Failed to unfollow user', severity: 'error'});
      }
    } catch (err) {
      setSnackbar({open: true, message: 'Network error', severity: 'error'});
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedUser) {
      try {
        const response = await ChatService.sendMessage(selectedUser.id, newMessage.trim());
        
        // Also send via Socket.IO for real-time delivery
        const currentUserId = ChatService.getCurrentUserId();
        if (currentUserId) {
          ChatService.sendMessageRealtime(currentUserId, selectedUser.id, newMessage.trim());
        }
        
        if (response.success && response.data) {
          // Add the message immediately from HTTP API response
          const sentMessage = response.data;
          
          // Ensure the message has valid text content
          if (!sentMessage.text || sentMessage.text.trim() === '') {
            sentMessage.text = newMessage.trim();
          }
          
          setMessages(prev => [...prev, sentMessage]);
          
          setNewMessage('');
          
          // Update conversation's last message and ensure it exists in the list
          setConversations(prev => {
            const updatedConversations = updateConversationLastMessage(prev, selectedUser.id.toString(), sentMessage.text);
            
            // If conversation doesn't exist, create it
            const existingConversation = updatedConversations.find(conv => conv.id === selectedUser.id.toString());
            if (!existingConversation) {
              const newConversation: Conversation = {
                id: selectedUser.id.toString(),
                name: selectedUser.name,
                avatar: selectedUser.avatar,
                lastMessage: sentMessage.text,
                lastMessageTime: new Date(),
                unreadCount: 0,
                isOnline: selectedUser.isOnline,
                participants: [selectedUser.id.toString(), 'me'],
                isGroup: false
              };
              return [newConversation, ...updatedConversations];
            }
            
            return updatedConversations;
          });
      
          // Scroll to bottom
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          // Fallback to local state update
          const message = createNewMessage(newMessage, 'me');
          setMessages(prev => [...prev, message]);
          setNewMessage('');
          setConversations(prev => {
            const updatedConversations = updateConversationLastMessage(prev, selectedUser.id.toString(), newMessage);
            
            // If conversation doesn't exist, create it
            const existingConversation = updatedConversations.find(conv => conv.id === selectedUser.id.toString());
            if (!existingConversation) {
              const newConversation: Conversation = {
                id: selectedUser.id.toString(),
                name: selectedUser.name,
                avatar: selectedUser.avatar,
                lastMessage: newMessage,
                lastMessageTime: new Date(),
                unreadCount: 0,
                isOnline: selectedUser.isOnline,
                participants: [selectedUser.id.toString(), 'me'],
                isGroup: false
              };
              return [newConversation, ...updatedConversations];
            }
            
            return updatedConversations;
          });
        }
      } catch (error) {
        // Fallback to local state update
        const message = createNewMessage(newMessage, 'me');
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setConversations(prev => {
          const updatedConversations = updateConversationLastMessage(prev, selectedUser.id.toString(), newMessage);
          
          // If conversation doesn't exist, create it
          const existingConversation = updatedConversations.find(conv => conv.id === selectedUser.id.toString());
          if (!existingConversation) {
            const newConversation: Conversation = {
              id: selectedUser.id.toString(),
              name: selectedUser.name,
              avatar: selectedUser.avatar,
              lastMessage: newMessage,
              lastMessageTime: new Date(),
              unreadCount: 0,
              isOnline: selectedUser.isOnline,
              participants: [selectedUser.id.toString(), 'me'],
              isGroup: false
            };
            return [newConversation, ...updatedConversations];
          }
          
          return updatedConversations;
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations based on search query
  const filteredConversations = searchQuery
    ? searchConversations(conversations, searchQuery)
    : conversations;

  // Filter users based on search query
  const filteredUsers = searchQuery
    ? users.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  // Filter communities based on search query
  const filteredCommunities = searchQuery
    ? communities.filter(community => 
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : communities;

  const handleStartChatWithUser = (user: ExtendedUser) => {
    // Create a new conversation for this user
    const newConversation: Conversation = {
      id: user.id.toString(),
      name: user.name || user.email,
      avatar: user.avatarUrl || '',
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      isOnline: false,
      participants: [user.id.toString(), 'me'],
      isGroup: false
    };

    // Add the conversation to the list if it doesn't already exist
    setConversations(prev => {
      const existingConversation = prev.find(conv => conv.id === user.id.toString());
      if (!existingConversation) {
        return [newConversation, ...prev];
      }
      return prev;
    });

    // Set the selected user to start chatting
    setSelectedUser({
      id: user.id,
      name: user.name || user.email,
      avatar: user.avatarUrl || '',
      isOnline: false
    });
  };



  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (selectedUserId !== null) {
    return <Profile userId={selectedUserId} isDarkTheme={isDarkTheme} onBack={() => setSelectedUserId(null)} />;
  }

  if (selectedUser) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: isDarkTheme ? '#1a1a1a' : '#ffffff',
          color: isDarkTheme ? '#ffffff' : '#000000',
          zIndex: 1300,
        display: 'flex', 
        flexDirection: 'column',
          height: '100vh',
          width: '100vw'
        }}
      >
        {/* Header */}
        <Box
          sx={{ 
            borderBottom: isDarkTheme 
              ? '1px solid rgba(255, 255, 255, 0.08)' 
              : '1px solid rgba(0, 0, 0, 0.08)',
            p: 2.5,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            bgcolor: isDarkTheme ? '#1a1a1a' : '#ffffff',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isDarkTheme
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, transparent 100%)'
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, transparent 100%)',
              pointerEvents: 'none',
            }
          }}
        >
          <Box display="flex" alignItems="center" gap={2.5}>
            <IconButton
              onClick={() => setSelectedUser(null)}
              sx={{
                color: isDarkTheme ? '#d1d5db' : '#374151',
                bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
            <ArrowBackIcon />
          </IconButton>
            <Avatar
              src={selectedUser.avatar}
              sx={{
                width: 48,
                height: 48,
                border: isDarkTheme ? '2px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(99, 102, 241, 0.1)',
                boxShadow: isDarkTheme 
                  ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 12px rgba(99, 102, 241, 0.15)',
              }}
            >
            {selectedUser.name && selectedUser.name.length > 0
              ? selectedUser.name.charAt(0).toUpperCase()
              : 'U'}
          </Avatar>
            <Box>
              <Typography 
                variant="h6" 
                component="div"
                sx={{
                  fontWeight: 600,
                  color: isDarkTheme ? '#ffffff' : '#1f2937',
                  mb: 0.5
                }}
              >
              {selectedUser.name}
            </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: selectedUser.isOnline ? '#10b981' : '#6b7280',
                    boxShadow: selectedUser.isOnline 
                      ? '0 0 8px rgba(16, 185, 129, 0.4)' 
                      : 'none'
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{
                    color: selectedUser.isOnline 
                      ? (isDarkTheme ? '#10b981' : '#059669') 
                      : (isDarkTheme ? '#9ca3af' : '#6b7280'),
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </Typography>
          </Box>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <IconButton
              sx={{
                color: isDarkTheme ? '#d1d5db' : '#374151',
                bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
            <CallIcon />
          </IconButton>
            <IconButton
              sx={{
                color: isDarkTheme ? '#d1d5db' : '#374151',
                bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
            <VideoIcon />
          </IconButton>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                color: isDarkTheme ? '#d1d5db' : '#374151',
                bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
            <MoreHorizIcon />
          </IconButton>
          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Messages Area */}
          <Box
            sx={{
          flex: 1, 
              overflowY: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              background: isDarkTheme
                ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.3) 0%, rgba(15, 15, 35, 0.2) 100%)'
                : 'linear-gradient(135deg, rgba(248, 250, 252, 0.5) 0%, rgba(241, 245, 249, 0.3) 100%)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: isDarkTheme
                  ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 50%)'
                  : 'radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.02) 0%, transparent 50%)',
                pointerEvents: 'none',
              }
            }}
          >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
            </Box>
          ) : (
            messages.map((message) => (
                <Box
                key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                                     <Box
                     sx={{
                       maxWidth: '75%',
                       display: 'flex',
                       flexDirection: message.sender === 'me' ? 'row-reverse' : 'row',
                       alignItems: 'flex-end',
                       gap: 1
                     }}
                   >
                     {message.sender !== 'me' && (
                       <Avatar
                         src={selectedUser.avatar}
                         sx={{ width: 32, height: 32 }}
                       >
                         {selectedUser.name && selectedUser.name.length > 0
                           ? selectedUser.name.charAt(0).toUpperCase()
                           : 'U'}
                       </Avatar>
                     )}
                     <Paper
                       sx={{
                         p: 2,
                         bgcolor: message.sender === 'me' 
                           ? (isDarkTheme ? '#6366f1' : '#3b82f6')
                           : (isDarkTheme ? '#374151' : '#f3f4f6'),
                         color: message.sender === 'me' ? '#ffffff' : (isDarkTheme ? '#ffffff' : '#1f2937'),
                         borderRadius: 3,
                         maxWidth: '100%',
                         minWidth: '120px',
                         wordBreak: 'break-word',
                         boxShadow: message.sender === 'me'
                           ? (isDarkTheme ? '0 4px 12px rgba(99, 102, 241, 0.3)' : '0 4px 12px rgba(59, 130, 246, 0.2)')
                           : (isDarkTheme ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.08)'),
                         border: message.sender === 'me'
                           ? '1px solid rgba(255, 255, 255, 0.1)'
                           : (isDarkTheme ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)'),
                         transition: 'all 0.2s ease',
                         '&:hover': {
                           transform: 'translateY(-1px)',
                           boxShadow: message.sender === 'me'
                             ? (isDarkTheme ? '0 6px 16px rgba(99, 102, 241, 0.4)' : '0 6px 16px rgba(59, 130, 246, 0.3)')
                             : (isDarkTheme ? '0 6px 16px rgba(0, 0, 0, 0.3)' : '0 6px 16px rgba(0, 0, 0, 0.12)'),
                         }
                       }}
                     >
                      {message.sender !== 'me' && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mb: 0.5,
                            fontWeight: 600,
                            color: message.sender === 'me' ? 'rgba(255, 255, 255, 0.8)' : (isDarkTheme ? '#9ca3af' : '#6b7280')
                          }}
                        >
                          {selectedUser.name}
                        </Typography>
                      )}
                      <Typography variant="body2">
                        {message.text}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          color: message.sender === 'me' ? 'rgba(255, 255, 255, 0.7)' : (isDarkTheme ? '#6b7280' : '#9ca3af'),
                          textAlign: message.sender === 'me' ? 'right' : 'left'
                        }}
                      >
                        {formatTime(message.timestamp)}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

          {/* Input Area */}
          <Box
          sx={{ 
                p: 3,
                pb: 12, // Increased bottom padding to account for bottom navigation
                borderTop: isDarkTheme 
                  ? '1px solid rgba(255, 255, 255, 0.08)' 
                  : '1px solid rgba(0, 0, 0, 0.08)',
                bgcolor: isDarkTheme ? '#1a1a1a' : '#ffffff',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: isDarkTheme
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, transparent 100%)'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.01) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }
              }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
                placeholder="Type your message..."
              variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Attach file">
                          <IconButton 
              size="small"
              sx={{
                              color: isDarkTheme ? '#9ca3af' : '#6b7280',
                              bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                              borderRadius: 1.5,
                              '&:hover': {
                                bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <AttachFileIcon fontSize="small" />
            </IconButton>
                        </Tooltip>
                        <Tooltip title="Add emoji">
            <IconButton 
                            size="small"
                            sx={{
                              color: isDarkTheme ? '#9ca3af' : '#6b7280',
                              bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                              borderRadius: 1.5,
                              '&:hover': {
                                bgcolor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <EmojiIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Send message">
                          <IconButton
                            size="small"
                            onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading}
              sx={{ 
                              color: newMessage.trim() ? '#ffffff' : (isDarkTheme ? '#6b7280' : '#9ca3af'),
                              bgcolor: newMessage.trim() 
                                ? (isDarkTheme ? '#6366f1' : '#3b82f6') 
                                : (isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
                              borderRadius: 1.5,
                '&:hover': {
                                bgcolor: newMessage.trim() 
                                  ? (isDarkTheme ? '#5b21b6' : '#2563eb') 
                                  : (isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <SendIcon fontSize="small" />
            </IconButton>
                        </Tooltip>
          </Box>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: isDarkTheme ? '#374151' : '#f9fafb',
                    borderRadius: 3,
                    '& fieldset': {
                      borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      borderRadius: 3,
                    },
                    '&:hover fieldset': {
                      borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: isDarkTheme ? '#6366f1' : '#3b82f6',
                      borderWidth: '2px',
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: isDarkTheme ? '#ffffff' : '#1f2937',
                    '&::placeholder': {
                      color: isDarkTheme ? '#9ca3af' : '#6b7280',
                      opacity: 1,
                    }
                  }
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Chat Options Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { bgcolor: isDarkTheme ? '#2C2C2E' : '#fff' }
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Typography color={isDarkTheme ? 'white' : 'black'}>
              View Profile
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Typography color={isDarkTheme ? 'white' : 'black'}>
              Mute Notifications
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Typography color={isDarkTheme ? 'white' : 'black'}>
              Clear Chat
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Typography color={isDarkTheme ? 'white' : 'black'}>
              Block User
            </Typography>
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: 'calc(100vh - 136px)', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      bgcolor: isDarkTheme ? '#1C1C1E' : '#F8F9FA'
    }}>
      {/* Header */}
      <Box
        sx={{
          py: 1.5,
          px: 2,
          background: isDarkTheme
            ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.6) 0%, rgba(15, 15, 35, 0.7) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: isDarkTheme
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(99, 102, 241, 0.08)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDarkTheme
              ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)'
              : 'radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 50%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            letterSpacing: 0.3,
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(31, 41, 55, 0.9)',
            textAlign: 'left',
            position: 'relative',
            zIndex: 1,
            fontSize: '1.1rem'
          }}
        >
          Messages
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper 
        elevation={1} 
        sx={{ 
          bgcolor: isDarkTheme ? '#2C2C2E' : '#fff',
          flexShrink: 0
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: isDarkTheme ? 'white' : 'black'
            },
            '& .Mui-selected': {
              color: '#007AFF'
            }
          }}
        >
          <Tab 
            icon={<ChatIcon />} 
            label="Conversations" 
            iconPosition="start"
          />
          <Tab 
            icon={<PeopleIcon />} 
            label="All Users" 
            iconPosition="start"
          />
          <Tab 
            icon={<GroupsIcon />} 
            label="Groups" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
      {/* Conversations List */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          pb: 12, // Increased bottom padding to account for bottom navigation
          bgcolor: isDarkTheme ? '#1C1C1E' : '#F8F9FA'
        }}>
          {conversationsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Typography>Loading conversations...</Typography>
            </Box>
          ) : (
        <List sx={{ bgcolor: 'transparent' }}>
              {filteredConversations.map((conversation) => (
            <React.Fragment key={conversation.id}>
              <ListItem 
                component="div"
                  onClick={() => {
                    // Convert conversation to user format
                    setSelectedUser({
                      id: parseInt(conversation.id),
                      name: conversation.name,
                      avatar: conversation.avatar,
                      isOnline: conversation.isOnline
                    });
                  }}
                sx={{ 
                  bgcolor: isDarkTheme ? '#1C1C1E' : '#fff',
                  '&:hover': {
                    bgcolor: isDarkTheme ? '#2C2C2E' : '#F5F5F5'
                  },
                  cursor: 'pointer'
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      conversation.isOnline ? (
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: '#4CAF50',
                            border: '2px solid white'
                          }}
                        />
                      ) : null
                    }
                  >
                    <Avatar src={conversation.avatar}>
                      {conversation.name && conversation.name.length > 0
                        ? conversation.name.charAt(0).toUpperCase()
                        : 'U'}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                      <Typography 
                        variant="subtitle1" 
                        color={isDarkTheme ? 'white' : 'black'}
                        sx={{ 
                          fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal'
                        }}
                      >
                        {conversation.name}
                      </Typography>
                  }
                  secondary={
                      <Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                            fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal'
                        }}
                      >
                        {conversation.lastMessage}
                      </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(conversation.lastMessageTime)}
                        </Typography>
                      </Box>
                    }
                  />
                      {conversation.unreadCount > 0 && (
                        <Chip
                          label={conversation.unreadCount}
                          size="small"
                          sx={{ 
                            bgcolor: '#007AFF', 
                            color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                                 </ListItem>
                 <Divider />
               </React.Fragment>
             ))}
             {filteredConversations.length === 0 && !conversationsLoading && (
               <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                 <Typography color="text.secondary">
                   No conversations yet. Start chatting with users!
                 </Typography>
               </Box>
             )}
           </List>
         )}
       </Box>
     </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Users List with People Features */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          pb: 12, // Increased bottom padding to account for bottom navigation
          bgcolor: isDarkTheme ? '#1C1C1E' : '#F8F9FA'
        }}>
          {usersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress color={isDarkTheme ? 'inherit' : 'primary'} />
            </Box>
          ) : (
            <Paper sx={{ 
              width: '100%', 
              height: '100%', 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              p: 0, 
              m: 0, 
              boxShadow: 'none', 
              borderRadius: 0,
              bgcolor: 'transparent'
            }}>
              <List sx={{ 
                width: '100%', 
                flex: 1, 
                overflow: 'auto', 
                p: 0, 
                paddingBottom: '64px',
                bgcolor: 'transparent'
              }}>
                {filteredUsers.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No people found." />
                  </ListItem>
                ) : (
                  filteredUsers.map((user) => (
                    <ListItem key={user.id} divider secondaryAction={
                      <Box display="flex" gap={1}>
                        <Tooltip title="Message">
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleStartChatWithUser(user)}
                          >
                            <ChatBubbleOutlineIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={currentUserId === user.id ? 'You cannot follow yourself' : user.is_following ? 'Unfollow' : 'Follow'}>
                          <span>
                            <IconButton
                              color={user.is_following ? 'error' : 'secondary'}
                              size="small"
                              disabled={followLoading[user.id] || currentUserId === user.id}
                              onClick={() => user.is_following ? handleUnfollow(user.id) : handleFollow(user.id)}
                            >
                              {followLoading[user.id] ? <CircularProgress size={20} /> : user.is_following ? <PersonRemoveIcon /> : <PersonAddIcon />}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    }>
                      <ListItemAvatar>
                        <Avatar 
                          src={user.avatarUrl || undefined}
                          onClick={() => setSelectedUserId(user.id)} 
                          style={{ cursor: 'pointer' }}
                        >
                          {user.name && user.name.length > 0
                            ? user.name.charAt(0).toUpperCase()
                            : <ChatBubbleOutlineIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <span 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            {user.name || user.email}
                          </span>
                        }
                        secondary={user.email + (user.bio ? ` — ${user.bio}` : '')}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Groups List */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          pb: 12, // Increased bottom padding to account for bottom navigation
          bgcolor: isDarkTheme ? '#1C1C1E' : '#F8F9FA'
        }}>
          {communitiesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Typography>Loading groups...</Typography>
            </Box>
          ) : (
            <List sx={{ bgcolor: 'transparent' }}>
              {filteredCommunities.map((community) => (
                <React.Fragment key={community.id}>
                  <ListItem 
                    component="div"
                    onClick={() => {
                      handleCommunitySelect(community);
                    }}
                    sx={{ 
                      bgcolor: isDarkTheme ? '#1C1C1E' : '#fff',
                      '&:hover': {
                        bgcolor: isDarkTheme ? '#2C2C2E' : '#F5F5F5'
                      },
                      cursor: 'pointer'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#6366f1' }}>
                        <GroupsIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="subtitle1" 
                          color={isDarkTheme ? 'white' : 'black'}
                          sx={{ 
                            fontWeight: community.unreadCount > 0 ? 'bold' : 'normal'
                          }}
                        >
                          {community.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              fontWeight: community.unreadCount > 0 ? 'bold' : 'normal'
                            }}
                          >
                            {community.lastMessage || 'No messages yet'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(new Date(community.lastMessageTime))}
                          </Typography>
                        </Box>
                      }
                    />
                    {community.unreadCount > 0 && (
                      <Chip
                        label={community.unreadCount}
                        size="small"
                        sx={{ 
                          bgcolor: '#007AFF', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {filteredCommunities.length === 0 && !communitiesLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <Typography color="text.secondary">
                    No groups yet. Join communities to see them here!
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </Box>
      </TabPanel>

      {/* Community Message Modal */}
      {selectedCommunity && (
        <CommunityMessageModal
          open={communityMessageModalOpen}
          onClose={() => {
            setCommunityMessageModalOpen(false);
            setSelectedCommunity(null);
            // Refresh communities list when modal is closed to ensure unread counts are up to date
            loadCommunities();
          }}
          communityId={selectedCommunity.id}
          communityName={selectedCommunity.name}
          isDarkTheme={isDarkTheme}
          onMessageSent={handleCommunityMessageSent}
        />
      )}

      {/* Snackbar for follow/unfollow notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({...prev, open: false}))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
} 