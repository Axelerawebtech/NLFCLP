import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  Alert,
  Paper,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export default function PatientDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [patient, setPatient] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [answers, setAnswers] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [viewResponsesOpen, setViewResponsesOpen] = useState(false);

  // Get patient ID from query params or localStorage
  const patientId = router.query.patientId || (typeof window !== 'undefined' ? localStorage.getItem('patientId') : null);

  useEffect(() => {
    if (patientId) {
      fetchDashboardData();
    } else {
      // Redirect to login if no patient ID
      router.push('/login');
    }
  }, [patientId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/patient/dashboard?patientId=${patientId}`);
      const data = await response.json();
      
      if (data.success) {
        setPatient(data.data.patient);
        setQuestionnaire(data.data.questionnaire);
        
        // Initialize answers object if questionnaire exists
        if (data.data.questionnaire) {
          const initialAnswers = {};
          data.data.questionnaire.questions.forEach(question => {
            if (question.type === 'checkbox') {
              initialAnswers[question._id] = [];
            } else {
              initialAnswers[question._id] = '';
            }
          });
          setAnswers(initialAnswers);
        }
      } else {
        showAlert(data.message || 'Failed to load dashboard', 'error');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showAlert('Failed to load dashboard data', 'error');
    }
    setLoading(false);
  };

  const handleAnswerChange = (questionId, value, questionType) => {
    setAnswers(prev => {
      if (questionType === 'checkbox') {
        const currentValues = prev[questionId] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...prev, [questionId]: newValues };
      } else {
        return { ...prev, [questionId]: value };
      }
    });
  };

  const validateAnswers = () => {
    const requiredQuestions = questionnaire.questions.filter(q => q.required);
    const unansweredRequired = [];

    requiredQuestions.forEach(question => {
      const answer = answers[question._id];
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        unansweredRequired.push(question.questionText);
      }
    });

    return unansweredRequired;
  };

  const handleSubmit = async () => {
    // Validate required questions
    const unansweredRequired = validateAnswers();
    if (unansweredRequired.length > 0) {
      showAlert(`Please answer all required questions: ${unansweredRequired.join(', ')}`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/patient/questionnaire/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          answers
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessDialogOpen(true);
        // Refresh dashboard data to show updated submission
        await fetchDashboardData();
      } else {
        showAlert(data.message || 'Failed to submit questionnaire', 'error');
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      showAlert('Failed to submit questionnaire', 'error');
    }
    setSubmitting(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('patientId');
    localStorage.removeItem('patientAuthId');
    localStorage.removeItem('patientName');
    router.push('/patient/login');
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000);
  };

  const renderQuestion = (question, index) => {
    const questionId = question._id;
    const answer = answers[questionId];

    return (
      <Card key={questionId} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {index + 1}. {question.questionText}
            {question.required && <Chip label="Required" size="small" color="error" sx={{ ml: 1 }} />}
          </Typography>

          {question.type === 'text' && (
            <TextField
              fullWidth
              value={answer}
              onChange={(e) => handleAnswerChange(questionId, e.target.value, question.type)}
              placeholder="Enter your answer..."
              variant="outlined"
            />
          )}

          {question.type === 'textarea' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={answer}
              onChange={(e) => handleAnswerChange(questionId, e.target.value, question.type)}
              placeholder="Enter your detailed answer..."
              variant="outlined"
            />
          )}

          {question.type === 'radio' && (
            <FormControl component="fieldset">
              <RadioGroup
                value={answer}
                onChange={(e) => handleAnswerChange(questionId, e.target.value, question.type)}
              >
                {question.options.map((option, optIndex) => (
                  <FormControlLabel
                    key={optIndex}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {question.type === 'checkbox' && (
            <FormControl component="fieldset">
              <FormGroup>
                {question.options.map((option, optIndex) => (
                  <FormControlLabel
                    key={optIndex}
                    control={
                      <Checkbox
                        checked={(answer || []).includes(option)}
                        onChange={(e) => handleAnswerChange(questionId, option, question.type)}
                      />
                    }
                    label={option}
                  />
                ))}
              </FormGroup>
            </FormControl>
          )}

          {question.type === 'select' && (
            <FormControl fullWidth>
              <Select
                value={answer}
                onChange={(e) => handleAnswerChange(questionId, e.target.value, question.type)}
                displayEmpty
              >
                <MenuItem value="">
                  <em>Select an option...</em>
                </MenuItem>
                {question.options.map((option, optIndex) => (
                  <MenuItem key={optIndex} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {question.type === 'scale' && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Rate from 1 (lowest) to 10 (highest)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <Button
                    key={num}
                    variant={answer === num.toString() ? 'contained' : 'outlined'}
                    onClick={() => handleAnswerChange(questionId, num.toString(), question.type)}
                    sx={{ minWidth: 40 }}
                  >
                    {num}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const formatAnswer = (answer) => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return String(answer);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading your dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Patient not found. Please contact support.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                Welcome, {patient.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Patient Dashboard
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Paper>

      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      {/* Main Content */}
      {!patient.questionnaireEnabled ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              No Questionnaire Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your healthcare provider hasn&apos;t enabled any questionnaires for you yet. 
              Please check back later or contact your care team.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDashboardData}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : !questionnaire ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              No Active Questionnaire
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              There&apos;s no active questionnaire configured at the moment. 
              Please contact your healthcare provider.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDashboardData}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Questionnaire Header */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    {questionnaire.title}
                  </Typography>
                  {questionnaire.description && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {questionnaire.description}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {questionnaire.questions.length} questions
                  </Typography>
                </Box>
                {patient.lastQuestionnaireSubmission && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Previously Submitted"
                      color="success"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Last: {new Date(patient.lastQuestionnaireSubmission).toLocaleDateString()}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setViewResponsesOpen(true)}
                    >
                      View Previous Responses
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Questions */}
          {questionnaire.questions
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((question, index) => renderQuestion(question, index))}

          {/* Submit Button */}
          <Paper sx={{ p: 3, textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SendIcon />}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Questionnaire'}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please review your answers before submitting
            </Typography>
          </Paper>
        </>
      )}

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)}>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Questionnaire Submitted!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thank you for completing the questionnaire. Your responses have been recorded 
            and shared with your healthcare team.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => setSuccessDialogOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Previous Responses Dialog */}
      <Dialog
        open={viewResponsesOpen}
        onClose={() => setViewResponsesOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Previous Questionnaire Responses</DialogTitle>
        <DialogContent dividers>
          {patient.questionnaireAnswers && patient.questionnaireAnswers.length > 0 ? (
            <Box>
              {patient.questionnaireAnswers.map((response, index) => (
                <Box key={response._id || index} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    {response.questionText}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {formatAnswer(response.answer)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submitted: {new Date(response.submittedAt).toLocaleString()}
                  </Typography>
                  {index < patient.questionnaireAnswers.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No previous responses found.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewResponsesOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default function PatientDashboard() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [postTestQuestions, setPostTestQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [resultsDialog, setResultsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage or props
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    setUserData(user);
    loadPostTestQuestions();
  }, []);

  const loadPostTestQuestions = () => {
    // Sample post-test questions to evaluate caregiver knowledge transfer
    const sampleQuestions = [
      {
        id: 1,
        question: "What is the most important first step when someone shares their cancer-related fears with you?",
        options: [
          "Try to cheer them up immediately",
          "Listen actively and validate their feelings",
          "Give them medical advice",
          "Change the subject to something positive"
        ],
        correctAnswer: 1,
        category: "Emotional Support",
        explanation: "Active listening and validation are fundamental to providing emotional support. This shows respect for their experience and creates a safe space for expression."
      },
      {
        id: 2,
        question: "Which breathing technique is most effective for managing anxiety during cancer treatment?",
        options: [
          "Rapid shallow breathing",
          "Holding breath for long periods",
          "4-4-6 breathing (inhale 4, hold 4, exhale 6)",
          "Breathing only through the mouth"
        ],
        correctAnswer: 2,
        category: "Stress Management",
        explanation: "The 4-4-6 breathing pattern activates the parasympathetic nervous system, promoting relaxation and reducing anxiety."
      },
      {
        id: 3,
        question: "How should you respond when a cancer patient expresses anger about their diagnosis?",
        options: [
          "Tell them to stay positive",
          "Acknowledge their anger as a normal response",
          "Avoid the topic completely",
          "Compare their situation to others who are worse off"
        ],
        correctAnswer: 1,
        category: "Communication",
        explanation: "Anger is a normal part of the cancer journey. Acknowledging and validating this emotion helps the patient process their feelings healthily."
      },
      {
        id: 4,
        question: "What is the best way to build trust with a cancer patient?",
        options: [
          "Always agree with everything they say",
          "Share your personal problems to relate to them",
          "Be consistent, reliable, and respect their boundaries",
          "Offer medical advice based on internet research"
        ],
        correctAnswer: 2,
        category: "Trust Building",
        explanation: "Trust is built through consistency, reliability, and respect for boundaries. These elements create safety and predictability in the relationship."
      },
      {
        id: 5,
        question: "When should a caregiver practice self-care?",
        options: [
          "Only when feeling completely burned out",
          "Once a month whether needed or not",
          "Regularly as an ongoing practice",
          "Only when the patient is doing well"
        ],
        correctAnswer: 2,
        category: "Self-Care",
        explanation: "Self-care should be a regular, ongoing practice to prevent burnout and maintain the ability to provide quality care."
      },
      {
        id: 6,
        question: "How can you help a cancer patient maintain hope while being realistic?",
        options: [
          "Always focus only on positive outcomes",
          "Share stories of miracle cures",
          "Help them find meaning and small goals while acknowledging challenges",
          "Avoid discussing the future entirely"
        ],
        correctAnswer: 2,
        category: "Hope and Resilience",
        explanation: "Realistic hope involves acknowledging challenges while helping patients find meaning, purpose, and achievable goals in their journey."
      },
      {
        id: 7,
        question: "What is the most effective way to support family members of cancer patients?",
        options: [
          "Tell them to stay strong for the patient",
          "Focus only on the patient's needs",
          "Recognize that they also need support and validation",
          "Keep them away from difficult conversations"
        ],
        correctAnswer: 2,
        category: "Family Support",
        explanation: "Family members experience their own grief, fear, and stress. They need support and validation just as much as the patient does."
      },
      {
        id: 8,
        question: "How should you handle a situation where a patient is in emotional crisis?",
        options: [
          "Handle it completely on your own",
          "Ignore it and hope it passes",
          "Assess safety, provide immediate support, and seek professional help",
          "Tell them to calm down"
        ],
        correctAnswer: 2,
        category: "Crisis Intervention",
        explanation: "Crisis intervention requires immediate safety assessment, supportive presence, and appropriate professional intervention when needed."
      },
      {
        id: 9,
        question: "What role does non-verbal communication play in cancer care?",
        options: [
          "It's not important as long as you say the right words",
          "It can communicate empathy, presence, and understanding",
          "It should be avoided to maintain professional boundaries",
          "It only matters during medical procedures"
        ],
        correctAnswer: 1,
        category: "Communication",
        explanation: "Non-verbal communication often conveys more than words. It can communicate empathy, presence, and understanding, which are crucial in cancer care."
      },
      {
        id: 10,
        question: "What is the key to long-term sustainable cancer care support?",
        options: [
          "Working as many hours as possible",
          "Focusing only on immediate problems",
          "Building systems, setting boundaries, and maintaining self-care",
          "Avoiding difficult emotions and conversations"
        ],
        correctAnswer: 2,
        category: "Sustainable Care",
        explanation: "Sustainable care requires building effective systems, maintaining healthy boundaries, and prioritizing self-care to prevent burnout."
      }
    ];
    setPostTestQuestions(sampleQuestions);
  };

  const handleAnswerSelect = (value) => {
    setAnswers({ ...answers, [currentQuestion]: parseInt(value) });
  };

  const handleNext = () => {
    if (currentQuestion < postTestQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleTestSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleTestSubmit = () => {
    setLoading(true);

    // Calculate score
    let correctAnswers = 0;
    postTestQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / postTestQuestions.length) * 100);
    setScore(finalScore);
    setTestCompleted(true);
    setResultsDialog(true);

    // Update user data
    const updatedUser = {
      ...userData,
      postTestCompleted: true,
      postTestScore: finalScore,
      postTestDate: new Date().toISOString()
    };
    setUserData(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));

    // Submit to backend
    submitTestResults(finalScore, answers);
    setLoading(false);
  };

  const submitTestResults = async (score, answers) => {
    try {
      await fetch('/api/submit-post-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: userData.id,
          score,
          answers,
          completedAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to submit test results:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    router.push('/');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getScoreMessage = (score) => {
    if (score >= 80) {
      return {
        title: "Excellent Knowledge Transfer!",
        message: "Your caregiver has done an outstanding job teaching you about emotional support and stress management. You've demonstrated excellent understanding of the concepts.",
        icon: <FaTrophy style={{ fontSize: '3rem', color: '#f59e0b' }} />
      };
    } else if (score >= 60) {
      return {
        title: "Good Understanding",
        message: "You've shown good comprehension of the support concepts. Consider reviewing some areas with your caregiver for even better outcomes.",
        icon: <FaCheckCircle style={{ fontSize: '3rem', color: '#10b981' }} />
      };
    } else {
      return {
        title: "More Learning Needed",
        message: "It looks like there's room for improvement. Your caregiver may need to spend more time reviewing the key concepts with you.",
        icon: <FaHeart style={{ fontSize: '3rem', color: '#ef4444' }} />
      };
    }
  };

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h4">Loading...</Typography>
      </Box>
    );
  }

  // Check if post-test is available
  const isPostTestAvailable = userData.postTestAvailable;
  const hasCompletedTest = userData.postTestCompleted;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Patient Dashboard - {userData.name}
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

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)', color: 'white' }}>
            <CardContent sx={{ py: 4 }}>
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                Welcome, {userData.name}!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Your journey towards emotional well-being and stress management
              </Typography>
              {userData.assignedCaregiver && (
                <Typography variant="body1" sx={{ mt: 2, opacity: 0.8 }}>
                  Your caregiver: <strong>{userData.assignedCaregiver.name}</strong>
                </Typography>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Post-Test Section */}
        <AnimatePresence>
          {!isPostTestAvailable ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Card sx={{ textAlign: 'center', py: 8 }}>
                <CardContent>
                  <FaLock style={{ fontSize: '4rem', color: '#6b7280', marginBottom: '2rem' }} />
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Post-Test Coming Soon
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                    Your caregiver is currently working through a 7-day emotional support program.
                    Once they complete the program, your post-test will become available.
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    This test will help evaluate how well your caregiver has shared their knowledge with you.
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ) : hasCompletedTest ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Card sx={{ textAlign: 'center', py: 6 }}>
                <CardContent>
                  <FaTrophy style={{ fontSize: '4rem', color: '#f59e0b', marginBottom: '2rem' }} />
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Test Completed!
                  </Typography>
                  <Typography variant="h2" sx={{ mb: 3, fontWeight: 700, color: getScoreColor(userData.postTestScore) }}>
                    {userData.postTestScore}%
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                    {getScoreMessage(userData.postTestScore).title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                    {getScoreMessage(userData.postTestScore).message}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                    Completed on: {new Date(userData.postTestDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ) : !testStarted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Card sx={{ textAlign: 'center', py: 6 }}>
                <CardContent>
                  <FaClipboardCheck style={{ fontSize: '4rem', color: '#2563eb', marginBottom: '2rem' }} />
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Post-Test Available
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                    Your caregiver has completed the 7-day program! Take this test to show how well
                    they&apos;ve shared their knowledge about emotional support and stress management with you.
                  </Typography>

                  <Grid container spacing={3} sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h4" color="primary">10</Typography>
                        <Typography variant="body2">Questions</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h4" color="primary">15</Typography>
                        <Typography variant="body2">Minutes</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h4" color="primary">1</Typography>
                        <Typography variant="body2">Attempt</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<FaClipboardCheck />}
                      onClick={() => setTestStarted(true)}
                      sx={{
                        px: 6,
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1d4ed8, #5b21b6)',
                        }
                      }}
                    >
                      Start Post-Test
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card sx={{ maxWidth: 800, mx: 'auto' }}>
                <CardContent sx={{ p: 4 }}>
                  {/* Progress Bar */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Question {currentQuestion + 1} of {postTestQuestions.length}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={((currentQuestion + 1) / postTestQuestions.length) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Question */}
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    {postTestQuestions[currentQuestion]?.question}
                  </Typography>

                  <Chip
                    label={postTestQuestions[currentQuestion]?.category}
                    color="primary"
                    size="small"
                    sx={{ mb: 4 }}
                  />

                  {/* Options */}
                  <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
                    <RadioGroup
                      value={answers[currentQuestion] || ''}
                      onChange={(e) => handleAnswerSelect(e.target.value)}
                    >
                      {postTestQuestions[currentQuestion]?.options.map((option, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Paper
                            sx={{
                              p: 2,
                              mb: 2,
                              cursor: 'pointer',
                              border: answers[currentQuestion] === index ? '2px solid #2563eb' : '1px solid #e0e0e0',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            onClick={() => handleAnswerSelect(index.toString())}
                          >
                            <FormControlLabel
                              value={index.toString()}
                              control={<Radio />}
                              label={option}
                              sx={{ width: '100%', m: 0 }}
                            />
                          </Paper>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </FormControl>

                  {/* Navigation */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      startIcon={<FaArrowLeft />}
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </Button>

                    <Button
                      variant="contained"
                      endIcon={currentQuestion === postTestQuestions.length - 1 ? <FaCheckCircle /> : <FaArrowRight />}
                      onClick={handleNext}
                      disabled={answers[currentQuestion] === undefined}
                      sx={{ px: 4 }}
                    >
                      {currentQuestion === postTestQuestions.length - 1 ? 'Submit Test' : 'Next'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Results Dialog */}
      <Dialog open={resultsDialog} onClose={() => setResultsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>
          Test Results
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {getScoreMessage(score).icon}
          <Typography variant="h3" sx={{ my: 3, fontWeight: 700, color: getScoreColor(score) }}>
            {score}%
          </Typography>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            {getScoreMessage(score).title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {getScoreMessage(score).message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => setResultsDialog(false)}
            sx={{ px: 4, py: 1.5 }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
