import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Tab,
  Tabs,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHeart,
  FaExclamationTriangle,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaCheckCircle,
  FaPlayCircle,
  FaLightbulb,
  FaChevronDown,
  FaFileAlt,
  FaCalendarAlt
} from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'next/router';

export default function CaregiverDashboard() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [programData, setProgramData] = useState([]);
  const [healthTips, setHealthTips] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [dayNotes, setDayNotes] = useState('');
  const [completionDialog, setCompletionDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage or props
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    setUserData(user);
    loadProgramData();
    loadHealthTips();
  }, []);

  const loadProgramData = () => {
    // Sample 10-day program data
    const sampleProgram = [
      {
        day: 1,
        title: "Understanding Cancer Emotions",
        description: "Learn about the emotional journey of cancer patients",
        content: "Cancer diagnosis brings a wave of emotions including fear, anxiety, anger, and sadness. Understanding these emotions is the first step in providing effective support.",
        activities: [
          { title: "Active Listening Exercise", description: "Practice listening without trying to fix or solve", duration: "30 minutes" },
          { title: "Emotion Recognition", description: "Learn to identify different emotional states", duration: "20 minutes" }
        ],
        learningObjectives: [
          "Recognize common emotional responses to cancer",
          "Understand the importance of validation",
          "Learn basic active listening techniques"
        ],
        emotionalSupport: [
          {
            topic: "Validation Techniques",
            techniques: ["Acknowledge feelings", "Avoid minimizing concerns", "Use reflective listening"],
            resources: ["Validation phrase examples", "Body language guide"]
          }
        ],
        stressManagement: [
          {
            technique: "Deep Breathing",
            steps: ["Inhale for 4 counts", "Hold for 4 counts", "Exhale for 6 counts", "Repeat 5 times"],
            benefits: "Reduces anxiety and promotes calm"
          }
        ],
        reflectionQuestions: [
          "How do you typically respond when someone shares difficult emotions?",
          "What barriers might prevent effective emotional support?"
        ]
      },
      {
        day: 2,
        title: "Building Trust and Rapport",
        description: "Establish a strong foundation of trust with patients",
        content: "Trust is essential for effective caregiving. Building rapport creates a safe space for patients to express their fears and concerns.",
        activities: [
          { title: "Trust Building Exercise", description: "Practice creating safe communication spaces", duration: "45 minutes" },
          { title: "Rapport Techniques", description: "Learn mirroring and matching techniques", duration: "25 minutes" }
        ],
        learningObjectives: [
          "Understand the components of trust",
          "Learn rapport-building techniques",
          "Practice creating safe spaces"
        ],
        emotionalSupport: [
          {
            topic: "Creating Safety",
            techniques: ["Consistent presence", "Reliable communication", "Respect boundaries"],
            resources: ["Trust assessment tools", "Communication guidelines"]
          }
        ],
        stressManagement: [
          {
            technique: "Progressive Muscle Relaxation",
            steps: ["Tense muscle groups for 5 seconds", "Release and relax for 10 seconds", "Move through body systematically"],
            benefits: "Reduces physical tension and mental stress"
          }
        ],
        reflectionQuestions: [
          "What makes you feel trusted by others?",
          "How can you demonstrate reliability to patients?"
        ]
      },
      {
        day: 3,
        title: "Communication Strategies",
        description: "Master effective communication techniques for cancer care",
        content: "Effective communication goes beyond words. It involves understanding non-verbal cues, timing, and creating meaningful connections.",
        activities: [
          { title: "Non-verbal Communication", description: "Practice reading and using body language", duration: "35 minutes" },
          { title: "Difficult Conversations", description: "Role-play challenging scenarios", duration: "40 minutes" }
        ],
        learningObjectives: [
          "Master verbal and non-verbal communication",
          "Learn to navigate difficult conversations",
          "Understand timing in communication"
        ],
        emotionalSupport: [
          {
            topic: "Empathetic Communication",
            techniques: ["Use 'I' statements", "Reflect emotions", "Ask open-ended questions"],
            resources: ["Communication scripts", "Empathy building exercises"]
          }
        ],
        stressManagement: [
          {
            technique: "Mindful Communication",
            steps: ["Pause before responding", "Listen with full attention", "Speak with intention"],
            benefits: "Improves understanding and reduces miscommunication"
          }
        ],
        reflectionQuestions: [
          "When do you communicate most effectively?",
          "What communication habits would you like to change?"
        ]
      },
      // Continue with days 4-10...
      {
        day: 4,
        title: "Managing Fear and Anxiety",
        description: "Help patients cope with cancer-related fears",
        content: "Fear and anxiety are natural responses to cancer. Learning to address these emotions helps patients feel more in control.",
        activities: [
          { title: "Fear Assessment", description: "Identify specific fears and concerns", duration: "30 minutes" },
          { title: "Coping Strategies", description: "Practice anxiety reduction techniques", duration: "35 minutes" }
        ]
      },
      {
        day: 5,
        title: "Hope and Resilience",
        description: "Foster hope and build resilience in cancer patients",
        content: "Hope is a powerful force in healing. Learning to nurture hope while being realistic about challenges is a delicate balance.",
        activities: [
          { title: "Hope Building", description: "Identify sources of hope and meaning", duration: "40 minutes" },
          { title: "Resilience Training", description: "Build emotional and mental strength", duration: "30 minutes" }
        ]
      },
      {
        day: 6,
        title: "Family Dynamics and Support",
        description: "Navigate family relationships during cancer treatment",
        content: "Cancer affects the entire family system. Understanding family dynamics helps provide comprehensive support.",
        activities: [
          { title: "Family Assessment", description: "Understand family roles and relationships", duration: "35 minutes" },
          { title: "Support Coordination", description: "Facilitate family communication", duration: "25 minutes" }
        ]
      },
      {
        day: 7,
        title: "Self-Care for Caregivers",
        description: "Maintain your own well-being while caring for others",
        content: "Caregiver burnout is real. Learning self-care strategies ensures you can provide sustained, quality care.",
        activities: [
          { title: "Self-Assessment", description: "Evaluate your own stress levels", duration: "20 minutes" },
          { title: "Self-Care Planning", description: "Create a personal self-care routine", duration: "40 minutes" }
        ]
      },
      {
        day: 8,
        title: "Crisis Intervention",
        description: "Handle emotional crises and urgent situations",
        content: "Sometimes patients experience emotional crises. Knowing how to respond appropriately can be life-saving.",
        activities: [
          { title: "Crisis Recognition", description: "Identify signs of emotional crisis", duration: "30 minutes" },
          { title: "Intervention Techniques", description: "Practice crisis response protocols", duration: "45 minutes" }
        ]
      },
      {
        day: 9,
        title: "Long-term Support Planning",
        description: "Develop sustainable support strategies",
        content: "Cancer care is often a long journey. Creating sustainable support plans helps maintain consistent care quality.",
        activities: [
          { title: "Support Planning", description: "Create long-term care strategies", duration: "40 minutes" },
          { title: "Resource Mapping", description: "Identify available support resources", duration: "30 minutes" }
        ]
      },
      {
        day: 10,
        title: "Reflection and Integration",
        description: "Integrate learning and prepare for ongoing support",
        content: "Reflection helps solidify learning. This final day focuses on integrating all concepts for effective ongoing care.",
        activities: [
          { title: "Learning Integration", description: "Connect all program concepts", duration: "35 minutes" },
          { title: "Future Planning", description: "Plan for continued growth and learning", duration: "25 minutes" }
        ]
      }
    ];
    setProgramData(sampleProgram);
  };

  const loadHealthTips = () => {
    // Sample health tips
    const sampleTips = [
      {
        id: 1,
        title: "Nutrition During Treatment",
        content: "Encourage small, frequent meals with high-protein foods. Stay hydrated and avoid empty calories.",
        category: "nutrition",
        date: new Date().toISOString()
      },
      {
        id: 2,
        title: "Gentle Exercise Benefits",
        content: "Light walking or stretching can help maintain strength and improve mood during treatment.",
        category: "exercise",
        date: new Date().toISOString()
      },
      {
        id: 3,
        title: "Managing Treatment Side Effects",
        content: "Keep a symptom diary to track patterns and communicate effectively with the medical team.",
        category: "medication",
        date: new Date().toISOString()
      },
      {
        id: 4,
        title: "Sleep Quality Tips",
        content: "Maintain a consistent sleep schedule and create a calming bedtime routine to improve rest quality.",
        category: "lifestyle",
        date: new Date().toISOString()
      },
      {
        id: 5,
        title: "Emotional Well-being",
        content: "Practice mindfulness and meditation to help manage anxiety and stress during treatment.",
        category: "mental_health",
        date: new Date().toISOString()
      }
    ];
    setHealthTips(sampleTips);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDayCompletion = (day) => {
    setCurrentDay(day);
    setCompletionDialog(true);
  };

  const submitDayCompletion = () => {
    // Here you would typically update the backend
    console.log(`Day ${currentDay} completed with notes: ${dayNotes}`);

    // Update local state
    const updatedUser = { ...userData };
    if (!updatedUser.programProgress) {
      updatedUser.programProgress = { completedDays: [], currentDay: 1 };
    }

    if (!updatedUser.programProgress.completedDays.includes(currentDay)) {
      updatedUser.programProgress.completedDays.push(currentDay);
    }

    updatedUser.programProgress.currentDay = Math.min(currentDay + 1, 10);

    // Check if program is completed
    if (updatedUser.programProgress.completedDays.length === 10) {
      updatedUser.programProgress.isCompleted = true;
      // Enable post-test for assigned patient
      enablePatientPostTest();
    }

    setUserData(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));

    setCompletionDialog(false);
    setDayNotes('');
  };

  const enablePatientPostTest = async () => {
    // API call to enable post-test for the assigned patient
    try {
      await fetch('/api/enable-post-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId: userData.id })
      });
    } catch (error) {
      console.error('Failed to enable post-test:', error);
    }
  };

  const handleEmergencyAlert = () => {
    setAlertDialogOpen(true);
  };

  const submitAlert = async () => {
    try {
      // API call to submit emergency alert
      await fetch('/api/emergency-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId: userData?.id,
          message: alertMessage,
          timestamp: new Date().toISOString()
        })
      });

      setAlertDialogOpen(false);
      setAlertMessage('');
      // Show success message
    } catch (error) {
      console.error('Failed to submit alert:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    router.push('/');
  };

  const getCategoryColor = (category) => {
    const colors = {
      nutrition: '#10b981',
      exercise: '#2563eb',
      medication: '#7c3aed',
      lifestyle: '#f59e0b',
      mental_health: '#ef4444'
    };
    return colors[category] || '#6b7280';
  };

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h4">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Caregiver Dashboard - {userData.name}
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 2 }}>
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </IconButton>
          <Button
            color="inherit"
            startIcon={<FaSignOutAlt />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Emergency Alert Button */}
      <Box sx={{ position: 'fixed', top: 100, right: 20, zIndex: 1000 }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<FaExclamationTriangle />}
            onClick={handleEmergencyAlert}
            sx={{
              px: 3,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(239, 68, 68, 0.6)',
              }
            }}
          >
            RED ALERT
          </Button>
        </motion.div>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', color: 'white' }}>
            <CardContent sx={{ py: 4 }}>
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                Welcome back, {userData.name}!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Continue your journey of providing exceptional cancer care support
              </Typography>
              {userData.assignedPatient && (
                <Typography variant="body1" sx={{ mt: 2, opacity: 0.8 }}>
                  Currently supporting: <strong>{userData.assignedPatient.name}</strong>
                </Typography>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
          >
            <Tab
              label="10-Day Program"
              icon={<FaCalendarAlt />}
              iconPosition="start"
            />
            <Tab
              label="Daily Health Tips"
              icon={<FaLightbulb />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="program"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4 }}
            >
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
                10-Day Emotional Support Program
              </Typography>

              <Grid container spacing={3}>
                {programData.map((day) => {
                  const isCompleted = userData.programProgress?.completedDays?.includes(day.day);
                  const isCurrent = userData.programProgress?.currentDay === day.day;
                  const isLocked = day.day > (userData.programProgress?.currentDay || 1);

                  return (
                    <Grid item xs={12} key={day.day}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: day.day * 0.1 }}
                      >
                        <Card sx={{
                          opacity: isLocked ? 0.6 : 1,
                          border: isCurrent ? '2px solid #2563eb' : 'none',
                          background: isCompleted ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'background.paper',
                          color: isCompleted ? 'white' : 'text.primary'
                        }}>
                          <Accordion disabled={isLocked}>
                            <AccordionSummary expandIcon={<FaChevronDown />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Box sx={{ mr: 2 }}>
                                  {isCompleted ? (
                                    <FaCheckCircle style={{ color: isCompleted ? 'white' : '#10b981', fontSize: '1.5rem' }} />
                                  ) : (
                                    <FaPlayCircle style={{ color: isCurrent ? '#2563eb' : '#6b7280', fontSize: '1.5rem' }} />
                                  )}
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Day {day.day}: {day.title}
                                  </Typography>
                                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    {day.description}
                                  </Typography>
                                </Box>
                                {isCurrent && (
                                  <Chip
                                    label="Current"
                                    color="primary"
                                    size="small"
                                    sx={{ ml: 2 }}
                                  />
                                )}
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography variant="body1" sx={{ mb: 3 }}>
                                {day.content}
                              </Typography>

                              {day.activities && (
                                <Box sx={{ mb: 3 }}>
                                  <Typography variant="h6" sx={{ mb: 2 }}>Activities</Typography>
                                  {day.activities.map((activity, index) => (
                                    <Paper key={index} sx={{ p: 2, mb: 1, backgroundColor: 'action.hover' }}>
                                      <Typography variant="subtitle1" fontWeight={500}>
                                        {activity.title}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {activity.description}
                                      </Typography>
                                      {activity.duration && (
                                        <Typography variant="caption" color="primary">
                                          Duration: {activity.duration}
                                        </Typography>
                                      )}
                                    </Paper>
                                  ))}
                                </Box>
                              )}

                              {!isCompleted && !isLocked && (
                                <Box sx={{ textAlign: 'center', mt: 3 }}>
                                  <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<FaCheckCircle />}
                                    onClick={() => handleDayCompletion(day.day)}
                                    sx={{ px: 4, py: 2 }}
                                  >
                                    Mark as Complete
                                  </Button>
                                </Box>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        </Card>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
                Daily Health Tips
              </Typography>

              <Grid container spacing={3}>
                {healthTips.map((tip, index) => (
                  <Grid item xs={12} md={6} lg={4} key={tip.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card sx={{
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <FaLightbulb
                              style={{
                                color: getCategoryColor(tip.category),
                                fontSize: '1.5rem',
                                marginRight: '8px'
                              }}
                            />
                            <Chip
                              label={tip.category.replace('_', ' ')}
                              size="small"
                              sx={{
                                backgroundColor: getCategoryColor(tip.category),
                                color: 'white',
                                textTransform: 'capitalize'
                              }}
                            />
                          </Box>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            {tip.title}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {tip.content}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Day Completion Dialog */}
      <Dialog open={completionDialog} onClose={() => setCompletionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FaFileAlt style={{ marginRight: '8px' }} />
            Complete Day {currentDay}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Congratulations on completing Day {currentDay}! Please share your reflection and notes about today's learning.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reflection Notes"
            value={dayNotes}
            onChange={(e) => setDayNotes(e.target.value)}
            placeholder="What did you learn today? How will you apply this knowledge?"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompletionDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitDayCompletion}>
            Complete Day
          </Button>
        </DialogActions>
      </Dialog>

      {/* Emergency Alert Dialog */}
      <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FaExclamationTriangle style={{ marginRight: '8px' }} />
            Emergency Alert
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            This alert will immediately notify the medical team and administrators. Please describe the situation.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Emergency Description"
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            placeholder="Describe the emergency situation..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={submitAlert}
            disabled={!alertMessage.trim()}
          >
            Send Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
