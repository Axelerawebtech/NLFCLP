import { useState, useEffect } from 'react';

export default function ProgramConfigManager() {
  // Language selection
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  
  // Wait times
  const [globalWaitTimes, setGlobalWaitTimes] = useState({ day0ToDay1: 24, betweenDays: 24 });
  
  // Day 0 Intro Video (same for all burden levels)
  const [day0IntroVideo, setDay0IntroVideo] = useState({
    title: { english: '', kannada: '', hindi: '' },
    videoUrl: { english: '', kannada: '', hindi: '' },
    description: { english: '', kannada: '', hindi: '' }
  });
  const [uploadingDay0, setUploadingDay0] = useState({ english: false, kannada: false, hindi: false });
  
  // Day 1 Configuration (Burden Test + Videos)
  const [day1Config, setDay1Config] = useState({
    mild: {
      videoTitle: { english: '', kannada: '', hindi: '' },
      videoUrl: { english: '', kannada: '', hindi: '' },
      description: { english: '', kannada: '', hindi: '' }
    },
    moderate: {
      videoTitle: { english: '', kannada: '', hindi: '' },
      videoUrl: { english: '', kannada: '', hindi: '' },
      description: { english: '', kannada: '', hindi: '' }
    },
    severe: {
      videoTitle: { english: '', kannada: '', hindi: '' },
      videoUrl: { english: '', kannada: '', hindi: '' },
      description: { english: '', kannada: '', hindi: '' }
    }
  });
  const [uploadingDay1, setUploadingDay1] = useState({ 
    mild: { english: false, kannada: false, hindi: false },
    moderate: { english: false, kannada: false, hindi: false },
    severe: { english: false, kannada: false, hindi: false }
  });
  const [day1SelectedBurden, setDay1SelectedBurden] = useState('mild');
  const [burdenTestQuestions, setBurdenTestQuestions] = useState([
    { id: 1, text: 'Does your relative ask for more help than needed?', enabled: true },
    { id: 2, text: 'Does caregiving affect your relationship with family/friends?', enabled: true },
    { id: 3, text: 'Do you feel your relative is dependent on you?', enabled: true },
    { id: 4, text: 'Do you feel strained when around your relative?', enabled: true },
    { id: 5, text: 'Has your social life suffered?', enabled: true },
    { id: 6, text: 'Does your relative expect you to be the only caregiver?', enabled: true },
    { id: 7, text: 'Do you wish you could leave care to someone else?', enabled: true }
  ]);
  
  // Days 2-9 Configuration
  const [selectedBurdenLevel, setSelectedBurdenLevel] = useState('mild');
  const [selectedDay, setSelectedDay] = useState(2);
  const [dayContent, setDayContent] = useState({
    videoTitle: { english: '', kannada: '', hindi: '' },
    videoUrl: { english: '', kannada: '', hindi: '' },
    content: { english: '', kannada: '', hindi: '' },
    tasks: []
  });
  const [uploadingDayVideo, setUploadingDayVideo] = useState(false);
  
  // Task management
  const [newTask, setNewTask] = useState({
    taskDescription: { english: '', kannada: '', hindi: '' },
    taskType: 'checkbox'
  });
  
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    loadConfig();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadDayContent();
  }, [selectedDay, selectedBurdenLevel]);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/program/config');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setGlobalWaitTimes(data.config.waitTimes || { day0ToDay1: 24, betweenDays: 24 });
          if (data.config.day0IntroVideo) {
            setDay0IntroVideo(data.config.day0IntroVideo);
          }
        }
      }

      // Load Day 1 configuration
      const day1Response = await fetch('/api/admin/program/config/day1');
      if (day1Response.ok) {
        const day1Data = await day1Response.json();
        if (day1Data.config) {
          setBurdenTestQuestions(day1Data.config.burdenTestQuestions || []);
          if (day1Data.config.videos) {
            setDay1Config(day1Data.config.videos);
          }
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadDayContent = async () => {
    try {
      const response = await fetch(`/api/admin/program/config?day=${selectedDay}&burdenLevel=${selectedBurdenLevel}`);
      if (response.ok) {
        const data = await response.json();
        if (data.dayContent) {
          setDayContent(data.dayContent);
        } else {
          // Reset to empty if no content
          setDayContent({
            videoTitle: { english: '', kannada: '', hindi: '' },
            videoUrl: { english: '', kannada: '', hindi: '' },
            content: { english: '', kannada: '', hindi: '' },
            tasks: []
          });
        }
      }
    } catch (error) {
      console.error('Error loading day content:', error);
    }
  };

  const handleVideoUpload = async (file, targetLanguage, isDay0 = false, burdenLevel = null) => {
    const formData = new FormData();
    formData.append('video', file);

    // Set uploading state based on context
    if (isDay0) {
      setUploadingDay0({ ...uploadingDay0, [targetLanguage]: true });
    } else if (burdenLevel) {
      // Day 1 upload
      setUploadingDay1({
        ...uploadingDay1,
        [burdenLevel]: {
          ...uploadingDay1[burdenLevel],
          [targetLanguage]: true
        }
      });
    } else {
      setUploadingDayVideo(true);
    }

    try {
      const response = await fetch('/api/admin/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        if (isDay0) {
          setDay0IntroVideo({
            ...day0IntroVideo,
            videoUrl: {
              ...day0IntroVideo.videoUrl,
              [targetLanguage]: data.url
            }
          });
          alert(`Day 0 video uploaded successfully for ${targetLanguage}!`);
        } else if (burdenLevel) {
          // Day 1 video
          setDay1Config({
            ...day1Config,
            [burdenLevel]: {
              ...day1Config[burdenLevel],
              videoUrl: {
                ...day1Config[burdenLevel].videoUrl,
                [targetLanguage]: data.url
              }
            }
          });
          alert(`Day 1 video uploaded successfully for ${burdenLevel} burden - ${targetLanguage}!`);
        } else {
          setDayContent({
            ...dayContent,
            videoUrl: {
              ...dayContent.videoUrl,
              [targetLanguage]: data.url
            }
          });
          alert(`Day ${selectedDay} video uploaded successfully for ${targetLanguage}!`);
        }
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      if (isDay0) {
        setUploadingDay0({ ...uploadingDay0, [targetLanguage]: false });
      } else if (burdenLevel) {
        // Day 1 upload finished
        setUploadingDay1({
          ...uploadingDay1,
          [burdenLevel]: {
            ...uploadingDay1[burdenLevel],
            [targetLanguage]: false
          }
        });
      } else {
        setUploadingDayVideo(false);
      }
    }
  };

  const updateWaitTimes = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/program/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitTimes: globalWaitTimes }),
      });
      if (response.ok) {
        alert('Wait times updated successfully!');
      }
    } catch (error) {
      console.error('Error updating wait times:', error);
      alert('Failed to update wait times');
    }
    setSaving(false);
  };

  const saveDay0Config = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/program/config/day0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day0IntroVideo }),
      });
      if (response.ok) {
        alert('Day 0 configuration saved successfully!');
      }
    } catch (error) {
      console.error('Error saving Day 0 config:', error);
      alert('Failed to save Day 0 configuration');
    }
    setSaving(false);
  };

  const syncDay0ToAllCaregivers = async () => {
    if (!confirm('This will update Day 0 content for ALL existing caregivers. Continue?')) {
      return;
    }
    
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/refresh-all-day0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Success!\n\nDay 0 content synced to ${data.updatedCount} caregiver(s).\n\nCaregivers can now see the Day 0 videos you uploaded.`);
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error syncing Day 0:', error);
      alert('Failed to sync Day 0 content to caregivers');
    }
    setSyncing(false);
  };

  const saveDay1Config = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/program/config/day1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          day1Config,
          burdenTestQuestions
        }),
      });
      if (response.ok) {
        alert('Day 1 configuration saved successfully!');
      }
    } catch (error) {
      console.error('Error saving Day 1 config:', error);
      alert('Failed to save Day 1 configuration');
    }
    setSaving(false);
  };

  const toggleQuestion = (questionId) => {
    setBurdenTestQuestions(burdenTestQuestions.map(q => 
      q.id === questionId ? { ...q, enabled: !q.enabled } : q
    ));
  };

  const updateQuestionText = (questionId, newText) => {
    setBurdenTestQuestions(burdenTestQuestions.map(q => 
      q.id === questionId ? { ...q, text: newText } : q
    ));
  };

  const saveDayContent = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/program/config/day-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: selectedDay,
          burdenLevel: selectedBurdenLevel,
          content: dayContent
        }),
      });
      if (response.ok) {
        alert(`Day ${selectedDay} content saved for ${selectedBurdenLevel} burden level!`);
        loadDayContent();
      }
    } catch (error) {
      console.error('Error saving day content:', error);
      alert('Failed to save day content');
    }
    setSaving(false);
  };

  const addTask = () => {
    if (!newTask.taskDescription[selectedLanguage]?.trim()) {
      alert(`Please enter a task description in ${selectedLanguage}`);
      return;
    }

    const task = {
      taskId: Date.now().toString(),
      taskDescription: newTask.taskDescription,
      taskType: newTask.taskType
    };

    setDayContent({
      ...dayContent,
      tasks: [...dayContent.tasks, task]
    });

    setNewTask({
      taskDescription: { english: '', kannada: '', hindi: '' },
      taskType: 'checkbox'
    });
  };

  const removeTask = (taskId) => {
    setDayContent({
      ...dayContent,
      tasks: dayContent.tasks.filter(task => task.taskId !== taskId)
    });
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '32px' },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: isMobile ? '20px' : '32px'
    },
    cardTitle: {
      fontSize: isMobile ? '22px' : '28px',
      fontWeight: '700',
      marginBottom: '24px',
      marginTop: 0,
      color: '#111827',
      borderBottom: '3px solid #2563eb',
      paddingBottom: '12px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '16px',
      marginTop: '24px',
      color: '#1f2937'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      resize: 'vertical',
      minHeight: '120px',
      fontFamily: 'inherit',
      transition: 'all 0.2s',
      boxSizing: 'border-box'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    buttonPrimary: {
      backgroundColor: '#2563eb',
      color: '#ffffff'
    },
    buttonSecondary: {
      backgroundColor: '#6b7280',
      color: '#ffffff'
    },
    buttonDanger: {
      backgroundColor: '#dc2626',
      color: '#ffffff'
    },
    languageTabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '0'
    },
    languageTab: (isActive) => ({
      padding: '12px 24px',
      border: 'none',
      backgroundColor: 'transparent',
      color: isActive ? '#2563eb' : '#6b7280',
      fontWeight: isActive ? '600' : '500',
      fontSize: '14px',
      cursor: 'pointer',
      borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
      marginBottom: '-2px',
      transition: 'all 0.2s'
    }),
    uploadSection: {
      border: '2px dashed #d1d5db',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      backgroundColor: '#f9fafb',
      marginTop: '12px'
    },
    fileInput: {
      display: 'none'
    },
    uploadButton: {
      padding: '12px 24px',
      backgroundColor: '#10b981',
      color: '#ffffff',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'inline-block'
    },
    taskItem: {
      padding: '16px',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '16px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Language Selector */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Select Language for Configuration</h2>
        <div style={styles.languageTabs}>
          <button
            style={styles.languageTab(selectedLanguage === 'english')}
            onClick={() => setSelectedLanguage('english')}
          >
            🇬🇧 English
          </button>
          <button
            style={styles.languageTab(selectedLanguage === 'kannada')}
            onClick={() => setSelectedLanguage('kannada')}
          >
            🇮🇳 ಕನ್ನಡ (Kannada)
          </button>
          <button
            style={styles.languageTab(selectedLanguage === 'hindi')}
            onClick={() => setSelectedLanguage('hindi')}
          >
            🇮🇳 हिंदी (Hindi)
          </button>
        </div>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
          💡 You need to configure content for all three languages. Switch between tabs to add translations.
        </p>
      </div>

      {/* Wait Times Configuration */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>⏰ Global Wait Times</h2>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Day 0 to Day 1 (hours)</label>
            <input
              type="number"
              style={styles.input}
              value={globalWaitTimes.day0ToDay1}
              onChange={(e) => setGlobalWaitTimes({ ...globalWaitTimes, day0ToDay1: parseInt(e.target.value) })}
              min="0"
            />
          </div>
          <div>
            <label style={styles.label}>Between Days 1-9 (hours)</label>
            <input
              type="number"
              style={styles.input}
              value={globalWaitTimes.betweenDays}
              onChange={(e) => setGlobalWaitTimes({ ...globalWaitTimes, betweenDays: parseInt(e.target.value) })}
              min="0"
            />
          </div>
        </div>
        <button
          style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '16px' }}
          onClick={updateWaitTimes}
          disabled={saving}
        >
          {saving ? 'Updating...' : 'Update Wait Times'}
        </button>
      </div>

      {/* Day 0: Introductory Video */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📺 Day 0: Introductory Video</h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
          This intro video is shown to ALL users before they take the burden assessment on Day 1.
        </p>

        <div>
          <label style={styles.label}>Video Title ({selectedLanguage})</label>
          <input
            type="text"
            style={styles.input}
            value={day0IntroVideo.title[selectedLanguage] || ''}
            onChange={(e) => setDay0IntroVideo({
              ...day0IntroVideo,
              title: { ...day0IntroVideo.title, [selectedLanguage]: e.target.value }
            })}
            placeholder={`Enter video title in ${selectedLanguage}`}
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={styles.label}>Description ({selectedLanguage})</label>
          <textarea
            style={styles.textarea}
            value={day0IntroVideo.description[selectedLanguage] || ''}
            onChange={(e) => setDay0IntroVideo({
              ...day0IntroVideo,
              description: { ...day0IntroVideo.description, [selectedLanguage]: e.target.value }
            })}
            placeholder={`Enter video description in ${selectedLanguage}`}
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={styles.label}>Video URL ({selectedLanguage})</label>
          <input
            type="text"
            style={styles.input}
            value={day0IntroVideo.videoUrl[selectedLanguage] || ''}
            readOnly
            placeholder="Upload video to get URL"
          />
          
          <div style={styles.uploadSection}>
            <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
              📤 Upload video for {selectedLanguage}
            </p>
            <input
              type="file"
              id={`day0-upload-${selectedLanguage}`}
              style={styles.fileInput}
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleVideoUpload(file, selectedLanguage, true);
              }}
            />
            <label htmlFor={`day0-upload-${selectedLanguage}`} style={styles.uploadButton}>
              {uploadingDay0[selectedLanguage] ? 'Uploading...' : 'Choose Video File'}
            </label>
            <p style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
              Supported: MP4, MOV, AVI • Max 100MB (Free tier)
            </p>
          </div>
        </div>

        <button
          style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '24px' }}
          onClick={saveDay0Config}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Day 0 Configuration'}
        </button>

        <button
          style={{ 
            ...styles.button, 
            backgroundColor: syncing ? '#9ca3af' : '#059669',
            color: 'white',
            marginTop: '12px',
            width: '100%'
          }}
          onClick={syncDay0ToAllCaregivers}
          disabled={syncing}
        >
          {syncing ? '🔄 Syncing...' : '🔄 Sync Day 0 to All Caregivers'}
        </button>

        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', fontStyle: 'italic' }}>
          💡 Click "Sync" after saving to update all existing caregiver programs with the latest Day 0 videos
        </p>
      </div>

      {/* Day 1: Burden Test + Videos */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📋 Day 1: Burden Assessment + Video</h2>
        
        {/* Burden Test Questions Management */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={styles.sectionTitle}>Zarit Burden Assessment Questions</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            Manage the 7 MCQ questions for burden assessment. Caregivers answer these first, then see a video based on their score.
          </p>
          
          {burdenTestQuestions.map((question, index) => (
            <div key={question.id} style={{ 
              padding: '16px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              marginBottom: '12px',
              backgroundColor: question.enabled ? 'white' : '#f9fafb'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input
                  type="checkbox"
                  checked={question.enabled}
                  onChange={() => toggleQuestion(question.id)}
                  style={{ marginTop: '4px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <strong style={{ color: '#111827' }}>Question {index + 1}:</strong>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      backgroundColor: question.enabled ? '#dcfce7' : '#f3f4f6',
                      color: question.enabled ? '#166534' : '#6b7280'
                    }}>
                      {question.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <textarea
                    value={question.text}
                    onChange={(e) => updateQuestionText(question.id, e.target.value)}
                    disabled={!question.enabled}
                    style={{
                      ...styles.input,
                      minHeight: '60px',
                      opacity: question.enabled ? 1 : 0.6
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Day 1 Videos by Burden Level */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={styles.sectionTitle}>Post-Assessment Videos</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            Upload videos that will be shown AFTER the burden test, based on the caregiver's score.
          </p>
          
          {/* Burden Level Selector for Day 1 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={styles.label}>Select Burden Level</label>
            <select
              style={styles.input}
              value={day1SelectedBurden}
              onChange={(e) => setDay1SelectedBurden(e.target.value)}
            >
              <option value="mild">😊 Mild Burden (Score 0-10)</option>
              <option value="moderate">😐 Moderate Burden (Score 11-20)</option>
              <option value="severe">😟 Severe Burden (Score 21-28)</option>
            </select>
          </div>

          {/* Language Tabs for Day 1 */}
          <div style={styles.languageTabs}>
            {['english', 'kannada', 'hindi'].map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                style={{
                  ...styles.languageTab,
                  ...(selectedLanguage === lang ? styles.languageTabActive : {})
                }}
              >
                {lang === 'english' ? 'English' : lang === 'kannada' ? 'ಕನ್ನಡ' : 'हिंदी'}
              </button>
            ))}
          </div>

          {/* Video Configuration for Selected Burden Level */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Video Title ({selectedLanguage})</label>
              <input
                type="text"
                style={styles.input}
                value={day1Config[day1SelectedBurden].videoTitle[selectedLanguage] || ''}
                onChange={(e) => setDay1Config({
                  ...day1Config,
                  [day1SelectedBurden]: {
                    ...day1Config[day1SelectedBurden],
                    videoTitle: {
                      ...day1Config[day1SelectedBurden].videoTitle,
                      [selectedLanguage]: e.target.value
                    }
                  }
                })}
                placeholder={`Enter video title in ${selectedLanguage}`}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Video URL ({selectedLanguage})</label>
              <input
                type="text"
                style={styles.input}
                value={day1Config[day1SelectedBurden].videoUrl[selectedLanguage] || ''}
                onChange={(e) => setDay1Config({
                  ...day1Config,
                  [day1SelectedBurden]: {
                    ...day1Config[day1SelectedBurden],
                    videoUrl: {
                      ...day1Config[day1SelectedBurden].videoUrl,
                      [selectedLanguage]: e.target.value
                    }
                  }
                })}
                placeholder="Upload video to get URL"
              />
              
              <div style={styles.uploadSection}>
                <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
                  📤 Upload video for {day1SelectedBurden} burden - {selectedLanguage}
                </p>
                <input
                  type="file"
                  id={`day1-upload-${day1SelectedBurden}-${selectedLanguage}`}
                  style={styles.fileInput}
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleVideoUpload(file, selectedLanguage, false, day1SelectedBurden);
                    }
                  }}
                />
                <label 
                  htmlFor={`day1-upload-${day1SelectedBurden}-${selectedLanguage}`} 
                  style={styles.uploadButton}
                >
                  {uploadingDay1[day1SelectedBurden][selectedLanguage] ? 'Uploading...' : 'Choose Video File'}
                </label>
                <p style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                  Supported: MP4, MOV, AVI • Max 100MB (Free tier)
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Description ({selectedLanguage})</label>
              <textarea
                style={{ ...styles.input, minHeight: '80px' }}
                value={day1Config[day1SelectedBurden].description[selectedLanguage] || ''}
                onChange={(e) => setDay1Config({
                  ...day1Config,
                  [day1SelectedBurden]: {
                    ...day1Config[day1SelectedBurden],
                    description: {
                      ...day1Config[day1SelectedBurden].description,
                      [selectedLanguage]: e.target.value
                    }
                  }
                })}
                placeholder={`Enter video description in ${selectedLanguage}`}
              />
            </div>
          </div>
        </div>

        <button
          style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '24px', width: '100%' }}
          onClick={saveDay1Config}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Day 1 Configuration'}
        </button>

        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', fontStyle: 'italic' }}>
          💡 Upload videos for all 3 burden levels (mild, moderate, severe) and all 3 languages
        </p>
      </div>

      {/* Days 2-9: Dynamic Content */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🎯 Days 2-9: Personalized Content</h2>
        
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Select Burden Level</label>
            <select
              style={styles.input}
              value={selectedBurdenLevel}
              onChange={(e) => setSelectedBurdenLevel(e.target.value)}
            >
              <option value="mild">😊 Mild Burden</option>
              <option value="moderate">😐 Moderate Burden</option>
              <option value="severe">😟 Severe Burden</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Select Day</label>
            <select
              style={styles.input}
              value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value))}
            >
              {[2, 3, 4, 5, 6, 7, 8, 9].map(day => (
                <option key={day} value={day}>Day {day}</option>
              ))}
            </select>
          </div>
        </div>

        <h3 style={styles.sectionTitle}>Video Configuration</h3>
        
        <div>
          <label style={styles.label}>Video Title ({selectedLanguage})</label>
          <input
            type="text"
            style={styles.input}
            value={dayContent.videoTitle[selectedLanguage] || ''}
            onChange={(e) => setDayContent({
              ...dayContent,
              videoTitle: { ...dayContent.videoTitle, [selectedLanguage]: e.target.value }
            })}
            placeholder={`Enter video title in ${selectedLanguage}`}
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={styles.label}>Video URL ({selectedLanguage})</label>
          <input
            type="text"
            style={styles.input}
            value={dayContent.videoUrl[selectedLanguage] || ''}
            readOnly
            placeholder="Upload video to get URL"
          />
          
          <div style={styles.uploadSection}>
            <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
              📤 Upload video for Day {selectedDay} ({selectedBurdenLevel}) in {selectedLanguage}
            </p>
            <input
              type="file"
              id={`day-${selectedDay}-upload-${selectedLanguage}`}
              style={styles.fileInput}
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleVideoUpload(file, selectedLanguage, false);
              }}
            />
            <label htmlFor={`day-${selectedDay}-upload-${selectedLanguage}`} style={styles.uploadButton}>
              {uploadingDayVideo ? 'Uploading...' : 'Choose Video File'}
            </label>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <label style={styles.label}>Additional Content ({selectedLanguage})</label>
          <textarea
            style={styles.textarea}
            value={dayContent.content[selectedLanguage] || ''}
            onChange={(e) => setDayContent({
              ...dayContent,
              content: { ...dayContent.content, [selectedLanguage]: e.target.value }
            })}
            placeholder={`Enter additional text content/instructions in ${selectedLanguage}`}
          />
        </div>

        <h3 style={styles.sectionTitle}>Daily Tasks</h3>
        
        <div style={{ marginBottom: '16px' }}>
          {dayContent.tasks && dayContent.tasks.length > 0 ? (
            dayContent.tasks.map((task, index) => (
              <div key={task.taskId} style={styles.taskItem}>
                <div style={{ flex: 1 }}>
                  <strong>Task {index + 1}:</strong> {task.taskDescription[selectedLanguage] || task.taskDescription.english || '(No translation)'}
                  <br />
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Type: {task.taskType}</span>
                </div>
                <button
                  style={{ ...styles.button, ...styles.buttonDanger, padding: '8px 16px' }}
                  onClick={() => removeTask(task.taskId)}
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No tasks added yet</p>
          )}
        </div>

        <div style={{ border: '2px solid #e5e7eb', borderRadius: '8px', padding: '16px', backgroundColor: '#f9fafb' }}>
          <h4 style={{ marginTop: 0, fontSize: '16px', fontWeight: '600' }}>Add New Task</h4>
          
          <div>
            <label style={styles.label}>Task Description ({selectedLanguage})</label>
            <textarea
              style={{ ...styles.textarea, minHeight: '80px' }}
              value={newTask.taskDescription[selectedLanguage] || ''}
              onChange={(e) => setNewTask({
                ...newTask,
                taskDescription: { ...newTask.taskDescription, [selectedLanguage]: e.target.value }
              })}
              placeholder={`Enter task description in ${selectedLanguage}`}
            />
          </div>

          <div style={{ marginTop: '12px' }}>
            <label style={styles.label}>Task Type</label>
            <select
              style={styles.input}
              value={newTask.taskType}
              onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
            >
              <option value="checkbox">✓ Checkbox (Yes/No)</option>
              <option value="text">✏️ Text Input</option>
              <option value="reflection">💭 Reflection</option>
              <option value="problem-solving">🧩 Problem Solving</option>
            </select>
          </div>

          <button
            style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '12px' }}
            onClick={addTask}
          >
            + Add Task
          </button>
        </div>

        <button
          style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '24px', width: '100%' }}
          onClick={saveDayContent}
          disabled={saving}
        >
          {saving ? 'Saving...' : `Save Day ${selectedDay} Configuration`}
        </button>
      </div>
    </div>
  );
}
