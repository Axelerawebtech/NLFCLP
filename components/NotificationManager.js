import { useState, useEffect, useRef } from 'react';

/**
 * NotificationManager Component
 * 
 * Manages push notifications for reminders in caregiver dashboard
 * - Requests notification permission
 * - Polls for pending reminders
 * - Shows browser notifications
 * - Displays in-app notification banner
 */

export default function NotificationManager({ caregiverId, day }) {
  const [permission, setPermission] = useState('default');
  const [notifications, setNotifications] = useState([]);
  const [shownNotifications, setShownNotifications] = useState(new Set());
  const intervalRef = useRef(null);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(result => {
          setPermission(result);
        });
      }
    }
  }, []);

  // Poll for reminders
  useEffect(() => {
    if (!caregiverId) return;

    const checkReminders = async () => {
      try {
        const res = await fetch(`/api/caregiver/check-reminders?caregiverId=${caregiverId}&day=${day}`);
        const data = await res.json();
        
        if (data.success && data.reminders && data.reminders.length > 0) {
          data.reminders.forEach(reminder => {
            // Show only if not already shown
            if (!shownNotifications.has(reminder.id)) {
              showNotification(reminder);
              setShownNotifications(prev => new Set(prev).add(reminder.id));
              
              // Add to in-app notification list
              setNotifications(prev => [reminder, ...prev].slice(0, 5)); // Keep last 5
            }
          });
        }
      } catch (err) {
        console.error('Error checking reminders:', err);
      }
    };

    // Check immediately
    checkReminders();

    // Then check every 30 seconds
    intervalRef.current = setInterval(checkReminders, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [caregiverId, day, shownNotifications]);

  const showNotification = (reminder) => {
    // Browser notification
    if (permission === 'granted' && 'Notification' in window) {
      const notification = new Notification('Reminder', {
        body: reminder.message,
        icon: '/logo.png', // Update with your app logo path
        badge: '/badge.png',
        tag: reminder.id,
        requireInteraction: true, // Notification stays until user dismisses
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        dismissNotification(reminder.id);
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
    }

    // Play notification sound
    try {
      const audio = new Audio('/notification.mp3'); // Update with your sound file
      audio.volume = 0.5;
      audio.play().catch(() => {}); // Ignore errors if sound fails
    } catch (err) {
      // Ignore audio errors
    }
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {/* In-app notification banner */}
      {notifications.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '400px'
        }}>
          {notifications.map(notification => (
            <div
              key={notification.id}
              style={{
                backgroundColor: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'start',
                gap: '12px',
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              <div style={{ fontSize: '24px' }}>⏰</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#92400e', marginBottom: '4px' }}>
                  Reminder
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.5' }}>
                  {notification.message}
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: '#a16207', marginTop: '6px' }}>
                  {notification.title || 'Task Reminder'}
                </p>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#92400e',
                  padding: '4px',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Permission request banner */}
      {permission === 'default' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#dbeafe',
          border: '2px solid #3b82f6',
          borderRadius: '12px',
          padding: '16px 24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '500px'
        }}>
          <span style={{ fontSize: '24px' }}>🔔</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
              Enable Notifications
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#3b82f6' }}>
              Get timely reminders for your caregiving tasks
            </p>
          </div>
          <button
            onClick={() => {
              Notification.requestPermission().then(result => {
                setPermission(result);
              });
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Enable
          </button>
        </div>
      )}
    </>
  );
}
