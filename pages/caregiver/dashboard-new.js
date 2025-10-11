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
  IconButton
} from '@mui/material';
import { FaSignOutAlt, FaSun, FaMoon, FaUserCircle, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ZaritBurdenAssessment from '../../components/ZaritBurdenAssessment';
import DayModuleCardEnhanced from '../../components/DayModuleCardEnhanced';
import VideoContentPlayer from '../../components/VideoContentPlayer';

export default function CaregiverDashboard() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language } = useLanguage();
  
  const [caregiverData, setCaregiverData] = useState(null);
  const [programData, setProgramData] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentView, setCurrentView] = useState('overview'); // overview, assessment, dailyContent
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/caregiver/dashboard');
      const data = await response.json();

      if (response.ok) {
        setCaregiverData(data.caregiver);
        setProgramData(data.program);
        
        // Determine initial view based on program state
        if (!data.program) {
          setCurrentView('assessment');
        } else if (data.program.currentDay === 0 && !data.program.dayModules[0]?.videoCompleted) {
          setCurrentView('dailyContent');
        } else {
          setCurrentView('overview');
        }
      } else {
        setError(data.error || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = (assessmentData) => {
    setProgramData(assessmentData.program);
    setCurrentView('dailyContent');
  };

  const handleDayModuleComplete = async (dayModule) => {
    // Refresh dashboard data to get updated progress
    await fetchDashboardData();
  };

  const handleVideoComplete = () => {
    // Video completion is handled by the VideoContentPlayer
    console.log('Video completed');
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    router.push('/login');
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
              disabled={!programData}
              startIcon={<FaCalendarAlt />}
            >
              Daily Content
            </Button>
          </Box>
        </Paper>

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
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {programData.currentDay}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current Day
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {Math.round(programData.overallProgress)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overall Progress
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        {programData.zaritBurdenAssessment && (
                          <Chip 
                            label={programData.zaritBurdenAssessment.burdenLevel.toUpperCase()}
                            color={getBurdenLevelColor(programData.zaritBurdenAssessment.burdenLevel)}
                          />
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Burden Level
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4">
                          {programData.zaritBurdenAssessment?.totalScore || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Zarit Score
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
                    {programData.dayModules?.map((dayModule) => (
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

            {/* Recent Activity */}
            {programData.dailyTasks?.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Activity
                    </Typography>
                    
                    {programData.dailyTasks
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
                    }
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}

        {currentView === 'dailyContent' && programData && (
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
          </Box>
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
    </Box>
  );
}