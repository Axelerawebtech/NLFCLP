import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab
} from '@mui/material';
import { 
  FaSignOutAlt, 
  FaSun, 
  FaMoon, 
  FaUserCircle, 
  FaCalendarAlt, 
  FaChartLine,
  FaExclamationTriangle,
  FaChevronDown,
  FaLightbulb,
  FaFileAlt,
  FaCheckCircle,
  FaPlayCircle
} from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ZaritBurdenAssessment from '../../components/ZaritBurdenAssessment';
import DayModuleCardEnhanced from '../../components/DayModuleCardEnhanced';
import VideoContentPlayer from '../../components/VideoContentPlayer';
import CoreModuleEmbedded from '../../components/CoreModuleEmbedded';

export default function CaregiverDashboard() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language } = useLanguage();
  
  // Enhanced state management - combining all functionality
  const [caregiverData, setCaregiverData] = useState(null);
  const [programData, setProgramData] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentView, setCurrentView] = useState('overview'); // overview, assessment, dailyContent
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Additional functionality states
  const [healthTips, setHealthTips] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [dayNotes, setDayNotes] = useState('');
  const [completionDialog, setCompletionDialog] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  // Core Module specific states
  const [coreModuleCompleted, setCoreModuleCompleted] = useState(false);
  const [showCoreCompletionMessage, setShowCoreCompletionMessage] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    loadHealthTips();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('userData');
      console.log('UserData from localStorage:', userData);
      
      if (!userData) {
        setError('User data not found. Please log in again.');
        router.push('/login');
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id; // This should be the caregiverId
      console.log('Fetching dashboard data for userId:', userId);
      
      if (!userId) {
        setError('User ID not found. Please log in again.');
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/caregiver/dashboard?caregiverId=${userId}`);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setCaregiverData(data.caregiver);
        setProgramData(data.program);
        
        // Check core module completion status
        const coreModuleStatus = data.program?.dayModules?.[0]?.videoCompleted || false;
        setCoreModuleCompleted(coreModuleStatus);
        
        // Determine initial view based on program state
        if (!data.program) {
          setCurrentView('assessment');
        } else if (data.program.currentDay === 0 && !coreModuleStatus) {
          setCurrentView('dailyContent');
        } else {
          setCurrentView('overview');
        }
        
        // Set current day from program data
        if (data.program?.currentDay) {
          setCurrentDay(data.program.currentDay);
        }
      } else {
        console.error('API Error:', data);
        setError(data.error || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(`Network error: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const loadHealthTips = () => {
    // Sample health tips - can be made dynamic
    const tips = [
      {
        id: 1,
        title: "Take Regular Breaks",
        content: "Remember to take 15-minute breaks every 2 hours to prevent caregiver burnout."
      },
      {
        id: 2,
        title: "Stay Hydrated",
        content: "Drink at least 8 glasses of water daily to maintain your energy levels."
      },
      {
        id: 3,
        title: "Connect with Others",
        content: "Maintain social connections to support your emotional well-being."
      }
    ];
    setHealthTips(tips);
  };

  const handleAssessmentComplete = (assessmentData) => {
    setProgramData(assessmentData.program);
    setCurrentView('dailyContent');
  };

  const handleDayModuleComplete = async (dayModule) => {
    // Refresh dashboard data to get updated progress
    await fetchDashboardData();
    
    // Show completion dialog for certain milestones
    if (dayModule.progressPercentage === 100) {
      setCompletionDialog(true);
    }
  };

  const handleVideoComplete = () => {
    // Video completion is handled by the VideoContentPlayer
    console.log('Video completed');
  };

  const handleCoreModuleComplete = async () => {
    try {
      setCoreModuleCompleted(true);
      setShowCoreCompletionMessage(true);
      
      // Update backend about core module completion
      const userData = JSON.parse(localStorage.getItem('userData'));
      const response = await fetch('/api/caregiver/complete-day-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiverId: userData._id,
          day: 0,
          moduleType: 'video'
        }),
      });

      if (response.ok) {
        // Refresh dashboard data to reflect completion
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error completing core module:', error);
    }
  };

  const handleProceedToDay1 = async () => {
    setShowCoreCompletionMessage(false);
    
    try {
      // Update the current day to 1 in the backend
      const userData = JSON.parse(localStorage.getItem('userData'));
      const response = await fetch('/api/caregiver/program-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiverId: userData._id,
          currentDay: 1
        }),
      });

      if (response.ok) {
        // Update local state
        setCurrentDay(1);
        
        // Navigate to daily content view to show Day 1
        setCurrentView('dailyContent');
        
        // Refresh dashboard data to reflect the new day
        await fetchDashboardData();
      } else {
        // Fallback: just update UI state even if API fails
        setCurrentDay(1);
        setCurrentView('dailyContent');
        
        // Update programData locally to reflect Day 1
        setProgramData(prev => ({
          ...prev,
          currentDay: 1
        }));
      }
    } catch (error) {
      console.error('Error proceeding to Day 1:', error);
      // Fallback: just update UI state
      setCurrentDay(1);
      setCurrentView('dailyContent');
      
      // Update programData locally to reflect Day 1
      setProgramData(prev => ({
        ...prev,
        currentDay: 1
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    router.push('/login');
  };

  const handleEmergencyAlert = () => {
    setAlertDialogOpen(true);
  };

  const submitAlert = async () => {
    try {
      // API call to submit emergency alert
      await fetch('/api/emergency-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiverId: caregiverData._id,
          message: alertMessage,
          timestamp: new Date().toISOString()
        }),
      });
      
      setAlertDialogOpen(false);
      setAlertMessage('');
      alert('Emergency alert sent successfully!');
    } catch (error) {
      console.error('Error sending alert:', error);
      alert('Failed to send alert. Please try again.');
    }
  };

  const handleCompletionDialogClose = () => {
    setCompletionDialog(false);
  };

  const getBurdenLevelColor = (level) => {
    switch (level) {
      case 'mild': return 'success';
      case 'moderate': return 'warning';
      case 'severe': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading your dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Caregiver Dashboard
          </Typography>
          
          {caregiverData && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2">
                  {caregiverData.name}
                </Typography>
                <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                  ID: {caregiverData.caregiverId}
                </Typography>
              </Box>
              <IconButton color="inherit" onClick={toggleTheme}>
                {isDarkMode ? <FaSun /> : <FaMoon />}
              </IconButton>
              <IconButton color="inherit" onClick={handleLogout}>
                <FaSignOutAlt />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
            <Button
              variant={currentView === 'overview' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('overview')}
              disabled={!programData}
              startIcon={<FaChartLine />}
            >
              Overview
            </Button>
            <Button
              variant={currentView === 'assessment' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('assessment')}
              disabled={programData && programData.zaritBurdenAssessment}
              startIcon={<FaUserCircle />}
            >
              Assessment
            </Button>
            <Button
              variant={currentView === 'dailyContent' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('dailyContent')}
              disabled={!programData || !coreModuleCompleted}
              startIcon={<FaCalendarAlt />}
            >
              Daily Content
            </Button>
          </Box>
        </Paper>

        {/* Core Module Section - Always visible when program exists */}
        {programData && (
          <CoreModuleEmbedded
            caregiverId={caregiverData?._id}
            completed={coreModuleCompleted}
            onComplete={handleCoreModuleComplete}
            onProceedToDay1={handleProceedToDay1}
          />
        )}

        {/* Content based on current view */}
        {currentView === 'assessment' && (
          <ZaritBurdenAssessment
            caregiverId={caregiverData?._id}
            onComplete={handleAssessmentComplete}
          />
        )}

        {currentView === 'overview' && programData && (
          <Grid container spacing={3}>
            {/* Program Overview */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Program Overview
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {programData.currentDay}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current Day
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {Math.round(programData.overallProgress)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overall Progress
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Progress Timeline */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    7-Day Program Progress
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Day 0 - Core Module Card */}
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          bgcolor: coreModuleCompleted ? 'success.light' : 'background.paper',
                          border: programData.currentDay === 0 ? 2 : 1,
                          borderColor: programData.currentDay === 0 ? 'primary.main' : 'divider'
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {coreModuleCompleted ? <FaCheckCircle color="green" /> : <FaPlayCircle />}
                            Day 0 - Core Module
                          </Typography>
                          
                          <LinearProgress 
                            variant="determinate" 
                            value={coreModuleCompleted ? 100 : 0}
                            sx={{ mb: 1, height: 8, borderRadius: 4 }}
                          />
                          
                          <Typography variant="body2" color="text.secondary">
                            {coreModuleCompleted ? '100' : '0'}% Complete
                          </Typography>
                          
                          {programData.currentDay === 0 && (
                            <Chip 
                              label="Current" 
                              color="primary" 
                              size="small" 
                              sx={{ mt: 1 }}
                            />
                          )}
                          {coreModuleCompleted && (
                            <Chip 
                              label="Completed" 
                              color="success" 
                              size="small" 
                              sx={{ mt: 1 }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Regular Day 1-7 Cards - Filter out Day 0 to prevent duplication */}
                    {programData.dayModules?.filter(dayModule => dayModule.day !== 0).map((dayModule) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={dayModule.day}>
                        <Card 
                          variant="outlined"
                          sx={{ 
                            bgcolor: dayModule.progressPercentage === 100 ? 'success.light' : 'background.paper',
                            border: dayModule.day === programData.currentDay ? 2 : 1,
                            borderColor: dayModule.day === programData.currentDay ? 'primary.main' : 'divider'
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              Day {dayModule.day}
                            </Typography>
                            
                            <LinearProgress 
                              variant="determinate" 
                              value={dayModule.progressPercentage}
                              sx={{ mb: 1, height: 8, borderRadius: 4 }}
                            />
                            
                            <Typography variant="body2" color="text.secondary">
                              {dayModule.progressPercentage}% Complete
                            </Typography>
                            
                            {dayModule.day === programData.currentDay && (
                              <Chip 
                                label="Current" 
                                color="primary" 
                                size="small" 
                                sx={{ mt: 1 }}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Health Tips Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaLightbulb />
                    Daily Health Tips
                  </Typography>
                  
                  {healthTips.map((tip) => (
                    <Accordion key={tip.id} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<FaChevronDown />}>
                        <Typography variant="subtitle2">{tip.title}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2">{tip.content}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  
                  {programData.dailyTasks?.length > 0 ? (
                    programData.dailyTasks
                      .slice(-5)
                      .reverse()
                      .map((task, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            p: 2, 
                            mb: 1, 
                            bgcolor: 'grey.50', 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200'
                          }}
                        >
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" fontWeight="bold">
                                Day {task.day} Completed
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(task.completedAt)}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              {task.task1 !== null && (
                                <Typography variant="body2">
                                  Break taken: {task.task1 ? '✅ Yes' : '❌ No'}
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </Box>
                      ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent activity to display.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {currentView === 'dailyContent' && programData && coreModuleCompleted && programData.currentDay > 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Day {programData.currentDay} - Daily Content
            </Typography>
            
            {/* Current Day Module */}
            {programData.dayModules?.find(module => module.day === programData.currentDay) && (
              <DayModuleCardEnhanced
                dayModule={programData.dayModules.find(module => module.day === programData.currentDay)}
                burdenLevel={programData.zaritBurdenAssessment?.burdenLevel}
                caregiverId={caregiverData?._id}
                onComplete={handleDayModuleComplete}
              />
            )}
            
            {/* If no day module found for current day, show preparation message */}
            {!programData.dayModules?.find(module => module.day === programData.currentDay) && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Day {programData.currentDay} content is being prepared
                </Typography>
                <Typography variant="body2">
                  Your Day {programData.currentDay} personalized content will be available soon based on your assessment results.
                  Please check back later or contact your program coordinator.
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {/* Message when daily content is accessed but only Day 0 available */}
        {currentView === 'dailyContent' && programData && coreModuleCompleted && programData.currentDay === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ready to start your daily program!
            </Typography>
            <Typography variant="body2">
              You have completed the Core Module. Click "View Your Daily Program" in the Core Module section above to proceed to Day 1.
            </Typography>
          </Alert>
        )}

        {/* Message when trying to access daily content without completing core module */}
        {currentView === 'dailyContent' && programData && !coreModuleCompleted && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Please complete the Core Module first
            </Typography>
            <Typography variant="body2">
              The Core Module contains essential foundation knowledge required before starting your daily program. 
              Please watch the Core Module video above to proceed.
            </Typography>
          </Alert>
        )}

        {/* Welcome message for new users */}
        {!programData && currentView === 'assessment' && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Welcome to the Caregiver Support Program!
              </Typography>
              <Typography variant="body1" paragraph>
                We're glad you're here. To provide you with the most personalized support, 
                we'll start with a brief assessment to understand your current caregiving situation.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This assessment will help us tailor the 7-day program content to your specific needs.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Emergency Alert FAB */}
      <Fab
        color="error"
        aria-label="emergency"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleEmergencyAlert}
      >
        <FaExclamationTriangle />
      </Fab>

      {/* Completion Dialog */}
      <Dialog open={completionDialog} onClose={handleCompletionDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Congratulations!</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            You've successfully completed Day {currentDay}! Your progress has been saved.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Take a moment to reflect on what you've learned today, and remember to take care of yourself.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompletionDialogClose} variant="contained">
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Emergency Alert Dialog */}
      <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Emergency Alert</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Send an emergency alert to your support network. Please describe your situation:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Describe your emergency situation..."
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={submitAlert} 
            variant="contained" 
            color="error"
            disabled={!alertMessage.trim()}
          >
            Send Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}