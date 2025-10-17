import { useState, useRef, useEffect } from 'react';

export default function VideoPlayer({ 
  videoUrl, 
  videoTitle, 
  onProgressUpdate, 
  onComplete,
  initialProgress = 0,
  isCompleted = false,
  caregiverId,
  day
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(initialProgress);
  const [watchedPercentage, setWatchedPercentage] = useState(initialProgress);
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const progressUpdateInterval = useRef(null);

  useEffect(() => {
    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
  }, []);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Resume from last watched position
      if (initialProgress > 0 && !isCompleted) {
        videoRef.current.currentTime = (initialProgress / 100) * videoRef.current.duration;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      
      setCurrentTime(current);
      
      if (total > 0) {
        const progressPercent = (current / total) * 100;
        setProgress(progressPercent);
        
        // Track maximum watched percentage (can't go backwards)
        if (progressPercent > watchedPercentage) {
          setWatchedPercentage(progressPercent);
          
          // Send progress update to backend every 5 seconds
          if (!progressUpdateInterval.current) {
            progressUpdateInterval.current = setInterval(() => {
              if (onProgressUpdate && videoRef.current) {
                const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
                onProgressUpdate(Math.round(currentProgress));
              }
            }, 5000); // Update every 5 seconds
          }
        }
        
        // Show complete button when 95% watched (to account for slight variations)
        if (progressPercent >= 95 && !isCompleted) {
          setShowCompleteButton(true);
        }
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    // Send final progress update when paused
    if (onProgressUpdate && videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      onProgressUpdate(Math.round(currentProgress));
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setShowCompleteButton(true);
    if (onProgressUpdate) {
      onProgressUpdate(100);
    }
  };

  const handleMarkComplete = async () => {
    if (onComplete) {
      await onComplete();
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = {
    container: {
      backgroundColor: '#000',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '16px'
    },
    video: {
      width: '100%',
      maxHeight: '500px',
      display: 'block'
    },
    controls: {
      padding: '12px 16px',
      backgroundColor: '#1f2937',
      color: 'white'
    },
    progressBar: {
      width: '100%',
      height: '6px',
      backgroundColor: '#374151',
      borderRadius: '999px',
      cursor: 'pointer',
      marginBottom: '12px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#3b82f6',
      borderRadius: '999px',
      transition: 'width 0.1s'
    },
    watchedFill: {
      position: 'absolute',
      height: '100%',
      backgroundColor: '#10b981',
      borderRadius: '999px',
      opacity: 0.5
    },
    timeInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '14px'
    },
    completeButton: {
      marginTop: '16px',
      padding: '12px 24px',
      backgroundColor: '#16a34a',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      width: '100%',
      transition: 'background-color 0.2s'
    },
    completeButtonHover: {
      backgroundColor: '#15803d'
    },
    completedBadge: {
      padding: '12px 16px',
      backgroundColor: '#dcfce7',
      border: '2px solid #86efac',
      borderRadius: '8px',
      color: '#166534',
      fontWeight: '600',
      textAlign: 'center',
      marginTop: '16px'
    }
  };

  return (
    <div>
      <div style={styles.container}>
        <video
          ref={videoRef}
          style={styles.video}
          src={videoUrl}
          controls
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          controlsList="nodownload"
        >
          Your browser does not support the video tag.
        </video>
        
        <div style={styles.controls}>
          {/* Progress Bar */}
          <div style={{ position: 'relative' }}>
            <div style={styles.progressBar}>
              {/* Watched progress (green) */}
              <div style={{ ...styles.watchedFill, width: `${watchedPercentage}%` }}></div>
              {/* Current progress (blue) */}
              <div style={{ ...styles.progressFill, width: `${progress}%` }}></div>
            </div>
          </div>
          
          {/* Time Info */}
          <div style={styles.timeInfo}>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>
              {Math.round(watchedPercentage)}% watched
            </span>
          </div>
        </div>
      </div>

      {/* Complete Button (shows when 95% watched) */}
      {showCompleteButton && !isCompleted && (
        <button
          style={styles.completeButton}
          onClick={handleMarkComplete}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
        >
          ✅ Mark Video as Complete
        </button>
      )}

      {/* Completed Badge */}
      {isCompleted && (
        <div style={styles.completedBadge}>
          ✅ Video Completed - Well done!
        </div>
      )}

      {/* Warning if not enough watched */}
      {!showCompleteButton && !isCompleted && watchedPercentage > 0 && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#fef3c7', 
          border: '1px solid #fde68a',
          borderRadius: '8px',
          color: '#92400e',
          fontSize: '14px',
          marginTop: '16px'
        }}>
          ℹ️ Watch at least 95% of the video to unlock tasks and complete this day.
        </div>
      )}
    </div>
  );
}
