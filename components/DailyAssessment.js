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
  Grid
} from '@mui/material';
import { FaCheckCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

// Daily Assessment Questions Configuration
const DAILY_ASSESSMENTS = {
  1: {
    type: 'zarit_burden',
    title: 'Day 1 - Caregiver Burden Assessment',
    description: 'This assessment helps us understand your current caregiving burden level.',
    questions: [
      {
        id: 'q1',
        text: 'Do you feel that your relative asks for more help than he/she needs?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Quite frequently' },
          { value: 4, label: 'Nearly always' }
        ]
      },
      {
        id: 'q2',
        text: 'Do you feel that because of the time you spend with your relative that you don\'t have enough time for yourself?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Quite frequently' },
          { value: 4, label: 'Nearly always' }
        ]
      },
      {
        id: 'q3',
        text: 'Do you feel stressed between caring for your relative and trying to meet other responsibilities?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Quite frequently' },
          { value: 4, label: 'Nearly always' }
        ]
      },
      {
        id: 'q4',
        text: 'Do you feel embarrassed over your relative\'s behavior?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Quite frequently' },
          { value: 4, label: 'Nearly always' }
        ]
      },
      {
        id: 'q5',
        text: 'Do you feel angry when you are around your relative?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Quite frequently' },
          { value: 4, label: 'Nearly always' }
        ]
      },
      {
        id: 'q6',
        text: 'Do you feel that your relative currently affects your relationship with family members or friends?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Quite frequently' },
          { value: 4, label: 'Nearly always' }
        ]
      },
      {
        id: 'q7',
        text: 'Do you feel uncertain about what to do about your relative?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Quite frequently' },
          { value: 4, label: 'Nearly always' }
        ]
      }
    ],
    maxScore: 28
  },
  2: {
    type: 'stress_level',
    title: 'Day 2 - Stress Level Assessment',
    description: 'Let\'s assess your current stress levels to provide appropriate coping strategies.',
    questions: [
      {
        id: 'q1',
        text: 'How often do you feel overwhelmed by your caregiving responsibilities?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q2',
        text: 'How frequently do you experience physical symptoms of stress (headaches, fatigue, muscle tension)?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q3',
        text: 'How often do you have trouble sleeping due to caregiving worries?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q4',
        text: 'How frequently do you feel irritable or short-tempered?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q5',
        text: 'How often do you feel like you have no control over your situation?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q6',
        text: 'How frequently do you experience difficulty concentrating?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      }
    ],
    maxScore: 24
  },
  3: {
    type: 'coping_strategies',
    title: 'Day 3 - Coping Strategies Assessment',
    description: 'Understanding your current coping mechanisms helps us provide better support.',
    questions: [
      {
        id: 'q1',
        text: 'How often do you use problem-solving strategies when facing caregiving challenges?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q2',
        text: 'How frequently do you seek emotional support from others?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q3',
        text: 'How often do you practice relaxation techniques or mindfulness?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q4',
        text: 'How frequently do you maintain a positive outlook despite challenges?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q5',
        text: 'How often do you take breaks from caregiving when needed?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q6',
        text: 'How frequently do you accept help from others when offered?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q7',
        text: 'How often do you engage in activities you enjoy?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q8',
        text: 'How frequently do you maintain hope for the future?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q9',
        text: 'How often do you adapt your approach when facing new challenges?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      }
    ],
    maxScore: 36
  },
  4: {
    type: 'self_care',
    title: 'Day 4 - Self-Care Assessment',
    description: 'Evaluating your self-care practices to ensure your wellbeing.',
    questions: [
      {
        id: 'q1',
        text: 'How often do you maintain a regular sleep schedule?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q2',
        text: 'How frequently do you eat regular, nutritious meals?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q3',
        text: 'How often do you engage in physical activity or exercise?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q4',
        text: 'How frequently do you practice personal hygiene and grooming?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q5',
        text: 'How often do you take time for activities you enjoy?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q6',
        text: 'How frequently do you attend to your medical needs?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      }
    ],
    maxScore: 24
  },
  5: {
    type: 'social_support',
    title: 'Day 5 - Social Support Assessment',
    description: 'Understanding your social support network and connections.',
    questions: [
      {
        id: 'q1',
        text: 'How often do you feel you have people you can talk to about your problems?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q2',
        text: 'How frequently do you receive practical help when you need it?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q3',
        text: 'How often do you feel understood by your family and friends?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q4',
        text: 'How frequently do you maintain contact with your social network?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q5',
        text: 'How often do you feel comfortable asking others for help?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q6',
        text: 'How frequently do you participate in social activities?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q7',
        text: 'How often do you feel isolated or alone in your caregiving role?',
        scale: [
          { value: 4, label: 'Never' },
          { value: 3, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 1, label: 'Often' },
          { value: 0, label: 'Always' }
        ]
      },
      {
        id: 'q8',
        text: 'How frequently do you receive emotional support when stressed?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q9',
        text: 'How often do you feel valued and appreciated by others?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      }
    ],
    maxScore: 36
  },
  6: {
    type: 'emotional_wellbeing',
    title: 'Day 6 - Emotional Wellbeing Assessment',
    description: 'Assessing your emotional health and psychological wellbeing.',
    questions: [
      {
        id: 'q1',
        text: 'How often do you feel sad or depressed?',
        scale: [
          { value: 4, label: 'Never' },
          { value: 3, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 1, label: 'Often' },
          { value: 0, label: 'Always' }
        ]
      },
      {
        id: 'q2',
        text: 'How frequently do you feel anxious or worried?',
        scale: [
          { value: 4, label: 'Never' },
          { value: 3, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 1, label: 'Often' },
          { value: 0, label: 'Always' }
        ]
      },
      {
        id: 'q3',
        text: 'How often do you feel hopeful about the future?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q4',
        text: 'How frequently do you experience feelings of guilt?',
        scale: [
          { value: 4, label: 'Never' },
          { value: 3, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 1, label: 'Often' },
          { value: 0, label: 'Always' }
        ]
      },
      {
        id: 'q5',
        text: 'How often do you feel emotionally stable?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q6',
        text: 'How frequently do you feel overwhelmed by emotions?',
        scale: [
          { value: 4, label: 'Never' },
          { value: 3, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 1, label: 'Often' },
          { value: 0, label: 'Always' }
        ]
      },
      {
        id: 'q7',
        text: 'How often do you feel satisfied with your life?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      },
      {
        id: 'q8',
        text: 'How frequently do you experience mood swings?',
        scale: [
          { value: 4, label: 'Never' },
          { value: 3, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 1, label: 'Often' },
          { value: 0, label: 'Always' }
        ]
      },
      {
        id: 'q9',
        text: 'How often do you feel in control of your emotions?',
        scale: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Always' }
        ]
      }
    ],
    maxScore: 36
  },
  7: {
    type: 'program_evaluation',
    title: 'Day 7 - Program Evaluation',
    description: 'Help us understand how effective this program has been for you.',
    questions: [
      {
        id: 'q1',
        text: 'How helpful has this 7-day program been for your caregiving situation?',
        scale: [
          { value: 0, label: 'Not helpful at all' },
          { value: 1, label: 'Slightly helpful' },
          { value: 2, label: 'Moderately helpful' },
          { value: 3, label: 'Very helpful' },
          { value: 4, label: 'Extremely helpful' }
        ]
      },
      {
        id: 'q2',
        text: 'How much has your understanding of caregiving improved?',
        scale: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'A little' },
          { value: 2, label: 'Moderately' },
          { value: 3, label: 'Significantly' },
          { value: 4, label: 'Greatly' }
        ]
      },
      {
        id: 'q3',
        text: 'How likely are you to continue using the strategies learned in this program?',
        scale: [
          { value: 0, label: 'Very unlikely' },
          { value: 1, label: 'Unlikely' },
          { value: 2, label: 'Neutral' },
          { value: 3, label: 'Likely' },
          { value: 4, label: 'Very likely' }
        ]
      },
      {
        id: 'q4',
        text: 'How would you rate the quality of the video content?',
        scale: [
          { value: 0, label: 'Poor' },
          { value: 1, label: 'Fair' },
          { value: 2, label: 'Good' },
          { value: 3, label: 'Very good' },
          { value: 4, label: 'Excellent' }
        ]
      },
      {
        id: 'q5',
        text: 'How appropriate was the difficulty level of the daily tasks?',
        scale: [
          { value: 0, label: 'Too difficult' },
          { value: 1, label: 'Somewhat difficult' },
          { value: 2, label: 'Just right' },
          { value: 3, label: 'Somewhat easy' },
          { value: 4, label: 'Too easy' }
        ]
      },
      {
        id: 'q6',
        text: 'How satisfied are you with the personalized content based on your assessments?',
        scale: [
          { value: 0, label: 'Very dissatisfied' },
          { value: 1, label: 'Dissatisfied' },
          { value: 2, label: 'Neutral' },
          { value: 3, label: 'Satisfied' },
          { value: 4, label: 'Very satisfied' }
        ]
      },
      {
        id: 'q7',
        text: 'How likely are you to recommend this program to other caregivers?',
        scale: [
          { value: 0, label: 'Very unlikely' },
          { value: 1, label: 'Unlikely' },
          { value: 2, label: 'Neutral' },
          { value: 3, label: 'Likely' },
          { value: 4, label: 'Very likely' }
        ]
      },
      {
        id: 'q8',
        text: 'How has your confidence in caregiving changed since starting the program?',
        scale: [
          { value: 0, label: 'Decreased significantly' },
          { value: 1, label: 'Decreased slightly' },
          { value: 2, label: 'No change' },
          { value: 3, label: 'Increased slightly' },
          { value: 4, label: 'Increased significantly' }
        ]
      },
      {
        id: 'q9',
        text: 'How well did the program address your specific caregiving challenges?',
        scale: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Poorly' },
          { value: 2, label: 'Adequately' },
          { value: 3, label: 'Well' },
          { value: 4, label: 'Very well' }
        ]
      },
      {
        id: 'q10',
        text: 'How much has your stress level changed since starting the program?',
        scale: [
          { value: 4, label: 'Decreased significantly' },
          { value: 3, label: 'Decreased slightly' },
          { value: 2, label: 'No change' },
          { value: 1, label: 'Increased slightly' },
          { value: 0, label: 'Increased significantly' }
        ]
      },
      {
        id: 'q11',
        text: 'How valuable were the daily assessments in understanding your needs?',
        scale: [
          { value: 0, label: 'Not valuable' },
          { value: 1, label: 'Slightly valuable' },
          { value: 2, label: 'Moderately valuable' },
          { value: 3, label: 'Very valuable' },
          { value: 4, label: 'Extremely valuable' }
        ]
      },
      {
        id: 'q12',
        text: 'How satisfied are you with the overall program experience?',
        scale: [
          { value: 0, label: 'Very dissatisfied' },
          { value: 1, label: 'Dissatisfied' },
          { value: 2, label: 'Neutral' },
          { value: 3, label: 'Satisfied' },
          { value: 4, label: 'Very satisfied' }
        ]
      }
    ],
    maxScore: 48
  }
};

