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
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { getTranslation, translations } from '../../lib/translations';

export default function PatientDashboard() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentLanguage } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState(null);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [retakeStatus, setRetakeStatus] = useState('none');
  const [retakeScheduledFor, setRetakeScheduledFor] = useState(null);
  const [questionnaireAttempts, setQuestionnaireAttempts] = useState([]);
  const [retakeCompletedAt, setRetakeCompletedAt] = useState(null);

  // Translation helper using context language
  const t = (key) => getTranslation(key, currentLanguage);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const storedUserData = localStorage.getItem('userData');
      
      if (!storedUserData) {
        router.push('/login');
        return;
      }

      try {
        const user = JSON.parse(storedUserData);
        
        // Verify user is patient and assigned
        if (user.userType !== 'patient' || !user.isAssigned) {
          localStorage.removeItem('userData');
          router.push('/login');
          return;
        }

        setUserData(user);
        
        // Update URL with MongoDB ID if available
        if (user.mongoDbId && !router.asPath.includes(user.mongoDbId)) {
          router.push(`/patient/dashboard?id=${user.mongoDbId}`, undefined, { shallow: true });
        }
        
        // Always fetch dashboard data to get latest questionnaire status from database
        await fetchQuestionnaireData(user.id);
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('userData');
        router.push('/login');
      }
    };

    if (router.isReady) {
      checkAuth();
    }
  }, [router.isReady]);

  const fetchQuestionnaireData = async (patientId) => {
    try {
      console.log(`[Dashboard] Fetching questionnaire for patientId: ${patientId}`);
      const response = await fetch(`/api/patient/dashboard?patientId=${patientId}&lang=${currentLanguage}`);
      const data = await response.json();

      console.log('[Dashboard] API Response:', {
        success: data.success,
        hasPatient: !!data.data?.patient,
        hasQuestionnaire: !!data.data?.questionnaire
      });

      if (data.success && data.data && data.data.patient) {
        const apiPatientData = data.data.patient;
        const statusFromApi = apiPatientData.questionnaireRetakeStatus || 'none';
        const scheduledFor = apiPatientData.questionnaireRetakeScheduledFor || null;
        const attemptsFromApi = apiPatientData.questionnaireAttempts || [];
        const completedAt = apiPatientData.questionnaireRetakeCompletedAt || null;
        const isRetakeActive = statusFromApi === 'open';
        
        // Update userData with fresh data from API (all patient details + questionnaire status)
        const updatedUserData = {
          ...userData,
          id: apiPatientData.id || userData?.id,
          name: apiPatientData.name || userData?.name,
          age: apiPatientData.age || userData?.age,
          email: apiPatientData.email || userData?.email,
          phone: apiPatientData.phone || userData?.phone,
          cancerType: apiPatientData.cancerType || userData?.cancerType,
          stage: apiPatientData.stage || userData?.stage,
          treatmentStatus: apiPatientData.treatmentStatus || userData?.treatmentStatus,
          assignedCaregiver: apiPatientData.assignedCaregiver || userData?.assignedCaregiver,
          questionnaireEnabled: apiPatientData.questionnaireEnabled,
          lastQuestionnaireSubmission: apiPatientData.lastQuestionnaireSubmission
        };
        setUserData(updatedUserData);
        setRetakeStatus(statusFromApi);
        setRetakeScheduledFor(scheduledFor);
        setQuestionnaireAttempts(attemptsFromApi);
        setRetakeCompletedAt(completedAt);
        console.log('[Dashboard] Updated userData with id:', updatedUserData.id);

        // If questionnaire is enabled and exists, process it
        if (apiPatientData.questionnaireEnabled && data.data.questionnaire) {
          const questionCount = data.data.questionnaire.questions?.length;
          console.log(`✅ [Dashboard] Questionnaire found with ${questionCount} questions`);
          setQuestionnaire(data.data.questionnaire);

          // Check if patient has already submitted valid questionnaire responses
          const existingAnswers = apiPatientData.questionnaireAnswers;
          
          console.log('[Dashboard] Existing answers:', existingAnswers);
          console.log('[Dashboard] Is array:', Array.isArray(existingAnswers));
          console.log('[Dashboard] Length:', existingAnswers?.length);
          
          // Validate answers - must be valid questionnaire responses, not corrupted data
          // Valid answer has: questionId, questionText, answer
          // Corrupted answer has: name, phone, age, gender, cancerType (patient object properties)
          const hasValidAnswers = Array.isArray(existingAnswers) && 
            existingAnswers.length > 0 && 
            existingAnswers.every(answer => 
              answer && 
              answer.questionId && 
              answer.questionText && 
              answer.answer !== undefined && 
              !answer.name && 
              !answer.phone && 
              !answer.gender
            );
          
          console.log('[Dashboard] Has valid answers:', hasValidAnswers);
          
          const shouldShowSubmittedState = hasValidAnswers && !isRetakeActive;
          const previousAnswerMap = hasValidAnswers
            ? existingAnswers.reduce((acc, answer) => {
                acc[answer.questionId] = answer.answer;
                return acc;
              }, {})
            : {};

          if (shouldShowSubmittedState) {
            console.log(`[Dashboard] ✅ Patient HAS submitted - showing ${existingAnswers.length} valid answers`);
            setIsSubmitted(true);
            setSubmittedAnswers(existingAnswers);
          } else {
            console.log('[Dashboard] ❌ Showing questionnaire form for new submission');
            const initialAnswers = {};
            data.data.questionnaire.questions.forEach(question => {
              if (question.type === 'checkbox') {
                const fallback = isRetakeActive && hasValidAnswers ? (previousAnswerMap[question._id] || []) : [];
                initialAnswers[question._id] = Array.isArray(fallback) ? fallback : [];
              } else {
                const fallback = isRetakeActive && hasValidAnswers ? previousAnswerMap[question._id] : '';
                initialAnswers[question._id] = fallback ?? '';
              }
            });
            setAnswers(initialAnswers);
            setIsSubmitted(false);
            if (isRetakeActive && hasValidAnswers) {
              setSubmittedAnswers(existingAnswers);
            }
          }
        } else {
          console.warn('❌ [Dashboard] Questionnaire not enabled or not found');
          setQuestionnaire(null);
          setIsSubmitted(false);
        }
      } else {
        console.error('[Dashboard] API response invalid:', data);
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching questionnaire:', error);
      showAlert('Failed to load questionnaire', 'error');
    } finally {
      setLoading(false);
    }
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

  const handleEditAnswers = () => {
    // Load submitted answers into the form
    if (submittedAnswers) {
      const loadedAnswers = {};
      submittedAnswers.forEach(item => {
        loadedAnswers[item.questionId] = item.answer;
      });
      setAnswers(loadedAnswers);
    }
    setIsEditing(true);
  };

  const validateAnswers = () => {
    if (!questionnaire) return true;
    
    const requiredQuestions = questionnaire.questions.filter(q => q.required);
    
    for (const question of requiredQuestions) {
      const answer = answers[question._id];
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      showAlert('Please answer all required questions', 'error');
      return;
    }

    setSubmitting(true);

    try {
      // Ensure we have a valid patientId - try both id and patientId properties
      const patientId = userData?.id || userData?.patientId;
      
      if (!patientId) {
        console.error('[Dashboard] ERROR: No patientId found in userData:', userData);
        showAlert('Patient ID not found', 'error');
        setSubmitting(false);
        return;
      }

      // Build answers array - only include non-empty answers
      const answersToSubmit = questionnaire.questions
        .filter(question => {
          const answer = answers[question._id];
          return answer !== undefined && answer !== '' && (Array.isArray(answer) ? answer.length > 0 : true);
        })
        .map(question => ({
          questionId: question._id,
          questionText: question.questionText,
          answer: answers[question._id],
          submittedAt: new Date().toISOString()
        }));

      if (answersToSubmit.length === 0) {
        console.error('[Dashboard] ERROR: No valid answers to submit');
        showAlert('Please answer all required questions', 'error');
        setSubmitting(false);
        return;
      }

      const payload = {
        patientId,
        answers: answersToSubmit
      };

      console.log('[Dashboard] Submitting questionnaire:');
      console.log('[Dashboard] patientId:', payload.patientId);
      console.log('[Dashboard] answers count:', payload.answers.length);
      console.log('[Dashboard] Sample answer:', payload.answers[0]);
      console.log('[Dashboard] Full payload:', payload);

      const response = await fetch('/api/patient/questionnaire/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('[Dashboard] Response status:', response.status);
      
      const data = await response.json();
      
      console.log('[Dashboard] Response data:', data);

      if (data.success) {
        // Show "Saved" message temporarily
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2000);
        
        // Set submitted state and store submitted answers
        setIsSubmitted(true);
        const submittedAnswersData = payload.answers;
        setSubmittedAnswers(submittedAnswersData);
        const attemptNumber = data.data?.attemptNumber || 1;
        const submissionTimestamp = new Date().toISOString();
        const attemptRecord = {
          attemptNumber,
          submittedAt: submissionTimestamp,
          answers: submittedAnswersData,
        };
        setQuestionnaireAttempts(prev => {
          const updated = [...prev];
          updated[attemptNumber - 1] = attemptRecord;
          return updated;
        });
        if (attemptNumber === 2) {
          setRetakeStatus('completed');
          setRetakeCompletedAt(submissionTimestamp);
        } else {
          setRetakeStatus('none');
        }
        setRetakeScheduledFor(null);
        
        // Exit editing mode and show success card
        setIsEditing(false);
        
        // Reset answers
        const initialAnswers = {};
        questionnaire.questions.forEach(question => {
          if (question.type === 'checkbox') {
            initialAnswers[question._id] = [];
          } else {
            initialAnswers[question._id] = '';
          }
        });
        setAnswers(initialAnswers);

        // Update user data
        const updatedUser = {
          ...userData,
          lastQuestionnaireSubmission: submissionTimestamp,
          questionnaireEnabled: false
        };
        setUserData(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      } else {
        showAlert(data.message || 'Failed to submit questionnaire', 'error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      showAlert('Error submitting questionnaire', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    router.push('/login');
  };

  // Helper function to get translated question text
  const getQuestionText = (question, index) => {
    // Try to get translation based on question order (q1, q2, etc)
    const translationKey = `q${index + 1}`;
    const translated = t(translationKey);
    // DEBUG: log translation attempts for troubleshooting (temporary)
    try {
      // only log for indices known to have issues
      if ([10,11,12,13,25].includes(index)) {
        console.log('[getQuestionText] index', index, 'key', translationKey, 'lang', currentLanguage, 'translated', translated, 'dbText', question.questionText);
      }
    } catch (e) {
      // ignore
    }

    // If translation exists and is different from the key, use it
    if (translated !== translationKey) return translated;

    // Fallback #2: Try to match the question's English text to a translation key directly
    try {
      const enMap = translations.en || {};
      const normalize = s => (s || '').toString().trim().toLowerCase();
      const qTextNorm = normalize(question.questionText);
      for (let i = 1; i <= 26; i++) {
        const key = `q${i}`;
        const enText = enMap[key];
        if (!enText) continue;
        const enNorm = normalize(enText);
        // match if equal or one contains the other (loose match)
        if (enNorm === qTextNorm || enNorm.includes(qTextNorm) || qTextNorm.includes(enNorm)) {
          const translatedByKey = getTranslation(key, currentLanguage);
          if (translatedByKey && translatedByKey !== enText) return translatedByKey;
        }
      }
    } catch (e) {
      // ignore
    }

    // Final fallback: return the question text from database
    return question.questionText;
  };

  // Prefer translating options by their option-set/index rather than by exact English label.
  // This handles variations in stored option text and ensures consistent translations.
  const getOptionText = (option, question = null, optIndex = null) => {
    // Define canonical option sets (ordered)
    const OPTION_SETS = {
      qualityOfLife: ['Very poor', 'Poor', 'Neither poor nor good', 'Good', 'Very good'],
      satisfaction: ['Very dissatisfied', 'Dissatisfied', 'Neither satisfied nor dissatisfied', 'Satisfied', 'Very satisfied'],
      extent: ['Not at all', 'A little', 'A moderate amount', 'Very much', 'An extreme amount'],
    };

    // Translation keys by set and index
    const OPTION_KEYS = {
      qualityOfLife: ['veryPoor', 'poor', 'neitherPoorNorGood', 'good', 'veryGood'],
      satisfaction: ['veryDissatisfied', 'dissatisfied', 'neitherSatisfiedNorDissatisfied', 'satisfied', 'verySatisfied'],
      extent: ['notAtAll', 'aLittle', 'aModerateAmount', 'veryMuch', 'anExtremeAmount'],
    };

    // Helper to normalize string for loose matching
    const normalize = (s) => (s || '').toString().trim().toLowerCase();

    // If a question and option index are provided, try to detect set by comparing lengths and labels
    if (question && typeof optIndex === 'number') {
      // Try to detect which canonical set matches this question's options
      const opts = question.options || [];
      const normalizedOpts = opts.map(normalize);

      for (const [setName, canonical] of Object.entries(OPTION_SETS)) {
        const canonNorm = canonical.map(normalize);
        // quick length check then element-wise fuzzy match (allow substrings/prefixes)
        if (canonNorm.length === normalizedOpts.length) {
          const matches = canonNorm.every((c, i) => {
            const opt = normalizedOpts[i];
            // match if exact or if canonical phrase is contained within the option text
            return c === opt || opt.includes(c) || c.includes(opt);
          });
          if (matches) {
            const key = OPTION_KEYS[setName][optIndex];
            const translated = t(key);
            return translated !== key ? translated : option;
          }
        }
      }
    }

    // Fallback: try to match option text loosely to known canonical items
    const optNorm = normalize(option);
    for (const [setName, canonical] of Object.entries(OPTION_SETS)) {
      for (let i = 0; i < canonical.length; i++) {
        const canon = normalize(canonical[i]);
        // loose match: either exact or canonical phrase contained in option text
        if (optNorm === canon || optNorm.includes(canon) || canon.includes(optNorm)) {
          const key = OPTION_KEYS[setName][i];
          const translated = t(key);
          return translated !== key ? translated : option;
        }
      }
    }

    // Last fallback: map standalone placeholder
    if (optNorm === normalize('Select an option')) {
      const translated = t('selectAnOption');
      return translated !== 'selectAnOption' ? translated : option;
    }

    // If nothing matched, return original option
    return option;
  };

  const renderQuestion = (question, index) => {
    const questionId = question._id;
    const value = answers[questionId];
    const questionText = getQuestionText(question, index);

    switch (question.type) {
      case 'text':
        return (
          <TextField
            key={questionId}
            fullWidth
            label={questionText}
            value={value || ''}
            onChange={(e) => handleAnswerChange(questionId, e.target.value, 'text')}
            required={question.required}
            sx={{ mb: 3 }}
            variant="outlined"
          />
        );

      case 'textarea':
        return (
          <TextField
            key={questionId}
            fullWidth
            label={questionText}
            value={value || ''}
            onChange={(e) => handleAnswerChange(questionId, e.target.value, 'textarea')}
            required={question.required}
            multiline
            rows={4}
            sx={{ mb: 3 }}
            variant="outlined"
          />
        );

      case 'radio':
        return (
          <FormControl key={questionId} fullWidth sx={{ mb: 0 }}>
            <FormLabel component="legend" required={question.required} sx={{ mb: 1.5, fontWeight: 600 }}>
              {questionText}
            </FormLabel>
            <RadioGroup
              value={value || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value, 'radio')}
            >
              {question.options?.map((option, optIdx) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={getOptionText(option, question, optIdx)}
                  sx={{ mb: 1 }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl key={questionId} fullWidth sx={{ mb: 0 }}>
            <FormLabel component="legend" required={question.required} sx={{ mb: 1.5, fontWeight: 600 }}>
              {questionText}
            </FormLabel>
            <FormGroup>
              {question.options?.map((option, optIdx) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={(value || []).includes(option)}
                      onChange={(e) => {
                        const currentValues = value || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option]
                          : currentValues.filter(v => v !== option);
                        handleAnswerChange(questionId, newValues, 'checkbox');
                      }}
                    />
                  }
                  label={getOptionText(option, question, optIdx)}
                  sx={{ mb: 1 }}
                />
              ))}
            </FormGroup>
          </FormControl>
        );

      case 'select':
        return (
          <FormControl key={questionId} fullWidth sx={{ mb: 3 }}>
            <FormLabel required={question.required}>
              {questionText}
            </FormLabel>
            <Select
              value={value || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value, 'select')}
            >
              <MenuItem value="">{getOptionText('Select an option')}</MenuItem>
              {question.options?.map((option, optIdx) => (
                <MenuItem key={option} value={option}>
                  {getOptionText(option, question, optIdx)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'scale':
        return (
          <FormControl key={questionId} fullWidth sx={{ mb: 3 }}>
            <FormLabel component="legend" required={question.required}>
              {questionText}
            </FormLabel>
            <RadioGroup
              row
              value={value || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value, 'scale')}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <FormControlLabel
                  key={num}
                  value={num.toString()}
                  control={<Radio />}
                  label={num.toString()}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>{t('loading')}</Typography>
      </Box>
    );
  }

  if (!userData) {
    console.warn('[Dashboard] No userData found');
    return null;
  }

  // Debug logging before render
  console.log('[Dashboard] About to render:');
  console.log('  userData:', userData);
  console.log('  userData.id:', userData?.id);
  console.log('  userData.patientId:', userData?.patientId);
  console.log('  userData.questionnaireEnabled:', userData?.questionnaireEnabled);
  console.log('  questionnaire exists:', !!questionnaire);
  console.log('  Will show questionnaire?:', userData?.questionnaireEnabled && questionnaire);

  const maxQuestionnaireAttempts = 2;
  const totalRecordedAttempts = Array.isArray(questionnaireAttempts) ? questionnaireAttempts.length : 0;
  const baselineAttempt = totalRecordedAttempts === 0 ? 1 : totalRecordedAttempts;
  const activeAttemptNumber = retakeStatus === 'open'
    ? Math.min(totalRecordedAttempts + 1, maxQuestionnaireAttempts)
    : Math.min(baselineAttempt, maxQuestionnaireAttempts);
  const scheduledDateLabel = retakeScheduledFor ? new Date(retakeScheduledFor).toLocaleString() : null;
  const completedDateLabel = retakeCompletedAt ? new Date(retakeCompletedAt).toLocaleString() : null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('patientDashboard')}
          </Typography>

          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            {t('logout')}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.light' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1">
                    {t('welcome')}, {userData?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('patientDashboard')}
                  </Typography>
                  {userData?.assignedCaregiver && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {t('assignedCaregiver')}: <strong>{userData.assignedCaregiver.name}</strong>
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Patient Information Card - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card sx={{ mb: 4, boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ mr: 2, fontSize: 28, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {t('patientInformation')}
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      {t('patientID')}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 600, color: 'primary.main' }}>
                      {userData?.id}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      {t('fullName')}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                      {userData?.name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      {t('age')}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                      {userData?.age || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      {t('email')}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 600, fontSize: '0.9rem', wordBreak: 'break-word' }}>
                      {userData?.email || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      {t('phone')}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                      {userData?.phone || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      {t('cancerType')}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                      {userData?.cancerType || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      {t('stage')}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                      {userData?.stage || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      {t('treatmentStatus')}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                      {userData?.treatmentStatus || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                {userData?.diagnosisDate && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        {t('diagnosisDate')}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                        {new Date(userData.diagnosisDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {userData?.assignedCaregiver && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        {t('caregiver')}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                        {userData.assignedCaregiver.name}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alert Messages */}
        {alert.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert({ ...alert, show: false })}>
              {alert.message}
            </Alert>
          </motion.div>
        )}

        {retakeStatus === 'scheduled' && scheduledDateLabel && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Second assessment scheduled for {scheduledDateLabel}. Access will reopen automatically at that time.
          </Alert>
        )}

        {retakeStatus === 'open' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your second assessment is now available. Attempt {activeAttemptNumber} of {maxQuestionnaireAttempts}.
          </Alert>
        )}

        {retakeStatus === 'completed' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            You have completed both assessments{completedDateLabel ? ` (${completedDateLabel})` : ''}.
          </Alert>
        )}

        {/* Questionnaire Section */}
        {userData.questionnaireEnabled && questionnaire ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isSubmitted && !isEditing ? (
              // Show submitted state
              <Card sx={{ mb: 4, bgcolor: 'success.light', border: '2px solid', borderColor: 'success.main' }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 56, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'success.dark' }}>
                    {t('questionnairesSubmittedSuccessfully')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {t('youHaveSubmittedThePreTest')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Attempt {Math.min(questionnaireAttempts.length, maxQuestionnaireAttempts)} of {maxQuestionnaireAttempts}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                    {t('submittedOn')}: {submittedAnswers?.[0]?.submittedAt ? new Date(submittedAnswers[0].submittedAt).toLocaleString() : t('today')}
                  </Typography>
                  
                  {/* Review/Edit Button */}
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleEditAnswers}
                    startIcon={<RefreshIcon />}
                  >
                    {t('reviewEditAnswers')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Show questionnaire form (new or edit mode)
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AssignmentIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {questionnaire?.title}
                        {isEditing && <Chip label={t('editing')} size="small" color="info" sx={{ ml: 2 }} />}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {questionnaire?.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Attempt {activeAttemptNumber} of {maxQuestionnaireAttempts}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Questions */}
                  <Box>
                    {questionnaire?.questions.map((question, index) => (
                      <Box key={question._id} sx={{ mb: 4, p: 2.5, bgcolor: '#f8f9fa', borderRadius: 1.5, border: '1px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Chip
                            label={`${t('questionLabel')}${index + 1}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          {question.required && (
                            <Chip label={t('required')} size="small" color="error" variant="outlined" />
                          )}
                        </Box>
                        <Box sx={{ backgroundColor: '#fff', p: 2, borderRadius: 1 }}>
                          {renderQuestion(question, index)}
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Submit/Save Button */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleSubmit}
                      disabled={submitting || showSavedMessage}
                      startIcon={<SendIcon />}
                      fullWidth
                      sx={{
                        bgcolor: showSavedMessage ? 'success.main' : 'primary.main',
                        '&:hover': {
                          bgcolor: showSavedMessage ? 'success.dark' : 'primary.dark'
                        }
                      }}
                    >
                      {showSavedMessage ? t('saved') : (submitting ? t('submitting') : isEditing ? t('saveChanges') : t('submitQuestionnaire'))}
                    </Button>
                    {isEditing && (
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => setIsEditing(false)}
                        fullWidth
                      >
                        {t('cancel')}
                      </Button>
                    )}
                  </Box>

                  {/* Last Submission Info */}
                  {userData?.lastQuestionnaireSubmission && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                      {t('lastSubmitted')}: {new Date(userData.lastQuestionnaireSubmission).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">
                {isSubmitted && !userData?.questionnaireEnabled 
                  ? t('youHaveSubmittedThePreTest')
                  : t('noQuestionnaireAvailable')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {!isSubmitted && t('pleaseCheckBackLater')}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
