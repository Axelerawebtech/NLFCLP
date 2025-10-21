import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '2rem 1rem',
  },
  maxWidth: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  button: {
    padding: '0.625rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
    marginLeft: '0.5rem',
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    color: 'white',
  },
  buttonSecondary: {
    backgroundColor: '#6b7280',
    color: 'white',
  },
  buttonGreen: {
    backgroundColor: '#16a34a',
    color: 'white',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
  },
  statFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  tabs: {
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    gap: 0,
    overflowX: 'auto',
  },
  tab: {
    padding: '1rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
  },
  tabActive: {
    borderBottomColor: '#2563eb',
    color: '#2563eb',
  },
  tabInactive: {
    color: '#6b7280',
  },
  tabContent: {
    padding: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#111827',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  infoLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.25rem',
  },
  infoValue: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#111827',
  },
  dayCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem',
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  dayTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  progressBar: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    height: '0.5rem',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginLeft: '0.5rem',
  },
  badgeGreen: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  badgeGray: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
  badgeYellow: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  badgeRed: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    maxWidth: '28rem',
    width: '100%',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#111827',
  },
  input: {
    width: '100%',
    padding: '0.625rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1.5rem',
  },
  buttonFull: {
    flex: 1,
  },
  noteCard: {
    backgroundColor: '#f9fafb',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
    marginBottom: '0.75rem',
  },
  noteText: {
    fontSize: '0.875rem',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  noteDate: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  alertBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginTop: '1rem',
  },
  alertText: {
    fontSize: '0.875rem',
    color: '#1e40af',
  },
  dayDetailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.5rem',
    fontSize: '0.875rem',
  },
  checkIcon: {
    color: '#16a34a',
  },
  crossIcon: {
    color: '#9ca3af',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  backButton: {
    color: '#2563eb',
    textDecoration: 'none',
    cursor: 'pointer',
    marginBottom: '0.5rem',
    display: 'inline-block',
  },
};

