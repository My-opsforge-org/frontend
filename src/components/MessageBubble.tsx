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
      return <DoneAllIcon sx={{ fontSize: 14, color: '#10b981' }} />;
    } else {
      return <DoneIcon sx={{ fontSize: 14, color: isDarkTheme ? '#9ca3af' : '#6b7280' }} />;
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
                borderRadius: 12,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
            {message.text && (
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {message.text}
              </Typography>
            )}
          </Box>
        );
      
      case 'file':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: isOwnMessage 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : (isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileIcon sx={{ fontSize: 20, color: isOwnMessage ? 'white' : '#6366f1' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {message.fileName || 'File'}
              </Typography>
              {message.text && (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {message.text}
                </Typography>
              )}
            </Box>
            <IconButton 
              size="small" 
              onClick={handleFileClick}
              sx={{
                background: isOwnMessage 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : (isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)'),
                borderRadius: 2,
                '&:hover': {
                  background: isOwnMessage 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : (isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)'),
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <DownloadIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        );
      
      default:
        return (
          <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
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
        wordBreak: 'break-word',
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      <Paper
        sx={{
          p: 2.5,
          maxWidth: '70%',
          minWidth: 120,
          background: isOwnMessage 
            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
            : (isDarkTheme 
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'),
          color: isOwnMessage ? 'white' : (isDarkTheme ? 'white' : '#1f2937'),
          position: 'relative',
          borderRadius: 3,
          boxShadow: isOwnMessage
            ? '0 4px 16px rgba(99, 102, 241, 0.3)'
            : (isDarkTheme 
                ? '0 4px 16px rgba(0, 0, 0, 0.3)' 
                : '0 4px 16px rgba(0, 0, 0, 0.08)'),
          border: isOwnMessage
            ? '1px solid rgba(255, 255, 255, 0.2)'
            : (isDarkTheme 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(255, 255, 255, 0.8)'),
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: isOwnMessage
              ? '0 8px 24px rgba(99, 102, 241, 0.4)'
              : (isDarkTheme 
                  ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
                  : '0 8px 24px rgba(0, 0, 0, 0.12)'),
          },
          wordWrap: 'break-word',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isOwnMessage
              ? 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
              : (isDarkTheme 
                  ? 'radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)'
                  : 'radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)'),
            borderRadius: 3,
            pointerEvents: 'none',
          }
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
            mt: 1.5,
            pt: 1,
            borderTop: '1px solid',
            borderColor: isOwnMessage 
              ? 'rgba(255, 255, 255, 0.2)' 
              : (isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
          }}
        >
          {showTime && (
            <Typography 
              variant="caption" 
              sx={{ 
                opacity: 0.7,
                fontSize: '0.75rem',
                fontWeight: 500,
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