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

  // Quick Assessment Questions (Yes/No type)
  const [quickAssessmentQuestions, setQuickAssessmentQuestions] = useState([
    { 
      id: 1, 
      questionText: {
        english: 'Did you complete your daily self-care routine today?',
        kannada: 'ನೀವು ಇಂದು ನಿಮ್ಮ ದೈನಂದಿನ ಸ್ವಯಂ-ಆರೈಕೆ ದಿನಚರಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದೀರಾ?',
        hindi: 'क्या आपने आज अपनी दैनिक स्व-देखभाल की दिनचर्या पूरी की?'
      },
      enabled: true 
    },
    { 
      id: 2, 
      questionText: {
        english: 'Did you feel stressed while caregiving today?',
        kannada: 'ಇಂದು ಆರೈಕೆ ನೀಡುವಾಗ ನೀವು ಒತ್ತಡವನ್ನು ಅನುಭವಿಸಿದ್ದೀರಾ?',
        hindi: 'क्या आज देखभाल करते समय आपको तनाव महसूस हुआ?'
      },
      enabled: true 
    },
    { 
      id: 3, 
      questionText: {
        english: 'Did you take any time for yourself today?',
        kannada: 'ಇಂದು ನೀವು ನಿಮಗಾಗಿ ಸ್ವಲ್ಪ ಸಮಯ ತೆಗೆದುಕೊಂಡಿದ್ದೀರಾ?',
        hindi: 'क्या आज आपने अपने लिए कुछ समय निकाला?'
      },
      enabled: true 
    },
    { 
      id: 4, 
      questionText: {
        english: 'Did you connect with family or friends today?',
        kannada: 'ಇಂದು ನೀವು ಕುಟುಂಬ ಅಥವಾ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿದ್ದೀರಾ?',
        hindi: 'क्या आज आपने परिवार या दोस्तों से संपर्क किया?'
      },
      enabled: true 
    },
    { 
      id: 5, 
      questionText: {
        english: 'Did you feel confident in your caregiving abilities today?',
        kannada: 'ಇಂದು ನಿಮ್ಮ ಆರೈಕೆ ಸಾಮರ್ಥ್ಯದಲ್ಲಿ ನೀವು ವಿಶ್ವಾಸ ಹೊಂದಿದ್ದೀರಾ?',
        hindi: 'क्या आज आपको अपनी देखभाल क्षमताओं पर भरोसा महसूस हुआ?'
      },
      enabled: true 
    }
  ]);
  
  // Days 2-9 Configuration
  const [selectedBurdenLevel, setSelectedBurdenLevel] = useState('mild');
  const [selectedDay, setSelectedDay] = useState(0);
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

  // Video upload and save tracking
  const [videoUploadedButNotSaved, setVideoUploadedButNotSaved] = useState(false);
  const [lastSaveStatus, setLastSaveStatus] = useState(''); // 'saved', 'error', or ''

  // Content Management States for Days 0-7
  const [selectedContentDay, setSelectedContentDay] = useState(0);
  const [contentType, setContentType] = useState('motivation');
  const [contentData, setContentData] = useState({
    motivation: { english: '', kannada: '', hindi: '' },
    healthcareTips: { english: '', kannada: '', hindi: '' },
    reminder: { english: '', kannada: '', hindi: '' },
    dailyTasks: { english: '', kannada: '', hindi: '' },
    audioContent: { english: '', kannada: '', hindi: '' },
    quickAssessment: { english: '', kannada: '', hindi: '' }
  });
  const [uploadingContent, setUploadingContent] = useState({
    motivation: { english: false, kannada: false, hindi: false },
    healthcareTips: { english: false, kannada: false, hindi: false },
    reminder: { english: false, kannada: false, hindi: false },
    dailyTasks: { english: false, kannada: false, hindi: false },
    audioContent: { english: false, kannada: false, hindi: false },
    quickAssessment: { english: false, kannada: false, hindi: false }
  });

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

  // Reset selectedBurdenLevel to first option when day changes
  useEffect(() => {
    const getFirstOptionForDay = (day) => {
      switch (day) {
        case 1: return 'mild';
        case 2: return 'low';
        case 3: return 'physical';
        case 4: return 'wound-care';
        default: return 'mild';
      }
    };
    
    const firstOption = getFirstOptionForDay(selectedDay);
    if (selectedBurdenLevel !== firstOption) {
      setSelectedBurdenLevel(firstOption);
    }
  }, [selectedDay]);

  // Load content data when selected day or content type changes
  useEffect(() => {
    loadContentData();
  }, [selectedContentDay, contentType]);

  // Load quick assessment questions on component mount
  useEffect(() => {
    loadQuickAssessmentQuestions();
  }, []);

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

    // Validate file size before upload
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 500) {
      alert(`❌ File too large! Maximum size is 500MB. Your file is ${fileSizeInMB.toFixed(2)}MB`);
      return;
    }

    // Set uploading state based on context
    if (isDay0) {
      setUploadingDayVideo(true);
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
      // Create timeout controller with longer timeout for large files
      const controller = new AbortController();
      const timeoutDuration = fileSizeInMB > 100 ? 300000 : 180000; // 5 minutes for large files, 3 minutes for smaller
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

      console.log(`📤 Starting upload: ${fileSizeInMB.toFixed(2)}MB file with ${timeoutDuration/1000}s timeout`);

      const response = await fetch('/api/admin/upload-video', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        if (isDay0) {
          // For Day 0, update dayContent state (not day0IntroVideo) when uploading from video config section
          const updatedDayContent = {
            ...dayContent,
            videoUrl: {
              ...dayContent.videoUrl,
              [targetLanguage]: data.url
            }
          };
          setDayContent(updatedDayContent);
          
          // Also update day0IntroVideo for saving
          const updatedDay0IntroVideo = {
            ...day0IntroVideo,
            videoUrl: {
              ...day0IntroVideo.videoUrl,
              [targetLanguage]: data.url
            }
          };
          setDay0IntroVideo(updatedDay0IntroVideo);
          
          alert(`✅ Day 0 video uploaded successfully for ${targetLanguage}!\n📹 Size: ${fileSizeInMB.toFixed(2)}MB\n💾 Auto-saving configuration...`);
          
          // Auto-save Day 0 configuration
          try {
            const saveResponse = await fetch('/api/admin/program/config/day0', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ day0IntroVideo: updatedDay0IntroVideo }),
            });
            
            if (saveResponse.ok) {
              setVideoUploadedButNotSaved(false);
              setLastSaveStatus('saved');
              alert(`🎉 Day 0 video uploaded and saved successfully for ${targetLanguage}!\n📹 Size: ${fileSizeInMB.toFixed(2)}MB\n✅ Configuration auto-saved to database`);
              setTimeout(() => setLastSaveStatus(''), 3000);
            } else {
              setVideoUploadedButNotSaved(true);
              setLastSaveStatus('error');
              alert(`✅ Video uploaded for ${targetLanguage}, but auto-save failed.\n📹 Size: ${fileSizeInMB.toFixed(2)}MB\n⚠️ Please click 'Save Configuration' button manually.`);
              setTimeout(() => setLastSaveStatus(''), 3000);
            }
          } catch (saveError) {
            console.error('Auto-save error:', saveError);
            setVideoUploadedButNotSaved(true);
            setLastSaveStatus('error');
            alert(`✅ Video uploaded for ${targetLanguage}, but auto-save failed.\n📹 Size: ${fileSizeInMB.toFixed(2)}MB\n⚠️ Please click 'Save Configuration' button manually.`);
            setTimeout(() => setLastSaveStatus(''), 3000);
          }
          
        } else if (burdenLevel) {
          // Day 1 video
          const updatedDay1Config = {
            ...day1Config,
            [burdenLevel]: {
              ...day1Config[burdenLevel],
              videoUrl: {
                ...day1Config[burdenLevel].videoUrl,
                [targetLanguage]: data.url
              }
            }
          };
          setDay1Config(updatedDay1Config);
          
          alert(`✅ Day 1 video uploaded successfully for ${burdenLevel} burden - ${targetLanguage}!\n📹 Size: ${fileSizeInMB.toFixed(2)}MB\n💾 Auto-saving configuration...`);
          
          // Auto-save Day 1 configuration
          try {
            const saveResponse = await fetch('/api/admin/program/config/day1', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                day1Config: updatedDay1Config,
                burdenTestQuestions
              }),
            });
            
            if (saveResponse.ok) {
              setVideoUploadedButNotSaved(false);
              setLastSaveStatus('saved');
              alert(`🎉 Day 1 video uploaded and saved successfully for ${burdenLevel} burden - ${targetLanguage}!\n📹 Size: ${fileSizeInMB.toFixed(2)}MB\n✅ Configuration auto-saved to database`);
              setTimeout(() => setLastSaveStatus(''), 3000);
            } else {
              setVideoUploadedButNotSaved(true);
              setLastSaveStatus('error');
              alert(`✅ Video uploaded for ${burdenLevel} burden - ${targetLanguage}, but auto-save failed.\n📹 Size: ${fileSizeInMB.toFixed(2)}MB\n⚠️ Please click 'Save Configuration' button manually.`);
              setTimeout(() => setLastSaveStatus(''), 3000);
            }
          } catch (saveError) {
            console.error('Auto-save error:', saveError);
            setVideoUploadedButNotSaved(true);
            setLastSaveStatus('error');
            alert(`✅ Video uploaded for ${burdenLevel} burden - ${targetLanguage}, but auto-save failed.\n📹 Size: ${fileSizeInMB.toFixed(2)}MB\n⚠️ Please click 'Save Configuration' button manually.`);
            setTimeout(() => setLastSaveStatus(''), 3000);
          }
          
        } else {
          // Days 2-7 video
          const updatedDayContent = {
            ...dayContent,
            videoUrl: {
              ...dayContent.videoUrl,
              [targetLanguage]: data.url
            }
          };
          setDayContent(updatedDayContent);
          
          alert(`✅ Day ${selectedDay} video uploaded successfully for ${targetLanguage}!\n📹 Size: ${fileSizeInMB.toFixed(2)}MB\n💾 Auto-saving configuration...`);
          
          // Auto-save Days 2-7 configuration
          try {
            const saveResponse = await fetch('/api/admin/program/config/dynamic', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                day: selectedDay,
                dayContent: updatedDayContent 
              }),
            });
            
            if (saveResponse.ok) {
              setVideoUploadedButNotSaved(false);
              setLastSaveStatus('saved');
              alert(`🎉 Day ${selectedDay} video uploaded and saved successfully for ${targetLanguage}!\n📹 Size: ${fileSizeInMB.toFixed(2)}MB\n✅ Configuration auto-saved to database`);
              setTimeout(() => setLastSaveStatus(''), 3000);
            } else {
              setVideoUploadedButNotSaved(true);
              setLastSaveStatus('error');
              alert(`✅ Video uploaded for Day ${selectedDay} - ${targetLanguage}, but auto-save failed.\n📹 Size: ${fileSizeInMB.toFixed(2)}MB\n⚠️ Please click 'Save Configuration' button manually.`);
              setTimeout(() => setLastSaveStatus(''), 3000);
            }
          } catch (saveError) {
            console.error('Auto-save error:', saveError);
            setVideoUploadedButNotSaved(true);
            setLastSaveStatus('error');
            alert(`✅ Video uploaded for Day ${selectedDay} - ${targetLanguage}, but auto-save failed.\n📹 Size: ${fileSizeInMB.toFixed(2)}MB\n⚠️ Please click 'Save Configuration' button manually.`);
            setTimeout(() => setLastSaveStatus(''), 3000);
          }
        }
      } else {
        const error = await response.json();
        console.error('Upload response error:', error);
        alert(`❌ Upload failed: ${error.error || 'Unknown error'}\n${error.details || 'Please check your internet connection and try again.'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error.name === 'AbortError') {
        const timeoutMinutes = fileSizeInMB > 100 ? 5 : 3;
        alert(`❌ Upload timed out after ${timeoutMinutes} minutes. Please try with a smaller file or check your internet connection.`);
      } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        alert('❌ Network error during upload. Please check your internet connection and try again.');
      } else if (error.message.includes('413') || error.message.includes('Payload Too Large')) {
        alert(`❌ File too large for upload (${fileSizeInMB.toFixed(2)}MB). Please use a smaller video file (recommended: under 100MB).`);
      } else {
        alert(`❌ Upload failed: ${error.message || 'Unknown error'}. Please try again.`);
      }
    } finally {
      if (isDay0) {
        setUploadingDayVideo(false);
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

  const handleVideoDelete = async (targetLanguage, isDay0 = false, burdenLevel = null) => {
    if (!confirm(`Are you sure you want to delete the ${targetLanguage} video for Day ${selectedDay}?`)) {
      return;
    }

    try {
      let videoUrl = '';
      let requestData = {
        day: selectedDay,
        language: targetLanguage,
        burdenLevel: burdenLevel
      };

      // Get the current video URL for deletion
      if (isDay0) {
        videoUrl = dayContent.videoUrl[targetLanguage];
      } else if (burdenLevel) {
        videoUrl = day1Config[burdenLevel]?.videoUrl?.[targetLanguage];
      } else {
        videoUrl = dayContent.videoUrl[targetLanguage];
      }

      if (videoUrl) {
        requestData.videoUrl = videoUrl;
      }

      const response = await fetch('/api/admin/delete-video', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        // Update local state to remove the video
        if (isDay0) {
          setDayContent({
            ...dayContent,
            videoUrl: {
              ...dayContent.videoUrl,
              [targetLanguage]: ''
            }
          });
        } else if (burdenLevel) {
          setDay1Config({
            ...day1Config,
            [burdenLevel]: {
              ...day1Config[burdenLevel],
              videoUrl: {
                ...day1Config[burdenLevel].videoUrl,
                [targetLanguage]: ''
              }
            }
          });
        } else {
          setDayContent({
            ...dayContent,
            videoUrl: {
              ...dayContent.videoUrl,
              [targetLanguage]: ''
            }
          });
        }

        alert(`✅ Video deleted successfully!`);
        setVideoUploadedButNotSaved(true); // Enable save button
      } else {
        const error = await response.json();
        alert(`❌ Delete failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Delete failed. Please try again.');
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
        // Reset upload flags and set save status
        setVideoUploadedButNotSaved(false);
        setLastSaveStatus('saved');
        // Clear save status after 3 seconds
        setTimeout(() => setLastSaveStatus(''), 3000);
      } else {
        setLastSaveStatus('error');
        setTimeout(() => setLastSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error saving Day 0 config:', error);
      alert('Failed to save Day 0 configuration');
      setLastSaveStatus('error');
      setTimeout(() => setLastSaveStatus(''), 3000);
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
          burdenLevel: selectedDay === 0 ? null : selectedBurdenLevel,
          content: dayContent
        }),
      });
      if (response.ok) {
        const message = selectedDay === 0 
          ? `✅ Day ${selectedDay} content saved successfully (Core Module)!`
          : `✅ Day ${selectedDay} content saved successfully for ${selectedBurdenLevel} level!`;
        alert(message);
        // Reset upload flags and set save status
        setVideoUploadedButNotSaved(false);
        setLastSaveStatus('saved');
        // Clear save status after 3 seconds
        setTimeout(() => setLastSaveStatus(''), 3000);
        loadDayContent();
      } else {
        // Get the error details from the response
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Save failed with status:', response.status, errorData);
        alert(`❌ Failed to save content: ${errorData.error || 'Unknown error'}`);
        setLastSaveStatus('error');
        setTimeout(() => setLastSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error saving day content:', error);
      alert(`❌ Failed to save day content: ${error.message}`);
      setLastSaveStatus('error');
      setTimeout(() => setLastSaveStatus(''), 3000);
    }
    setSaving(false);
  };

  // Content Management Functions
  const handleContentDelete = async (language, type, day) => {
    if (!confirm(`Are you sure you want to delete the ${type} for Day ${day} in ${language}?`)) {
      return;
    }

    try {
      const contentUrl = contentData[type][language];
      if (!contentUrl) {
        alert('No content to delete.');
        return;
      }

      const response = await fetch('/api/admin/delete-content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          contentType: type,
          day,
          contentUrl
        }),
      });

      if (response.ok) {
        // Update local state to remove the content
        setContentData(prev => ({
          ...prev,
          [type]: {
            ...prev[type],
            [language]: ''
          }
        }));
        alert(`✅ ${type} deleted successfully for Day ${day} in ${language}!`);
        
        // Content is already deleted from database by delete-content API
        // No need to call saveContentData again
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Delete failed' }));
        throw new Error(errorData.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert(`❌ Failed to delete ${type}: ${error.message}`);
    }
  };

  const handleContentUpload = async (file, language, type, day) => {
    setUploadingContent(prev => ({
      ...prev,
      [type]: { ...prev[type], [language]: true }
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);
      formData.append('contentType', type);
      formData.append('day', day.toString());

      const response = await fetch('/api/admin/upload-content', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setContentData(prev => ({
          ...prev,
          [type]: { ...prev[type], [language]: data.url }
        }));
        alert(`✅ ${type} uploaded successfully for Day ${day} in ${language}!`);
        
        // Content is already saved to database by upload-content API
        // No need to call saveContentData again
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading content:', error);
      alert(`❌ Failed to upload ${type} file: ${error.message}`);
    }

    setUploadingContent(prev => ({
      ...prev,
      [type]: { ...prev[type], [language]: false }
    }));
  };

  const saveContentData = async () => {
    setSaving(true);
    try {
      // Save content for each language that has data
      const languages = ['english', 'kannada', 'hindi'];
      let savePromises = [];
      
      for (const language of languages) {
        const content = contentData[contentType][language];
        if (content && content.trim() !== '') {
          savePromises.push(
            fetch('/api/admin/program/content-management', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                day: selectedContentDay,
                contentType: contentType,
                language: language,
                url: content
              }),
            })
          );
        }
      }
      
      if (savePromises.length === 0) {
        alert('No content to save');
        setSaving(false);
        return;
      }
      
      const responses = await Promise.all(savePromises);
      const allSuccess = responses.every(response => response.ok);
      
      if (allSuccess) {
        alert(`✅ Day ${selectedContentDay} ${contentType} content saved successfully!`);
      } else {
        throw new Error('Some saves failed');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('❌ Failed to save content');
    }
    setSaving(false);
  };

  const loadContentData = async () => {
    try {
      const response = await fetch(`/api/admin/program/content-management?day=${selectedContentDay}&contentType=${contentType}`);
      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setContentData(prev => ({
            ...prev,
            [contentType]: data.content
          }));
        }
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
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

  // Quick Assessment Management Functions
  const addQuickAssessmentQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      questionText: {
        english: '',
        kannada: '',
        hindi: ''
      },
      enabled: true
    };
    setQuickAssessmentQuestions([...quickAssessmentQuestions, newQuestion]);
  };

  const updateQuickAssessmentQuestion = (id, field, value, language = null) => {
    setQuickAssessmentQuestions(quickAssessmentQuestions.map(q => {
      if (q.id === id) {
        if (language) {
          return {
            ...q,
            [field]: {
              ...q[field],
              [language]: value
            }
          };
        } else {
          return { ...q, [field]: value };
        }
      }
      return q;
    }));
  };

  const removeQuickAssessmentQuestion = (id) => {
    setQuickAssessmentQuestions(quickAssessmentQuestions.filter(q => q.id !== id));
  };

  // Load quick assessment questions from API
  const loadQuickAssessmentQuestions = async () => {
    try {
      const response = await fetch('/api/admin/quick-assessment', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuickAssessmentQuestions(data.questions || []);
      } else {
        console.log('No existing quick assessment questions found');
        // Keep default questions if none exist
      }
    } catch (error) {
      console.error('Error loading quick assessment questions:', error);
      showNotification('Failed to load quick assessment questions', 'error');
    }
  };

  const saveQuickAssessmentQuestions = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/quick-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: quickAssessmentQuestions
        }),
      });

      if (response.ok) {
        showNotification('Quick Assessment questions saved successfully!', 'success');
      } else {
        throw new Error('Failed to save questions');
      }
    } catch (error) {
      console.error('Error saving quick assessment questions:', error);
      showNotification('Failed to save Quick Assessment questions', 'error');
    } finally {
      setSaving(false);
    }
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
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .success-notification {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
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

      {/* Days 0-7: Dynamic Content */}
      <div style={styles.card}>
                <h2 style={styles.cardTitle}>🎯 Days 0-7: Video Content Management</h2>
        
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Select Day</label>
            <select
              style={styles.input}
              value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value))}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7].map(day => (
                <option key={day} value={day}>Day {day}</option>
              ))}
            </select>
          </div>
          
          <div>
            {selectedDay === 0 && (
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f0f9ff', 
                borderRadius: '8px',
                textAlign: 'center',
                color: '#1e40af'
              }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
                  📺 Day 0 - Core Module (Introduction)
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                  Same video for all caregivers - introductory content
                </p>
              </div>
            )}

            {selectedDay === 1 && (
              <>
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '8px'
                }}>
                  <h4 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#334155',
                    borderBottom: '1px solid #cbd5e1',
                    paddingBottom: '8px'
                  }}>
                    📋 Module Assignment
                  </h4>
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
                </div>
              </>
            )}
            
            {selectedDay === 2 && (
              <>
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '8px'
                }}>
                  <h4 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#334155',
                    borderBottom: '1px solid #cbd5e1',
                    paddingBottom: '8px'
                  }}>
                    📊 Module Assignment
                  </h4>
                  <div>
                    <label style={styles.label}>Select Stress Level</label>
                    <select
                      style={styles.input}
                      value={selectedBurdenLevel}
                      onChange={(e) => setSelectedBurdenLevel(e.target.value)}
                    >
                      <option value="low">😌 Low Stress</option>
                      <option value="moderate">😐 Moderate Stress</option>
                      <option value="high">😰 High Stress</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            
            {selectedDay === 3 && (
              <>
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '8px'
                }}>
                  <h4 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#334155',
                    borderBottom: '1px solid #cbd5e1',
                    paddingBottom: '8px'
                  }}>
                    🧠 Module Assignment
                  </h4>
                  <div>
                    <label style={styles.label}>WHOQOL-BREF Questions Interpretations</label>
                    <select
                      style={styles.input}
                      value={selectedBurdenLevel}
                      onChange={(e) => setSelectedBurdenLevel(e.target.value)}
                    >
                      <option value="physical">🏃‍♂️ Physical Health Domain</option>
                      <option value="psychological">🧠 Psychological Domain</option>
                      <option value="social">👥 Social Relationships Domain</option>
                      <option value="environment">🌍 Environment Domain</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            
            {selectedDay === 4 && (
              <>
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '8px'
                }}>
                  <h4 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#334155',
                    borderBottom: '1px solid #cbd5e1',
                    paddingBottom: '8px'
                  }}>
                    🏥 Module Assignment
                  </h4>
                  <div>
                    <label style={styles.label}>Care Type Options</label>
                    <select
                      style={styles.input}
                      value={selectedBurdenLevel}
                      onChange={(e) => setSelectedBurdenLevel(e.target.value)}
                    >
                      <option value="wound-care">🩹 Wound Care</option>
                      <option value="drain-care">🔧 Drain Care</option>
                      <option value="stoma-care">🎯 Stoma Care</option>
                      <option value="feeding-tube">🍽️ Feeding Tube (NG/PEG)</option>
                      <option value="urinary-catheter">💧 Urinary Catheter</option>
                      <option value="oral-anticancer">💊 Oral Anticancer Medication</option>
                      <option value="bedbound-patient">🛏️ Bedbound Patient</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            
            {selectedDay >= 5 && selectedDay <= 7 && (
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '8px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
                  📝 No video upload required for Day {selectedDay}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                  This day is reserved for assessments and other activities
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Video Configuration - Only show for days 0-4 */}
        {selectedDay >= 0 && selectedDay <= 4 && (
          <>
            <h3 style={styles.sectionTitle}>
              Video Configuration - Day {selectedDay} 
              {selectedDay === 0 ? ' (Core Module - All Caregivers)' :
               selectedDay === 1 ? ` (${selectedBurdenLevel} Burden Level)` :
               selectedDay === 2 ? ` (${selectedBurdenLevel} Stress Level)` :
               selectedDay === 3 ? ` (${selectedBurdenLevel} Domain)` :
               selectedDay === 4 ? ` (${selectedBurdenLevel} Care Type)` : ''}
            </h3>
        
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
          
          {/* Show video preview if URL exists */}
          {dayContent.videoUrl[selectedLanguage] && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #0ea5e9'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0369a1', fontWeight: '500' }}>
                ✅ Video uploaded successfully
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                URL: {dayContent.videoUrl[selectedLanguage].substring(0, 60)}...
              </p>
            </div>
          )}
          
          <div style={styles.uploadSection}>
            <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
              📤 {dayContent.videoUrl[selectedLanguage] ? 'Replace' : 'Upload'} video for Day {selectedDay} {selectedDay === 0 ? '(Core Module)' : `(${selectedBurdenLevel})`} in {selectedLanguage}
            </p>
            
            {/* Upload/Replace Button */}
            <input
              type="file"
              id={`day-${selectedDay}-upload-${selectedLanguage}`}
              style={styles.fileInput}
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  if (selectedDay === 0) {
                    handleVideoUpload(file, selectedLanguage, true); // Day 0
                  } else if (selectedDay === 1) {
                    handleVideoUpload(file, selectedLanguage, false, selectedBurdenLevel); // Day 1 with burden level
                  } else {
                    handleVideoUpload(file, selectedLanguage, false, null); // Days 2-7
                  }
                }
              }}
            />
            <label 
              htmlFor={`day-${selectedDay}-upload-${selectedLanguage}`} 
              style={{
                ...styles.uploadButton,
                backgroundColor: uploadingDayVideo ? '#9ca3af' : styles.uploadButton.backgroundColor,
                cursor: uploadingDayVideo ? 'not-allowed' : 'pointer'
              }}
            >
              {uploadingDayVideo ? 'Uploading...' : dayContent.videoUrl[selectedLanguage] ? '🔄 Replace Video' : '📤 Upload Video'}
            </label>
            
            {/* Delete Button - Only show if video exists */}
            {dayContent.videoUrl[selectedLanguage] && !uploadingDayVideo && (
              <button
                onClick={() => {
                  if (selectedDay === 0) {
                    handleVideoDelete(selectedLanguage, true); // Day 0
                  } else if (selectedDay === 1) {
                    handleVideoDelete(selectedLanguage, false, selectedBurdenLevel); // Day 1 with burden level
                  } else {
                    handleVideoDelete(selectedLanguage, false, null); // Days 2-7
                  }
                }}
                style={{
                  ...styles.uploadButton,
                  backgroundColor: '#ef4444',
                  marginLeft: '12px'
                }}
              >
                🗑️ Delete Video
              </button>
            )}
            
            <p style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
              Supported: MP4, MOV, AVI • Max 500MB
            </p>
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

        

            <button
              style={{ 
                ...styles.button, 
                ...styles.buttonPrimary, 
                marginTop: '24px', 
                width: '100%',
                backgroundColor: lastSaveStatus === 'saved' ? '#10b981' : 
                               lastSaveStatus === 'error' ? '#ef4444' : 
                               videoUploadedButNotSaved ? '#f59e0b' : 
                               styles.buttonPrimary.backgroundColor,
                animation: lastSaveStatus === 'saved' ? 'pulse 0.5s' : 'none'
              }}
              onClick={saveDayContent}
              disabled={saving}
            >
              {saving ? '💾 Saving...' : 
               lastSaveStatus === 'saved' ? '✅ Configuration Saved!' : 
               lastSaveStatus === 'error' ? '❌ Save Failed - Retry' : 
               videoUploadedButNotSaved ? '💾 Save Configuration' :
               `💾 Save Day ${selectedDay} Configuration`}
            </button>
          </>
        )}
      </div>

      {/* Content Management Section */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📝 Content Management - Days 0-7</h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
          Upload and manage various types of content for caregivers including motivation messages, healthcare tips, reminders, daily tasks, and audio content.
        </p>

        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Select Day</label>
            <select
              style={styles.input}
              value={selectedContentDay}
              onChange={(e) => setSelectedContentDay(parseInt(e.target.value))}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7].map(day => (
                <option key={day} value={day}>Day {day}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>Content Type</label>
            <select
              style={styles.input}
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option value="motivation">💪 Motivation Message</option>
              <option value="healthcareTips">🏥 Healthcare Tips</option>
              <option value="reminder">⏰ Reminder</option>
              <option value="dailyTasks">📋 Daily Tasks</option>
              <option value="audioContent">🎵 Audio Content</option>
              <option value="quickAssessment">❓ Quick Assessment</option>
            </select>
          </div>
        </div>

        {/* Language Tabs */}
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

        {/* Content Type Specific Fields */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={styles.sectionTitle}>
            {contentType === 'motivation' ? '💪 Motivation Message Configuration' :
             contentType === 'healthcareTips' ? '🏥 Healthcare Tips Configuration' :
             contentType === 'reminder' ? '⏰ Reminder Configuration' :
             contentType === 'dailyTasks' ? '📋 Daily Tasks Configuration' :
             contentType === 'quickAssessment' ? '❓ Quick Assessment Configuration' :
             '🎵 Audio Content Configuration'} - Day {selectedContentDay}
          </h3>

          {contentType === 'audioContent' ? (
            <div>
              <label style={styles.label}>Audio File URL ({selectedLanguage})</label>
              <input
                type="text"
                style={styles.input}
                value={contentData[contentType][selectedLanguage] || ''}
                readOnly
                placeholder="Upload audio file to get URL"
              />
              
              {/* Show audio preview if URL exists */}
              {contentData[contentType][selectedLanguage] && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #0ea5e9',
                  marginBottom: '16px'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0369a1', fontWeight: '500' }}>
                    ✅ Audio uploaded successfully
                  </p>
                  <audio controls style={{ width: '100%', marginTop: '8px' }}>
                    <source src={contentData[contentType][selectedLanguage]} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              <div style={styles.uploadSection}>
                <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
                  🎵 {contentData[contentType][selectedLanguage] ? 'Replace' : 'Upload'} audio for Day {selectedContentDay} in {selectedLanguage}
                </p>
                <input
                  type="file"
                  id={`content-audio-${selectedContentDay}-${selectedLanguage}`}
                  style={styles.fileInput}
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleContentUpload(file, selectedLanguage, contentType, selectedContentDay);
                  }}
                />
                <label 
                  htmlFor={`content-audio-${selectedContentDay}-${selectedLanguage}`} 
                  style={{
                    ...styles.uploadButton,
                    backgroundColor: uploadingContent[contentType][selectedLanguage] ? '#9ca3af' : '#10b981',
                    cursor: uploadingContent[contentType][selectedLanguage] ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploadingContent[contentType][selectedLanguage] ? '📤 Uploading...' : 
                   contentData[contentType][selectedLanguage] ? '🔄 Replace Audio' : '📤 Upload Audio'}
                </label>

                {/* Delete Button - Only show if audio exists */}
                {contentData[contentType][selectedLanguage] && !uploadingContent[contentType][selectedLanguage] && (
                  <button
                    onClick={() => handleContentDelete(selectedLanguage, contentType, selectedContentDay)}
                    style={{
                      ...styles.uploadButton,
                      backgroundColor: '#ef4444',
                      marginLeft: '12px'
                    }}
                  >
                    🗑️ Delete Audio
                  </button>
                )}
                
                <p style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                  Supported: MP3, WAV, M4A • Max 50MB
                </p>
              </div>
            </div>
          ) : contentType === 'quickAssessment' ? (
            <div>
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '16px', fontWeight: '600' }}>
                  ❓ Quick Assessment Questions
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
                  Create Yes/No questions for daily caregiver assessments. These will be shown to caregivers for quick daily check-ins.
                </p>
              </div>

              {quickAssessmentQuestions.map((question, index) => (
                <div key={question.id} style={{ 
                  padding: '20px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '8px', 
                  marginBottom: '16px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Question {index + 1}
                    </h5>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={question.enabled}
                          onChange={(e) => updateQuickAssessmentQuestion(question.id, 'enabled', e.target.checked)}
                        />
                        Enabled
                      </label>
                      <button
                        onClick={() => removeQuickAssessmentQuestion(question.id)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                      <label style={{ ...styles.label, fontSize: '12px' }}>English</label>
                      <textarea
                        style={{ ...styles.textarea, minHeight: '60px', fontSize: '14px' }}
                        value={question.questionText.english}
                        onChange={(e) => updateQuickAssessmentQuestion(question.id, 'questionText', e.target.value, 'english')}
                        placeholder="Enter question in English"
                      />
                    </div>
                    <div>
                      <label style={{ ...styles.label, fontSize: '12px' }}>ಕನ್ನಡ (Kannada)</label>
                      <textarea
                        style={{ ...styles.textarea, minHeight: '60px', fontSize: '14px' }}
                        value={question.questionText.kannada}
                        onChange={(e) => updateQuickAssessmentQuestion(question.id, 'questionText', e.target.value, 'kannada')}
                        placeholder="Enter question in Kannada"
                      />
                    </div>
                    <div>
                      <label style={{ ...styles.label, fontSize: '12px' }}>हिंदी (Hindi)</label>
                      <textarea
                        style={{ ...styles.textarea, minHeight: '60px', fontSize: '14px' }}
                        value={question.questionText.hindi}
                        onChange={(e) => updateQuickAssessmentQuestion(question.id, 'questionText', e.target.value, 'hindi')}
                        placeholder="Enter question in Hindi"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={addQuickAssessmentQuestion}
                  style={{
                    ...styles.button,
                    backgroundColor: '#10b981',
                    color: 'white'
                  }}
                >
                  ➕ Add Question
                </button>
                <button
                  onClick={saveQuickAssessmentQuestions}
                  disabled={saving}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary
                  }}
                >
                  {saving ? 'Saving...' : '💾 Save Questions'}
                </button>
              </div>

              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', fontSize: '12px', color: '#92400e' }}>
                <strong>Note:</strong> These questions will appear as Yes/No options in the caregiver's daily assessment. 
                Keep questions clear and focused on daily caregiving experiences.
              </div>
            </div>
          ) : (
            <div>
              <label style={styles.label}>
                {contentType === 'motivation' ? 'Motivation Message' :
                 contentType === 'healthcareTips' ? 'Healthcare Tips' :
                 contentType === 'reminder' ? 'Reminder Text' :
                 'Daily Tasks'} ({selectedLanguage})
              </label>
              <textarea
                style={{ ...styles.textarea, minHeight: '120px' }}
                value={contentData[contentType][selectedLanguage] || ''}
                onChange={(e) => setContentData({
                  ...contentData,
                  [contentType]: {
                    ...contentData[contentType],
                    [selectedLanguage]: e.target.value
                  }
                })}
                placeholder={`Enter ${contentType === 'motivation' ? 'motivation message' :
                  contentType === 'healthcareTips' ? 'healthcare tips' :
                  contentType === 'reminder' ? 'reminder text' :
                  'daily tasks'} in ${selectedLanguage}`}
              />
            </div>
          )}
        </div>

        <button
          style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '24px', width: '100%' }}
          onClick={saveContentData}
          disabled={saving}
        >
          {saving ? 'Saving...' : `Save Day ${selectedContentDay} ${contentType} Content`}
        </button>

        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', fontStyle: 'italic' }}>
          💡 Configure content for all days (0-7) and all content types in multiple languages
        </p>
      </div>

    </div>
  );
}