export default function CaregiverProfile() {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [noteText, setNoteText] = useState('');
  const [customWaitTime, setCustomWaitTime] = useState({ day0ToDay1: 24, betweenDays: 24 });
  const [showWaitTimeModal, setShowWaitTimeModal] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [resetDayData, setResetDayData] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      fetchProfileData();
    }
  }, [id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/caregiver/profile?caregiverId=${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProfileData(data.data);
        if (data.data.program?.customWaitTimes) {
          setCustomWaitTime(data.data.program.customWaitTimes);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch caregiver profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockDay = async (day) => {
    try {
      const response = await fetch('/api/admin/program/unlock-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId: id, day })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Day ${day} unlocked successfully`);
        fetchProfileData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to unlock day');
      console.error(err);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    
    try {
      const response = await fetch('/api/admin/caregiver/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caregiverId: id, 
          note: noteText,
          addedBy: 'admin'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setNoteText('');
        fetchProfileData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to add note');
      console.error(err);
    }
  };

  const handleUpdateWaitTime = async () => {
    try {
      const response = await fetch('/api/admin/program/update-wait-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caregiverId: id, 
          ...customWaitTime
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Wait times updated successfully');
        setShowWaitTimeModal(false);
        fetchProfileData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to update wait times');
      console.error(err);
    }
  };

  const handleToggleLock = async (day, currentStatus) => {
    try {
      const response = await fetch('/api/admin/toggle-day-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId: id,
          day,
          permission: !currentStatus
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Day ${day} ${!currentStatus ? 'unlocked' : 'locked'} successfully`);
        setTimeout(() => setSuccess(''), 3000);
        fetchProfileData();
      } else {
        alert(data.error || 'Failed to update permission');
      }
    } catch (error) {
      console.error('Permission toggle error:', error);
      alert('Network error. Please try again.');
    }
  };

  const openResetDialog = (day) => {
    setResetDayData({ day });
    setResetDialog(true);
  };

  const handleResetDayProgress = async (resetBurdenTest = false) => {
    if (!resetDayData) return;

    try {
      const response = await fetch('/api/admin/reset-day-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiverId: id,
          day: resetDayData.day,
          resetBurdenTest
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => setSuccess(''), 3000);
        setResetDialog(false);
        setResetDayData(null);
        fetchProfileData();
      } else {
        alert(data.error || 'Failed to reset day progress');
      }
    } catch (error) {
      console.error('Reset day progress error:', error);
      alert('Network error. Please try again.');
    }
  };

  const getBurdenLevelStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'mild': return { ...styles.badge, ...styles.badgeGreen };
      case 'moderate': return { ...styles.badge, ...styles.badgeYellow };
      case 'severe': return { ...styles.badge, ...styles.badgeRed };
      default: return { ...styles.badge, ...styles.badgeGray };
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return '#16a34a';
    if (percentage >= 50) return '#eab308';
    if (percentage >= 25) return '#f97316';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .spinner {
            border: 3px solid #f3f4f6;
            border-top-color: #2563eb;
            border-radius: 50%;
            width: 3rem;
            height: 3rem;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
        `}</style>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading caregiver profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', fontSize: '1.25rem', marginBottom: '1rem' }}>{error || 'Profile not found'}</p>
          <button 
            onClick={() => router.back()}
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { caregiver, program, statistics } = profileData;

  return (
    <>
      <Head>
        <title>{caregiver.name} - Caregiver Profile</title>
      </Head>
      
      <div style={styles.container}>
        <div style={styles.maxWidth}>
          {/* Header */}
          <div style={styles.card}>
            <a onClick={() => router.back()} style={styles.backButton}>
              ← Back to Dashboard
            </a>
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>{caregiver.name}</h1>
                <p style={styles.subtitle}>Caregiver ID: {caregiver.caregiverId}</p>
              </div>
              <div>
                <button
                  onClick={() => setShowWaitTimeModal(true)}
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  Configure Wait Times
                </button>
                <button
                  onClick={fetchProfileData}
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div style={{ 
              backgroundColor: '#d1fae5', 
              border: '1px solid #6ee7b7', 
              borderRadius: '0.5rem', 
              padding: '1rem', 
              marginBottom: '1.5rem',
              color: '#065f46'
            }}>
              {success}
            </div>
          )}

          {/* Statistics Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statFlex}>
                <div>
                  <p style={styles.statLabel}>Overall Progress</p>
                  <p style={{ ...styles.statValue, color: '#2563eb' }}>
                    {Math.round(statistics.overallProgress)}%
                  </p>
                </div>
                <div style={{ fontSize: '2.5rem' }}>📊</div>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statFlex}>
                <div>
                  <p style={styles.statLabel}>Current Day</p>
                  <p style={{ ...styles.statValue, color: '#16a34a' }}>
                    Day {statistics.currentDay}
                  </p>
                </div>
                <div style={{ fontSize: '2.5rem' }}>📅</div>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statFlex}>
                <div>
                  <p style={styles.statLabel}>Completed Days</p>
                  <p style={{ ...styles.statValue, color: '#7c3aed' }}>
                    {statistics.completedDays} / {statistics.totalDays}
                  </p>
                </div>
                <div style={{ fontSize: '2.5rem' }}>✅</div>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statFlex}>
                <div>
                  <p style={styles.statLabel}>Burden Level</p>
                  <span style={getBurdenLevelStyle(statistics.burdenLevel)}>
                    {statistics.burdenLevel}
                  </span>
                </div>
                <div style={{ fontSize: '2.5rem' }}>🎯</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.card}>
            <div style={styles.tabs}>
              {['overview', 'progress', 'assessment', 'notes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab ? styles.tabActive : styles.tabInactive)
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div style={styles.tabContent}>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={styles.sectionTitle}>Personal Information</h3>
                    <div style={styles.infoGrid}>
                      <div>
                        <p style={styles.infoLabel}>Phone</p>
                        <p style={styles.infoValue}>{caregiver.phone}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Age</p>
                        <p style={styles.infoValue}>{caregiver.age}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Gender</p>
                        <p style={styles.infoValue}>{caregiver.gender}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Marital Status</p>
                        <p style={styles.infoValue}>{caregiver.maritalStatus}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Education Level</p>
                        <p style={styles.infoValue}>{caregiver.educationLevel}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Employment Status</p>
                        <p style={styles.infoValue}>{caregiver.employmentStatus}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={styles.sectionTitle}>Caregiving Information</h3>
                    <div style={styles.infoGrid}>
                      <div>
                        <p style={styles.infoLabel}>Relationship to Patient</p>
                        <p style={styles.infoValue}>{caregiver.relationshipToPatient}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Hours Per Day</p>
                        <p style={styles.infoValue}>{caregiver.hoursPerDay}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Duration of Caregiving</p>
                        <p style={styles.infoValue}>{caregiver.durationOfCaregiving}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Previous Experience</p>
                        <p style={styles.infoValue}>{caregiver.previousExperience}</p>
                      </div>
                    </div>
                  </div>

                  {program && (
                    <div>
                      <h3 style={styles.sectionTitle}>Program Timeline</h3>
                      <div style={styles.infoGrid}>
                        <div>
                          <p style={styles.infoLabel}>Program Started</p>
                          <p style={styles.infoValue}>
                            {new Date(program.programStartedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p style={styles.infoLabel}>Last Active</p>
                          <p style={styles.infoValue}>
                            {new Date(program.lastActiveAt).toLocaleDateString()}
                          </p>
                        </div>
                        {program.burdenTestCompletedAt && (
                          <div>
                            <p style={styles.infoLabel}>Burden Test Completed</p>
                            <p style={styles.infoValue}>
                              {new Date(program.burdenTestCompletedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div>
                  <h3 style={styles.sectionTitle}>7-Day Program Progress</h3>
                  
                  <div>
                    {statistics.daysProgress.map((day) => (
                      <div key={day.day} style={styles.dayCard}>
                        <div style={styles.dayHeader}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <h4 style={styles.dayTitle}>Day {day.day}</h4>
                              {day.completedAt && (
                                <span style={{ ...styles.badge, ...styles.badgeGreen }}>
                                  Completed
                                </span>
                              )}
                              {!day.isUnlocked && (
                                <span style={{ ...styles.badge, ...styles.badgeGray }}>
                                  Locked
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{day.videoTitle}</p>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>
                                {day.progressPercentage}%
                              </p>
                              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Day Progress</p>
                            </div>
                            
                            {/* Video Watch Progress */}
                            {day.videoProgress !== undefined && (
                              <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#7c3aed', margin: 0 }}>
                                  {Math.round(day.videoProgress)}%
                                </p>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Video Watched</p>
                              </div>
                            )}
                            
                            {/* Audio Completion Status */}
                            {day.day === 0 && (
                              <div style={{ textAlign: 'center' }}>
                                <p style={{ 
                                  fontSize: '1.25rem', 
                                  fontWeight: 'bold', 
                                  color: day.audioCompleted ? '#16a34a' : '#6b7280', 
                                  margin: 0 
                                }}>
                                  {day.audioCompleted ? '✅' : '⏳'}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Audio Status</p>
                              </div>
                            )}
                            
                            {/* Lock/Unlock Button */}
                            {day.day !== 0 && (
                              <button
                                onClick={() => handleToggleLock(day.day, day.isUnlocked)}
                                style={{ 
                                  ...styles.button, 
                                  backgroundColor: day.isUnlocked ? '#dc2626' : '#16a34a',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  padding: '0.5rem 0.75rem'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = day.isUnlocked ? '#b91c1c' : '#15803d'}
                                onMouseOut={(e) => e.target.style.backgroundColor = day.isUnlocked ? '#dc2626' : '#16a34a'}
                              >
                                {day.isUnlocked ? '🔓 Lock' : '🔒 Unlock'}
                              </button>
                            )}
                            
                            {/* Reset Progress Button */}
                            {day.progressPercentage > 0 && (
                              <button
                                onClick={() => openResetDialog(day.day)}
                                style={{ 
                                  ...styles.button, 
                                  backgroundColor: '#f59e0b',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  padding: '0.5rem 0.75rem'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                              >
                                🔄 Reset
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div style={styles.progressBar}>
                          <div
                            style={{ 
                              width: `${day.progressPercentage}%`, 
                              height: '100%', 
                              backgroundColor: getProgressColor(day.progressPercentage),
                              borderRadius: '9999px',
                              transition: 'width 0.3s'
                            }}
                          ></div>
                        </div>
                        
                        {/* Day Details */}
                        <div style={styles.dayDetailGrid}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={day.videoWatched ? styles.checkIcon : styles.crossIcon}>
                              {day.videoWatched ? '✅' : '⭕'}
                            </span>
                            <span style={{ color: '#6b7280' }}>Video</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={day.tasksCompleted ? styles.checkIcon : styles.crossIcon}>
                              {day.tasksCompleted ? '✅' : '⭕'}
                            </span>
                            <span style={{ color: '#6b7280' }}>Tasks</span>
                          </div>
                          {day.completedAt && (
                            <div style={{ color: '#6b7280' }}>
                              <p style={{ fontSize: '0.75rem', margin: 0 }}>
                                Completed: {new Date(day.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assessment Tab */}
              {activeTab === 'assessment' && (
                <div>
                  <h3 style={styles.sectionTitle}>Zarit Burden Assessment</h3>
                  
                  {program?.zaritBurdenAssessment ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                          <p style={styles.infoLabel}>Total Score</p>
                          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                            {program.zaritBurdenAssessment.totalScore} / 28
                          </p>
                        </div>
                        <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                          <p style={styles.infoLabel}>Burden Level</p>
                          <span style={getBurdenLevelStyle(program.zaritBurdenAssessment.burdenLevel)}>
                            {program.zaritBurdenAssessment.burdenLevel?.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                          <p style={styles.infoLabel}>Completed Date</p>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                            {program.zaritBurdenAssessment.completedAt 
                              ? new Date(program.zaritBurdenAssessment.completedAt).toLocaleDateString()
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 style={{ ...styles.sectionTitle, fontSize: '1.125rem' }}>Question Responses</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {(() => {
                            const questions = [
                              'Do you feel that your relative asks for more help than he/she needs?',
                              'Do you feel that because of the time you spend with your relative you don\'t have enough time for yourself?',
                              'Do you feel stressed between caring for your relative and trying to meet other responsibilities (work/family)?',
                              'Do you feel embarrassed over your relative\'s behavior?',
                              'Do you feel angry when you are around your relative?',
                              'Do you feel that your social life has suffered because you are caring for your relative?',
                              'Overall, how burdened do you feel in caring for your relative?'
                            ];
                            
                            const scaleLabels = ['Never', 'Rarely', 'Sometimes', 'Quite Frequently', 'Nearly Always'];
                            
                            // Handle both formats: answers array (new) or question1-7 (old)
                            let answersArray = [];
                            
                            if (program.zaritBurdenAssessment.answers && Array.isArray(program.zaritBurdenAssessment.answers)) {
                              // New format: answers array
                              answersArray = program.zaritBurdenAssessment.answers;
                            } else {
                              // Old format: question1, question2, etc.
                              for (let i = 1; i <= 7; i++) {
                                const questionKey = `question${i}`;
                                if (program.zaritBurdenAssessment[questionKey] !== undefined) {
                                  answersArray.push(program.zaritBurdenAssessment[questionKey]);
                                }
                              }
                            }
                            
                            if (answersArray.length === 0) {
                              return (
                                <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                                  <p style={{ color: '#6b7280' }}>No individual question responses available</p>
                                </div>
                              );
                            }
                            
                            return answersArray.map((answer, index) => (
                              <div key={index} style={{ 
                                padding: '1rem', 
                                backgroundColor: '#f9fafb', 
                                borderRadius: '0.5rem',
                                borderLeft: '4px solid #2563eb'
                              }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <span style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: '700', 
                                    color: '#2563eb',
                                    backgroundColor: '#dbeafe',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem'
                                  }}>
                                    Question {index + 1}
                                  </span>
                                </div>
                                <p style={{ 
                                  fontSize: '0.875rem', 
                                  color: '#374151', 
                                  marginBottom: '0.5rem',
                                  fontWeight: '500'
                                }}>
                                  {questions[index]}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ 
                                    fontSize: '0.875rem', 
                                    fontWeight: '600',
                                    color: '#16a34a'
                                  }}>
                                    Answer: {scaleLabels[answer]} ({answer}/4)
                                  </span>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                      
                      {program.contentAssignedDynamically && (
                        <div style={{ ...styles.alertBox, marginTop: '1.5rem' }}>
                          <p style={styles.alertText}>
                            ℹ️ Dynamic content has been assigned to days 2-9 based on this burden assessment.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                      <p style={{ color: '#6b7280', fontSize: '1rem' }}>No assessment data available yet</p>
                      <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        The caregiver hasn't completed the Zarit Burden Assessment
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div>
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={styles.sectionTitle}>Add Admin Note</h3>
                    <div>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Enter note..."
                        style={styles.textarea}
                        rows="3"
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={!noteText.trim()}
                        style={{ 
                          ...styles.button, 
                          ...styles.buttonPrimary, 
                          marginTop: '0.5rem',
                          opacity: !noteText.trim() ? 0.5 : 1,
                          cursor: !noteText.trim() ? 'not-allowed' : 'pointer'
                        }}
                        onMouseOver={(e) => {
                          if (noteText.trim()) e.target.style.backgroundColor = '#1d4ed8';
                        }}
                        onMouseOut={(e) => {
                          if (noteText.trim()) e.target.style.backgroundColor = '#2563eb';
                        }}
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 style={styles.sectionTitle}>Previous Notes</h3>
                    {program?.adminNotes && program.adminNotes.length > 0 ? (
                      <div>
                        {program.adminNotes.slice().reverse().map((note, index) => (
                          <div key={index} style={styles.noteCard}>
                            <p style={styles.noteText}>{note.note}</p>
                            <p style={styles.noteDate}>
                              {new Date(note.addedAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                        <p style={{ color: '#6b7280' }}>No notes yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wait Time Modal */}
        {showWaitTimeModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>Configure Wait Times</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Day 0 to Day 1 (hours)
                </label>
                <input
                  type="number"
                  value={customWaitTime.day0ToDay1}
                  onChange={(e) => setCustomWaitTime({ ...customWaitTime, day0ToDay1: parseInt(e.target.value) })}
                  style={styles.input}
                  min="0"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Between Days (hours)
                </label>
                <input
                  type="number"
                  value={customWaitTime.betweenDays}
                  onChange={(e) => setCustomWaitTime({ ...customWaitTime, betweenDays: parseInt(e.target.value) })}
                  style={styles.input}
                  min="0"
                />
              </div>
              
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => setShowWaitTimeModal(false)}
                  style={{ ...styles.button, ...styles.buttonFull, border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateWaitTime}
                  style={{ ...styles.button, ...styles.buttonPrimary, ...styles.buttonFull }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Day Progress Confirmation Dialog */}
        {resetDialog && (
          <div style={styles.modal}>
            <div style={{ ...styles.modalContent, maxWidth: '32rem' }}>
              <h3 style={styles.modalTitle}>🔄 Reset Day {resetDayData?.day} Progress</h3>
              
              <div style={{ 
                backgroundColor: '#fef3c7', 
                border: '1px solid #fbbf24', 
                borderRadius: '0.5rem', 
                padding: '0.75rem', 
                marginBottom: '1rem'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0, fontWeight: '500' }}>
                  ⚠️ This action will reset all progress for Day {resetDayData?.day}
                </p>
              </div>
              
              <div style={{ paddingLeft: '1rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                  • Video progress will be cleared
                </p>
                <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                  • Task completion will be reset
                </p>
                <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                  • Progress percentage will be set to 0%
                </p>
                {resetDayData?.day === 1 && (
                  <>
                    <p style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '0.5rem', fontWeight: '600' }}>
                      • Optionally reset burden test results
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', paddingLeft: '1rem' }}>
                      (If you reset the burden test, the caregiver will need to retake it)
                    </p>
                  </>
                )}
              </div>

              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                The caregiver will need to complete Day {resetDayData?.day} again from the beginning.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {resetDayData?.day === 1 && (
                  <button
                    onClick={() => handleResetDayProgress(true)}
                    style={{ 
                      ...styles.button, 
                      width: '100%',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      padding: '0.75rem'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                  >
                    🗑️ Reset Including Burden Test
                  </button>
                )}
                <button
                  onClick={() => handleResetDayProgress(false)}
                  style={{ 
                    ...styles.button, 
                    width: '100%',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    padding: '0.75rem'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                >
                  🔄 Reset Progress Only
                </button>
                <button
                  onClick={() => {
                    setResetDialog(false);
                    setResetDayData(null);
                  }}
                  style={{ 
                    ...styles.button, 
                    width: '100%',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    color: '#374151',
                    padding: '0.75rem'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
