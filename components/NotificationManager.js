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
      {/* In-app notification banner - Beautiful Format */}
      {notifications.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '450px'
        }}>
          {notifications.map(notification => (
            <div
              key={notification.id}
              style={{
                backgroundColor: '#ffffff',
                border: '3px solid #fbbf24',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 10px 25px -5px rgba(251, 191, 36, 0.3), 0 8px 10px -6px rgba(251, 191, 36, 0.2)',
                position: 'relative',
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              {/* Decorative pattern background */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.08,
                pointerEvents: 'none',
                background: `radial-gradient(circle, #fbbf24 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
                borderRadius: '16px'
              }} />

              {/* Close button */}
              <button
                onClick={() => dismissNotification(notification.id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#92400e',
                  padding: '4px',
                  lineHeight: 1,
                  zIndex: 2,
                  opacity: 0.6,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.6'}
              >
                ✕
              </button>

              {/* Title with Icon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                position: 'relative',
                zIndex: 1
              }}>
                <span style={{ fontSize: '36px' }}>🔔</span>
                <h3 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#78350f',
                  lineHeight: '1.2'
                }}>
                  {notification.title || 'Reminder'}
                </h3>
              </div>

              {/* Description */}
              {notification.description && (
                <p style={{
                  margin: '0 0 16px 48px',
                  fontSize: '15px',
                  color: '#92400e',
                  lineHeight: '1.6',
                  fontStyle: 'italic',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {notification.description}
                </p>
              )}

              {/* Message Content - Centered Box */}
              <div style={{
                padding: '20px',
                backgroundColor: '#fffbeb',
                borderRadius: '10px',
                border: '2px solid #fde68a',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '18px',
                  lineHeight: '1.7',
                  color: '#78350f',
                  fontWeight: '500',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  letterSpacing: '0.3px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {notification.message}
                </p>
              </div>

              {/* Decorative hearts */}
              <div style={{
                marginTop: '16px',
                textAlign: 'center',
                fontSize: '18px',
                opacity: 0.6,
                position: 'relative',
                zIndex: 1
              }}>
                💛 ✨ 💛
              </div>
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
