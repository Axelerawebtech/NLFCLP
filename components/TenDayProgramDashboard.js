import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import VideoPlayer from './VideoPlayer';

export default function TenDayProgramDashboard({ caregiverId }) {
  const { currentLanguage } = useLanguage();
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Map language codes: en -> english, kn -> kannada, hi -> hindi
  const getLanguageKey = () => {
    const map = { en: 'english', kn: 'kannada', hi: 'hindi' };
    return map[currentLanguage] || 'english';
  };

  // Hover states
  const [hoveredDay, setHoveredDay] = useState(null);
  const [videoButtonHovered, setVideoButtonHovered] = useState(false);
  const [tasksButtonHovered, setTasksButtonHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (caregiverId) {
      fetchProgramStatus();
      const interval = setInterval(fetchProgramStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [caregiverId]);

  // Re-fetch when language changes to get updated content
  useEffect(() => {
    if (caregiverId && currentLanguage) {
      fetchProgramStatus();
    }
  }, [currentLanguage]);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '0'
    },
    headerCard: {
      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      padding: '24px',
      color: 'white'
    },
    headerFlex: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: '16px'
    },
    title: {
      fontSize: isMobile ? '22px' : '28px',
      fontWeight: '700',
      margin: 0,
      marginBottom: '8px'
    },
    subtitle: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: '14px',
      margin: 0
    },
    progressBox: {
      textAlign: isMobile ? 'left' : 'right'
    },
    progressText: {
      fontSize: '36px',
      fontWeight: '700',
      margin: 0
    },
    progressLabel: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.9)',
      margin: 0
    },
    progressBar: {
      marginTop: '16px',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '999px',
      height: '12px',
      overflow: 'hidden'
    },
    progressFill: {
      backgroundColor: 'white',
      height: '100%',
      borderRadius: '999px',
      transition: 'width 0.5s ease'
    },
    burdenCard: {
      border: '2px solid',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    dayGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
      gap: isMobile ? '12px' : '16px'
    },
    dayButton: {
      position: 'relative',
      padding: '16px',
      borderRadius: '12px',
      border: '2px solid',
      transition: 'all 0.3s',
      textAlign: 'left',
      cursor: 'pointer',
      backgroundColor: 'white',
      display: 'block',
      width: '100%'
    },
    contentCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    contentHeader: {
      borderBottom: '1px solid #e5e7eb',
      padding: '24px'
    },
    contentBody: {
      padding: '24px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '12px',
      marginTop: 0
    },
    button: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '12px'
    },
    infoBox: {
      backgroundColor: '#fef3c7',
      border: '1px solid #fde68a',
      borderRadius: '12px',
      padding: '16px'
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      textAlign: 'center'
    },
    spinner: {
      border: '3px solid #f3f4f6',
      borderTop: '3px solid #2563eb',
      borderRadius: '50%',
      width: '48px',
      height: '48px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto'
    },
    errorBox: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      color: '#dc2626'
    }
  };

  const fetchProgramStatus = async () => {
    try {
      const response = await fetch(`/api/caregiver/check-program-status?caregiverId=${caregiverId}`);
      const data = await response.json();
      
      if (data.success) {
        setProgramData(data.data);
        if (!selectedDay && data.data.currentDay !== undefined) {
          setSelectedDay(data.data.currentDay);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch program status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (day, isUnlocked) => {
    if (isUnlocked) {
      setSelectedDay(day);
    }
  };

  const handleVideoComplete = async (day) => {
    try {
      const response = await fetch('/api/caregiver/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          day,
          videoWatched: true,
          videoProgress: 100
        })
      });
      
      if (response.ok) {
        fetchProgramStatus();
      }
    } catch (err) {
      console.error('Failed to update video progress:', err);
    }
  };

  const handleTasksComplete = async (day) => {
    try {
      const response = await fetch('/api/caregiver/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          day,
          tasksCompleted: true,
          taskResponses: []
        })
      });
      
      if (response.ok) {
        fetchProgramStatus();
      }
    } catch (err) {
      console.error('Failed to update task progress:', err);
    }
  };

  const getTimeRemaining = (scheduledUnlockAt) => {
    if (!scheduledUnlockAt) return null;
    
    const now = new Date();
    const unlock = new Date(scheduledUnlockAt);
    const diff = unlock - now;
    
    if (diff <= 0) return 'Available now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    
    return `${hours}h ${minutes}m remaining`;
  };

  const getBurdenLevelInfo = (level) => {
    switch (level?.toLowerCase()) {
      case 'mild':
        return { 
          backgroundColor: '#dcfce7', 
          color: '#166534', 
          borderColor: '#86efac', 
          text: 'Mild Burden',
          emoji: '😊'
        };
      case 'moderate':
        return { 
          backgroundColor: '#fef3c7', 
          color: '#92400e', 
          borderColor: '#fde68a', 
          text: 'Moderate Burden',
          emoji: '😐'
        };
      case 'severe':
        return { 
          backgroundColor: '#fee2e2', 
          color: '#991b1b', 
          borderColor: '#fecaca', 
          text: 'Severe Burden',
          emoji: '😟'
        };
      default:
        return { 
          backgroundColor: '#f3f4f6', 
          color: '#1f2937', 
          borderColor: '#d1d5db', 
          text: 'Not Assessed',
          emoji: '❓'
        };
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div>
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading your program...</p>
        </div>
      </div>
    );
  }

  if (error || !programData) {
    return (
      <div style={styles.errorBox}>
        <p style={{ margin: 0 }}>{error || 'Program data not available'}</p>
      </div>
    );
  }

  const selectedDayData = programData.dayModules?.find(m => m.day === selectedDay);
  const burdenInfo = getBurdenLevelInfo(programData.burdenLevel);

  return (
    <div style={styles.container}>
      {/* Progress Overview */}
      <div style={styles.headerCard}>
        <div style={styles.headerFlex}>
          <div>
            <h2 style={styles.title}>10-Day Caregiver Support Program</h2>
            <p style={styles.subtitle}>Your journey to better caregiving</p>
          </div>
          <div style={styles.progressBox}>
            <p style={styles.progressText}>{Math.round(programData.overallProgress || 0)}%</p>
            <p style={styles.progressLabel}>Complete</p>
          </div>
        </div>
        
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${programData.overallProgress || 0}%`
            }}
          ></div>
        </div>
      </div>

      {/* Burden Level Badge */}
      {programData.burdenTestCompleted && (
        <div style={{
          ...styles.burdenCard,
          backgroundColor: burdenInfo.backgroundColor,
          color: burdenInfo.color,
          borderColor: burdenInfo.borderColor
        }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, marginBottom: '4px' }}>
              Your Burden Assessment Result:
            </p>
            <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
              {burdenInfo.text}
            </p>
            <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8, margin: 0 }}>
              Your program content has been personalized based on this assessment
            </p>
          </div>
          <div style={{ fontSize: '32px' }}>{burdenInfo.emoji}</div>
        </div>
      )}

      {/* Day Grid */}
      <div style={styles.dayGrid}>
        {programData.dayModules?.map((dayModule) => {
          const isUnlocked = dayModule.adminPermissionGranted;
          const isCompleted = dayModule.progressPercentage === 100;
          const isCurrent = dayModule.day === programData.currentDay;
          const isSelected = dayModule.day === selectedDay;
          const timeRemaining = getTimeRemaining(dayModule.scheduledUnlockAt);
          
          return (
            <button
              key={dayModule.day}
              onClick={() => handleDayClick(dayModule.day, isUnlocked)}
              disabled={!isUnlocked}
              style={{
                ...styles.dayButton,
                borderColor: isSelected ? '#2563eb' : '#e5e7eb',
                boxShadow: isSelected ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                opacity: isUnlocked ? 1 : 0.5,
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                backgroundColor: isCompleted ? '#dcfce7' : 'white',
                ...(hoveredDay === dayModule.day && isUnlocked ? {
                  borderColor: '#60a5fa',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                } : {})
              }}
              onMouseEnter={() => setHoveredDay(dayModule.day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Day Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                  Day {dayModule.day}
                </span>
                <span style={{ fontSize: '20px' }}>
                  {isCompleted ? '✅' : !isUnlocked ? '🔒' : isCurrent ? '▶️' : '📝'}
                </span>
              </div>
              
              {/* Progress Bar */}
              {isUnlocked && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      flex: 1, 
                      backgroundColor: '#e5e7eb', 
                      borderRadius: '999px', 
                      height: '6px',
                      overflow: 'hidden'
                    }}>
                      <div 
                        style={{
                          height: '100%',
                          backgroundColor: isCompleted ? '#16a34a' : '#2563eb',
                          borderRadius: '999px',
                          width: `${dayModule.progressPercentage || 0}%`,
                          transition: 'width 0.3s'
                        }}
                      ></div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280' }}>
                      {dayModule.progressPercentage || 0}%
                    </span>
                  </div>
                </div>
              )}
              
              {/* Title */}
              <p style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {dayModule.videoTitle?.[getLanguageKey()] || dayModule.videoTitle || 'Module Content'}
              </p>
              
              {/* Time Remaining */}
              {!isUnlocked && timeRemaining && (
                <p style={{ 
                  fontSize: '11px', 
                  color: '#ea580c', 
                  marginTop: '8px', 
                  fontWeight: '500',
                  margin: '8px 0 0 0'
                }}>
                  ⏳ {timeRemaining}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Content */}
      {selectedDayData && selectedDayData.adminPermissionGranted && (
        <div style={styles.contentCard}>
          <div style={styles.contentHeader}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '700', color: '#111827', margin: 0, marginBottom: '4px' }}>
                  Day {selectedDay}: {selectedDayData.videoTitle?.[getLanguageKey()] || selectedDayData.videoTitle || 'Program Content'}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  {selectedDayData.progressPercentage === 100 
                    ? '✅ Completed' 
                    : `${selectedDayData.progressPercentage || 0}% Complete`}
                </p>
              </div>
              
              {selectedDayData.completedAt && (
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  Completed: {new Date(selectedDayData.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          
          <div style={styles.contentBody}>
            {/* Video Section */}
            {(selectedDayData.videoUrl?.[getLanguageKey()] || selectedDayData.videoUrl) && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={styles.sectionTitle}>📹 Video Lesson</h4>
                <VideoPlayer
                  videoUrl={selectedDayData.videoUrl?.[getLanguageKey()] || selectedDayData.videoUrl}
                  videoTitle={selectedDayData.videoTitle?.[getLanguageKey()] || selectedDayData.videoTitle}
                  initialProgress={selectedDayData.videoProgress || 0}
                  isCompleted={selectedDayData.videoWatched || false}
                  caregiverId={caregiverId}
                  day={selectedDay}
                  onProgressUpdate={async (progressPercent) => {
                    try {
                      await fetch('/api/caregiver/update-progress', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          caregiverId,
                          day: selectedDay,
                          videoProgress: progressPercent
                        })
                      });
                    } catch (err) {
                      console.error('Failed to update video progress:', err);
                    }
                  }}
                  onComplete={async () => {
                    await handleVideoComplete(selectedDay);
                  }}
                />
              </div>
            )}
            
            {/* Tasks Section - Only unlocked after video is watched */}
            <div>
              <h4 style={styles.sectionTitle}>📝 Daily Tasks</h4>
              
              {/* Show lock message if video not watched */}
              {!selectedDayData.videoWatched && (selectedDayData.videoUrl?.[getLanguageKey()] || selectedDayData.videoUrl) && (
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#fef3c7', 
                  border: '2px solid #fde68a',
                  borderRadius: '8px',
                  color: '#92400e',
                  marginBottom: '16px'
                }}>
                  <p style={{ margin: 0, fontWeight: '600', marginBottom: '4px' }}>
                    🔒 Tasks Locked
                  </p>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    Complete watching the video above to unlock daily tasks.
                  </p>
                </div>
              )}
              
              {/* Tasks content - only shown if video is watched OR no video exists */}
              {(selectedDayData.videoWatched || !(selectedDayData.videoUrl?.[getLanguageKey()] || selectedDayData.videoUrl)) && (
                <>
                  {selectedDayData.taskResponses && selectedDayData.taskResponses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedDayData.taskResponses.map((task, index) => (
                        <div key={index} style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px', border: '1px solid #e5e7eb' }}>
                          <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                            {task.taskDescription?.[getLanguageKey()] || task.taskDescription}
                          </p>
                          {task.completedAt && (
                            <p style={{ fontSize: '12px', color: '#16a34a', margin: '4px 0 0 0' }}>
                              ✅ Completed {new Date(task.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px' }}>
                      <p style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>
                        Complete the tasks for this day to unlock the next module.
                      </p>
                    </div>
                  )}
                  
                  {!selectedDayData.tasksCompleted && (
                    <button
                      onClick={() => handleTasksComplete(selectedDay)}
                      style={{
                        ...styles.button,
                        backgroundColor: tasksButtonHovered ? '#1d4ed8' : '#2563eb',
                        color: 'white'
                      }}
                      onMouseEnter={() => setTasksButtonHovered(true)}
                      onMouseLeave={() => setTasksButtonHovered(false)}
                    >
                      Mark Tasks as Complete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div style={styles.infoBox}>
        <h4 style={{ fontWeight: '600', color: '#78350f', marginTop: 0, marginBottom: '8px' }}>
          💡 Program Information
        </h4>
        <ul style={{ fontSize: '14px', color: '#78350f', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
          <li>Complete each day's video and tasks to progress</li>
          <li>New days unlock automatically after the wait period</li>
          <li>Day 1 includes a burden assessment that personalizes your content</li>
          <li>Contact support if you need assistance: <strong>Tele-MANAS (14416)</strong></li>
        </ul>
      </div>
    </div>
  );
}
