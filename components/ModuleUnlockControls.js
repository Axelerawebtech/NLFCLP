import { useState } from 'react';

export default function ModuleUnlockControls({
  caregiverId,
  dayModules = [],
  burdenAssessmentComplete = false,
  onDayUnlocked,
  onRefreshNeeded
}) {
  const [loading, setLoading] = useState({});
  const [bulkUnlocking, setBulkUnlocking] = useState(false);

  const handleSingleUnlock = async (day) => {
    setLoading(prev => ({ ...prev, [day]: true }));
    
    try {
      const response = await fetch('/api/admin/program/unlock-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caregiverId, 
          day,
          method: 'manual-admin-override'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        if (onDayUnlocked) onDayUnlocked(day, true);
        if (onRefreshNeeded) onRefreshNeeded();
      } else {
        alert(`Failed to unlock Day ${day}: ${data.message}`);
      }
    } catch (error) {
      console.error('Error unlocking day:', error);
      alert(`Error unlocking Day ${day}`);
    } finally {
      setLoading(prev => ({ ...prev, [day]: false }));
    }
  };

  const handleBulkUnlock = async (targetDays) => {
    setBulkUnlocking(true);
    const results = [];
    
    for (const day of targetDays) {
      try {
        const response = await fetch('/api/admin/program/unlock-day', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            caregiverId, 
            day,
            method: 'bulk-admin-unlock'
          })
        });
        
        const data = await response.json();
        results.push({ day, success: data.success, message: data.message });
      } catch (error) {
        results.push({ day, success: false, message: error.message });
      }
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    alert(`Bulk unlock complete: ${successful} successful, ${failed} failed`);
    
    if (onRefreshNeeded) onRefreshNeeded();
    setBulkUnlocking(false);
  };

  const getPrerequisiteStatus = (day) => {
    if (day === 0) return { met: true, message: 'Always available' };
    if (day === 1) {
      const day0Complete = dayModules.find(d => d.day === 0)?.progressPercentage === 100;
      return {
        met: day0Complete,
        message: day0Complete ? 'Prerequisites met' : 'Requires Day 0 completion (100%)'
      };
    }
    if (day >= 2) {
      return {
        met: burdenAssessmentComplete,
        message: burdenAssessmentComplete ? 'Prerequisites met' : 'Requires burden assessment completion'
      };
    }
    return { met: false, message: 'Unknown prerequisites' };
  };

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e5e7eb',
      marginBottom: '24px'
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '16px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '20px',
      lineHeight: 1.5
    },
    moduleGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    moduleCard: {
      border: '2px solid',
      borderRadius: '8px',
      padding: '16px',
      position: 'relative'
    },
    moduleCardUnlocked: {
      borderColor: '#10b981',
      backgroundColor: '#f0fdf4'
    },
    moduleCardLocked: {
      borderColor: '#ef4444',
      backgroundColor: '#fef2f2'
    },
    moduleCardPartial: {
      borderColor: '#f59e0b',
      backgroundColor: '#fffbeb'
    },
    moduleHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    moduleTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937'
    },
    moduleStatus: {
      fontSize: '12px',
      fontWeight: '500',
      padding: '4px 8px',
      borderRadius: '4px',
      textTransform: 'uppercase'
    },
    statusUnlocked: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    statusLocked: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    statusPartial: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    prerequisiteInfo: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '12px',
      fontStyle: 'italic'
    },
    prerequisiteMet: {
      color: '#059669'
    },
    prerequisiteNotMet: {
      color: '#dc2626'
    },
    progressInfo: {
      fontSize: '14px',
      color: '#374151',
      marginBottom: '12px'
    },
    actionButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      width: '100%'
    },
    unlockButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    unlockButtonHover: {
      backgroundColor: '#2563eb'
    },
    disabledButton: {
      backgroundColor: '#9ca3af',
      color: '#f9fafb',
      cursor: 'not-allowed'
    },
    bulkActions: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      paddingTop: '20px',
      borderTop: '1px solid #e5e7eb'
    },
    bulkButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: '1px solid',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    bulkButtonPrimary: {
      backgroundColor: '#7c3aed',
      borderColor: '#7c3aed',
      color: 'white'
    },
    bulkButtonSecondary: {
      backgroundColor: 'white',
      borderColor: '#d1d5db',
      color: '#374151'
    },
    warningBox: {
      backgroundColor: '#fef3c7',
      border: '1px solid #fde68a',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '16px'
    },
    warningText: {
      fontSize: '14px',
      color: '#92400e',
      margin: 0
    }
  };

  const moduleInfo = [
    { day: 0, title: 'Foundation & Core Content', description: 'Introduction and essential concepts' },
    { day: 1, title: 'Assessment & Personalization', description: 'Burden assessment and content customization' },
    { day: 2, title: 'Understanding Your Role', description: 'Caregiver identity and responsibilities' },
    { day: 3, title: 'Managing Stress & Emotions', description: 'Emotional regulation techniques' },
    { day: 4, title: 'Communication Skills', description: 'Effective communication strategies' },
    { day: 5, title: 'Self-Care Practices', description: 'Personal wellness and self-care' },
    { day: 6, title: 'Support Systems', description: 'Building and utilizing support networks' },
    { day: 7, title: 'Moving Forward', description: 'Long-term strategies and resources' }
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🔐 Module Unlock Controls</h3>
      <p style={styles.subtitle}>
        Manually unlock program modules for this caregiver. Use caution when overriding prerequisites as it may affect the program's educational progression.
      </p>

      <div style={styles.warningBox}>
        <p style={styles.warningText}>
          ⚠️ <strong>Admin Override:</strong> Unlocking modules without prerequisites may disrupt the learning progression. Only use when necessary for specific caregiver needs.
        </p>
      </div>

      <div style={styles.moduleGrid}>
        {moduleInfo.map(({ day, title, description }) => {
          const dayModule = dayModules.find(d => d.day === day);
          const prerequisites = getPrerequisiteStatus(day);
          const isUnlocked = dayModule?.isUnlocked || false;
          const progress = dayModule?.progressPercentage || 0;
          const isLoading = loading[day];
          
          let cardStyle = { ...styles.moduleCard };
          let statusStyle = { ...styles.moduleStatus };
          
          if (isUnlocked) {
            cardStyle = { ...cardStyle, ...styles.moduleCardUnlocked };
            statusStyle = { ...statusStyle, ...styles.statusUnlocked };
          } else if (prerequisites.met) {
            cardStyle = { ...cardStyle, ...styles.moduleCardPartial };
            statusStyle = { ...statusStyle, ...styles.statusPartial };
          } else {
            cardStyle = { ...cardStyle, ...styles.moduleCardLocked };
            statusStyle = { ...statusStyle, ...styles.statusLocked };
          }

          return (
            <div key={day} style={cardStyle}>
              <div style={styles.moduleHeader}>
                <div>
                  <div style={styles.moduleTitle}>Day {day}: {title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {description}
                  </div>
                </div>
                <div style={statusStyle}>
                  {isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}
                </div>
              </div>

              <div style={{
                ...styles.prerequisiteInfo,
                ...(prerequisites.met ? styles.prerequisiteMet : styles.prerequisiteNotMet)
              }}>
                {prerequisites.met ? '✅' : '❌'} {prerequisites.message}
              </div>

              {isUnlocked && (
                <div style={styles.progressInfo}>
                  Progress: {progress}% complete
                  {progress === 100 && ' ✅'}
                </div>
              )}

              <button
                style={{
                  ...styles.actionButton,
                  ...(isUnlocked || isLoading ? styles.disabledButton : styles.unlockButton)
                }}
                onClick={() => !isUnlocked && !isLoading && handleSingleUnlock(day)}
                disabled={isUnlocked || isLoading}
                onMouseOver={(e) => {
                  if (!isUnlocked && !isLoading) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isUnlocked && !isLoading) {
                    e.target.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {isLoading ? 'Unlocking...' : isUnlocked ? 'Already Unlocked' : 'Unlock Module'}
              </button>
            </div>
          );
        })}
      </div>

      <div style={styles.bulkActions}>
        <button
          style={{ ...styles.bulkButton, ...styles.bulkButtonPrimary }}
          onClick={() => handleBulkUnlock([0, 1])}
          disabled={bulkUnlocking}
          onMouseOver={(e) => !bulkUnlocking && (e.target.style.backgroundColor = '#6d28d9')}
          onMouseOut={(e) => !bulkUnlocking && (e.target.style.backgroundColor = '#7c3aed')}
        >
          {bulkUnlocking ? 'Processing...' : '🚀 Unlock Foundation (Days 0-1)'}
        </button>
        
        <button
          style={{ ...styles.bulkButton, ...styles.bulkButtonPrimary }}
          onClick={() => handleBulkUnlock([2, 3, 4, 5, 6, 7])}
          disabled={bulkUnlocking}
          onMouseOver={(e) => !bulkUnlocking && (e.target.style.backgroundColor = '#6d28d9')}
          onMouseOut={(e) => !bulkUnlocking && (e.target.style.backgroundColor = '#7c3aed')}
        >
          {bulkUnlocking ? 'Processing...' : '📚 Unlock All Content (Days 2-7)'}
        </button>
        
        <button
          style={{ ...styles.bulkButton, ...styles.bulkButtonSecondary }}
          onClick={() => handleBulkUnlock([0, 1, 2, 3, 4, 5, 6, 7])}
          disabled={bulkUnlocking}
          onMouseOver={(e) => !bulkUnlocking && (e.target.style.backgroundColor = '#f3f4f6')}
          onMouseOut={(e) => !bulkUnlocking && (e.target.style.backgroundColor = 'white')}
        >
          {bulkUnlocking ? 'Processing...' : '🔓 Unlock Everything'}
        </button>
      </div>
    </div>
  );
}