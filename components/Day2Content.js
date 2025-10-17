import { useState, useEffect } from 'react';
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
  Alert,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { FaPlay, FaCheckCircle, FaTasks, FaVideo, FaHeartbeat } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import VideoContentPlayer from './VideoContentPlayer';
import DailyTasks from './DailyTasks';

export default function Day2Content({ 
  burdenLevel, 
  caregiverId, 
  onComplete 
}) {
  const { language, translations } = useLanguage();
  
  const [currentStep, setCurrentStep] = useState(0); // 0: Video, 1: Daily Check-in Tasks
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [tasksCompleted, setTasksCompleted] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [completionDialog, setCompletionDialog] = useState(false);

  // Progress calculation based on burden level
  const calculateProgress = () => {
    if (burdenLevel === 'mild') {
      // For mild burden: 60% video + 40% tasks = 100%
      let progress = 0;
      if (videoCompleted) progress += 60;
      if (tasksCompleted) progress += 40;
      return Math.min(progress, 100);
    } else {
      // For moderate/severe: 50% video + 50% tasks = 100%
      let progress = 0;
      if (videoCompleted) progress += 50;
      if (tasksCompleted) progress += 50;
      return Math.min(progress, 100);
    }
  };

  const handleVideoComplete = () => {
    setVideoCompleted(true);
    setCurrentStep(1);
  };

  const handleTasksComplete = (taskData) => {
    setTasksCompleted(true);
    setShowTasks(false);
    
    // Check if day is fully completed
    if (videoCompleted) {
      setCompletionDialog(true);
    }
  };

  const handleDayComplete = () => {
    setCompletionDialog(false);
    if (onComplete) {
      onComplete(3); // Advance to Day 3
    }
  };

  const progress = calculateProgress();
  const isCompleted = progress === 100;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FaHeartbeat size={24} style={{ marginRight: '12px' }} />
            <Typography variant="h4" component="h1">
              Day 2: Managing Stress & Building Resilience
            </Typography>
          </Box>
          
          <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
            Learn effective stress management techniques and build your emotional resilience
          </Typography>

          {/* Progress */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Progress</Typography>
              <Typography variant="body2">{progress}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: progress === 100 ? '#4caf50' : '#90caf9'
                }
              }} 
            />
          </Box>

          {/* Status */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<FaVideo />}
              label="Stress Management Video"
              color={videoCompleted ? "success" : "default"}
              variant={videoCompleted ? "filled" : "outlined"}
              sx={{ color: videoCompleted ? 'white' : 'rgba(255,255,255,0.8)' }}
            />
            <Chip 
              icon={<FaTasks />}
              label="Daily Check-in"
              color={tasksCompleted ? "success" : "default"}
              variant={tasksCompleted ? "filled" : "outlined"}
              sx={{ color: tasksCompleted ? 'white' : 'rgba(255,255,255,0.8)' }}
            />
            {isCompleted && (
              <Chip 
                icon={<FaCheckCircle />}
                label="Day 2 Complete!"
                color="success"
                sx={{ color: 'white' }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Content Steps */}
      <Grid container spacing={3}>
        {/* Video Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FaVideo size={20} style={{ marginRight: '8px', color: '#1976d2' }} />
                <Typography variant="h6">
                  Stress Management Video
                </Typography>
                {videoCompleted && <FaCheckCircle style={{ marginLeft: '8px', color: '#4caf50' }} />}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Learn proven techniques to manage caregiving stress and build emotional resilience.
              </Typography>

              <VideoContentPlayer
                day={2}
                burdenLevel={burdenLevel}
                caregiverId={caregiverId}
                onComplete={handleVideoComplete}
                language={language}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Check-in Tasks */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FaTasks size={20} style={{ marginRight: '8px', color: '#9c27b0' }} />
                <Typography variant="h6">
                  Daily Check-in Tasks
                </Typography>
                {tasksCompleted && <FaCheckCircle style={{ marginLeft: '8px', color: '#4caf50' }} />}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Complete your daily wellness check-in with simple yes/no questions about your stress management and self-care.
              </Typography>

              <Box sx={{ mb: 2 }}>
                {burdenLevel === 'mild' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Focus Areas:</strong> Basic stress awareness, breathing exercises, and positive moments
                    </Typography>
                  </Alert>
                )}
                {burdenLevel === 'moderate' && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Focus Areas:</strong> Active stress management, social connections, and healthy boundaries
                    </Typography>
                  </Alert>
                )}
                {burdenLevel === 'severe' && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Focus Areas:</strong> Crisis management, professional support, and intensive self-care
                    </Typography>
                  </Alert>
                )}
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={() => setShowTasks(true)}
                disabled={!videoCompleted}
                startIcon={<FaTasks />}
                sx={{ 
                  background: tasksCompleted ? '#4caf50' : '#9c27b0',
                  '&:hover': {
                    background: tasksCompleted ? '#388e3c' : '#7b1fa2'
                  }
                }}
              >
                {tasksCompleted ? 'Review Check-in' : 'Start Daily Check-in'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Completion Message */}
      {isCompleted && (
        <Card sx={{ mt: 3, background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <FaCheckCircle size={48} style={{ marginBottom: '16px' }} />
            <Typography variant="h5" gutterBottom>
              Congratulations! Day 2 Complete
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              You've learned valuable stress management techniques and completed your daily wellness check-in. 
              Your commitment to self-care is building resilience for your caregiving journey.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleDayComplete}
              sx={{ 
                background: 'rgba(255,255,255,0.2)', 
                '&:hover': { background: 'rgba(255,255,255,0.3)' }
              }}
            >
              Continue to Day 3
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Daily Tasks Dialog */}
      <Dialog 
        open={showTasks} 
        onClose={() => setShowTasks(false)}
        maxWidth="md"
        fullWidth
      >
        <DailyTasks
          day={2}
          contentLevel={burdenLevel === 'mild' ? 'low' : burdenLevel === 'moderate' ? 'moderate' : 'high'}
          caregiverId={caregiverId}
          onComplete={handleTasksComplete}
          onBack={() => setShowTasks(false)}
        />
      </Dialog>

      {/* Day Completion Dialog */}
      <Dialog open={completionDialog} onClose={() => setCompletionDialog(false)}>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <FaCheckCircle size={48} style={{ color: '#4caf50', marginBottom: '16px' }} />
          <Typography variant="h5">
            Day 2 Content Complete!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 2 }}>
            You've successfully completed your Day 2 stress management training and daily check-in. 
            Your progress in building resilience is commendable!
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Ready to move on to Day 3: Developing Coping Strategies?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setCompletionDialog(false)} color="secondary">
            Stay on Day 2
          </Button>
          <Button 
            onClick={handleDayComplete} 
            variant="contained" 
            color="primary"
            startIcon={<FaCheckCircle />}
          >
            Continue to Day 3
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}