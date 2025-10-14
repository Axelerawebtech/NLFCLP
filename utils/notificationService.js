// Notification Service for Caregiver Reminders
// Handles scheduling and displaying gentle reminders based on burden level

export class NotificationService {
  constructor() {
    this.reminders = {
      mild: {
        message: "🕊️ Take 2 minutes for yourself today — relax and breathe.",
        times: ['09:00', '14:00', '19:00'], // 9 AM, 2 PM, 7 PM
        frequency: 'daily'
      },
      'mild-moderate': {
        message: "💡 Remember to practice your problem-solving step today. You're doing great!",
        times: ['10:00', '15:00', '20:00'],
        frequency: 'daily'
      },
      'moderate-severe': {
        message: "🌟 Take a moment to reflect and check in with yourself. You matter too.",
        times: ['08:00', '13:00', '18:00'],
        frequency: 'daily'
      },
      severe: {
        message: "💪 You're handling a lot. Remember to reach out for support when needed.",
        times: ['09:30', '14:30', '19:30'],
        frequency: 'daily'
      }
    };
    
    this.activeReminders = new Set();
  }

  // Schedule notifications for a specific burden level
  scheduleReminders(burdenLevel, caregiverId) {
    const reminderConfig = this.reminders[burdenLevel];
    if (!reminderConfig) return;

    console.log(`📅 Scheduling ${reminderConfig.times.length} daily reminders for ${burdenLevel} burden level`);

    // Clear any existing reminders for this caregiver
    this.clearReminders(caregiverId);

    // Schedule each reminder time
    reminderConfig.times.forEach((time, index) => {
      this.scheduleReminderAtTime(time, reminderConfig.message, caregiverId, index);
    });

    // Store in localStorage for persistence
    this.saveReminderSettings(burdenLevel, caregiverId);
  }

  // Schedule a reminder at a specific time
  scheduleReminderAtTime(time, message, caregiverId, index) {
    const [hours, minutes] = time.split(':').map(Number);
    
    const scheduleDaily = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeUntilReminder = scheduledTime.getTime() - now.getTime();
      
      const timeoutId = setTimeout(() => {
        this.showNotification(message, caregiverId);
        // Reschedule for next day
        scheduleDaily();
      }, timeUntilReminder);

      this.activeReminders.add(timeoutId);
      
      console.log(`⏰ Reminder ${index + 1} scheduled for ${time} (${Math.round(timeUntilReminder / 1000 / 60)} minutes from now)`);
    };

    scheduleDaily();
  }

  // Show notification (browser notification + in-app)
  showNotification(message, caregiverId) {
    console.log(`🔔 Showing reminder: ${message}`);

    // Browser notification (if permission granted)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('NLFCLP Caregiver Reminder', {
        body: message,
        icon: '/favicon.ico',
        tag: 'caregiver-reminder'
      });
    }

    // In-app notification (custom event)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('caregiverReminder', {
        detail: { message, caregiverId, timestamp: new Date() }
      }));
    }

    // Log to localStorage for history
    this.logNotification(message, caregiverId);
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log(`📱 Notification permission: ${permission}`);
      return permission === 'granted';
    }
    return false;
  }

  // Clear all active reminders
  clearReminders(caregiverId) {
    this.activeReminders.forEach(timeoutId => clearTimeout(timeoutId));
    this.activeReminders.clear();
    console.log(`🗑️ Cleared all reminders for caregiver ${caregiverId}`);
  }

  // Save reminder settings to localStorage
  saveReminderSettings(burdenLevel, caregiverId) {
    if (typeof window !== 'undefined') {
      const settings = {
        burdenLevel,
        caregiverId,
        scheduledAt: new Date().toISOString(),
        active: true
      };
      localStorage.setItem('caregiverReminders', JSON.stringify(settings));
    }
  }

  // Load and restore reminders from localStorage
  restoreReminders() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('caregiverReminders');
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.active) {
          console.log(`🔄 Restoring reminders for ${settings.burdenLevel} burden level`);
          this.scheduleReminders(settings.burdenLevel, settings.caregiverId);
        }
      }
    }
  }

  // Log notification for history
  logNotification(message, caregiverId) {
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
      history.push({
        message,
        caregiverId,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 50 notifications
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }
      
      localStorage.setItem('notificationHistory', JSON.stringify(history));
    }
  }

  // Get notification history
  getNotificationHistory() {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('notificationHistory') || '[]');
    }
    return [];
  }

  // Cancel reminders (for opt-out)
  cancelReminders(caregiverId) {
    this.clearReminders(caregiverId);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('caregiverReminders');
    }
    console.log(`❌ Cancelled all reminders for caregiver ${caregiverId}`);
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// Initialize service when module loads
if (typeof window !== 'undefined') {
  // Restore reminders on page load
  window.addEventListener('load', () => {
    notificationService.restoreReminders();
  });
}