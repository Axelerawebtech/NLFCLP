import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  LinearProgress,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { FaPlay, FaPause, FaCheck, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

const DayModuleCard = ({ 
  dayNumber, 
  burdenLevel, 
  isUnlocked, 
  isCompleted, 
  progress, 
  onComplete, 
  caregiverId 
}) => {
  const { currentLanguage } = useLanguage();
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState({});
  const [problemText, setProblemText] = useState('');
  const [solutionText, setSolutionText] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionDialog, setCompletionDialog] = useState(false);

  // Video content paths (you'll need to add these to public/videos/)
  const getVideoPath = () => {
    if (dayNumber === 0) return '/videos/day0-core-module.mp4';
    return `/videos/day${dayNumber}-${burdenLevel}.mp4`;
  };

  const getMotivationalMessage = () => {
    if (burdenLevel === 'mild') {
      return getTranslation(currentLanguage, 'mildBurdenMessage') || 
             "Your care matters — a small break keeps you stronger.";
    } else if (burdenLevel === 'moderate') {
      return getTranslation(currentLanguage, 'moderateBurdenMessage') || 
             "You're managing well. Let's work on some problem-solving strategies.";
    } else {
      return getTranslation(currentLanguage, 'severeBurdenMessage') || 
             "You're doing your best. Take a breath. Small progress counts.";
    }
  };

  const handleVideoEnd = () => {
    setVideoProgress(100);
    setVideoPlaying(false);
    setShowTasks(true);
  };

  const handleTaskChange = (taskKey, value) => {
    setTasks(prev => ({
      ...prev,
      [taskKey]: value
    }));
  };

  const handleCompleteModule = async () => {
    setIsSubmitting(true);

    try {
      const taskData = {
        day: dayNumber,
        ...tasks,
        problemSolution: burdenLevel === 'moderate' || burdenLevel === 'severe' ? {
          problem: problemText,
          solution: solutionText
        } : undefined,
        reflectionText: burdenLevel === 'severe' ? reflectionText : undefined
      };

      const response = await fetch('/api/caregiver/complete-day-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiverId,
          day: dayNumber,
          taskData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCompletionDialog(true);
        onComplete(dayNumber);
      } else {
        console.error('Failed to complete module:', data.error);
      }
    } catch (error) {
      console.error('Module completion error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTasks = () => {
    switch (burdenLevel) {
      case 'mild':
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
              {getMotivationalMessage()}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tasks.task1 || false}
                    onChange={(e) => handleTaskChange('task1', e.target.checked)}
                  />
                }
                label={getTranslation(currentLanguage, 'mildTask1') || "Did you take one 2-minute break today?"}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tasks.task2 || false}
                    onChange={(e) => handleTaskChange('task2', e.target.checked)}
                  />
                }
                label={getTranslation(currentLanguage, 'mildTask2') || "Did you practice deep breathing today?"}
              />
            </Box>
          </Box>
        );

      case 'moderate':
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
              {getMotivationalMessage()}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {getTranslation(currentLanguage, 'moderateInstruction') || 
               "Now try it! Write your biggest problem and one solution below."}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={getTranslation(currentLanguage, 'problemLabel') || "Your biggest problem"}
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Example: I cannot cook daily."
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label={getTranslation(currentLanguage, 'solutionLabel') || "Your solution"}
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Example: Cook once for two meals."
            />
          </Box>
        );

      case 'severe':
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
              {getMotivationalMessage()}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={getTranslation(currentLanguage, 'reflectionLabel') || "What problem feels hardest right now?"}
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tasks.task1 || false}
                    onChange={(e) => handleTaskChange('task1', e.target.checked)}
                  />
                }
                label={getTranslation(currentLanguage, 'severeTask1') || "Did you practice your problem-solving step today?"}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tasks.task2 || false}
                    onChange={(e) => handleTaskChange('task2', e.target.checked)}
                  />
                }
                label={getTranslation(currentLanguage, 'severeTask2') || "Did you take one 2-minute break today?"}
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!isUnlocked) {
    return (
      <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.100' }}>
        <FaLock size={48} color="#ccc" style={{ marginBottom: 16 }} />
        <Typography variant="h6" color="text.secondary">
          {getTranslation(currentLanguage, 'dayLockedTitle') || `Day ${dayNumber} Module`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getTranslation(currentLanguage, 'dayLockedMessage') || 
           'This module will be unlocked by your administrator.'}
        </Typography>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
        <FaCheck size={48} style={{ marginBottom: 16 }} />
        <Typography variant="h6">
          {getTranslation(currentLanguage, 'dayCompletedTitle') || `Day ${dayNumber} Completed`}
        </Typography>
        <Chip 
          label={`${progress}% Complete`} 
          color="success" 
          sx={{ mt: 2 }}
        />
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          {dayNumber === 0 
            ? (getTranslation(currentLanguage, 'coreModuleTitle') || 'Core Module - Day 0')
            : `${getTranslation(currentLanguage, 'day') || 'Day'} ${dayNumber} ${getTranslation(currentLanguage, 'module') || 'Module'}`
          }
        </Typography>

        {/* Video Section */}
        <Box sx={{ mb: 3 }}>
          <video
            width="100%"
            height="300"
            controls
            onPlay={() => setVideoPlaying(true)}
            onPause={() => setVideoPlaying(false)}
            onEnded={handleVideoEnd}
            onTimeUpdate={(e) => {
              const progress = (e.target.currentTime / e.target.duration) * 100;
              setVideoProgress(progress);
            }}
          >
            <source src={getVideoPath()} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          <LinearProgress 
            variant="determinate" 
            value={videoProgress} 
            sx={{ mt: 1, height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            {getTranslation(currentLanguage, 'videoProgress') || 'Video Progress'}: {Math.round(videoProgress)}%
          </Typography>
        </Box>

        {/* Tasks Section */}
        {showTasks && (
          <Box>
            {renderTasks()}
            
            <Button
              variant="contained"
              onClick={handleCompleteModule}
              disabled={isSubmitting}
              sx={{ mt: 3, width: '100%' }}
            >
              {isSubmitting 
                ? (getTranslation(currentLanguage, 'completing') || 'Completing...')
                : (getTranslation(currentLanguage, 'completeModule') || 'Complete Module')
              }
            </Button>
          </Box>
        )}

        {/* Completion Dialog */}
        <Dialog open={completionDialog} onClose={() => setCompletionDialog(false)}>
          <DialogTitle>
            {getTranslation(currentLanguage, 'moduleCompleted') || 'Module Completed!'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {dayNumber === 0 
                ? (getTranslation(currentLanguage, 'day0CompletedMessage') || 'Your Day 0 module is completed')
                : `${getTranslation(currentLanguage, 'dayCompletedMessage') || `Your Day ${dayNumber} module is completed`}`
              }
            </Typography>
          </DialogContent>
          <DialogActions>
            {dayNumber < 7 && (
              <Button variant="contained" onClick={() => setCompletionDialog(false)}>
                {getTranslation(currentLanguage, 'proceedNextDay') || `Proceed to Day ${dayNumber + 1} content`}
              </Button>
            )}
            <Button onClick={() => setCompletionDialog(false)}>
              {getTranslation(currentLanguage, 'close') || 'Close'}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </motion.div>
  );
};

export default DayModuleCard;