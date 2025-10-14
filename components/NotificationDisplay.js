import { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  IconButton,
  Slide
} from '@mui/material';
import { FaTimes, FaBell } from 'react-icons/fa';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

export default function NotificationDisplay() {
  const [notification, setNotification] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleCaregiverReminder = (event) => {
      const { message, timestamp } = event.detail;
      
      setNotification({
        message,
        timestamp: new Date(timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      });
      setOpen(true);
    };

    // Listen for custom reminder events
    window.addEventListener('caregiverReminder', handleCaregiverReminder);

    return () => {
      window.removeEventListener('caregiverReminder', handleCaregiverReminder);
    };
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  if (!notification) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={8000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
    >
      <Alert
        severity="info"
        variant="filled"
        onClose={handleClose}
        sx={{
          width: '350px',
          bgcolor: '#e3f2fd',
          color: '#1565c0',
          '& .MuiAlert-icon': {
            color: '#1565c0'
          }
        }}
        icon={<FaBell />}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Gentle Reminder
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {notification.message}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {notification.timestamp}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
}