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
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
  Menu,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Add as AddIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Videocam as VideoIcon,
  Call as CallIcon,
  ArrowBack as ArrowBackIcon,
  MoreHoriz as MoreHorizIcon,
  People as PeopleIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { 
  Message, 
  Conversation, 
  formatTime, 
  createNewConversation,
  createNewMessage,
  updateConversationLastMessage,
  markConversationAsRead,
  searchConversations,
  sortConversations
} from './ChatUtils';
import MessageBubble from './MessageBubble';
import { ChatService, User } from '../services/chatService';

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

export default function ChatContent({ isDarkTheme }: { isDarkTheme: boolean }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations and users on component mount
  useEffect(() => {
    loadConversations();
    loadUsers();
  }, []);

  // Initialize Socket.IO connection when component mounts
  useEffect(() => {
    const socket = ChatService.initializeSocket();
  }, []);

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
      
      // Listen for real-time messages
      ChatService.onReceiveMessage((nodeMessage) => {
        // Convert Node.js message format to frontend format
        const message: Message = {
          id: nodeMessage.id,
          text: nodeMessage.content,
          sender: nodeMessage.sender_id === currentUserId ? 'me' : 'other',
          timestamp: new Date(nodeMessage.createdAt),
          isRead: nodeMessage.is_read,
          type: 'text'
        };
        
        // Add message to current conversation if it's from the selected user
        if (nodeMessage.sender_id === selectedUser.id || nodeMessage.receiver_id === selectedUser.id) {
          // Check if message already exists to avoid duplicates
          setMessages(prev => {
            const messageExists = prev.some(existingMsg => 
              existingMsg.text === message.text && 
              existingMsg.sender === message.sender &&
              Math.abs(existingMsg.timestamp.getTime() - message.timestamp.getTime()) < 5000 // Within 5 seconds
            );
            
            if (messageExists) {
              return prev;
            }
            
            const newMessages = [...prev, message];
            return newMessages;
          });
          
          // Update conversation's last message
          setConversations(prev => updateConversationLastMessage(prev, selectedUser.id.toString(), nodeMessage.content));
        }
      });
    }
  }, [selectedUser]);

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
      const response = await ChatService.getAllUsers();
      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]); // Defensive: always set to array
      }
    } catch (error) {
      setUsers([]); // Defensive: always set to array
    } finally {
      setUsersLoading(false);
    }
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
          
          setMessages(prev => {
            const newMessages = [...prev, response.data!];
            return newMessages;
          });
          
      setNewMessage('');
      
      // Update conversation's last message
          setConversations(prev => updateConversationLastMessage(prev, selectedUser.id.toString(), newMessage));
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
        } else {
          // Fallback to local state update
          const message = createNewMessage(newMessage, 'me');
          setMessages(prev => [...prev, message]);
          setNewMessage('');
          setConversations(prev => updateConversationLastMessage(prev, selectedUser.id.toString(), newMessage));
        }
      } catch (error) {
        // Fallback to local state update
        const message = createNewMessage(newMessage, 'me');
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setConversations(prev => updateConversationLastMessage(prev, selectedUser.id.toString(), newMessage));
      }
    } else {
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = searchConversations(conversations, searchQuery);
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    if (newChatName.trim()) {
      const newConversation = createNewConversation(newChatName);
      setConversations(prev => sortConversations([newConversation, ...prev]));
      setNewChatName('');
      setShowNewChatDialog(false);
      // Convert conversation to user format
      setSelectedUser({
        id: parseInt(newConversation.id),
        name: newConversation.name,
        avatar: newConversation.avatar,
        isOnline: newConversation.isOnline
      });
    }
  };

  const handleStartChatWithUser = (user: User) => {
    setSelectedUser({
      id: user.id,
      name: user.name || user.email,
      avatar: user.avatarUrl || '',
      isOnline: false
    });
  };

  const handleDownload = (message: Message) => {
    if (message.fileUrl) {
      const link = document.createElement('a');
      link.href = message.fileUrl;
      link.download = message.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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

  if (selectedUser) {
    return (
      <Box sx={{ 
        height: 'calc(100vh - 136px)', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Chat Header */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            bgcolor: isDarkTheme ? '#2C2C2E' : '#fff',
            flexShrink: 0
          }}
        >
          <IconButton onClick={() => setSelectedUser(null)}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar src={selectedUser.avatar} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" color={isDarkTheme ? 'white' : 'black'}>
              {selectedUser.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </Typography>
          </Box>
          <IconButton>
            <CallIcon />
          </IconButton>
          <IconButton>
            <VideoIcon />
          </IconButton>
          <IconButton onClick={handleMenuOpen}>
            <MoreHorizIcon />
          </IconButton>
        </Paper>

        {/* Messages */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2, 
          bgcolor: isDarkTheme ? '#1C1C1E' : '#F8F9FA',
          minHeight: 0
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Typography>Loading messages...</Typography>
            </Box>
          ) : (
            messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.sender === 'me'}
              isDarkTheme={isDarkTheme}
              onDownload={handleDownload}
            />
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            bgcolor: isDarkTheme ? '#2C2C2E' : '#fff',
            flexShrink: 0
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <IconButton>
              <AttachFileIcon />
            </IconButton>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: isDarkTheme ? '#1C1C1E' : '#fff'
                }
              }}
            />
            <IconButton>
              <EmojiIcon />
            </IconButton>
            <IconButton 
              onClick={() => {
                handleSendMessage();
              }}
              disabled={!newMessage.trim() || loading}
              sx={{ 
                bgcolor: newMessage.trim() ? '#007AFF' : 'transparent',
                color: newMessage.trim() ? 'white' : 'text.secondary',
                '&:hover': {
                  bgcolor: newMessage.trim() ? '#0056CC' : 'transparent'
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>

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
      position: 'relative'
    }}>
      {/* Header */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          bgcolor: isDarkTheme ? '#2C2C2E' : '#fff',
          flexShrink: 0
        }}
      >
        <Typography variant="h5" color={isDarkTheme ? 'white' : 'black'} sx={{ mb: 2 }}>
          Messages
        </Typography>
        <TextField
          fullWidth
          placeholder="Search conversations or users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: isDarkTheme ? '#1C1C1E' : '#fff'
            }
          }}
        />
      </Paper>

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
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
      {/* Conversations List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {conversationsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Typography>Loading conversations...</Typography>
            </Box>
          ) : (
        <List>
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
                    <Avatar src={conversation.avatar} />
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
        {/* Users List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {usersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Typography>Loading users...</Typography>
            </Box>
          ) : (
            <List>
              {filteredUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <ListItem 
                    component="div"
                    onClick={() => handleStartChatWithUser(user)}
                    sx={{
                      bgcolor: isDarkTheme ? '#1C1C1E' : '#fff',
                      '&:hover': {
                        bgcolor: isDarkTheme ? '#2C2C2E' : '#F5F5F5'
                      },
                      cursor: 'pointer'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={user.avatarUrl || ''} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="subtitle1" 
                          color={isDarkTheme ? 'white' : 'black'}
                        >
                          {user.name || user.email}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                          >
                            {user.bio || 'No bio available'}
                          </Typography>
                          {user.age && (
                            <Typography variant="caption" color="text.secondary">
                              Age: {user.age} • {user.gender || 'Not specified'}
                            </Typography>
                      )}
                    </Box>
                  }
                />
                    <Chip
                      label="Start Chat"
                      size="small"
                      sx={{
                        bgcolor: '#007AFF',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
              </ListItem>
                  <Divider />
            </React.Fragment>
          ))}
        </List>
          )}
      </Box>
      </TabPanel>

      {/* New Chat FAB */}
      <Fab
        color="primary"
        aria-label="new chat"
        onClick={() => setShowNewChatDialog(true)}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          bgcolor: '#007AFF'
        }}
      >
        <AddIcon />
      </Fab>

      {/* New Chat Dialog */}
      <Dialog 
        open={showNewChatDialog} 
        onClose={() => setShowNewChatDialog(false)}
        PaperProps={{
          sx: { bgcolor: isDarkTheme ? '#2C2C2E' : '#fff' }
        }}
      >
        <DialogTitle color={isDarkTheme ? 'white' : 'black'}>
          New Chat
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="User ID"
            type="number"
            fullWidth
            variant="outlined"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isDarkTheme ? '#1C1C1E' : '#fff'
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewChatDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleNewChat} variant="contained">
            Start Chat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 