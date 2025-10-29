import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SequentialContentPlayer from './SequentialContentPlayer';
import Day1BurdenAssessment from './Day1BurdenAssessment';
import BurdenSpecificFlow from './BurdenSpecificFlow';

export default function EnhancedCaregiverDashboard({ caregiverId }) {
  const { currentLanguage } = useLanguage();
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState({});
  const [burdenAssessmentComplete, setBurdenAssessmentComplete] = useState(false);
  const [burdenLevel, setBurdenLevel] = useState(null);
  const [showBurdenFlow, setShowBurdenFlow] = useState(false);

  // Load progress and assessment data from localStorage
  useEffect(() => {
    // Load progress data
    const savedProgress = {};
    for (let day = 0; day <= 7; day++) {
      const dayProgress = localStorage.getItem(`day_${day}_progress_${caregiverId}`);
      if (dayProgress) {
        savedProgress[day] = JSON.parse(dayProgress);
      }
    }
    setProgressData(savedProgress);

    // Load burden assessment
    const savedAssessment = localStorage.getItem(`burden_assessment_${caregiverId}`);
    if (savedAssessment) {
      const assessment = JSON.parse(savedAssessment);
      setBurdenAssessmentComplete(true);
      setBurdenLevel(assessment.burdenLevel);
    }

    fetchProgramStatus();
  }, [caregiverId]);

  const fetchProgramStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/caregiver/program-status?caregiverId=${caregiverId}`);
      const data = await response.json();
      
      if (data.success) {
        setProgramData(data.program);
        
        // Update burden level from server if available
        if (data.program.burdenLevel && !burdenLevel) {
          setBurdenLevel(data.program.burdenLevel);
          setBurdenAssessmentComplete(true);
        }
      } else {
        setError(data.message || 'Failed to load program data');
      }
    } catch (error) {
      console.error('Error fetching program status:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Map language codes
  const getLanguageKey = () => {
    const map = { en: 'english', kn: 'kannada', hi: 'hindi' };
    return map[currentLanguage] || 'english';
  };

  // Helper to safely extract text from multi-language fields
  const getLocalizedText = (field, defaultText = '') => {
    if (!field) return defaultText;
    if (typeof field === 'string') return field;
    if (typeof field === 'object') {
      const langKey = getLanguageKey();
      return field[langKey] || field.english || field.kannada || field.hindi || defaultText;
    }
    return defaultText;
  };

  const isDayUnlocked = (day) => {
    if (day === 0) return true; // Day 0 always unlocked
    if (day === 1) {
      // Day 1 unlocks after Day 0 completion
      return progressData[0]?.overallProgress === 100;
    }
    if (day >= 2) {
      // Days 2+ unlock after burden assessment completion
      return burdenAssessmentComplete;
    }
    return false;
  };

  const getDayStatus = (day) => {
    if (!isDayUnlocked(day)) return 'locked';
    
    const progress = progressData[day];
    if (!progress) return 'available';
    
    if (progress.overallProgress === 100) return 'completed';
    if (progress.overallProgress > 0) return 'in-progress';
    return 'available';
  };

  const getDayStatusColor = (status) => {
    const colors = {
      locked: '#9ca3af',
      available: '#3b82f6',
      'in-progress': '#f59e0b',
      completed: '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  const getDayStatusIcon = (status) => {
    const icons = {
      locked: '🔒',
      available: '📋',
      'in-progress': '⏳',
      completed: '✅'
    };
    return icons[status] || '📋';
  };

  const handleProgressUpdate = (day, progressType, value) => {
    const currentProgress = progressData[day] || {};
    const updatedProgress = {
      ...currentProgress,
      [progressType]: value
    };

    // Calculate overall progress
    let overallProgress = 0;
    if (day === 0) {
      // Day 0: 50% video + 50% audio
      const videoProgress = updatedProgress.videoProgress || 0;
      const audioProgress = updatedProgress.audioProgress || 0;
      overallProgress = Math.round((videoProgress + audioProgress) / 2);
    } else {
      // Other days: TBD based on content types
      overallProgress = updatedProgress.overallProgress || 0;
    }

    updatedProgress.overallProgress = overallProgress;

    // Save to localStorage
    localStorage.setItem(`day_${day}_progress_${caregiverId}`, JSON.stringify(updatedProgress));
    
    // Update state
    setProgressData(prev => ({
      ...prev,
      [day]: updatedProgress
    }));
  };

  const handleBurdenAssessmentComplete = (score, level) => {
    setBurdenAssessmentComplete(true);
    setBurdenLevel(level);
    
    // Save to localStorage
    localStorage.setItem(`burden_assessment_${caregiverId}`, JSON.stringify({
      score,
      burdenLevel: level,
      completedAt: new Date().toISOString()
    }));

    // Mark Day 1 as 100% complete
    handleProgressUpdate(1, 'overallProgress', 100);
  };

  const getSelectedDayData = () => {
    if (!programData || !programData.dayContent) return null;
    
    const dayContent = programData.dayContent[selectedDay];
    if (!dayContent) return null;

    const langKey = getLanguageKey();
    
    // For Day 0
    if (selectedDay === 0) {
      return {
        videoUrl: dayContent.videoUrl?.[langKey],
        audioUrl: dayContent.audioUrl?.[langKey],
        videoTitle: getLocalizedText(dayContent.videoTitle),
        audioTitle: getLocalizedText(dayContent.audioTitle)
      };
    }
    
    // For Day 1+ with burden-specific content
    if (selectedDay >= 1 && burdenLevel) {
      const burdenContent = dayContent.videos?.[burdenLevel];
      if (burdenContent) {
        return {
          videoUrl: burdenContent.videoUrl?.[langKey],
          videoTitle: getLocalizedText(burdenContent.title),
          hasBurdenSpecificContent: true
        };
      }
    }

    return null;
  };

  const selectedDayData = getSelectedDayData();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <div>Loading your personalized program...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorMessage}>
          <h3>⚠️ Connection Error</h3>
          <p>{error}</p>
          <button 
            onClick={fetchProgramStatus}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Your 7-Day Caregiver Support Program</h1>
        <div style={styles.progressSummary}>
          <div style={styles.overallProgress}>
            Overall Progress: {Math.round(Object.values(progressData).reduce((sum, day) => sum + (day.overallProgress || 0), 0) / 8)}%
          </div>
          {burdenLevel && (
            <div style={styles.burdenLevel}>
              Support Level: <span style={{ 
                color: burdenLevel === 'mild' ? '#10b981' : 
                       burdenLevel === 'moderate' ? '#f59e0b' : '#ef4444',
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}>
                {burdenLevel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Day Navigation */}
      <div style={styles.dayGrid}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(day => {
          const dayStatus = getDayStatus(day);
          const isSelected = selectedDay === day;
          
          return (
            <div
              key={day}
              style={{
                ...styles.dayCard,
                borderColor: getDayStatusColor(dayStatus),
                ...(isSelected ? styles.dayCardSelected : {}),
                cursor: isDayUnlocked(day) ? 'pointer' : 'not-allowed'
              }}
              onClick={() => isDayUnlocked(day) && setSelectedDay(day)}
            >
              <div style={{ ...styles.dayNumber, color: getDayStatusColor(dayStatus) }}>
                Day {day}
              </div>
              <div style={styles.dayTitle}>
                {day === 0 ? 'Foundation & Core Content' :
                 day === 1 ? 'Assessment & Personalization' :
                 `Daily Support & Activities`}
              </div>
              <div style={{ ...styles.dayStatus, color: getDayStatusColor(dayStatus) }}>
                {getDayStatusIcon(dayStatus)}
                {dayStatus.charAt(0).toUpperCase() + dayStatus.slice(1)}
              </div>
              {progressData[day] && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {progressData[day].overallProgress}% complete
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Burden-Specific Flow Toggle */}
      {selectedDay >= 1 && burdenAssessmentComplete && (
        <div style={styles.flowToggleContainer}>
          <button
            onClick={() => setShowBurdenFlow(!showBurdenFlow)}
            style={{
              ...styles.flowToggleButton,
              backgroundColor: showBurdenFlow ? '#ef4444' : '#10b981'
            }}
          >
            {showBurdenFlow ? '📹 Switch to Video Content' : '🎯 Start Personalized Activities'}
          </button>
        </div>
      )}

      {/* Content Area */}
      <div style={styles.contentArea}>
        <h2 style={styles.contentTitle}>Day {selectedDay} Content</h2>
        
        {/* Day 0 - Foundation Content */}
        {selectedDay === 0 && selectedDayData && (
          <SequentialContentPlayer
            videoUrl={selectedDayData.videoUrl}
            audioUrl={selectedDayData.audioUrl}
            videoTitle={selectedDayData.videoTitle}
            audioTitle={selectedDayData.audioTitle}
            day={0}
            caregiverId={caregiverId}
            onProgressUpdate={handleProgressUpdate}
            onComplete={() => {
              console.log('Day 0 completed!');
              fetchProgramStatus();
            }}
          />
        )}

        {/* Day 1 - Burden Assessment */}
        {selectedDay === 1 && (
          <div>
            {!isDayUnlocked(1) ? (
              <div style={styles.lockedMessage}>
                <h3>🔒 Day 1 Locked</h3>
                <p>Complete Day 0 content first to unlock Day 1 assessment.</p>
              </div>
            ) : !burdenAssessmentComplete ? (
              <Day1BurdenAssessment
                caregiverId={caregiverId}
                isUnlocked={isDayUnlocked(1)}
                onComplete={handleBurdenAssessmentComplete}
                onScoreCalculated={(score, level) => {
                  console.log('Burden assessment completed:', { score, level });
                }}
              />
            ) : showBurdenFlow ? (
              <BurdenSpecificFlow
                caregiverId={caregiverId}
                burdenLevel={burdenLevel}
                day={selectedDay}
                language={getLanguageKey()}
              />
            ) : (
              <div style={styles.completedMessage}>
                <h3>✅ Assessment Complete</h3>
                <p>Burden Level: <strong>{burdenLevel}</strong></p>
                <p>Your personalized content is now available in Days 2-7.</p>
                {selectedDayData?.videoUrl && (
                  <div style={{ marginTop: '20px' }}>
                    <video 
                      controls 
                      style={{ width: '100%', maxWidth: '600px', borderRadius: '8px' }}
                      src={selectedDayData.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Days 2-7 - Burden-Specific Content */}
        {selectedDay >= 2 && (
          <div>
            {!isDayUnlocked(selectedDay) ? (
              <div style={styles.lockedMessage}>
                <h3>🔒 Day {selectedDay} Locked</h3>
                <p>Complete the burden assessment in Day 1 to unlock personalized content.</p>
              </div>
            ) : showBurdenFlow ? (
              <BurdenSpecificFlow
                caregiverId={caregiverId}
                burdenLevel={burdenLevel}
                day={selectedDay}
                language={getLanguageKey()}
              />
            ) : (
              <div style={styles.dayContent}>
                <h3>Day {selectedDay} - Personalized Support Content</h3>
                <p>Burden Level: <strong>{burdenLevel}</strong></p>
                
                {selectedDayData?.videoUrl ? (
                  <div style={{ marginTop: '20px' }}>
                    <video 
                      controls 
                      style={{ width: '100%', maxWidth: '600px', borderRadius: '8px' }}
                      src={selectedDayData.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div style={styles.noContentMessage}>
                    <p>📹 Video content for this day is being prepared.</p>
                    <p>Click "Start Personalized Activities" to access interactive content.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    fontSize: '18px',
    color: '#6b7280'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px'
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    maxWidth: '400px'
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    marginTop: '12px'
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px'
  },
  progressSummary: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    fontSize: '16px'
  },
  overallProgress: {
    color: '#3b82f6',
    fontWeight: 'semibold'
  },
  burdenLevel: {
    color: '#6b7280'
  },
  dayGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  dayCard: {
    backgroundColor: 'white',
    border: '2px solid',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  dayCardSelected: {
    transform: 'scale(1.02)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  dayNumber: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  dayTitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  dayStatus: {
    fontSize: '12px',
    fontWeight: 'semibold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px'
  },
  flowToggleContainer: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  flowToggleButton: {
    padding: '12px 24px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  contentArea: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  contentTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px'
  },
  lockedMessage: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center'
  },
  completedMessage: {
    backgroundColor: '#d1fae5',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center'
  },
  dayContent: {
    padding: '20px'
  },
  noContentMessage: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    color: '#64748b'
  }
};