import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
  LinearProgress,
  Alert,
  Paper,
  Grid
} from '@mui/material';
import { FaClipboardCheck, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const zaritQuestions = [
  {
    id: 1,
    question: "Do you feel that your relative asks for more help than he or she needs?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 2,
    question: "Do you feel that, because of the time you spend with your relative, you don't have enough time for yourself?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 3,
    question: "Do you feel stressed between caring for your relative and trying to meet other responsibilities for your family or work?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 4,
    question: "Do you feel embarrassed about your relative's behavior?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 5,
    question: "Do you feel angry when you are around your relative?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 6,
    question: "Do you feel that your relative currently affects your relationship with other family members?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 7,
    question: "Are you afraid about what the future holds for your relative?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 8,
    question: "Do you feel that your relative is dependent upon you?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 9,
    question: "Do you feel strained when you are around your relative?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 10,
    question: "Do you feel that your health has suffered because of your involvement with your relative?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 11,
    question: "Do you feel that you don't have as much privacy as you would like, because of your relative?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 12,
    question: "Do you feel that your social life has suffered because you are caring for your relative?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 13,
    question: "Do you feel uncomfortable having your friends over because of your relative?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 14,
    question: "Do you feel that your relative seems to expect you to take care of him or her, as if you were the only one he or she could depend on?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 15,
    question: "Do you feel that you don't have enough money to care for your relative, in addition to the rest of your expenses?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 16,
    question: "Do you feel that you will be unable to take care of your relative much longer?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 17,
    question: "Do you feel that you have lost control of your life since your relative's illness?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 18,
    question: "Do you wish that you could just leave the care of your relative to someone else?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 19,
    question: "Do you feel uncertain about what to do about your relative?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 20,
    question: "Do you feel that you should be doing more for your relative?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 21,
    question: "Do you feel that you could do a better job in caring for your relative?",
    options: [
      { value: 0, label: "NEVER" },
      { value: 1, label: "RARELY" },
      { value: 2, label: "SOMETIMES" },
      { value: 3, label: "QUITE FREQUENTLY" },
      { value: 4, label: "NEARLY ALWAYS" }
    ]
  },
  {
    id: 22,
    question: "Overall, how burdened do you feel in caring for your relative?",
    options: [
      { value: 0, label: "NOT AT ALL" },
      { value: 1, label: "A LITTLE" },
      { value: 2, label: "MODERATELY" },
      { value: 3, label: "QUITE A BIT" },
      { value: 4, label: "EXTREMELY" }
    ]
  }
];

const getBurdenLevel = (score) => {
  if (score >= 0 && score <= 40) return 'mild';
  if (score >= 41 && score <= 60) return 'moderate';  
  if (score >= 61 && score <= 88) return 'severe';
  return 'mild';
};

const getBurdenLevelText = (level) => {
  switch (level) {
    case 'mild': return 'Mild Burden';
    case 'moderate': return 'Moderate Burden';
    case 'severe': return 'Severe Burden';
    default: return 'Mild Burden';
  }
};

const getBurdenLevelColor = (level) => {
  switch (level) {
    case 'mild': return 'success';
    case 'moderate': return 'warning';
    case 'severe': return 'error';
    default: return 'success';
  }
};

export default function ZaritBurdenAssessmentPreTest({ caregiverId, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [burdenLevel, setBurdenLevel] = useState('mild');
  const [onCompleteCalled, setOnCompleteCalled] = useState(false);

  // Safety check for questions array
  if (!zaritQuestions || zaritQuestions.length === 0) {
    console.error('ZaritBurdenAssessmentPreTest: Questions array is empty or undefined');
    return <div>Loading assessment questions...</div>;
  }

  const handleAnswerChange = (questionId, value) => {
    const numericValue = parseInt(value);
    setAnswers(prev => ({
      ...prev,
      [questionId]: numericValue
    }));
  };

  // Auto-advance to next question after selecting an answer
  const handleAnswerSelect = (questionId, value) => {
    handleAnswerChange(questionId, value);
    
    // Auto-advance after a short delay to show the selection
    setTimeout(() => {
      if (currentQuestion < zaritQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Calculate final score on last question
        const updatedAnswers = { ...answers, [questionId]: parseInt(value) };
        const score = Object.values(updatedAnswers).reduce((sum, val) => sum + val, 0);
        const level = getBurdenLevel(score);
        
        setTotalScore(score);
        setBurdenLevel(level);
        setShowResults(true);
        
        // Call onComplete immediately when assessment is completed via keyboard
        if (onComplete && !onCompleteCalled) {
          console.log('Assessment completed via keyboard, calling onComplete with:', { level, score });
          setOnCompleteCalled(true);
          onComplete(level, score);
        }
      }
    }, 300); // 300ms delay to show selection
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (showResults) return; // Don't handle keys on results screen
      
      const currentQ = zaritQuestions[currentQuestion];
      
      // Safety check
      if (!currentQ) {
        console.error('Current question is undefined in keyboard handler:', currentQuestion);
        return;
      }
      
      // Number keys 1-5 for quick selection
      if (event.key >= '1' && event.key <= '5') {
        const optionIndex = parseInt(event.key) - 1;
        if (optionIndex < currentQ.options.length) {
          const selectedValue = currentQ.options[optionIndex].value;
          handleAnswerSelect(currentQ.id, selectedValue);
        }
      }
      
      // Enter key to advance if answer is selected
      if (event.key === 'Enter') {
        const currentAnswer = answers[currentQ.id];
        if (currentAnswer !== undefined) {
          handleNext();
        }
      }
      
      // Arrow keys for navigation
      if (event.key === 'ArrowLeft' && currentQuestion > 0) {
        setCurrentQuestion(prev => prev - 1);
      }
      if (event.key === 'ArrowRight') {
        const currentAnswer = answers[currentQ.id];
        if (currentAnswer !== undefined) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, answers, showResults]);

  const handleNext = () => {
    if (currentQuestion < zaritQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate final score
      const score = Object.values(answers).reduce((sum, val) => sum + val, 0);
      const level = getBurdenLevel(score);
      
      setTotalScore(score);
      setBurdenLevel(level);
      setShowResults(true);
      
      // Call onComplete immediately when assessment is completed via Next/Enter
      if (onComplete && !onCompleteCalled) {
        console.log('Assessment completed via Next/Enter, calling onComplete with:', { level, score });
        setOnCompleteCalled(true);
        onComplete(level, score);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    console.log('handleComplete called with:', { burdenLevel, totalScore, caregiverId });
    
    // Call onComplete for the button click path (in case it hasn't been called yet)
    if (onComplete && burdenLevel && totalScore !== undefined && !onCompleteCalled) {
      console.log('Calling onComplete from button click...');
      setOnCompleteCalled(true);
      onComplete(burdenLevel, totalScore);
    }
    
    try {
      const response = await fetch('/api/caregiver/zarit-assessment-pretest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiverId,
          answers,
          totalScore,
          burdenLevel,
          day: 1,
          assessmentType: 'pretest'
        }),
      });
      console.log('API call completed with status:', response.status);
    } catch (error) {
      console.error('API error (but continuing):', error);
    }
  };

  const progress = ((currentQuestion + 1) / zaritQuestions.length) * 100;
  const currentQ = zaritQuestions[currentQuestion];
  
  // Safety check to prevent undefined errors
  if (!currentQ) {
    console.error('Current question is undefined:', { currentQuestion, totalQuestions: zaritQuestions.length });
    return <div>Loading assessment...</div>;
  }
  
  const isAnswered = answers[currentQ.id] !== undefined && answers[currentQ.id] !== null;
  
  // For the last question, also check if this is completion and all questions are answered
  const isLastQuestion = currentQuestion === zaritQuestions.length - 1;
  const allQuestionsAnswered = zaritQuestions.every(q => answers[q.id] !== undefined && answers[q.id] !== null);
  
  const canProceed = isAnswered || (isLastQuestion && allQuestionsAnswered);

  if (showResults) {
    return (
      <Card sx={{ maxWidth: 800, mx: 'auto', my: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <FaClipboardCheck size={48} color="green" />
            <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
              Assessment Complete
            </Typography>
          </Box>

          <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary" gutterBottom>
              {totalScore}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Total Score (out of 88)
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: `${getBurdenLevelColor(burdenLevel)}.main`,
                fontWeight: 'bold',
                mt: 2
              }}
            >
              {getBurdenLevelText(burdenLevel)}
            </Typography>
          </Paper>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1">
              Based on your responses, we've personalized your Day 1 content to best support your caregiving journey.
            </Typography>
          </Alert>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleComplete}
              endIcon={<FaArrowRight />}
              sx={{ px: 4 }}
            >
              Continue to Day 1 Content
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', my: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaClipboardCheck />
            Day 1 Pre-Assessment: Caregiver Burden Scale
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This brief assessment helps us personalize your content. Please answer honestly - there are no right or wrong answers.
          </Typography>
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              Question {currentQuestion + 1} of {zaritQuestions.length}
            </Typography>
            <Typography variant="body2">
              {Math.round(progress)}% Complete
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>

        {/* Keyboard Navigation Hints */}
        <Alert severity="info" sx={{ mb: 3, fontSize: '0.85rem' }}>
          <Typography variant="caption" display="block">
            💡 <strong>Keyboard shortcuts:</strong> Use keys 1-5 to select answers quickly, or press Enter after selecting to continue
          </Typography>
        </Alert>

        {/* Question */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 3, fontSize: '1.1rem', fontWeight: 'bold' }}>
              {currentQ.question}
            </FormLabel>
            <RadioGroup
              value={answers[currentQ.id]?.toString() || ''}
              onChange={(e) => handleAnswerSelect(currentQ.id, e.target.value)}
            >
              <Grid container spacing={1}>
                {currentQ.options.map((option, index) => (
                  <Grid item xs={12} key={option.value}>
                    <FormControlLabel
                      value={option.value}
                      control={<Radio />}
                      label={
                        <span>
                          <strong>[{index + 1}]</strong> {option.value} - {option.label}
                        </span>
                      }
                      sx={{
                        width: '100%',
                        p: 1,
                        border: '1px solid',
                        borderColor: answers[currentQ.id] === option.value ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        bgcolor: answers[currentQ.id] === option.value ? 'primary.50' : 'transparent',
                        '&:hover': {
                          bgcolor: 'grey.50'
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
          </FormControl>
        </Paper>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            startIcon={<FaArrowLeft />}
          >
            Previous
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed}
            endIcon={<FaArrowRight />}
          >
            {currentQuestion === zaritQuestions.length - 1 ? 'Complete Assessment' : 'Next Question'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}