export default function DailyAssessment({ day, caregiverId, onComplete, onBack }) {
  const { language } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const assessmentConfig = DAILY_ASSESSMENTS[day];
  
  if (!assessmentConfig) {
    return (
      <Alert severity="error">
        Assessment configuration not found for Day {day}
      </Alert>
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
      const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
      
      const response = await fetch('/api/caregiver/daily-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiverId,
          day,
          assessmentType: assessmentConfig.type,
          responses,
          totalScore
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onComplete?.(data);
      } else {
        setError(data.error || 'Failed to submit assessment');
      }
    } catch (error) {
      console.error('Assessment submission error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreLevel = () => {
    const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
    
    // Different scoring thresholds for different assessments
    const scoringConfig = {
      1: { low: 10, high: 20 },      // Zarit Burden
      2: { low: 8, high: 16 },       // Stress Level
      3: { low: 12, high: 24 },      // Coping Strategies
      4: { low: 10, high: 20 },      // Self-Care
      5: { low: 15, high: 30 },      // Social Support
      6: { low: 12, high: 24 },      // Emotional Wellbeing
      7: { low: 20, high: 40 }       // Program Evaluation
    };

    const thresholds = scoringConfig[day];
    if (!thresholds) return 'moderate';

    if (totalScore <= thresholds.low) return 'low';
    if (totalScore >= thresholds.high) return 'high';
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
                {currentQuestion.scale.map((option) => (
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