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
  StepContent,
  IconButton
} from '@mui/material';
import { FaPlay, FaCheckCircle, FaLock, FaUnlock, FaClipboardList, FaTasks, FaVideo } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import VideoContentPlayer from './VideoContentPlayer';
import DailyAssessment from './DailyAssessment';
import DailyTasks from './DailyTasks';

export default function DayModuleCardEnhanced({ 
  dayModule, 
  burdenLevel,  // Legacy - for Day 0 only
  caregiverId, 
  onComplete 
}) {
  const { language, translations } = useLanguage();
  
  // Skip rendering for Day 0 - it's handled by CoreModuleEmbedded component
  if (dayModule.day === 0) {
    return null;
  }
  
  const [currentStep, setCurrentStep] = useState(0); // 0: Assessment, 1: Video, 2: Tasks
  const [showAssessment, setShowAssessment] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [completionDialog, setCompletionDialog] = useState(false);

  // Determine content level - use assessment result for Days 1-7
  const contentLevel = dayModule.contentLevel || 'moderate'; // Default to moderate if assessment not completed

  useEffect(() => {
    // Determine which step to show based on completion status for Days 1-7
    if (!dayModule.dailyAssessment) {
      setCurrentStep(0); // Start with assessment
      setShowAssessment(true);
    } else if (!dayModule.videoCompleted) {
      setCurrentStep(1); // Move to video
      setShowVideo(true);
    } else if (!dayModule.tasksCompleted) {
      setCurrentStep(2); // Move to tasks
      setShowTasks(true);
    } else {
      setCurrentStep(3); // All completed
    }
  }, [dayModule]);

  const handleAssessmentComplete = (assessmentData) => {
    setShowAssessment(false);
    setCurrentStep(1);
    setShowVideo(true);
    // Refresh the component with updated data
    onComplete?.(dayModule);
  };

  const handleVideoComplete = () => {
    setShowVideo(false);
    if (dayModule.day === 0) {
      // Day 0 is complete after video
      setCompletionDialog(true);
      onComplete?.(dayModule);
    } else {
      // Move to tasks for Days 1-7
      setCurrentStep(2);
      setShowTasks(true);
    }
  };

  const handleTasksComplete = () => {
    setShowTasks(false);
    setCurrentStep(3);
    setCompletionDialog(true);
    onComplete?.(dayModule);
  };

  const getStepContent = (step) => {
    if (dayModule.day === 0) {
      // Day 0 steps
      return ['Core Video Content'];
    } else {
      // Days 1-7 steps
      return ['Daily Assessment', 'Video Content', 'Daily Tasks'];
    }
  };

  const getContentLevelColor = (level) => {
    switch (level) {
      case 'low': return 'success';
      case 'moderate': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getContentLevelLabel = (level) => {
    switch (level) {
      case 'low': return 'Basic Level';
      case 'moderate': return 'Intermediate Level';
      case 'high': return 'Advanced Level';
      default: return 'Standard Level';
    }
  };

  const getDayTitle = (day) => {
    const titles = {
      0: 'Core Module - Program Introduction',
      1: 'Day 1 - Understanding Caregiver Burden',
      2: 'Day 2 - Managing Stress Levels',
      3: 'Day 3 - Developing Coping Strategies',
      4: 'Day 4 - Self-Care Assessment',
      5: 'Day 5 - Building Social Support',
      6: 'Day 6 - Emotional Wellbeing',
      7: 'Day 7 - Program Evaluation & Future Planning'
    };
    return titles[day] || `Day ${day}`;
  };

  const getDayDescription = (day) => {
    const descriptions = {
      0: 'Introduction to the caregiver support program and core concepts.',
      1: 'Assess your current burden level and learn foundational caregiving strategies.',
      2: 'Evaluate your stress levels and discover effective stress management techniques.',
      3: 'Explore your coping mechanisms and learn new strategies for resilience.',
      4: 'Review your self-care practices and establish healthy routines.',
      5: 'Assess your social support network and strengthen connections.',
      6: 'Evaluate your emotional wellbeing and develop emotional regulation skills.',
      7: 'Reflect on your program experience and plan for continued growth.'
    };
    return descriptions[day] || `Day ${day} activities and content.`;
  };

  if (!dayModule.adminPermissionGranted) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <FaLock size={48} color="#ccc" />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Day {dayModule.day} - Locked
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete the previous day or wait for admin approval to unlock this content.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {getDayTitle(dayModule.day)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getDayDescription(dayModule.day)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                {contentLevel && dayModule.day > 0 && (
                  <Chip 
                    label={getContentLevelLabel(contentLevel)}
                    color={getContentLevelColor(contentLevel)}
                    sx={{ mb: 1 }}
                  />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <FaUnlock color="green" />
                  <Typography variant="body2" color="success.main">
                    Unlocked
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Progress Bar */}
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Progress</Typography>
                <Typography variant="body2">{dayModule.progressPercentage}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={dayModule.progressPercentage}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Box>

          {/* Progress Steps */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Stepper activeStep={currentStep} orientation="vertical">
              {dayModule.day === 0 ? (
                // Day 0 - Only video
                <Step>
                  <StepLabel 
                    icon={dayModule.videoCompleted ? <FaCheckCircle color="green" /> : <FaVideo />}
                  >
                    Core Video Content
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      Watch the introduction video to understand the program fundamentals.
                    </Typography>
                    {!dayModule.videoCompleted && (
                      <Button
                        variant="contained"
                        startIcon={<FaPlay />}
                        onClick={() => setShowVideo(true)}
                        sx={{ mt: 1 }}
                      >
                        Start Video
                      </Button>
                    )}
                  </StepContent>
                </Step>
              ) : (
                // Days 1-7 - Assessment + Video + Tasks
                <>
                  <Step>
                    <StepLabel 
                      icon={dayModule.dailyAssessment ? <FaCheckCircle color="green" /> : <FaClipboardList />}
                    >
                      Daily Assessment
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        Complete today's assessment to personalize your content.
                      </Typography>
                      {!dayModule.dailyAssessment && (
                        <Button
                          variant="contained"
                          startIcon={<FaClipboardList />}
                          onClick={() => setShowAssessment(true)}
                          sx={{ mt: 1 }}
                        >
                          Start Assessment
                        </Button>
                      )}
                    </StepContent>
                  </Step>

                  <Step>
                    <StepLabel 
                      icon={dayModule.videoCompleted ? <FaCheckCircle color="green" /> : <FaVideo />}
                    >
                      Video Content ({getContentLevelLabel(contentLevel)})
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        Watch personalized video content based on your assessment.
                      </Typography>
                      {dayModule.dailyAssessment && !dayModule.videoCompleted && (
                        <Button
                          variant="contained"
                          startIcon={<FaPlay />}
                          onClick={() => setShowVideo(true)}
                          sx={{ mt: 1 }}
                        >
                          Watch Video
                        </Button>
                      )}
                    </StepContent>
                  </Step>

                  <Step>
                    <StepLabel 
                      icon={dayModule.tasksCompleted ? <FaCheckCircle color="green" /> : <FaTasks />}
                    >
                      Daily Tasks
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        Complete today's practical tasks and reflections.
                      </Typography>
                      {dayModule.videoCompleted && !dayModule.tasksCompleted && (
                        <Button
                          variant="contained"
                          startIcon={<FaTasks />}
                          onClick={() => setShowTasks(true)}
                          sx={{ mt: 1 }}
                        >
                          Start Tasks
                        </Button>
                      )}
                    </StepContent>
                  </Step>
                </>
              )}
            </Stepper>
          </Paper>

          {/* Completion Status */}
          {dayModule.progressPercentage === 100 && (
            <Alert severity="success" sx={{ mb: 2 }}>
              🎉 Congratulations! You have completed Day {dayModule.day}.
              {dayModule.completedAt && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Completed on: {new Date(dayModule.completedAt).toLocaleDateString()}
                </Typography>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Assessment Dialog */}
      <Dialog 
        open={showAssessment} 
        onClose={() => setShowAssessment(false)}
        maxWidth="md"
        fullWidth
        fullScreen
      >
        <DailyAssessment
          day={dayModule.day}
          caregiverId={caregiverId}
          onComplete={handleAssessmentComplete}
          onBack={() => setShowAssessment(false)}
        />
      </Dialog>

      {/* Video Dialog */}
      <Dialog 
        open={showVideo} 
        onClose={() => setShowVideo(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <VideoContentPlayer
            dayModule={dayModule}
            burdenLevel={dayModule.day === 0 ? burdenLevel : contentLevel}
            onVideoComplete={handleVideoComplete}
            onTaskStart={() => setShowVideo(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Tasks Dialog */}
      <Dialog 
        open={showTasks} 
        onClose={() => setShowTasks(false)}
        maxWidth="md"
        fullWidth
      >
        <DailyTasks
          day={dayModule.day}
          contentLevel={contentLevel}
          caregiverId={caregiverId}
          onComplete={handleTasksComplete}
          onBack={() => setShowTasks(false)}
        />
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={completionDialog} onClose={() => setCompletionDialog(false)}>
        <DialogTitle>🎉 Day {dayModule.day} Completed!</DialogTitle>
        <DialogContent>
          <Typography>
            Excellent work! You have successfully completed all activities for Day {dayModule.day}.
            {dayModule.day < 7 && " Your next day will be unlocked according to the program schedule."}
            {dayModule.day === 7 && " Congratulations on completing the entire 7-day program!"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompletionDialog(false)}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}