import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
  Grid,
  Container,
  CircularProgress
} from '@mui/material';
import { FaCheckCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

export default function DailyAssessment({ day, caregiverId, onComplete, onBack }) {
  const { language } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assessmentConfig, setAssessmentConfig] = useState(null);

  // Fallback assessment config in case API fails
  const getFallbackAssessmentConfig = (day) => {
    return {
      day: parseInt(day),
      type: 'quick_assessment',
      title: `Day ${day} - Quick Assessment`,
      description: 'Please answer these questions to help us personalize your content.',
      questions: [
        {
          id: 'fallback_1',
          text: 'How are you feeling today?',
          type: 'yesno',
          options: [
            { value: 1, label: 'Good' },
            { value: 0, label: 'Not so good' }
          ]
        },
        {
          id: 'fallback_2',
          text: 'Do you feel prepared for today\'s caregiving tasks?',
          type: 'yesno',
          options: [
            { value: 1, label: 'Yes' },
            { value: 0, label: 'No' }
          ]
        }
      ],
      maxScore: 2
    };
  };

  // Fetch assessment questions from API
  useEffect(() => {
    const fetchAssessmentQuestions = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Try API call first
        try {
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
          const url = `${baseUrl}/api/caregiver/assessment-questions?day=${day}`;
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-cache'
          });
          
          if (response.ok) {
            const data = await response.json();

            if (data.success && data.assessment) {
              setAssessmentConfig(data.assessment);
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          // API call failed, use fallback
        }
        
        // Fallback if API fails
        const fallbackConfig = getFallbackAssessmentConfig(day);
        setAssessmentConfig(fallbackConfig);
      } catch (error) {
        setAssessmentConfig(getFallbackAssessmentConfig(day));
        setError(`Using offline questions. Network error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (day !== undefined && day !== null) {
      fetchAssessmentQuestions();
    } else {
      setLoading(false);
    }
  }, [day]);

  // Show loading state
  if (loading) {
    return (
      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">Loading assessment questions...</Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Show error state
  if (error || !assessmentConfig) {
    return (
      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || `Assessment configuration not found for Day ${day}`}
            </Alert>
            <Button variant="outlined" onClick={onBack} startIcon={<FaArrowLeft />}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const currentQuestion = assessmentConfig.questions[currentQuestionIndex];
  const totalQuestions = assessmentConfig.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: parseInt(value)
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required data
      if (!caregiverId) {
        throw new Error('Caregiver ID is missing');
      }
      
      if (!assessmentConfig) {
        throw new Error('Assessment configuration is missing');
      }
      
      const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
      
      // Create questionTexts mapping from assessmentConfig
      const questionTexts = {};
      assessmentConfig.questions.forEach(question => {
        questionTexts[question.id] = question.text;
      });
      
      const submitData = {
        caregiverId,
        day: parseInt(day),
        assessmentType: assessmentConfig.type || 'quick_assessment',
        responses,
        totalScore,
        questionTexts
      };
      
      const response = await fetch('/api/caregiver/daily-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        onComplete?.(data);
      } else {
        setError(data.error || 'Failed to submit assessment');
      }
    } catch (error) {
      setError(`Submission error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreLevel = () => {
    const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
    const maxScore = assessmentConfig.maxScore;
    
    // Calculate percentage-based thresholds
    const lowThreshold = maxScore * 0.33;
    const highThreshold = maxScore * 0.67;

    if (totalScore <= lowThreshold) return 'low';
    if (totalScore >= highThreshold) return 'high';
    return 'moderate';
  };

  const isCurrentQuestionAnswered = responses[currentQuestion.id] !== undefined;
  const canProceed = isCurrentQuestionAnswered;

  return (
    <Container maxWidth="md">
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              {assessmentConfig.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {assessmentConfig.description}
            </Typography>

            {/* Progress */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </Typography>
                <Typography variant="body2">
                  {Math.round(progress)}% Complete
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Question */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {currentQuestion.text}
            </Typography>

            <FormControl component="fieldset">
              <RadioGroup
                value={responses[currentQuestion.id] || ''}
                onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
              >
                {(currentQuestion.options || currentQuestion.scale || []).map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Paper>

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={currentQuestionIndex === 0 ? onBack : handlePrevious}
              startIcon={<FaArrowLeft />}
              disabled={isSubmitting}
            >
              {currentQuestionIndex === 0 ? 'Back to Dashboard' : 'Previous'}
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {Array.from({ length: totalQuestions }, (_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: index <= currentQuestionIndex 
                      ? (responses[assessmentConfig.questions[index].id] !== undefined ? 'success.main' : 'primary.main')
                      : 'grey.300'
                  }}
                />
              ))}
            </Box>

            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={currentQuestionIndex === totalQuestions - 1 ? <FaCheckCircle /> : <FaArrowRight />}
              disabled={!canProceed || isSubmitting}
            >
              {isSubmitting 
                ? 'Submitting...' 
                : currentQuestionIndex === totalQuestions - 1 
                  ? 'Complete Assessment' 
                  : 'Next'
              }
            </Button>
          </Box>

          {/* Current Score Preview */}
          {Object.keys(responses).length > 0 && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    Current Score:
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6">
                    {Object.values(responses).reduce((sum, score) => sum + score, 0)} / {assessmentConfig.maxScore}
                  </Typography>
                </Grid>
                <Grid item>
                  <Chip 
                    label={getScoreLevel().toUpperCase()}
                    size="small"
                    color={
                      getScoreLevel() === 'low' ? 'success' :
                      getScoreLevel() === 'moderate' ? 'warning' : 'error'
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}