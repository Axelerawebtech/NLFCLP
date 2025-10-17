import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { FaPlayCircle, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import VideoContentPlayer from './VideoContentPlayer';
import { useLanguage } from '../contexts/LanguageContext';

export default function CoreModuleEmbedded({ 
  caregiverId, 
  completed = false, 
  onComplete,
  onProceedToDay1 
}) {
  const { currentLanguage, translations } = useLanguage();
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [hasShownCompletionOnce, setHasShownCompletionOnce] = useState(completed); // Track if completion was already shown
  const [videoJustCompleted, setVideoJustCompleted] = useState(false); // Track if video was just completed in this session

  // Update hasShownCompletionOnce when completed prop changes
  useEffect(() => {
    if (completed) {
      setHasShownCompletionOnce(true);
    }
  }, [completed]);

  // Create a mock day module object for Day 0 (Core Module)
  const coreModuleData = {
    day: 0,
    title: 'Core Module - Introduction to Caregiving',
    description: 'Essential foundation for your caregiving journey',
    videoCompleted: completed,
    tasksCompleted: completed,
    progressPercentage: completed ? 100 : 0
  };

  const handleVideoComplete = () => {
    // Only show completion dialog if this is the first time completing
    if (!hasShownCompletionOnce) {
      setVideoJustCompleted(true); // Mark video as just completed
      setShowCompletionDialog(true);
      setHasShownCompletionOnce(true);
      onComplete?.();
    }
    // If it's a re-watch, don't show dialog or call onComplete again
  };

  const handleCompletionConfirm = () => {
    setShowCompletionDialog(false);
    setVideoJustCompleted(false); // Hide the button since user is proceeding
    onProceedToDay1?.();
  };

  const getLanguageLabel = (lang) => {
    switch (lang) {
      case 'en': return 'English';
      case 'hi': return 'हिंदी';
      case 'kn': return 'ಕನ್ನಡ';
      default: return 'English';
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Card sx={{ 
        border: completed ? '2px solid' : '2px solid',
        borderColor: completed ? 'success.main' : 'primary.main',
        backgroundColor: completed ? 'success.50' : 'background.paper'
      }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {completed ? <FaCheckCircle color="green" /> : <FaPlayCircle color="primary" />}
                Core Module - Day 0
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Foundation training for effective caregiving
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              <Chip 
                label={completed ? 'COMPLETED' : 'START HERE'}
                color={completed ? 'success' : 'primary'}
                sx={{ fontWeight: 'bold' }}
              />
              <Chip 
                label={getLanguageLabel(currentLanguage)}
                color="secondary"
                size="small"
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {!completed ? (
            // Show video player if not completed
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight="bold">
                  🎬 Welcome! Please watch this core module video to begin your caregiving journey.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  This video covers essential concepts that will help you throughout the 7-day program.
                </Typography>
              </Alert>
              
              <VideoContentPlayer
                dayModule={coreModuleData}
                burdenLevel={null} // Core module doesn't have burden levels
                onVideoComplete={handleVideoComplete}
                showCompletionDialog={false} // Disable internal completion dialog
                className="core-module-video"
              />

              {/* Show "Start Daily Tasks" button immediately after video completion */}
              {(completed || videoJustCompleted) && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<FaArrowRight />}
                    onClick={() => onProceedToDay1?.()}
                    sx={{ px: 4 }}
                  >
                    Start Daily Tasks
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            // Show only re-watch option with simple message
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  You can re-watch the video below if needed.
                </Typography>
              </Alert>

              {/* Show "Start Daily Tasks" button for completed core module */}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<FaArrowRight />}
                  onClick={() => onProceedToDay1?.()}
                  sx={{ px: 4 }}
                >
                  Start Daily Tasks
                </Button>
              </Box>
              
              {/* Allow re-watching the video */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaPlayCircle />
                Re-watch Core Module Video
              </Typography>
              
              {/* Re-watch video with NO completion handling */}
              <VideoContentPlayer
                dayModule={{
                  ...coreModuleData,
                  // Create a unique identifier to prevent completion tracking
                  isRewatch: true
                }}
                burdenLevel={null}
                onVideoComplete={null} // No completion callback for re-watch
                showCompletionDialog={false} // Explicitly disable dialogs
                className="core-module-video"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Completion Dialog */}
      <Dialog 
        open={showCompletionDialog} 
        onClose={() => setShowCompletionDialog(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <FaCheckCircle size={48} color="green" />
          <Typography variant="h5" sx={{ mt: 2 }}>
            🎉 Congratulations!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="h6" gutterBottom>
            You have completed your Day 0 Core Module!
          </Typography>
          <Typography variant="body1" paragraph>
            You now have the essential foundation knowledge for effective caregiving. 
            Your personalized 7-day program is ready to begin.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click "Proceed to Day 1" to start your customized daily content based on your assessment.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCompletionConfirm}
            endIcon={<FaArrowRight />}
            sx={{ px: 4 }}
          >
            Proceed to Day 1
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}