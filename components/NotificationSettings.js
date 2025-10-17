import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { FaBell, FaHistory, FaCog, FaCheck } from 'react-icons/fa';
import { notificationService } from '../utils/notificationService';

export default function NotificationSettings({ caregiverId, burdenLevel }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [reminderSettings, setReminderSettings] = useState(null);

  useEffect(() => {
    // Check if notifications are currently active
    const saved = localStorage.getItem('caregiverReminders');
    if (saved) {
      const settings = JSON.parse(saved);
      setNotificationsEnabled(settings.active);
      setReminderSettings(settings);
    }

    // Load notification history
    setHistory(notificationService.getNotificationHistory());
  }, []);

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      // Disable notifications
      notificationService.cancelReminders(caregiverId);
      setNotificationsEnabled(false);
      setReminderSettings(null);
    } else {
      // Enable notifications
      const permissionGranted = await notificationService.requestNotificationPermission();
      notificationService.scheduleReminders(burdenLevel, caregiverId);
      setNotificationsEnabled(true);
      
      // Update settings state
      const newSettings = {
        burdenLevel,
        caregiverId,
        scheduledAt: new Date().toISOString(),
        active: true
      };
      setReminderSettings(newSettings);

      // Show confirmation
      setTimeout(() => {
        notificationService.showNotification(
          "✅ Daily reminders have been enabled! You'll receive gentle notifications based on your care level.",
          caregiverId
        );
      }, 1000);
    }
  };

  const testNotification = () => {
    const testMessage = notificationService.reminders[burdenLevel]?.message || 
                       "🕊️ This is a test reminder - take a moment for yourself!";
    notificationService.showNotification(testMessage, caregiverId);
  };

  const reminderConfig = notificationService.reminders[burdenLevel];

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaBell />
            Reminder Notifications
          </Typography>

          {/* Current Status */}
          <Alert 
            severity={notificationsEnabled ? 'success' : 'info'} 
            sx={{ mb: 3 }}
            icon={notificationsEnabled ? <FaCheck /> : <FaBell />}
          >
            <Typography variant="body2">
              {notificationsEnabled 
                ? `Daily reminders are active for ${burdenLevel} care level`
                : 'Daily reminders are currently disabled'
              }
            </Typography>
          </Alert>

          {/* Toggle Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={notificationsEnabled}
                onChange={handleToggleNotifications}
                color="primary"
              />
            }
            label="Enable daily reminder notifications"
            sx={{ mb: 3 }}
          />

          {/* Reminder Details */}
          {reminderConfig && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Your Reminder Schedule:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                "{reminderConfig.message}"
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {reminderConfig.times.map((time) => (
                  <Chip 
                    key={time} 
                    label={time} 
                    size="small" 
                    color={notificationsEnabled ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              onClick={testNotification}
              startIcon={<FaBell />}
            >
              Test Notification
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowHistory(true)}
              startIcon={<FaHistory />}
            >
              View History
            </Button>
          </Box>

          {/* Settings Info */}
          {reminderSettings && (
            <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
              <Typography variant="caption">
                Reminders scheduled on {new Date(reminderSettings.scheduledAt).toLocaleDateString()} 
                for {reminderSettings.burdenLevel} care level
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* History Dialog */}
      <Dialog 
        open={showHistory} 
        onClose={() => setShowHistory(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaHistory />
            Notification History
          </Box>
        </DialogTitle>
        <DialogContent>
          {history.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No notifications sent yet
            </Typography>
          ) : (
            <List>
              {history.slice(-10).reverse().map((notification, index) => (
                <div key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <FaBell color="#1976d2" />
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.message}
                      secondary={new Date(notification.timestamp).toLocaleString()}
                    />
                  </ListItem>
                  {index < history.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}