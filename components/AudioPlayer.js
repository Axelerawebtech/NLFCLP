import { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ 
  audioUrl, 
  audioTitle, 
  onComplete, 
  style, 
  isVideoCompleted = false,
  disabled = false,
  caregiverId,
  day 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = async () => {
      setIsPlaying(false);
      setIsCompleted(true);
      
      // Only mark as completed once per session
      if (!hasCompletedOnce) {
        setHasCompletedOnce(true);
        
        // Track completion in database
        if (caregiverId && day !== undefined) {
          try {
            const response = await fetch('/api/caregiver/update-audio-progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                caregiverId,
                day,
                audioCompleted: true
              })
            });
            
            const data = await response.json();
            if (data.success) {
              console.log(`✅ Audio completion tracked for Day ${day}`);
            }
          } catch (error) {
            console.error('Failed to track audio completion:', error);
          }
        }
        
        if (onComplete) onComplete();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, onComplete, caregiverId, day, hasCompletedOnce]);

  const togglePlayPause = () => {
    if (disabled || (day === 0 && !isVideoCompleted)) return;
    
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    if (disabled || (day === 0 && !isVideoCompleted)) return;
    
    const audio = audioRef.current;
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  if (!audioUrl) return null;

  const isDisabled = disabled || (day === 0 && !isVideoCompleted);

  const defaultStyle = {
    background: isDisabled 
      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '20px',
    color: 'white',
    marginBottom: '20px',
    boxShadow: isDisabled 
      ? '0 8px 32px rgba(156, 163, 175, 0.3)' 
      : '0 8px 32px rgba(102, 126, 234, 0.3)',
    opacity: isDisabled ? 0.6 : 1,
    position: 'relative',
    ...style
  };

  return (
    <div style={defaultStyle}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Video completion requirement notice - Only for Day 0 */}
      {!isVideoCompleted && day === 0 && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div style={{
            textAlign: 'center',
            padding: '20px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              Complete the video first
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              Audio content will be available after watching the video
            </div>

          </div>
        </div>
      )}
      
      {/* Title */}
      {audioTitle && (
        <h4 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '18px', 
          fontWeight: '600',
          textAlign: 'center'
        }}>
          🎵 {audioTitle}
        </h4>
      )}

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        marginBottom: '12px'
      }}>
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          disabled={isDisabled}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: 'none',
            background: isDisabled 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => !isDisabled && (e.target.style.background = 'rgba(255, 255, 255, 0.3)')}
          onMouseOut={(e) => !isDisabled && (e.target.style.background = 'rgba(255, 255, 255, 0.2)')}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>

        {/* Progress Bar */}
        <div style={{ flex: 1 }}>
          <div
            onClick={handleSeek}
            style={{
              height: '6px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '3px',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              position: 'relative'
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'white',
                borderRadius: '3px',
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                transition: 'width 0.1s ease'
              }}
            />
          </div>
          
          {/* Time Display */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '12px', 
            marginTop: '4px',
            opacity: 0.8
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Completion Status */}
      {isCompleted && (
        <div style={{
          textAlign: 'center',
          padding: '8px',
          background: 'rgba(34, 197, 94, 0.2)',
          borderRadius: '8px',
          fontSize: '14px',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          ✅ Audio completed! Progress tracked.
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;