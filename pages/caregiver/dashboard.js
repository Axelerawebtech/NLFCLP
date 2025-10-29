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
  FaPlayCircle,
  FaBell
} from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ZaritBurdenAssessment from '../../components/ZaritBurdenAssessment';
import ZaritBurdenAssessmentPreTest from '../../components/ZaritBurdenAssessmentPreTest';
import NotificationSettings from '../../components/NotificationSettings';
import SevenDayProgramDashboard from '../../components/SevenDayProgramDashboard';

export default function CaregiverDashboard() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage } = useLanguage();
  
  // Enhanced state management - combining all functionality
  const [caregiverData, setCaregiverData] = useState(null);
  const [programData, setProgramData] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentView, setCurrentView] = useState('overview'); // overview, assessment, dailyContent, notifications
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

  // Day 1 specific states
  const [showDay1PreTest, setShowDay1PreTest] = useState(false);
  const [day1BurdenLevel, setDay1BurdenLevel] = useState(null);
  const [day1PreTestCompleted, setDay1PreTestCompleted] = useState(false);

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
        
        // Check core module completion status - Day 0 is complete only when both video AND audio are completed
        const day0Module = data.program?.dayModules?.[0];
        const coreModuleStatus = day0Module ? 
          (day0Module.videoCompleted && day0Module.audioCompleted) : false;
        setCoreModuleCompleted(coreModuleStatus);
        
        // Determine initial view based on program state
        if (!data.program) {
          setCurrentView('assessment');
        } else {
          // Default to 7-day program view for all users with a program
          setCurrentView('sevenDayProgram');
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
    // After completing assessment, go to 7-day program view
    setCurrentView('sevenDayProgram');
  };

  const handleStartDay1 = () => {
    // Show the Day 1 pre-test (Zarit Burden Assessment)
    setShowDay1PreTest(true);
    setCurrentView('day1PreTest');
  };

  const handleDay1PreTestComplete = (burdenLevel, totalScore) => {
    console.log('Day 1 Pre-test completed:', { burdenLevel, totalScore });
    console.log('Current state before update:', { 
      currentView, 
      day1PreTestCompleted, 
      day1BurdenLevel, 
      coreModuleCompleted,
      programData: programData ? { currentDay: programData.currentDay } : null
    });
    
    // Save the burden level and mark pre-test as completed
    setDay1BurdenLevel(burdenLevel);
    setDay1PreTestCompleted(true);
    setShowDay1PreTest(false);
    
    // Navigate to daily content with the determined burden level
    setCurrentView('dailyContent');
    
    console.log('States updated - new values:', { 
      day1BurdenLevel: burdenLevel, 
      day1PreTestCompleted: true, 
      currentView: 'dailyContent' 
    });
    
    // Log rendering conditions
    setTimeout(() => {
      console.log('Rendering conditions check:', {
        'currentView === dailyContent': currentView === 'dailyContent',
        'programData exists': !!programData,
        'coreModuleCompleted': coreModuleCompleted,
        'programData.currentDay > 0': programData?.currentDay > 0,
        'day1PreTestCompleted': day1PreTestCompleted,
        'day1BurdenLevel': day1BurdenLevel
      });
    }, 100);
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

  // Helper function to check if all content has been viewed
  const hasViewedAllContent = () => {
    if (!programData || !programData.dayModules) return false;
    
    // Check if all available days have been completed
    const availableDays = programData.dayModules.filter(module => module.adminPermissionGranted);
    const completedDays = programData.dayModules.filter(module => module.progressPercentage === 100);
    
    // All available content must be completed
    return availableDays.length > 0 && completedDays.length === availableDays.length;
  };

  // Helper function to check if assessment can be retaken
  const canRetakeAssessment = () => {
    if (!programData || !programData.zaritBurdenAssessment) return true; // First time taking
    
    const lastAssessmentDate = new Date(programData.zaritBurdenAssessment.completedAt);
    const now = new Date();
    const daysSinceLastAssessment = (now - lastAssessmentDate) / (1000 * 60 * 60 * 24);
    
    // Allow retaking if all content has been viewed AND it's been at least 7 days
    return hasViewedAllContent() && daysSinceLastAssessment >= 7;
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
              {/* Language Selector */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant={currentLanguage === 'en' ? 'contained' : 'outlined'}
                  onClick={() => changeLanguage('en')}
                  size="small"
                  sx={{
                    minWidth: '60px',
                    color: currentLanguage === 'en' ? 'primary.contrastText' : 'inherit',
                    bgcolor: currentLanguage === 'en' ? 'rgba(255,255,255,0.3)' : 'transparent',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                      borderColor: 'rgba(255,255,255,0.7)',
                    }
                  }}
                >
                  EN
                </Button>
                <Button
                  variant={currentLanguage === 'kn' ? 'contained' : 'outlined'}
                  onClick={() => changeLanguage('kn')}
                  size="small"
                  sx={{
                    minWidth: '60px',
                    color: currentLanguage === 'kn' ? 'primary.contrastText' : 'inherit',
                    bgcolor: currentLanguage === 'kn' ? 'rgba(255,255,255,0.3)' : 'transparent',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                      borderColor: 'rgba(255,255,255,0.7)',
                    }
                  }}
                >
                  ಕನ್ನಡ
                </Button>
                <Button
                  variant={currentLanguage === 'hi' ? 'contained' : 'outlined'}
                  onClick={() => changeLanguage('hi')}
                  size="small"
                  sx={{
                    minWidth: '60px',
                    color: currentLanguage === 'hi' ? 'primary.contrastText' : 'inherit',
                    bgcolor: currentLanguage === 'hi' ? 'rgba(255,255,255,0.3)' : 'transparent',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                      borderColor: 'rgba(255,255,255,0.7)',
                    }
                  }}
                >
                  हिंदी
                </Button>
              </Box>
              
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
          <Box sx={{ display: 'flex', gap: 1, p: 2, flexWrap: 'wrap' }}>
            <Button
              variant={currentView === 'overview' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('overview')}
              disabled={!programData}
              startIcon={<FaChartLine />}
            >
              Overview
            </Button>
            <Button
              variant={currentView === 'sevenDayProgram' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('sevenDayProgram')}
              disabled={!programData}
              startIcon={<FaCalendarAlt />}
              sx={{ 
                background: currentView === 'sevenDayProgram' ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' : 'transparent',
                '&:hover': {
                  background: currentView === 'sevenDayProgram' ? 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)' : 'transparent'
                }
              }}
            >
              7-Day Program
            </Button>
            <Button
              variant={currentView === 'assessment' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('assessment')}
              disabled={!canRetakeAssessment()}
              startIcon={<FaUserCircle />}
              title={
                programData && programData.zaritBurdenAssessment && !canRetakeAssessment()
                  ? 'Complete all program content before retaking the assessment'
                  : ''
              }
            >
              Assessment
            </Button>
            <Button
              variant={currentView === 'notifications' ? 'contained' : 'outlined'}
              onClick={() => setCurrentView('notifications')}
              disabled={!day1PreTestCompleted}
              startIcon={<FaBell />}
            >
              Reminders
            </Button>
          </Box>
        </Paper>

        {/* Content based on current view */}
        {currentView === 'sevenDayProgram' && caregiverData && (
          <SevenDayProgramDashboard 
            key={currentLanguage} 
            caregiverId={caregiverData._id} 
          />
        )}

        {currentView === 'assessment' && (
          <>
            {canRetakeAssessment() ? (
              <ZaritBurdenAssessment
                caregiverId={caregiverData?._id}
                onComplete={handleAssessmentComplete}
              />
            ) : (
              <Card sx={{ p: 3, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 4 }}>
                <Typography variant="h5" gutterBottom color="primary">
                  🔒 Assessment Locked
                </Typography>
                <Typography variant="body1" paragraph>
                  You have already completed the Zarit Burden Assessment. To maintain the 
                  integrity of your care program, you can only retake this assessment after:
                </Typography>
                <Box sx={{ textAlign: 'left', mx: 'auto', maxWidth: 400 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ✅ Viewing all available program content
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ⏰ Waiting at least 7 days since your last assessment
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                  Current status: {hasViewedAllContent() ? '✅ All content viewed' : '❌ Complete remaining program content'}
                </Typography>
                {programData?.zaritBurdenAssessment?.completedAt && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Last assessment: {formatDate(programData.zaritBurdenAssessment.completedAt)}
                  </Typography>
                )}
              </Card>
            )}
          </>
        )}

        {/* Day 1 Pre-Test Assessment */}
        {currentView === 'day1PreTest' && (
          <ZaritBurdenAssessmentPreTest
            caregiverId={caregiverData?._id}
            onComplete={handleDay1PreTestComplete}
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
                            value={(() => {
                              const day0Module = programData.dayModules?.[0];
                              if (!day0Module) return 0;
                              // Calculate progress: video (50%) + audio (50%)
                              let progress = 0;
                              if (day0Module.videoCompleted) progress += 50;
                              if (day0Module.audioCompleted) progress += 50;
                              return progress;
                            })()}
                            sx={{ mb: 1, height: 8, borderRadius: 4 }}
                          />
                          
                          <Typography variant="body2" color="text.secondary">
                            {(() => {
                              const day0Module = programData.dayModules?.[0];
                              if (!day0Module) return '0% Complete';
                              // Calculate progress: video (50%) + audio (50%)
                              let progress = 0;
                              if (day0Module.videoCompleted) progress += 50;
                              if (day0Module.audioCompleted) progress += 50;
                              return `${progress}% Complete`;
                            })()}
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
                    {programData.dayModules
                      ?.filter(dayModule => dayModule.day !== 0)
                      ?.sort((a, b) => a.day - b.day)  // Sort by day number to ensure proper order
                      ?.map((dayModule) => (
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

        {/* Notification Settings View */}
        {currentView === 'notifications' && day1PreTestCompleted && (
          <NotificationSettings 
            caregiverId={caregiverData?._id}
            burdenLevel={day1BurdenLevel}
          />
        )}

        {/* Notifications not available message */}
        {currentView === 'notifications' && !day1PreTestCompleted && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reminder Notifications Not Yet Available
            </Typography>
            <Typography variant="body2">
              Complete the Day 1 assessment to unlock personalized reminder notifications based on your care level.
            </Typography>
          </Alert>
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