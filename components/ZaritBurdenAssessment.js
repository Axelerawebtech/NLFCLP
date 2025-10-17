import { useState } from 'react';
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
  Alert
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

  const questions = [
    {
      id: 'question1',
      text: getTranslation(currentLanguage, 'zaritQuestion1'),
      englishText: "Do you feel that your relative asks for more help than he or she needs?"
    },
    {
      id: 'question2', 
      text: getTranslation(currentLanguage, 'zaritQuestion2'),
      englishText: "Do you feel that your relative currently affects your relationship with other family members?"
    },
    {
      id: 'question3',
      text: getTranslation(currentLanguage, 'zaritQuestion3'), 
      englishText: "Do you feel that your relative is dependent upon you?"
    },
    {
      id: 'question4',
      text: getTranslation(currentLanguage, 'zaritQuestion4'),
      englishText: "Do you feel that you don't have as much privacy as you would like, because of your relative?"
    },
    {
      id: 'question5',
      text: getTranslation(currentLanguage, 'zaritQuestion5'),
      englishText: "Do you feel that your social life has suffered because you are caring for your relative?"
    },
    {
      id: 'question6',
      text: getTranslation(currentLanguage, 'zaritQuestion6'),
      englishText: "Do you feel that your relative seems to expect you to take care of him or her, as if you were the only one he or she could depend on?"
    },
    {
      id: 'question7',
      text: getTranslation(currentLanguage, 'zaritQuestion7'),
      englishText: "Do you wish that you could just leave the care of your relative to someone else?"
    }
  ];

  const options = [
    { value: 0, label: getTranslation(currentLanguage, 'never') || 'NEVER' },
    { value: 1, label: getTranslation(currentLanguage, 'rarely') || 'RARELY' },
    { value: 2, label: getTranslation(currentLanguage, 'sometimes') || 'SOMETIMES' },
    { value: 3, label: getTranslation(currentLanguage, 'quiteFrequently') || 'QUITE FREQUENTLY' },
    { value: 4, label: getTranslation(currentLanguage, 'nearlyAlways') || 'NEARLY ALWAYS' }
  ];

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Calculate total score (each question 0-4 points = 0-28 total)
      const answers = Object.values(responses);
      const totalScore = answers.reduce((sum, score) => sum + score, 0);
      
      // Determine burden level based on score
      let burdenLevel;
      if (totalScore <= 10) {
        burdenLevel = 'mild';
      } else if (totalScore <= 20) {
        burdenLevel = 'moderate';
      } else {
        burdenLevel = 'severe';
      }

      console.log('Submitting burden test:', { totalScore, burdenLevel, answers });

      // Submit to new API
      const response = await fetch('/api/caregiver/submit-burden-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiverId,
          answers,
          totalScore,
          burdenLevel
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Burden test submitted successfully:', data);
        // Redirect to dashboard to see video
        window.location.href = '/caregiver/dashboard';
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

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionData = questions[currentQuestion];
  const hasResponse = responses[currentQuestionData.id] !== undefined;

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
            <RadioGroup
              value={responses[currentQuestionData.id] || ''}
              onChange={(e) => handleResponse(e.target.value)}
              sx={{ gap: 1 }}
            >
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 20 }}>
                        {option.value}
                      </Typography>
                      <Typography variant="body1">
                        {option.label}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    margin: 0,
                    padding: '8px 16px',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
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