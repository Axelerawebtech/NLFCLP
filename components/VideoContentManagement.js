import { useState, useEffect } from 'react';

export default function VideoContentManagement() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedBurdenLevel, setSelectedBurdenLevel] = useState('mild');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [videoData, setVideoData] = useState({
    videoTitle: { english: '', kannada: '', hindi: '' },
    videoUrl: { english: '', kannada: '', hindi: '' },
    description: { english: '', kannada: '', hindi: '' }
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load video data when day, burden level, or language changes
  useEffect(() => {
    loadVideoData();
  }, [selectedDay, selectedBurdenLevel]);

  const loadVideoData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        day: selectedDay.toString(),
        language: selectedLanguage
      });

      if (selectedDay === 1) {
        params.append('burdenLevel', selectedBurdenLevel);
      }

      const response = await fetch(`/api/admin/video-management?${params}`);
      const data = await response.json();

      if (data.success && data.videos) {
        setVideoData(data.videos);
      } else {
        // Reset to empty if no data
        setVideoData({
          videoTitle: { english: '', kannada: '', hindi: '' },
          videoUrl: { english: '', kannada: '', hindi: '' },
          description: { english: '', kannada: '', hindi: '' }
        });
      }
    } catch (error) {
      console.error('Error loading video data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (file) => {
    if (!file) return;

    // Validate file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 500) {
      alert(`❌ File too large! Maximum size is 500MB. Your file is ${fileSizeInMB.toFixed(2)}MB`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('day', selectedDay.toString());
      formData.append('language', selectedLanguage);
      formData.append('videoTitle', videoData.videoTitle[selectedLanguage] || '');
      formData.append('description', videoData.description[selectedLanguage] || '');

      if (selectedDay === 1) {
        formData.append('burdenLevel', selectedBurdenLevel);
      }

      console.log(`📤 Starting upload: ${fileSizeInMB.toFixed(2)}MB file`);

      const response = await fetch('/api/admin/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state with new video URL
        setVideoData(prev => ({
          ...prev,
          videoUrl: {
            ...prev.videoUrl,
            [selectedLanguage]: data.url
          }
        }));

        alert(`✅ Video uploaded successfully!\n📹 Size: ${fileSizeInMB.toFixed(2)}MB\n${data.autoSaved ? '💾 Auto-saved to database' : ''}`);
        
        // Reload data to ensure consistency
        await loadVideoData();
      } else {
        const error = await response.json();
        console.error('Upload response error:', error);
        alert(`❌ Upload failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.name === 'AbortError') {
        alert('❌ Upload timed out. Please try with a smaller file or check your internet connection.');
      } else {
        alert(`❌ Upload failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleVideoDelete = async () => {
    const videoUrl = videoData.videoUrl[selectedLanguage];
    if (!videoUrl) {
      alert('No video to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete the ${selectedLanguage} video for Day ${selectedDay}${selectedDay === 1 ? ` (${selectedBurdenLevel} burden)` : ''}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/video-management', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: selectedDay,
          burdenLevel: selectedDay === 1 ? selectedBurdenLevel : null,
          language: selectedLanguage,
          videoUrl: videoUrl
        }),
      });

      if (response.ok) {
        // Update local state to remove the video
        setVideoData(prev => ({
          ...prev,
          videoUrl: {
            ...prev.videoUrl,
            [selectedLanguage]: ''
          },
          videoTitle: {
            ...prev.videoTitle,
            [selectedLanguage]: ''
          },
          description: {
            ...prev.description,
            [selectedLanguage]: ''
          }
        }));

        alert('✅ Video deleted successfully!');
      } else {
        const error = await response.json();
        alert(`❌ Delete failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Delete failed. Please try again.');
    }
  };

  const saveVideoMetadata = async () => {
    try {
      const response = await fetch('/api/admin/video-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: selectedDay,
          burdenLevel: selectedDay === 1 ? selectedBurdenLevel : null,
          language: selectedLanguage,
          videoUrl: videoData.videoUrl[selectedLanguage],
          videoTitle: videoData.videoTitle[selectedLanguage],
          description: videoData.description[selectedLanguage]
        }),
      });

      if (response.ok) {
        alert('✅ Video metadata saved successfully!');
      } else {
        const error = await response.json();
        alert(`❌ Save failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Save failed. Please try again.');
    }
  };

  const hasVideo = videoData.videoUrl[selectedLanguage];

  const styles = {
    container: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '32px',
      marginBottom: '32px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '24px',
      marginTop: 0,
      color: '#111827',
      borderBottom: '3px solid #2563eb',
      paddingBottom: '12px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s',
      boxSizing: 'border-box'
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
      minHeight: '80px',
      fontFamily: 'inherit',
      transition: 'all 0.2s',
      boxSizing: 'border-box'
    },
    uploadSection: {
      border: '2px dashed #d1d5db',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      backgroundColor: '#f9fafb',
      marginTop: '24px'
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
      gap: '8px',
      marginRight: '12px',
      marginBottom: '12px'
    },
    uploadButton: {
      backgroundColor: '#10b981',
      color: '#ffffff'
    },
    replaceButton: {
      backgroundColor: '#f59e0b',
      color: '#ffffff'
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: '#ffffff'
    },
    saveButton: {
      backgroundColor: '#2563eb',
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
    videoPreview: {
      marginTop: '12px',
      padding: '12px',
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #0ea5e9'
    },
    fileInput: {
      display: 'none'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎬 Video Content Management</h2>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
        Upload and manage videos for different days and burden levels. Videos will automatically show Replace and Delete buttons after upload.
      </p>

      {/* Day and Burden Level Selection */}
      <div style={styles.grid}>
        <div>
          <label style={styles.label}>Select Day</label>
          <select
            style={styles.select}
            value={selectedDay}
            onChange={(e) => setSelectedDay(parseInt(e.target.value))}
          >
            <option value={0}>Day 0 - Introduction</option>
            <option value={1}>Day 1 - Burden Assessment</option>
            <option value={2}>Day 2 - Stress Management</option>
            <option value={3}>Day 3 - Coping Strategies</option>
            <option value={4}>Day 4 - Self-Care</option>
          </select>
        </div>

        {selectedDay === 1 && (
          <div>
            <label style={styles.label}>Burden Level</label>
            <select
              style={styles.select}
              value={selectedBurdenLevel}
              onChange={(e) => setSelectedBurdenLevel(e.target.value)}
            >
              <option value="mild">😊 Mild Burden</option>
              <option value="moderate">😐 Moderate Burden</option>
              <option value="severe">😟 Severe Burden</option>
            </select>
          </div>
        )}
      </div>

      {/* Language Tabs */}
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
          🇮🇳 ಕನ್ನಡ
        </button>
        <button
          style={styles.languageTab(selectedLanguage === 'hindi')}
          onClick={() => setSelectedLanguage('hindi')}
        >
          🇮🇳 हिंदी
        </button>
      </div>

      {/* Video Metadata */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={styles.label}>Video Title ({selectedLanguage})</label>
          <input
            type="text"
            style={styles.input}
            value={videoData.videoTitle[selectedLanguage] || ''}
            onChange={(e) => setVideoData(prev => ({
              ...prev,
              videoTitle: { ...prev.videoTitle, [selectedLanguage]: e.target.value }
            }))}
            placeholder={`Enter video title in ${selectedLanguage}`}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={styles.label}>Description ({selectedLanguage})</label>
          <textarea
            style={styles.textarea}
            value={videoData.description[selectedLanguage] || ''}
            onChange={(e) => setVideoData(prev => ({
              ...prev,
              description: { ...prev.description, [selectedLanguage]: e.target.value }
            }))}
            placeholder={`Enter video description in ${selectedLanguage}`}
          />
        </div>

        <div>
          <label style={styles.label}>Video URL ({selectedLanguage})</label>
          <input
            type="text"
            style={styles.input}
            value={videoData.videoUrl[selectedLanguage] || ''}
            readOnly
            placeholder="Upload video to get URL"
          />

          {/* Video Preview */}
          {hasVideo && (
            <div style={styles.videoPreview}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0369a1', fontWeight: '500' }}>
                ✅ Video uploaded successfully
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                URL: {videoData.videoUrl[selectedLanguage].substring(0, 60)}...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <div style={styles.uploadSection}>
        <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
          📤 {hasVideo ? 'Replace' : 'Upload'} video for Day {selectedDay}
          {selectedDay === 1 ? ` (${selectedBurdenLevel} burden)` : ''} in {selectedLanguage}
        </p>

        {/* Upload/Replace Button */}
        <input
          type="file"
          id="video-upload"
          style={styles.fileInput}
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleVideoUpload(file);
          }}
        />
        <label 
          htmlFor="video-upload" 
          style={{
            ...styles.button,
            ...(hasVideo ? styles.replaceButton : styles.uploadButton),
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.7 : 1
          }}
        >
          {uploading ? '📤 Uploading...' : hasVideo ? '🔄 Replace Video' : '📤 Upload Video'}
        </label>

        {/* Delete Button - Only show if video exists */}
        {hasVideo && !uploading && (
          <button
            onClick={handleVideoDelete}
            style={{ ...styles.button, ...styles.deleteButton }}
          >
            🗑️ Delete Video
          </button>
        )}

        <p style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
          Supported: MP4, MOV, AVI • Max 500MB
        </p>
      </div>

      {/* Save Metadata Button */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <button
          onClick={saveVideoMetadata}
          style={{ ...styles.button, ...styles.saveButton }}
        >
          💾 Save Video Metadata
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', margin: '16px 0', color: '#6b7280' }}>
          Loading video data...
        </div>
      )}
    </div>
  );
}