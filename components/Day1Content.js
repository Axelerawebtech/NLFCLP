import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Paper
} from '@mui/material';
import { FaPlay, FaCheckCircle, FaLightbulb, FaThumbsUp, FaPhone } from 'react-icons/fa';
import VideoContentPlayer from './VideoContentPlayer';
import { notificationService } from '../utils/notificationService';

// Day 1 content based on burden levels
const day1Content = {
  mild: {
    videoId: 'day1_mild',
    title: 'Day 1 - Self-Care Basics',
    motivationalMessage: "Your care matters — a small break keeps you stronger.",
    tasks: [
      "Did you take one 2-minute break today?",
      "Did you practice deep breathing today?"
    ],
    reminder: "🕊️ Take 2 minutes for yourself today — relax and breathe."
  },
  'mild-moderate': {
    videoId: 'day1_moderate',
    title: 'Day 1 - Problem-Solving Skills',
    videoDescription: '5-minute video on practical problem-solving',
    interactivePrompt: "Now try it! Write your biggest problem and one solution below.",
    promptExample: "Problem: I cannot cook daily. → Solution: Cook once for two meals.",
    weeklyReminder: "Have you practiced your problem-solving step this week?",
    weeklyQuestion: "Did it help?",
    encouragement: "💡 You're doing great! Small steps make a big difference."
  },
  'moderate-severe': {
    videoId: 'day1_moderate_severe', 
    title: 'Day 1 - Advanced Problem-Solving',
    videoDescription: '5-minute video on practical problem-solving',
    interactivePrompt: "Now try it! Write your biggest problem and one solution below.",
    promptExample: "Problem: I cannot cook daily. → Solution: Cook once for two meals.",
    weeklyReminder: "Have you practiced your problem-solving step this week?",
    weeklyQuestion: "Did it help?",
    encouragement: "💡 You're doing great! Small steps make a big difference."
  },
  severe: {
    videoId: 'day1_severe',
    title: 'Day 1 - Intensive Support & Problem-Solving',
    reflectionPrompts: [
      "What problem feels hardest right now?",
      "What solution will you try?"
    ],
    dailyTasks: [
      "Did you practice your problem-solving step today?",
      "Did you take one 2-minute break today?"
    ],
    supportMessage: "It seems you are having a difficult week. Please call your nurse or Tele-MANAS (14416) for support.",
    dailyReminder: "💬 You're doing your best. Take a breath. Small progress counts."
  }
};

