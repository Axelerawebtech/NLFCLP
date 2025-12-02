import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SequentialContentPlayer from './SequentialContentPlayer';
import Day1BurdenAssessment from './Day1BurdenAssessment';

export default function EnhancedCaregiverDashboard({ caregiverId }) {
  const { currentLanguage } = useLanguage();
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState({});
  const [burdenAssessmentComplete, setBurdenAssessmentComplete] = useState(false);
  const [burdenLevel, setBurdenLevel] = useState(null);

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
  }, [caregiverId]);

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

  useEffect(() => {
    if (caregiverId) {
      fetchProgramStatus();
    }
  }, [caregiverId, currentLanguage]);

  const fetchProgramStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/caregiver/check-program-status?caregiverId=${caregiverId}`);
      const data = await response.json();
      
      if (data.success) {
        const enhancedData = { ...data.data };
        
        // Fetch content for available days
        if (enhancedData.dayModules) {
          const contentPromises = enhancedData.dayModules.map(async (dayModule) => {
            try {
              const langKey = getLanguageKey();
              const queryParams = new URLSearchParams({
                day: dayModule.day.toString(),
                language: langKey
              });
              
              // Add burden level for days 1+ if assessment is complete
              if (dayModule.day >= 1 && burdenLevel) {
                queryParams.append('burdenLevel', burdenLevel);
              }
              
              // NOTE: This component uses deprecated get-video-content API
              // Consider migrating to SevenDayProgramDashboard.js which uses dynamic-day-content
              const contentResponse = await fetch(`/api/caregiver/get-video-content?${queryParams}`);
              
              if (contentResponse.ok) {
                const contentData = await contentResponse.json();
                return {
                  ...dayModule,
                  videoUrl: contentData.videoContent?.videoUrl || '',
                  videoTitle: contentData.videoContent?.title || '',
                  videoDescription: contentData.videoContent?.description || '',
                  audioUrl: contentData.videoContent?.audioUrl || '',
                  audioTitle: contentData.videoContent?.audioTitle || ''
                };
              }
              
              return {
                ...dayModule,
                videoUrl: '',
                videoTitle: '',
                videoDescription: '',
                audioUrl: '',
                audioTitle: ''
              };
            } catch (error) {
              console.error(`Error fetching content for Day ${dayModule.day}:`, error);
              return { ...dayModule };
            }
          });
          
          const enhancedDayModules = await Promise.all(contentPromises);
          enhancedData.dayModules = enhancedDayModules;
        }
        
        setProgramData(enhancedData);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error fetching program status:', err);
      setError('Failed to load program data');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = (progressInfo) => {
    setProgressData(prev => ({
      ...prev,
      [progressInfo.day]: progressInfo
    }));
  };

  const handleBurdenAssessmentComplete = (assessmentData) => {
    setBurdenAssessmentComplete(true);
    setBurdenLevel(assessmentData.burdenLevel);
    // Refresh program data to load content based on burden level
    fetchProgramStatus();
  };

  const isDayUnlocked = (day) => {
    if (day === 0) return true; // Day 0 always unlocked
    
    if (day === 1) {
      // Day 1 requires Day 0 completion (100%)
      const day0Progress = progressData[0];
      return day0Progress && day0Progress.isComplete;
    }
    
    if (day >= 2) {
      // Days 2+ require burden assessment completion
      return burdenAssessmentComplete;
    }
    
    return false;
  };

  const getOverallProgress = () => {
    const completedDays = Object.values(progressData).filter(p => p.isComplete).length;
    const totalDays = programData?.dayModules?.length || 8;
    return Math.round((completedDays / totalDays) * 100);
  };

  const getDayStatus = (day) => {
    if (!isDayUnlocked(day)) return 'locked';
    
    const dayProgress = progressData[day];
    if (dayProgress && dayProgress.isComplete) return 'completed';
    if (dayProgress && dayProgress.overallProgress > 0) return 'in-progress';
    
    return 'available';
  };

  const getDayStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'available': return '#3b82f6';
      case 'locked': return '#9ca3af';
      default: return '#9ca3af';
    }
  };

  const getDayStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'available': return '▶️';
      case 'locked': return '🔒';
      default: return '🔒';
    }
  };

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
    title: {
      fontSize: '28px',
      fontWeight: '700',
      margin: 0,
      marginBottom: '8px'
    },
    subtitle: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: '14px',
      margin: 0,
      marginBottom: '16px'
    },
    progressContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    progressText: {
      fontSize: '18px',
      fontWeight: '600'
    },
    progressBar: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '999px',
      height: '12px',
      width: '200px'
    },
    progressFill: {
      backgroundColor: 'white',
      height: '100%',
      borderRadius: '999px',
      transition: 'width 0.5s ease',
      width: `${getOverallProgress()}%`
    },
    dayGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px'
    },
    dayCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '2px solid',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      position: 'relative'
    },
    dayCardSelected: {
      borderColor: '#3b82f6',
      boxShadow: '0 4px 6px rgba(59, 130, 246, 0.1)'
    },
    dayNumber: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '8px'
    },
    dayTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px'
    },
    dayStatus: {
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'uppercase',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    contentArea: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e5e7eb'
    },
    contentTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#1f2937'
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
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div>
          <div style={styles.spinner}></div>
          <p>Loading your program...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.contentArea}>
        <h3>Error Loading Program</h3>
        <p>{error}</p>
      </div>
    );
  }

  const selectedDayData = programData?.dayModules?.find(d => d.day === selectedDay);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerCard}>
        <h1 style={styles.title}>Caregiver Support Program</h1>
        <p style={styles.subtitle}>
          Your personalized journey to better caregiving
        </p>
        <div style={styles.progressContainer}>
          <span style={styles.progressText}>
            Overall Progress: {getOverallProgress()}%
          </span>
          <div style={styles.progressBar}>
            <div style={styles.progressFill}></div>
          </div>
        </div>
      </div>

      {/* Day Grid */}
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
                ...(isSelected ? styles.dayCardSelected : {})
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

      {/* Content Area */}
      <div style={styles.contentArea}>
        <h2 style={styles.contentTitle}>Day {selectedDay} Content</h2>
        
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

        {selectedDay === 1 && (
          <div>
            {!isDayUnlocked(1) ? (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
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
            ) : (
              <div style={{
                backgroundColor: '#d1fae5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <h3>✅ Assessment Complete</h3>
                <p>Burden Level: {burdenLevel}</p>
                <p>Your personalized content is now available in Days 2-7.</p>
              </div>
            )}
          </div>
        )}

        {selectedDay >= 2 && (
          <div>
            {!isDayUnlocked(selectedDay) ? (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <h3>🔒 Day {selectedDay} Locked</h3>
                <p>Complete the burden assessment in Day 1 to unlock this content.</p>
              </div>
            ) : selectedDayData ? (
              <SequentialContentPlayer
                videoUrl={selectedDayData.videoUrl}
                audioUrl={selectedDayData.audioUrl}
                videoTitle={selectedDayData.videoTitle}
                audioTitle={selectedDayData.audioTitle}
                day={selectedDay}
                caregiverId={caregiverId}
                onProgressUpdate={handleProgressUpdate}
              />
            ) : (
              <div style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <p>Content for Day {selectedDay} is being prepared. Please check back later.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}