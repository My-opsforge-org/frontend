import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton
} from '@mui/material';
import {
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  GetApp as DownloadIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { Message, formatMessageTime } from './ChatUtils';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  isDarkTheme: boolean;
  showTime?: boolean;
  onDownload?: (message: Message) => void;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  isDarkTheme,
  showTime = true,
  onDownload
}: MessageBubbleProps) {
  const getMessageIcon = () => {
    switch (message.type) {
      case 'image':
        return <ImageIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      case 'file':
        return <FileIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      default:
        return null;
    }
  };

  const getReadStatusIcon = () => {
    if (!isOwnMessage) return null;
    
    if (message.isRead) {
      return <DoneAllIcon sx={{ fontSize: 14, color: '#007AFF' }} />;
    } else {
      return <DoneIcon sx={{ fontSize: 14, color: isDarkTheme ? '#666' : '#999' }} />;
    }
  };

  const handleFileClick = () => {
    if (message.type === 'file' && message.fileUrl && onDownload) {
      onDownload(message);
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <Box>
            <img
              src={message.fileUrl}
              alt="Shared content"
              style={{
                maxWidth: '100%',
                maxHeight: 200,
                borderRadius: 8,
                cursor: 'pointer'
              }}
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
            {message.text && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {message.text}
              </Typography>
            )}
          </Box>
        );
      
      case 'file':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileIcon sx={{ fontSize: 20 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {message.fileName || 'File'}
              </Typography>
              {message.text && (
                <Typography variant="caption" color="text.secondary">
                  {message.text}
                </Typography>
              )}
            </Box>
            <IconButton size="small" onClick={handleFileClick}>
              <DownloadIcon />
            </IconButton>
          </Box>
        );
      
      default:
        return (
          <Typography variant="body1">
            {message.text || 'Empty message'}
          </Typography>
        );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 2,
        position: 'relative',
        wordBreak: 'break-word'
      }}
    >
      <Paper
        sx={{
          p: 2,
          maxWidth: '70%',
          minWidth: 120,
          bgcolor: isOwnMessage 
            ? (isDarkTheme ? '#007AFF' : '#007AFF') 
            : (isDarkTheme ? '#2C2C2E' : '#fff'),
          color: isOwnMessage ? 'white' : (isDarkTheme ? 'white' : 'black'),
          position: 'relative',
          '&:hover': {
            boxShadow: 2
          },
          wordWrap: 'break-word'
        }}
      >
        {/* Message Type Icon */}
        {getMessageIcon()}
        
        {/* Message Content */}
        {renderMessageContent()}
        
        {/* Message Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 0.5,
            mt: 1
          }}
        >
          {showTime && (
            <Typography 
              variant="caption" 
              sx={{ 
                opacity: 0.7,
                fontSize: '0.75rem'
              }}
            >
              {formatMessageTime(message.timestamp)}
            </Typography>
          )}
          {getReadStatusIcon()}
        </Box>
      </Paper>
    </Box>
  );
} 