export default function Day1Content({ burdenLevel, caregiverId, onComplete }) {
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(false);
  const [showInteractivePrompt, setShowInteractivePrompt] = useState(false);
  const [problemText, setProblemText] = useState('');
  const [solutionText, setSolutionText] = useState('');
  const [dailyTasksResponses, setDailyTasksResponses] = useState({});
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [dayProgress, setDayProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1); // 1: Video, 2: Message/Prompt, 3: Tasks

  const content = day1Content[burdenLevel] || day1Content['mild'];

  useEffect(() => {
    // Calculate progress based on completed activities and burden level
    let progress = 0;
    
    console.log('🔍 Progress calculation debug:', {
      burdenLevel,
      videoCompleted,
      dailyTasksResponses,
      dailyTasksKeys: Object.keys(dailyTasksResponses),
      dailyTasksCount: Object.keys(dailyTasksResponses).length
    });
    
    if (burdenLevel === 'mild') {
      // Mild level: Only video + tasks (no problem-solving)
      if (videoCompleted) progress += 50; // 50% for video
      
      // For mild: check if any tasks are completed
      const tasksCompleted = Object.keys(dailyTasksResponses).length > 0;
      if (tasksCompleted) progress += 50; // 50% for tasks
      
      console.log('📊 Mild progress:', { videoCompleted, tasksCompleted, progress });
    } else {
      // Moderate/severe levels: video + problem-solving + tasks
      if (videoCompleted) progress += 40; // 40% for video
      if (problemText && solutionText) progress += 30; // 30% for problem-solving
      if (Object.keys(dailyTasksResponses).length > 0) progress += 30; // 30% for tasks
    }
    
    console.log('✅ Final progress:', progress);
    setDayProgress(progress);
  }, [videoCompleted, problemText, solutionText, dailyTasksResponses, burdenLevel]);

  const handleVideoComplete = () => {
    setVideoCompleted(true);
    setCurrentStep(2);
    
    // Show appropriate follow-up based on burden level
    if (burdenLevel === 'mild') {
      setShowMotivationalMessage(true);
      setTimeout(() => {
        setCurrentStep(3); // Move to tasks after showing message
      }, 3000); // Show message for 3 seconds
    } else {
      setShowInteractivePrompt(true);
    }
  };

  const handleTaskResponse = (taskIndex, completed) => {
    setDailyTasksResponses(prev => ({
      ...prev,
      [taskIndex]: completed
    }));
  };

  const handleSaveProblemSolution = async () => {
    try {
      const response = await fetch('/api/caregiver/day1-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          day: 1,
          burdenLevel,
          problem: problemText,
          solution: solutionText,
          activityType: 'problem-solving'
        })
      });

      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Error saving problem-solution:', error);
    }
  };

  const handleDayComplete = () => {
    // Show completion dialog first
    setShowCompletionDialog(true);
  };

  const handleConfirmCompletion = async () => {
    try {
      const response = await fetch('/api/caregiver/complete-day-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          day: 1,
          progressPercentage: dayProgress,
          burdenLevel,
          activities: {
            videoCompleted,
            problemSolution: problemText && solutionText ? { problem: problemText, solution: solutionText } : null,
            dailyTasks: dailyTasksResponses
          }
        })
      });

      if (response.ok) {
        // Schedule daily reminders based on burden level
        await scheduleNotifications();
        
        // Close dialog and proceed to Day 2
        setShowCompletionDialog(false);
        
        // Trigger completion callback which should advance to Day 2
        onComplete?.(2); // Pass day number for Day 2
      }
    } catch (error) {
      console.error('Error completing day:', error);
    }
  };

  // Schedule notifications based on burden level
  const scheduleNotifications = async () => {
    try {
      console.log(`📱 Scheduling notifications for ${burdenLevel} burden level`);
      
      // Request notification permission
      const permissionGranted = await notificationService.requestNotificationPermission();
      
      if (permissionGranted) {
        console.log('✅ Notification permission granted');
      } else {
        console.log('⚠️ Notification permission denied, will show in-app reminders only');
      }

      // Schedule reminders regardless of browser notification permission
      notificationService.scheduleReminders(burdenLevel, caregiverId);

      // Show immediate confirmation for mild burden level
      if (burdenLevel === 'mild') {
        setTimeout(() => {
          notificationService.showNotification(
            "🕊️ Daily reminders are now set up! You'll receive gentle self-care reminders 3 times a day.",
            caregiverId
          );
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  // Create mock video data for Day 1
  const videoData = {
    day: 1,
    title: content.title,
    description: content.videoDescription || 'Day 1 content video',
    videoCompleted: videoCompleted,
    progressPercentage: dayProgress
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', my: 3 }}>
      {/* Day Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" fontWeight="bold">
              {content.title}
            </Typography>
            <Chip 
              label={`${dayProgress}% Complete`} 
              color={dayProgress === 100 ? 'success' : 'primary'}
              sx={{ fontSize: '1rem', px: 2 }}
            />
          </Box>
          
          {/* Burden Level Indicator */}
          <Chip 
            label={`Content Level: ${burdenLevel.replace('-', ' to ').toUpperCase()}`}
            color="secondary"
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </CardContent>
      </Card>

      {/* Step 1: Video Section */}
      {currentStep >= 1 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FaPlay />
              Step 1: Watch Day 1 Video
            </Typography>
            
            <VideoContentPlayer
              dayModule={videoData}
              burdenLevel={burdenLevel}
              onVideoComplete={handleVideoComplete}
              showCompletionDialog={false}
            />
            
            {videoCompleted && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <FaCheckCircle style={{ marginRight: 8 }} />
                Video completed! Moving to next step...
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Motivational Message (Mild) */}
      {currentStep >= 2 && burdenLevel === 'mild' && showMotivationalMessage && (
        <Card sx={{ mb: 3, bgcolor: 'success.50' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              <FaThumbsUp style={{ marginRight: 8 }} />
              {content.motivationalMessage}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Now let's check in with your daily self-care activities...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Interactive Prompt (Moderate & Severe) */}
      {currentStep >= 2 && (burdenLevel === 'mild-moderate' || burdenLevel === 'moderate-severe' || burdenLevel === 'severe') && showInteractivePrompt && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FaLightbulb />
              Step 2: {content.interactivePrompt || 'Reflection Exercise'}
            </Typography>
            
            {content.promptExample && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Example:</strong> {content.promptExample}
                </Typography>
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={burdenLevel === 'severe' ? "What problem feels hardest right now?" : "Your biggest problem"}
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={burdenLevel === 'severe' ? "What solution will you try?" : "Your solution"}
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              onClick={() => {
                handleSaveProblemSolution();
                setCurrentStep(3);
              }}
              disabled={!problemText || !solutionText}
              sx={{ mt: 2 }}
            >
              Save & Continue to Daily Tasks
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Daily Tasks */}
      {currentStep >= 3 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Step 3: Daily Check-in Tasks
            </Typography>
            
            {burdenLevel === 'mild' && content.tasks && content.tasks.map((task, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  {task}
                </Typography>
                <RadioGroup
                  value={dailyTasksResponses[index] !== undefined ? dailyTasksResponses[index].toString() : ''}
                  onChange={(e) => handleTaskResponse(index, e.target.value === 'true')}
                  row
                >
                  <FormControlLabel value="true" control={<Radio />} label="Yes" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                </RadioGroup>
              </Box>
            ))}

            {burdenLevel === 'severe' && content.dailyTasks && content.dailyTasks.map((task, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  {task}
                </Typography>
                <RadioGroup
                  value={dailyTasksResponses[index] !== undefined ? dailyTasksResponses[index].toString() : ''}
                  onChange={(e) => handleTaskResponse(index, e.target.value === 'true')}
                  row
                >
                  <FormControlLabel value="true" control={<Radio />} label="Yes" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                </RadioGroup>
              </Box>
            ))}

            {(burdenLevel === 'mild-moderate' || burdenLevel === 'moderate-severe') && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Weekly Check-in:
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    {content.weeklyReminder}
                  </Typography>
                  <RadioGroup
                    value={dailyTasksResponses['weekly'] !== undefined ? dailyTasksResponses['weekly'].toString() : ''}
                    onChange={(e) => handleTaskResponse('weekly', e.target.value === 'true')}
                    row
                  >
                    <FormControlLabel value="true" control={<Radio />} label="Yes" />
                    <FormControlLabel value="false" control={<Radio />} label="No" />
                  </RadioGroup>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    {content.weeklyQuestion}
                  </Typography>
                  <RadioGroup
                    value={dailyTasksResponses['weekly-help'] !== undefined ? dailyTasksResponses['weekly-help'].toString() : ''}
                    onChange={(e) => handleTaskResponse('weekly-help', e.target.value === 'true')}
                    row
                  >
                    <FormControlLabel value="true" control={<Radio />} label="Yes" />
                    <FormControlLabel value="false" control={<Radio />} label="No" />
                  </RadioGroup>
                </Box>
              </Box>
            )}

            {/* Encouragement message for moderate levels */}
            {(burdenLevel === 'mild-moderate' || burdenLevel === 'moderate-severe') && Object.keys(dailyTasksResponses).length > 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {content.encouragement}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Daily Reminders Section */}
      {currentStep >= 3 && (
        <Card sx={{ mb: 3, bgcolor: 'info.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Daily Reminder
            </Typography>
            
            {burdenLevel === 'mild' && (
              <Alert severity="info">
                {content.reminder}
              </Alert>
            )}
            
            {burdenLevel === 'severe' && (
              <Alert severity="info">
                {content.dailyReminder}
              </Alert>
            )}
            
            {(burdenLevel === 'mild-moderate' || burdenLevel === 'moderate-severe') && (
              <Alert severity="success">
                {content.encouragement}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Support Message for Severe Cases */}
      {burdenLevel === 'severe' && Object.values(dailyTasksResponses).filter(r => !r).length >= 3 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            {content.supportMessage}
          </Typography>
          <Button
            variant="contained"
            color="warning"
            startIcon={<FaPhone />}
            onClick={() => setShowSupportDialog(true)}
            sx={{ mt: 1 }}
          >
            Get Support Now
          </Button>
        </Alert>
      )}

      {/* Day Completion */}
      {dayProgress >= 70 && (
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <FaCheckCircle size={48} color="green" />
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              Great Progress Today!
            </Typography>
            <Typography variant="body1" paragraph>
              You've completed {dayProgress}% of Day 1 activities.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleDayComplete}
              sx={{ px: 4 }}
            >
              Complete Day 1
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Support Dialog */}
      <Dialog open={showSupportDialog} onClose={() => setShowSupportDialog(false)}>
        <DialogTitle>Support Resources</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            <strong>Tele-MANAS:</strong> 14416
          </Typography>
          <Typography gutterBottom>
            24/7 mental health support helpline
          </Typography>
          <Typography>
            Your well-being matters. Don&apos;t hesitate to reach out for professional support.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSupportDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Day 1 Completion Dialog */}
      <Dialog open={showCompletionDialog} onClose={() => setShowCompletionDialog(false)}>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <FaCheckCircle color="#4caf50" />
            Congratulations!
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold' }}>
            Your Day 1 Content is completed
          </Typography>
          <Typography variant="body1" paragraph>
            🎉 You've successfully completed Day 1 of your caregiver support program!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You&apos;re ready to move on to Day 2 content and continue your journey.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={handleConfirmCompletion}
            variant="contained"
            size="large"
            sx={{ px: 4, py: 1 }}
          >
            OK - Continue to Day 2
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}