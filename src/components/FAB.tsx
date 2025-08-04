import AddIcon from '@mui/icons-material/Add';
import { Fab } from '@mui/material';

export default function FAB({ isDarkTheme, onClick }: {
  isDarkTheme: boolean;
  onClick: () => void;
}) {
  return (
    <Fab
      color="primary"
      aria-label="add"
      onClick={onClick}
      sx={{
        position: 'fixed',
        bottom: 100,
        right: 24,
        zIndex: 1000,
        width: 64,
        height: 64,
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        boxShadow: isDarkTheme
          ? '0 8px 32px rgba(99, 102, 241, 0.4)'
          : '0 8px 32px rgba(99, 102, 241, 0.3)',
        border: '2px solid',
        borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          transform: 'scale(1.1) translateY(-4px)',
          boxShadow: isDarkTheme
            ? '0 16px 48px rgba(99, 102, 241, 0.6)'
            : '0 16px 48px rgba(99, 102, 241, 0.5)',
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
        '& .MuiSvgIcon-root': {
          fontSize: '1.8rem',
          color: 'white',
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
        }
      }}
    >
      <AddIcon />
    </Fab>
  );
} 