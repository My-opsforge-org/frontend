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
        bottom: 80,
        right: 24,
        zIndex: 1000,
      }}
    >
      <AddIcon />
    </Fab>
  );
} 