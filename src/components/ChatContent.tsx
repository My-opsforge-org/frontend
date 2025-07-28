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
  MenuItem
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
  MoreHoriz as MoreHorizIcon
} from '@mui/icons-material';
import { 
  Message, 
  Conversation, 
  formatTime, 
  generateMockConversations, 
  generateMockMessages,
  createNewConversation,
  createNewMessage,
  updateConversationLastMessage,
  markConversationAsRead,
  searchConversations,
  sortConversations
} from './ChatUtils';
import MessageBubble from './MessageBubble';

export default function ChatContent({ isDarkTheme }: { isDarkTheme: boolean }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for conversations
  useEffect(() => {
    const mockConversations = generateMockConversations();
    setConversations(sortConversations(mockConversations));
  }, []);

  // Mock data for messages
  useEffect(() => {
    if (selectedConversation) {
      const mockMessages = generateMockMessages(selectedConversation.id);
      setMessages(mockMessages);
      
      // Mark conversation as read when opened
      setConversations(prev => markConversationAsRead(prev, selectedConversation.id));
      
      // Scroll to bottom when messages load
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const message = createNewMessage(newMessage, 'me');
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update conversation's last message
      setConversations(prev => updateConversationLastMessage(prev, selectedConversation.id, newMessage));
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = searchConversations(conversations, searchQuery);

  const handleNewChat = () => {
    if (newChatName.trim()) {
      const newConversation = createNewConversation(newChatName);
      setConversations(prev => sortConversations([newConversation, ...prev]));
      setNewChatName('');
      setShowNewChatDialog(false);
      setSelectedConversation(newConversation);
    }
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

  if (selectedConversation) {
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
          <IconButton onClick={() => setSelectedConversation(null)}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar src={selectedConversation.avatar} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" color={isDarkTheme ? 'white' : 'black'}>
              {selectedConversation.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedConversation.isOnline ? 'Online' : 'Offline'}
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
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.sender === 'me'}
              isDarkTheme={isDarkTheme}
              onDownload={handleDownload}
            />
          ))}
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
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
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
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: isDarkTheme ? '#1C1C1E' : '#fff'
            }
          }}
        />
      </Paper>

      {/* Conversations List */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <List>
          {filteredConversations.map((conversation, index) => (
            <React.Fragment key={conversation.id}>
              <ListItem 
                component="div"
                onClick={() => setSelectedConversation(conversation)}
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="subtitle1" 
                        color={isDarkTheme ? 'white' : 'black'}
                        sx={{ fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal' }}
                      >
                        {conversation.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(conversation.lastMessageTime)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal',
                          color: conversation.unreadCount > 0 ? (isDarkTheme ? 'white' : 'black') : 'text.secondary'
                        }}
                      >
                        {conversation.lastMessage}
                      </Typography>
                      {conversation.unreadCount > 0 && (
                        <Chip
                          label={conversation.unreadCount}
                          size="small"
                          sx={{ 
                            bgcolor: '#007AFF', 
                            color: 'white',
                            minWidth: 20,
                            height: 20
                          }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < filteredConversations.length - 1 && (
                <Divider sx={{ bgcolor: isDarkTheme ? '#2C2C2E' : '#E0E0E0' }} />
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* New Chat FAB */}
      <Fab
        color="primary"
        aria-label="new chat"
        onClick={() => setShowNewChatDialog(true)}
        sx={{
          position: 'fixed',
          bottom: 88,
          right: 16,
          bgcolor: '#007AFF',
          zIndex: 1400
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
          New Conversation
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Contact Name"
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
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 