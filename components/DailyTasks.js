import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  Checkbox,
  Alert,
  Grid,
  Paper,
  Container
} from '@mui/material';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

// Daily Tasks Configuration based on day and content level
const DAILY_TASKS_CONFIG = {
  1: {
    title: 'Day 1 - Understanding Your Burden',
    low: [
      {
        type: 'boolean',
        key: 'break_taken',
        title: 'Self-Care Break',
        question: 'Did you take at least one 5-minute break for yourself today?',
        required: true
      },
      {
        type: 'text',
        key: 'one_positive',
        title: 'Daily Reflection',
        question: 'Write one positive thing about your caregiving experience today:',
        required: true,
        maxLength: 200
      }
    ],
    moderate: [
      {
        type: 'boolean',
        key: 'break_taken',
        title: 'Self-Care Break',
        question: 'Did you take at least one 10-minute break for yourself today?',
        required: true
      },
      {
        type: 'text',
        key: 'challenge_response',
        title: 'Challenge Management',
        question: 'Describe one challenge you faced today and how you responded to it:',
        required: true,
        maxLength: 300
      },
      {
        type: 'boolean',
        key: 'asked_help',
        title: 'Support Seeking',
        question: 'Did you ask for or accept help from someone today?',
        required: true
      }
    ],
    high: [
      {
        type: 'boolean',
        key: 'break_taken',
        title: 'Self-Care Break',
        question: 'Did you take at least two 10-minute breaks for yourself today?',
        required: true
      },
      {
        type: 'text',
        key: 'stress_management',
        title: 'Stress Management',
        question: 'Describe the most stressful moment today and what coping strategy you used:',
        required: true,
        maxLength: 400
      },
      {
        type: 'text',
        key: 'support_plan',
        title: 'Support Planning',
        question: 'What specific support will you seek this week? Who will you contact?',
        required: true,
        maxLength: 300
      },
      {
        type: 'boolean',
        key: 'emergency_plan',
        title: 'Emergency Preparedness',
        question: 'Do you have someone you can call in case of a caregiving emergency?',
        required: true
      }
    ]
  },
  2: {
    title: 'Day 2 - Managing Stress',
    low: [
      {
        type: 'boolean',
        key: 'breathing_exercise',
        title: 'Breathing Exercise',
        question: 'Did you practice the deep breathing exercise from the video?',
        required: true
      },
      {
        type: 'boolean',
        key: 'physical_activity',
        title: 'Physical Activity',
        question: 'Did you engage in at least 10 minutes of physical activity today?',
        required: true
      }
    ],
    moderate: [
      {
        type: 'boolean',
        key: 'breathing_exercise',
        title: 'Breathing Exercise',
        question: 'Did you practice the deep breathing exercise at least twice today?',
        required: true
      },
      {
        type: 'text',
        key: 'stress_triggers',
        title: 'Stress Identification',
        question: 'What were your main stress triggers today? How did you manage them?',
        required: true,
        maxLength: 300
      },
      {
        type: 'boolean',
        key: 'relaxation_time',
        title: 'Relaxation Time',
        question: 'Did you set aside time for a relaxing activity today?',
        required: true
      }
    ],
    high: [
      {
        type: 'boolean',
        key: 'breathing_exercise',
        title: 'Breathing Exercise',
        question: 'Did you practice stress-relief techniques multiple times throughout the day?',
        required: true
      },
      {
        type: 'text',
        key: 'stress_management_plan',
        title: 'Stress Management Plan',
        question: 'Create a specific plan for managing your highest stress situations this week:',
        required: true,
        maxLength: 400
      },
      {
        type: 'text',
        key: 'professional_support',
        title: 'Professional Support',
        question: 'Have you considered seeking professional support? If yes, what type? If no, why not?',
        required: true,
        maxLength: 300
      }
    ]
  },
  3: {
    title: 'Day 3 - Developing Coping Strategies',
    low: [
      {
        type: 'boolean',
        key: 'positive_thinking',
        title: 'Positive Thinking',
        question: 'Did you practice focusing on positive aspects of your situation today?',
        required: true
      },
      {
        type: 'text',
        key: 'coping_strategy',
        title: 'Coping Strategy',
        question: 'What is one new coping strategy you tried or want to try?',
        required: true,
        maxLength: 200
      }
    ],
    moderate: [
      {
        type: 'boolean',
        key: 'problem_solving',
        title: 'Problem Solving',
        question: 'Did you use a structured approach to solve a caregiving challenge today?',
        required: true
      },
      {
        type: 'text',
        key: 'coping_evaluation',
        title: 'Coping Evaluation',
        question: 'Which coping strategies work best for you? Which ones need improvement?',
        required: true,
        maxLength: 300
      },
      {
        type: 'boolean',
        key: 'social_connection',
        title: 'Social Connection',
        question: 'Did you connect with someone who supports you today?',
        required: true
      }
    ],
    high: [
      {
        type: 'text',
        key: 'comprehensive_coping_plan',
        title: 'Comprehensive Coping Plan',
        question: 'Create a detailed coping plan for your three biggest caregiving challenges:',
        required: true,
        maxLength: 500
      },
      {
        type: 'text',
        key: 'adaptive_strategies',
        title: 'Adaptive Strategies',
        question: 'How will you adapt your coping strategies when situations change unexpectedly?',
        required: true,
        maxLength: 300
      },
      {
        type: 'boolean',
        key: 'mentor_connection',
        title: 'Mentor Connection',
        question: 'Have you connected with an experienced caregiver for guidance?',
        required: true
      }
    ]
  },
  4: {
    title: 'Day 4 - Self-Care Practices',
    low: [
      {
        type: 'boolean',
        key: 'personal_hygiene',
        title: 'Personal Care',
        question: 'Did you maintain your personal hygiene and grooming today?',
        required: true
      },
      {
        type: 'boolean',
        key: 'nutritious_meals',
        title: 'Nutrition',
        question: 'Did you eat regular, nutritious meals today?',
        required: true
      }
    ],
    moderate: [
      {
        type: 'boolean',
        key: 'self_care_routine',
        title: 'Self-Care Routine',
        question: 'Did you follow a consistent self-care routine today?',
        required: true
      },
      {
        type: 'text',
        key: 'self_care_plan',
        title: 'Self-Care Planning',
        question: 'What self-care activities will you prioritize this week?',
        required: true,
        maxLength: 250
      },
      {
        type: 'boolean',
        key: 'enjoyable_activity',
        title: 'Enjoyable Activity',
        question: 'Did you engage in an activity you enjoy today?',
        required: true
      }
    ],
    high: [
      {
        type: 'text',
        key: 'self_care_assessment',
        title: 'Self-Care Assessment',
        question: 'Evaluate your current self-care practices. What needs immediate attention?',
        required: true,
        maxLength: 400
      },
      {
        type: 'text',
        key: 'self_care_barriers',
        title: 'Barrier Identification',
        question: 'What barriers prevent you from practicing self-care? How will you overcome them?',
        required: true,
        maxLength: 350
      },
      {
        type: 'boolean',
        key: 'medical_care',
        title: 'Medical Care',
        question: 'Are you up-to-date with your own medical appointments and health needs?',
        required: true
      }
    ]
  },
  5: {
    title: 'Day 5 - Building Social Support',
    low: [
      {
        type: 'boolean',
        key: 'social_contact',
        title: 'Social Contact',
        question: 'Did you have meaningful contact with family or friends today?',
        required: true
      },
      {
        type: 'text',
        key: 'support_person',
        title: 'Support Person',
        question: 'Who is someone you can talk to about your caregiving experience?',
        required: true,
        maxLength: 200
      }
    ],
    moderate: [
      {
        type: 'boolean',
        key: 'asked_for_help',
        title: 'Seeking Help',
        question: 'Did you ask for help when you needed it today?',
        required: true
      },
      {
        type: 'text',
        key: 'support_network',
        title: 'Support Network',
        question: 'List three people in your support network and how they can help:',
        required: true,
        maxLength: 300
      },
      {
        type: 'boolean',
        key: 'community_resources',
        title: 'Community Resources',
        question: 'Have you explored community resources for caregivers?',
        required: true
      }
    ],
    high: [
      {
        type: 'text',
        key: 'support_network_analysis',
        title: 'Support Network Analysis',
        question: 'Analyze your support network. What gaps exist and how will you address them?',
        required: true,
        maxLength: 400
      },
      {
        type: 'text',
        key: 'isolation_prevention',
        title: 'Isolation Prevention',
        question: 'What specific steps will you take to prevent social isolation?',
        required: true,
        maxLength: 300
      },
      {
        type: 'boolean',
        key: 'support_groups',
        title: 'Support Groups',
        question: 'Have you considered joining a caregiver support group?',
        required: true
      }
    ]
  },
  6: {
    title: 'Day 6 - Emotional Wellbeing',
    low: [
      {
        type: 'boolean',
        key: 'emotion_awareness',
        title: 'Emotion Awareness',
        question: 'Did you take time to acknowledge your emotions today?',
        required: true
      },
      {
        type: 'text',
        key: 'emotional_moment',
        title: 'Emotional Moment',
        question: 'Describe one emotional moment today and how you handled it:',
        required: true,
        maxLength: 250
      }
    ],
    moderate: [
      {
        type: 'boolean',
        key: 'emotional_regulation',
        title: 'Emotional Regulation',
        question: 'Did you practice emotional regulation techniques today?',
        required: true
      },
      {
        type: 'text',
        key: 'emotional_challenges',
        title: 'Emotional Challenges',
        question: 'What are your biggest emotional challenges in caregiving and how do you cope?',
        required: true,
        maxLength: 350
      },
      {
        type: 'boolean',
        key: 'emotional_support',
        title: 'Emotional Support',
        question: 'Did you seek or receive emotional support when needed today?',
        required: true
      }
    ],
    high: [
      {
        type: 'text',
        key: 'emotional_wellbeing_plan',
        title: 'Emotional Wellbeing Plan',
        question: 'Create a comprehensive plan for maintaining your emotional wellbeing:',
        required: true,
        maxLength: 500
      },
      {
        type: 'text',
        key: 'emotional_warning_signs',
        title: 'Warning Signs',
        question: 'What are your warning signs of emotional distress and what will you do about them?',
        required: true,
        maxLength: 400
      },
      {
        type: 'boolean',
        key: 'professional_counseling',
        title: 'Professional Counseling',
        question: 'Have you considered professional counseling support?',
        required: true
      }
    ]
  },
  7: {
    title: 'Day 7 - Future Planning',
    low: [
      {
        type: 'boolean',
        key: 'program_helpful',
        title: 'Program Effectiveness',
        question: 'Was this 7-day program helpful for your caregiving journey?',
        required: true
      },
      {
        type: 'text',
        key: 'future_goals',
        title: 'Future Goals',
        question: 'What are your main goals for continuing your caregiving journey?',
        required: true,
        maxLength: 300
      }
    ],
    moderate: [
      {
        type: 'text',
        key: 'key_learnings',
        title: 'Key Learnings',
        question: 'What are the three most important things you learned from this program?',
        required: true,
        maxLength: 400
      },
      {
        type: 'text',
        key: 'action_plan',
        title: 'Action Plan',
        question: 'Create an action plan for implementing what you\'ve learned:',
        required: true,
        maxLength: 400
      },
      {
        type: 'boolean',
        key: 'continue_strategies',
        title: 'Continued Practice',
        question: 'Will you continue practicing the strategies learned in this program?',
        required: true
      }
    ],
    high: [
      {
        type: 'text',
        key: 'comprehensive_plan',
        title: 'Comprehensive Future Plan',
        question: 'Create a detailed plan for your continued growth as a caregiver:',
        required: true,
        maxLength: 600
      },
      {
        type: 'text',
        key: 'mentorship_plan',
        title: 'Mentorship Plan',
        question: 'How will you continue learning and potentially help other caregivers?',
        required: true,
        maxLength: 400
      },
      {
        type: 'text',
        key: 'program_feedback',
        title: 'Program Feedback',
        question: 'Provide detailed feedback on how this program could be improved:',
        required: true,
        maxLength: 500
      }
    ]
  }
};

