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
                padding: '28px',
                backgroundColor: '#ffffff',
                border: '3px solid #fbbf24',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(251, 191, 36, 0.2), 0 8px 10px -6px rgba(251, 191, 36, 0.15)',
                position: 'relative',
                marginBottom: '8px'
              }}
            >
              {/* Subtle decorative pattern */}
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
                borderRadius: '12px'
              }} />

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
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#78350f',
                  lineHeight: '1.2'
                }}>
                  {reminder.title || 'Reminder'}
                </h3>
              </div>

              {/* Description */}
              {reminder.description && (
                <p style={{
                  margin: '0 0 20px 48px',
                  fontSize: '16px',
                  color: '#92400e',
                  lineHeight: '1.6',
                  fontStyle: 'italic',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {reminder.description}
                </p>
              )}

              {/* Message Content - Centered Box */}
              <div style={{
                padding: '24px',
                backgroundColor: '#fffbeb',
                borderRadius: '10px',
                border: '2px solid #fde68a',
                textAlign: 'center',
                marginBottom: '24px',
                position: 'relative',
                zIndex: 1
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '20px',
                  lineHeight: '1.8',
                  color: '#78350f',
                  fontWeight: '500',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  letterSpacing: '0.3px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {message}
                </p>
              </div>

              {/* Decorative hearts */}
              <div style={{
                marginBottom: '20px',
                textAlign: 'center',
                fontSize: '20px',
                opacity: 0.6,
                position: 'relative',
                zIndex: 1
              }}>
                💛 ✨ 💛
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', zIndex: 1 }}>
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
