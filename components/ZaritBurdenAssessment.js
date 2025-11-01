import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
  Card,
  LinearProgress,
  Alert,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

const ZaritBurdenAssessment = ({ onComplete, caregiverId }) => {
  const { currentLanguage } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [scoreRanges, setScoreRanges] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Map language codes
  const getLanguageKey = () => {
    const map = { en: 'english', kn: 'kannada', hi: 'hindi' };
    return map[currentLanguage] || 'english';
  };

  // Load burden assessment configuration from admin settings
  useEffect(() => {
    const loadBurdenAssessmentConfig = async () => {
      try {
        setLoadingConfig(true);
        const response = await fetch('/api/admin/burden-assessment/config');
        const data = await response.json();
        
        if (data.success && data.config) {
          console.log('📋 Loaded burden assessment config:', data.config);
          
          // Filter enabled questions and map to component format
          const enabledQuestions = data.config.questions
            .filter(q => q.enabled !== false)
            .map((q, index) => ({
              id: `question${q.id || index + 1}`,
              questionData: q,
              text: q.questionText[getLanguageKey()] || q.questionText.english,
              englishText: q.questionText.english,
              options: q.options.map((opt, optIndex) => ({
                value: opt.score,
                label: opt.optionText[getLanguageKey()] || opt.optionText.english,
                score: opt.score
              }))
            }));
          
          setQuestions(enabledQuestions);
          setScoreRanges(data.config.scoreRanges);
          
          console.log('✅ Loaded questions:', enabledQuestions.length);
          console.log('✅ Score ranges:', data.config.scoreRanges);
        } else {
          throw new Error('Invalid config response');
        }
      } catch (err) {
        console.error('Error loading burden assessment config:', err);
        setError('Failed to load assessment questions. Please try again later.');
        
        // Fallback to basic questions if config fails
        setQuestions(getFallbackQuestions());
        setScoreRanges(getFallbackScoreRanges());
      } finally {
        setLoadingConfig(false);
      }
    };

    loadBurdenAssessmentConfig();
  }, [currentLanguage]);

  // Fallback questions if config loading fails
  const getFallbackQuestions = () => [
    {
      id: 'question1',
      text: getTranslation(currentLanguage, 'zaritQuestion1'),
      englishText: "Do you feel that your relative asks for more help than he or she needs?",
      options: [
        { value: 0, label: getTranslation(currentLanguage, 'never') || 'Never', score: 0 },
        { value: 1, label: getTranslation(currentLanguage, 'rarely') || 'Rarely', score: 1 },
        { value: 2, label: getTranslation(currentLanguage, 'sometimes') || 'Sometimes', score: 2 },
        { value: 3, label: getTranslation(currentLanguage, 'quiteFrequently') || 'Quite Frequently', score: 3 },
        { value: 4, label: getTranslation(currentLanguage, 'nearlyAlways') || 'Nearly Always', score: 4 }
      ]
    }
  ];

  // Fallback score ranges
  const getFallbackScoreRanges = () => ({
    mild: { min: 0, max: 40, burdenLevel: 'mild' },
    moderate: { min: 41, max: 60, burdenLevel: 'moderate' },
    severe: { min: 61, max: 88, burdenLevel: 'severe' }
  });

  console.log('Current language:', currentLanguage);
  console.log('Questions loaded:', questions.length);
  console.log('Score ranges:', scoreRanges);

  const handleResponse = (value) => {
    const newResponses = {
      ...responses,
      [questions[currentQuestion].id]: parseInt(value)
    };
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Calculate burden level based on admin-defined score ranges
  const calculateBurdenLevel = (totalScore) => {
    if (!scoreRanges) {
      // Fallback calculation with correct score ranges
      if (totalScore <= 40) return 'mild';
      if (totalScore <= 60) return 'moderate';
      return 'severe';
    }

    // Use admin-defined score ranges
    for (const [rangeName, range] of Object.entries(scoreRanges)) {
      if (totalScore >= range.min && totalScore <= range.max) {
        return range.burdenLevel || 'mild';
      }
    }
    
    // Default fallback
    return 'moderate';
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Calculate total score using the individual question option scores
      const answers = Object.entries(responses).map(([questionId, selectedValue]) => {
        const questionIndex = questions.findIndex(q => q.id === questionId);
        const question = questions[questionIndex];
        const selectedOption = question.options.find(opt => opt.value === selectedValue);
        
        return {
          questionId,
          questionIndex: questionIndex + 1,
          selectedValue,
          score: selectedOption ? selectedOption.score : 0
        };
      });
      
      const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
      const burdenLevel = calculateBurdenLevel(totalScore);

      console.log('📊 Assessment Results:', {
        totalAnswers: answers.length,
        totalQuestions: questions.length,
        totalScore,
        burdenLevel,
        answers,
        scoreRanges
      });

      // Submit to burden test API
      const response = await fetch('/api/caregiver/submit-burden-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiverId,
          answers: responses, // Keep original responses format for compatibility
          answerDetails: answers, // Include detailed answer breakdown
          totalScore,
          burdenLevel,
          maxPossibleScore: questions.length * 4, // Assuming max score per question is 4
          questionsCompleted: questions.length
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Burden test submitted successfully:', data);
        
        // Call completion handler if provided
        if (onComplete) {
          onComplete({
            totalScore,
            burdenLevel,
            answers,
            data
          });
        } else {
          // Redirect to dashboard to see results
          window.location.href = '/caregiver/dashboard';
        }
      } else {
        setError(data.error || data.message || 'Failed to submit assessment');
      }
    } catch (error) {
      console.error('Assessment submission error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while config loads
  if (loadingConfig) {
    return (
      <Card sx={{ maxWidth: 800, mx: 'auto', p: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Loading Assessment Questions...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fetching the latest burden assessment configuration
        </Typography>
      </Card>
    );
  }

  // Show error if no questions loaded
  if (questions.length === 0) {
    return (
      <Card sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Assessment Unavailable
          </Typography>
          <Typography variant="body2">
            {error || 'No assessment questions are currently available. Please contact the administrator.'}
          </Typography>
        </Alert>
      </Card>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionData = questions[currentQuestion];
  const hasResponse = responses[currentQuestionData.id] !== undefined;
  const currentOptions = currentQuestionData.options || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'zaritBurdenAssessment') || 'Caregiver Burden Assessment'}
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
          {getTranslation(currentLanguage, 'zaritAssessmentInstructions') || 'Please answer the following questions honestly. This will help us provide you with the most appropriate support.'}
        </Typography>

        {/* Progress Bar */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'question') || 'Question'} {currentQuestion + 1} {getTranslation(currentLanguage, 'of') || 'of'} {questions.length}
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>

        {/* Current Question */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            {currentQuestion + 1}. {currentQuestionData.text || currentQuestionData.englishText}
          </Typography>

          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
              Please select your answer:
            </FormLabel>
            <RadioGroup
              value={responses[currentQuestionData.id]?.toString() || ''}
              onChange={(e) => handleResponse(e.target.value)}
              sx={{ gap: 2 }}
            >
              {currentOptions.map((option, index) => (
                <FormControlLabel
                  key={`${currentQuestionData.id}-option-${index}`}
                  value={option.value.toString()}
                  control={
                    <Radio 
                      sx={{ 
                        color: 'primary.main',
                        '&.Mui-checked': { color: 'primary.main' }
                      }} 
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'bold', 
                          minWidth: 20,
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px'
                        }}
                      >
                        {option.score}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {option.label}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    border: '2px solid',
                    borderColor: responses[currentQuestionData.id]?.toString() === option.value.toString() ? 'primary.main' : '#e0e0e0',
                    borderRadius: 2,
                    margin: 0,
                    padding: '12px 16px',
                    bgcolor: responses[currentQuestionData.id]?.toString() === option.value.toString() ? 'primary.light' : 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: 'primary.main'
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            {getTranslation(currentLanguage, 'previous') || 'Previous'}
          </Button>

          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!hasResponse || isSubmitting}
            sx={{ minWidth: 120 }}
          >
            {isSubmitting 
              ? (getTranslation(currentLanguage, 'submitting') || 'Submitting...') 
              : currentQuestion === questions.length - 1 
                ? (getTranslation(currentLanguage, 'submit') || 'Submit')
                : (getTranslation(currentLanguage, 'next') || 'Next')
            }
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
};

export default ZaritBurdenAssessment;