export default function DailyTasks({ day, contentLevel, caregiverId, onComplete, onBack }) {
  const { language } = useLanguage();
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const taskConfig = DAILY_TASKS_CONFIG[day];
  if (!taskConfig) {
    return (
      <Alert severity="error">
        Task configuration not found for Day {day}
      </Alert>
    );
  }

  const tasks = taskConfig[contentLevel] || taskConfig.moderate;

  const handleResponseChange = (taskKey, value) => {
    setResponses(prev => ({
      ...prev,
      [taskKey]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredTasks = tasks.filter(task => task.required);
    const missingResponses = requiredTasks.filter(task => 
      responses[task.key] === undefined || responses[task.key] === ''
    );

    if (missingResponses.length > 0) {
      setError('Please complete all required fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/caregiver/complete-day-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiverId,
          day,
          contentLevel,
          taskResponses: responses
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onComplete?.(data);
      } else {
        setError(data.error || 'Failed to submit tasks');
      }
    } catch (error) {
      console.error('Task submission error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const requiredTasks = tasks.filter(task => task.required);
    return requiredTasks.every(task => 
      responses[task.key] !== undefined && responses[task.key] !== ''
    );
  };

  return (
    <Container maxWidth="md">
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              {taskConfig.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete these daily tasks to reinforce your learning and track your progress.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Tasks */}
          {tasks.map((task, index) => (
            <Paper key={task.key} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {task.title}
                {task.required && <span style={{ color: 'red' }}> *</span>}
              </Typography>

              {task.type === 'boolean' && (
                <FormControl component="fieldset" fullWidth>
                  <Typography variant="body1" gutterBottom>
                    {task.question}
                  </Typography>
                  <RadioGroup
                    value={responses[task.key] !== undefined ? responses[task.key].toString() : ''}
                    onChange={(e) => handleResponseChange(task.key, e.target.value === 'true')}
                  >
                    <FormControlLabel value="true" control={<Radio />} label="Yes" />
                    <FormControlLabel value="false" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              )}

              {task.type === 'text' && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={task.question}
                  value={responses[task.key] || ''}
                  onChange={(e) => handleResponseChange(task.key, e.target.value)}
                  variant="outlined"
                  inputProps={{ maxLength: task.maxLength }}
                  helperText={
                    task.maxLength ? 
                    `${(responses[task.key] || '').length}/${task.maxLength} characters` : 
                    undefined
                  }
                />
              )}

              {task.type === 'checkbox' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={responses[task.key] || false}
                      onChange={(e) => handleResponseChange(task.key, e.target.checked)}
                    />
                  }
                  label={task.question}
                />
              )}
            </Paper>
          ))}

          {/* Progress Indicator */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Task Completion Progress
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                {Object.keys(responses).length} of {tasks.length} tasks completed
              </Typography>
              <Typography variant="body2">
                {Math.round((Object.keys(responses).length / tasks.length) * 100)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(Object.keys(responses).length / tasks.length) * 100}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<FaArrowLeft />}
              disabled={isSubmitting}
            >
              Back to Module
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              endIcon={<FaCheckCircle />}
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Tasks'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}