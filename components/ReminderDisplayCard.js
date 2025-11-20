import { useState, useEffect } from 'react';

/**
 * ReminderDisplayCard Component
 * 
 * Shows upcoming and configured reminders for the caregiver
 * Displays on caregiver dashboard to provide visibility into notification schedule
 */

export default function ReminderDisplayCard({ caregiverId, day, language = 'english' }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!caregiverId || day === undefined) return;

    const fetchReminders = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/caregiver/dynamic-day-content?caregiverId=${caregiverId}&day=${day}&language=${language}`);
        const data = await res.json();
        
        if (data.success && data.dayContent) {
          const reminderTasks = (data.dayContent.tasks || []).filter(
            task => task.taskType === 'reminder' && task.enabled
          );
          setReminders(reminderTasks);
        }
      } catch (err) {
        console.error('Error fetching reminders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [caregiverId, day, language]);

  if (loading) {
    return null; // Don't show loading state
  }

  if (reminders.length === 0) {
    return null; // Don't show if no reminders
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#fffbeb',
      border: '2px solid #fbbf24',
      borderRadius: '12px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '28px' }}>⏰</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#92400e' }}>
            Your Reminders for Today
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#a16207' }}>
            You'll receive {reminders.length} notification{reminders.length > 1 ? 's' : ''} today
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {reminders.map((reminder, index) => {
          const content = reminder.content || {};
          const frequency = content.frequency || 'daily';
          const time = content.reminderTime || '09:00';
          const message = content.reminderMessage || 'Reminder';
          const customInterval = content.customInterval || 60;
          const weekDays = content.weekDays || [];
          const targetAudience = content.targetAudience || 'all';
          const targetLevels = content.targetLevels || [];
          
          return (
            <div
              key={reminder.taskId || index}
              style={{
                padding: '18px',
                backgroundColor: 'white',
                border: '2px solid #fcd34d',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(251, 191, 36, 0.15)'
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🔔</span>
                  <h4 style={{ margin: 0, fontWeight: '700', fontSize: '17px', color: '#1f2937' }}>
                    {reminder.title || 'Reminder'}
                  </h4>
                </div>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#fef3c7', 
                  borderRadius: '8px',
                  border: '1px solid #fde68a',
                  marginBottom: '14px'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.6', fontWeight: '500' }}>
                    {message}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Frequency Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', minWidth: '80px' }}>
                    📅 Frequency:
                  </span>
                  <div style={{ 
                    padding: '6px 14px', 
                    backgroundColor: '#dbeafe', 
                    color: '#1e40af', 
                    borderRadius: '6px', 
                    fontWeight: '600',
                    fontSize: '13px',
                    flex: 1
                  }}>
                    {frequency === 'daily' && '🗓️ Daily'}
                    {frequency === 'weekly' && `📆 Weekly`}
                    {frequency === 'custom' && `🔄 Custom (Every ${customInterval} min)`}
                  </div>
                </div>

                {/* Days (for weekly) */}
                {frequency === 'weekly' && weekDays.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', minWidth: '80px' }}>
                      📌 Days:
                    </span>
                    <div style={{ 
                      padding: '6px 14px', 
                      backgroundColor: '#e0e7ff', 
                      color: '#4338ca', 
                      borderRadius: '6px', 
                      fontWeight: '600',
                      fontSize: '13px',
                      flex: 1
                    }}>
                      {weekDays.join(', ')}
                    </div>
                  </div>
                )}

                {/* Time (for daily/weekly) */}
                {frequency !== 'custom' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', minWidth: '80px' }}>
                      🕐 Time:
                    </span>
                    <div style={{ 
                      padding: '6px 14px', 
                      backgroundColor: '#fef3c7', 
                      color: '#92400e', 
                      borderRadius: '6px', 
                      fontWeight: '600',
                      fontSize: '13px',
                      flex: 1
                    }}>
                      {time}
                    </div>
                  </div>
                )}

                {/* Target Audience */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', minWidth: '80px' }}>
                    👥 For:
                  </span>
                  <div style={{ 
                    padding: '6px 14px', 
                    backgroundColor: targetAudience === 'all' ? '#d1fae5' : '#fed7aa', 
                    color: targetAudience === 'all' ? '#065f46' : '#9a3412', 
                    borderRadius: '6px', 
                    fontWeight: '600',
                    fontSize: '13px',
                    flex: 1
                  }}>
                    {targetAudience === 'all' ? '✨ All Caregivers' : `🎯 ${targetLevels.join(', ')} Burden Level`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#fef3c7',
        borderRadius: '8px',
        border: '1px solid #fcd34d'
      }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
          💡 <strong>Tip:</strong> Make sure to enable browser notifications to receive these reminders on time!
        </p>
      </div>
    </div>
  );
}
