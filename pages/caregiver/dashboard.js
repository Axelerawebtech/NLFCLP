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
import { FaSignOutAlt, FaSun, FaMoon, FaCalendarAlt, FaChartLine, FaExclamationTriangle, FaChevronDown, FaLightbulb, FaCheckCircle, FaPlayCircle, FaBell } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
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
  const [currentView, setCurrentView] = useState('overview'); // overview, sevenDayProgram, notifications, day1PreTest
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

  const refreshProgramStatus = async (caregiverIdentifier) => {
    if (!caregiverIdentifier) return;
    try {
      const statusResponse = await fetch(`/api/caregiver/check-program-status?caregiverId=${caregiverIdentifier}&_ts=${Date.now()}`);
      if (!statusResponse.ok) {
        console.warn('Program status request failed', statusResponse.status);
        return;
      }
      const statusData = await statusResponse.json();
      if (statusData?.success && statusData.data) {
        const mergedProgram = (prevProgram) => ({
          ...(prevProgram || {}),
          ...statusData.data,
          dayModules: statusData.data.dayModules || prevProgram?.dayModules || [],
          waitTimes: statusData.data.waitTimes || prevProgram?.waitTimes
        });
        setProgramData((prev) => mergedProgram(prev));
        const statusDay0 = statusData.data.dayModules?.find((module) => Number(module.day) === 0);
        if (statusDay0) {
          const percentage = typeof statusDay0.progressPercentage === 'number' ? statusDay0.progressPercentage : parseInt(statusDay0.progressPercentage, 10);
          const statusCoreComplete = Boolean((!Number.isNaN(percentage) && percentage >= 100) || (statusDay0.videoCompleted && statusDay0.audioCompleted));
          setCoreModuleCompleted(statusCoreComplete);
        }
        if (typeof statusData.data.currentDay === 'number') {
          setCurrentDay(statusData.data.currentDay);
        }
      }
    } catch (statusError) {
      console.error('Failed to refresh program status:', statusError);
    }
  };

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
        const day0Module = data.program?.dayModules?.find((module) => Number(module.day) === 0);
        const coreModuleStatus = day0Module ? 
          (day0Module.videoCompleted && day0Module.audioCompleted) : false;
        setCoreModuleCompleted(coreModuleStatus);
        
        // Determine initial view based on program state
        if (!data.program) {
          setCurrentView('overview');
        } else {
          // Default to 7-day program view for all users with a program
          setCurrentView('sevenDayProgram');
        }
        
        // Set current day from program data
        if (data.program?.currentDay) {
          setCurrentDay(data.program.currentDay);
        }

        // Pull the latest program status so overview matches the 7-day tab
        await refreshProgramStatus(userId);
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const dayModules = programData?.dayModules || [];
  const normalizedCurrentDay = Number(programData?.currentDay ?? 0);
  const coreModule = dayModules.find((module) => Number(module.day) === 0) || null;
  const regularDayModules = dayModules.filter((module) => Number(module.day) > 0);
  const completedDayCount = regularDayModules.filter((module) => module.progressPercentage === 100).length;
  const unlockedDayCount = regularDayModules.filter((module) => module.adminPermissionGranted).length;
  const lockedDayCount = Math.max(regularDayModules.length - unlockedDayCount, 0);
  const currentDayModule = regularDayModules.find((module) => Number(module.day) === normalizedCurrentDay) || null;
  const nextLockedDay = regularDayModules
    .filter((module) => !module.adminPermissionGranted)
    .sort((a, b) => Number(a.day) - Number(b.day))[0];
  const totalAvailableSessions = regularDayModules.length + (coreModule ? 1 : 0);
  const completedSessionCount = completedDayCount + (coreModuleCompleted ? 1 : 0);
  const getDayModuleProgress = (module) => {
    if (!module) return 0;
    const percentage = typeof module.progressPercentage === 'number'
      ? module.progressPercentage
      : parseInt(module.progressPercentage, 10);
    if (!Number.isNaN(percentage) && percentage >= 0) {
      return percentage;
    }
    if (Number(module.day) === 0) {
      let progress = 0;
      if (module.videoCompleted) progress += 50;
      if (module.audioCompleted) progress += 50;
      return progress;
    }
    return 0;
  };
  const overviewStatusMessage = (() => {
    if (!programData) return 'Program content will appear here once your caregiver program is assigned.';
    if (!coreModuleCompleted) return 'Complete the Core Module to unlock Day 1 of the program.';
    if (coreModuleCompleted && completedDayCount === 0) {
      return 'Great work completing Day 0! Day 1 content unlocks automatically based on your countdown.';
    }
    if (currentDayModule && currentDayModule.progressPercentage < 100) {
      return `Continue with Day ${currentDayModule.day} to unlock upcoming content.`;
    }
    if (lockedDayCount > 0 && nextLockedDay) {
      return `Day ${nextLockedDay.day} will unlock automatically after the countdown finishes.`;
    }
    if (completedDayCount === regularDayModules.length) {
      return 'Great job! You have completed all available program days.';
    }
    return 'Start the next available day to keep your progress on track.';
  })();

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
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {overviewStatusMessage}
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h4" color="primary">
                          {programData.currentDay ?? 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current Day
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h4" color="success.main">
                          {completedSessionCount}/{totalAvailableSessions || 1}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sessions Completed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h4" color="info.main">
                          {unlockedDayCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Program Days Unlocked
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h4" color="error.main">
                          {lockedDayCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Locked Days
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h4" color="success.dark">
                          {Math.round(programData.overallProgress || 0)}%
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
                    {programData.dayModules
                      ?.filter(dayModule => typeof dayModule.day !== 'undefined')
                      ?.sort((a, b) => Number(a.day) - Number(b.day))
                      ?.map((dayModule) => {
                        const dayProgress = getDayModuleProgress(dayModule);
                        const dayNumber = Number(dayModule.day);
                        const isUnlocked = dayModule.adminPermissionGranted ?? dayNumber === 0;
                        const isLocked = !isUnlocked;
                        const isCompleted = dayProgress === 100;
                        const isCurrent = dayNumber === normalizedCurrentDay;
                        const statusLabel = isLocked
                          ? 'Locked'
                          : isCompleted
                            ? 'Completed'
                            : isCurrent
                              ? 'In Progress'
                              : 'Ready';
                        const statusColor = isLocked
                          ? 'default'
                          : isCompleted
                            ? 'success'
                            : isCurrent
                              ? 'primary'
                              : 'info';
                        return (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={dayModule.day}>
                            <Card 
                              variant="outlined"
                              sx={{ 
                                bgcolor: dayProgress === 100
                                  ? 'success.light'
                                  : (!isUnlocked ? 'grey.100' : 'background.paper'),
                                border: isCurrent ? 2 : 1,
                                borderColor: isCurrent ? 'primary.main' : 'divider',
                                opacity: isUnlocked ? 1 : 0.7
                              }}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                  Day {dayModule.day}
                                </Typography>
                                
                                <LinearProgress 
                                  variant="determinate" 
                                  value={dayProgress}
                                  sx={{ mb: 1, height: 8, borderRadius: 4 }}
                                />
                                
                                <Typography variant="body2" color="text.secondary">
                                  {dayProgress}% Complete
                                </Typography>
                                
                                <Chip
                                  label={statusLabel}
                                  color={statusColor}
                                  variant={isLocked ? 'outlined' : 'filled'}
                                  size="small"
                                  sx={{ mt: 1 }}
                                />
                                {!isUnlocked && dayModule.scheduledUnlockAt && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    Unlocks at {formatDateTime(dayModule.scheduledUnlockAt)}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
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

        {currentView === 'overview' && !programData && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Program Overview
              </Typography>
              <Typography variant="body1" paragraph>
                {overviewStatusMessage}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                If you believe this is an error, please contact your program administrator so they can assign the 7-day caregiver journey to your account.
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