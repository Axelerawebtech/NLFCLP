import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Grid
} from '@mui/material';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaExpand, FaCompress } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { getVideoContent, getVideoEmbedUrl, getSupportedLanguages } from '../config/videoConfig';

export default function VideoContentPlayer({ 
  dayModule, 
  burdenLevel, 
  onVideoComplete, 
  onTaskStart,
  className,
  showCompletionDialog: externalShowCompletion = true // New prop to control dialog display
}) {
  const { currentLanguage, translations } = useLanguage();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  // Use currentLanguage with fallback to 'en'
  const language = currentLanguage || 'en';
  
  // Add fallback for burdenLevel
  const safeBurdenLevel = burdenLevel || 'moderate';
  
  // Add safety check for dayModule
  if (!dayModule) {
    return (
      <Card className={className}>
        <CardContent>
          <Alert severity="error">
            Day module data is not available.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Get language-specific video content
  const videoContent = getVideoContent(dayModule.day, safeBurdenLevel, language);
  const supportedLanguages = getSupportedLanguages(dayModule.day, safeBurdenLevel);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      setCurrentTime(currentTime);
      setDuration(duration);
      
      if (duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        setProgress(progressPercent);
        
        // Mark video as completed when 100% watched
        if (progressPercent >= 100 && !videoCompleted) {
          setVideoCompleted(true);
          if (externalShowCompletion) {
            setShowCompletionDialog(true);
          }
          onVideoComplete?.();
        }
      }
    };

    const handleVideoEnd = () => {
      setIsPlaying(false);
      if (!videoCompleted) {
        setVideoCompleted(true);
        if (externalShowCompletion) {
          setShowCompletionDialog(true);
        }
        onVideoComplete?.();
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('loadedmetadata', updateProgress);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('ended', handleVideoEnd);
      video.removeEventListener('loadedmetadata', updateProgress);
    };
  }, [videoCompleted, onVideoComplete]);

  // Separate useEffect for fullscreen event handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement ||
        document.mozFullScreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    // Add event listeners for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (video.requestFullscreen) {
          await video.requestFullscreen();
          setIsFullscreen(true);
        } else if (video.webkitRequestFullscreen) {
          await video.webkitRequestFullscreen();
          setIsFullscreen(true);
        } else if (video.msRequestFullscreen) {
          await video.msRequestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen && document.fullscreenElement) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        } else if (document.webkitExitFullscreen && document.webkitFullscreenElement) {
          await document.webkitExitFullscreen();
          setIsFullscreen(false);
        } else if (document.msExitFullscreen && document.msFullscreenElement) {
          await document.msExitFullscreen();
          setIsFullscreen(false);
        } else {
          // Fallback: just update state if document is not in fullscreen
          setIsFullscreen(false);
        }
      }
    } catch (error) {
      console.warn('Fullscreen operation failed:', error);
      // Update state to reflect actual fullscreen status
      setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement || !!document.msFullscreenElement);
    }
  };

  const handleProgressClick = (event) => {
    const video = videoRef.current;
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const clickPercent = clickX / width;
    
    if (video && video.duration) {
      video.currentTime = clickPercent * video.duration;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBurdenLevelColor = (level) => {
    switch (level) {
      case 'low': return 'success';
      case 'moderate': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getLanguageLabel = (lang) => {
    switch (lang) {
      case 'en': return 'English';
      case 'hi': return 'हिंदी';
      case 'kn': return 'ಕನ್ನಡ';
      default: return 'English';
    }
  };

  if (!videoContent.videoUrl) {
    return (
      <Card className={className}>
        <CardContent>
          <Alert severity="warning">
            Video content for Day {dayModule.day} ({safeBurdenLevel} burden level) is not available yet.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box className={className}>
      <Card>
        <CardContent>
          {/* Video Header */}
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <Typography variant="h6" fontWeight="bold">
                  {videoContent.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {videoContent.description}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 1 }}>
                  <Chip 
                    label={getLanguageLabel(language)}
                    color="secondary"
                    size="small"
                    sx={{ fontSize: '0.75rem' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Duration: {videoContent.duration}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Video Player */}
          <Box sx={{ position: 'relative', mb: 2 }}>
            {videoContent.videoUrl ? (
              videoContent.provider === 'vimeo' || videoContent.provider === 'youtube' ? (
                // Embedded video player for external providers
                <Box
                  sx={{
                    position: 'relative',
                    paddingBottom: '56.25%', // 16:9 aspect ratio
                    height: 0,
                    overflow: 'hidden',
                    borderRadius: '8px',
                    backgroundColor: '#000'
                  }}
                >
                  <iframe
                    src={getVideoEmbedUrl(videoContent.videoUrl, videoContent.provider)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    allowFullScreen
                    title={videoContent.title}
                  />
                </Box>
              ) : (
                // Native HTML5 video player for direct video files (Cloudinary, custom URLs)
                <video
                  ref={videoRef}
                  width="100%"
                  height="auto"
                  style={{ 
                    borderRadius: '8px',
                    backgroundColor: '#000',
                    maxHeight: '400px'
                  }}
                  poster={videoContent.thumbnailUrl || "/images/video-placeholder.jpg"}
                  preload="metadata"
                  crossOrigin="anonymous"
                >
                  <source src={videoContent.videoUrl} type="video/mp4" />
                  <source src={videoContent.videoUrl} type="video/webm" />
                  <source src={videoContent.videoUrl} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              )
            ) : (
              // Placeholder for missing videos
              <Box
                sx={{
                  width: '100%',
                  height: '250px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #ccc'
                }}
              >
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Video Coming Soon
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {videoContent.title}
                  </Typography>
                  <img 
                    src={videoContent.thumbnailUrl} 
                    alt={videoContent.title}
                    style={{ 
                      maxWidth: '200px', 
                      marginTop: '16px', 
                      borderRadius: '4px',
                      opacity: 0.7
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Video Controls Overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                color: 'white',
                p: 2,
                borderRadius: '0 0 8px 8px'
              }}
            >
              {/* Progress Bar */}
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#fff'
                    },
                    cursor: 'pointer'
                  }}
                  onClick={handleProgressClick}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">
                    {formatTime(currentTime)}
                  </Typography>
                  <Typography variant="caption">
                    {formatTime(duration)}
                  </Typography>
                </Box>
              </Box>

              {/* Control Buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <IconButton onClick={togglePlay} sx={{ color: 'white' }}>
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </IconButton>
                <IconButton onClick={toggleMute} sx={{ color: 'white' }}>
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </IconButton>
                <IconButton onClick={toggleFullscreen} sx={{ color: 'white' }}>
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Completion Status */}
          {videoCompleted && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ Video completed! You can now proceed to today's tasks.
            </Alert>
          )}

          {/* Action Buttons - Only show for daily modules, not core module */}
          {dayModule.day !== 0 && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={onTaskStart}
                disabled={!videoCompleted}
                sx={{ minWidth: 200 }}
              >
                {videoCompleted ? 'Start Daily Tasks' : 'Complete Video First'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Video Completion Dialog */}
      <Dialog open={externalShowCompletion && showCompletionDialog} onClose={() => setShowCompletionDialog(false)}>
        <DialogTitle>🎉 Video Completed!</DialogTitle>
        <DialogContent>
          <Typography>
            Great job! You've successfully completed today's video content. 
            You can now proceed to complete your daily tasks for Day {dayModule.day}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompletionDialog(false)}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}