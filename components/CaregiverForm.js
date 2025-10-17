import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  FormControl,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

const CaregiverForm = ({ formData, setFormData, onNext }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [validationError, setValidationError] = useState('');

  // Helper function to validate name input (letters, spaces, hyphens, apostrophes only)
  const validateNameInput = (value) => {
    const nameRegex = /^[a-zA-Z\u00c0-\u00ff\\u0100-\\u017F\\u0180-\\u024F\\u1E00-\\u1EFF\\u0900-\\u097F\\u0C80-\\u0CFF\\s\\-']*$/;
    return nameRegex.test(value);
  };

  // Helper function to validate phone number input (10 digits only)
  const validatePhoneInput = (value) => {
    const phoneRegex = /^[0-9]{0,10}$/;
    return phoneRegex.test(value);
  };

// Reset input value when question changes
useEffect(() => {
  setCurrentInputValue('');
  setValidationError('');
}, [currentQuestion]);

  const questions = [
    {
      section: 'Personal Details',
      id: 'name',
      question: 'What is your full name?',
      type: 'text',
      required: true
    },
    {
      section: 'Personal Details',
      id: 'email',
      question: 'What is your email address?',
      type: 'email',
      required: true
    },
    {
      section: 'Personal Details',
      id: 'phone',
      question: 'What is your phone number?',
      type: 'tel',
      required: true
    },
    {
      section: 'Personal Details',
      id: 'age',
      question: 'Age (in years):',
      type: 'select',
      options: ['18-30', '31-40', '41-50', '51-60', '61 and above'],
      required: true
    },
    {
      section: 'Personal Details',
      id: 'gender',
      question: 'Gender:',
      type: 'select',
      options: ['Male', 'Female', 'Other'],
      required: true
    },
    {
      section: 'Personal Details',
      id: 'maritalStatus',
      question: 'Marital Status:',
      type: 'select',
      options: ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'],
      required: true
    },
    {
      section: 'Personal Details',
      id: 'educationLevel',
      question: 'Educational Level:',
      type: 'select',
      options: ['No formal education', 'Primary education', 'Secondary education', 'Higher secondary', 'Undergraduate degree', 'Postgraduate degree'],
      required: true
    },
    {
      section: 'Personal Details',
      id: 'employmentStatus',
      question: 'Employment Status:',
      type: 'select',
      options: ['Employed (Full-time/Part-time)', 'Unemployed', 'Retired', 'Homemaker', 'Student'],
      required: true
    },
    {
      section: 'Personal Details',
      id: 'residentialArea',
      question: 'Residential Area:',
      type: 'select',
      options: ['Urban', 'Rural'],
      required: true
    },
    {
      section: 'Caregiving Information',
      id: 'relationshipToPatient',
      question: 'Relationship to the Patient:',
      type: 'select',
      options: ['Spouse', 'Parent', 'Child', 'Sibling', 'Other'],
      allowOther: true,
      required: true
    },
    {
      section: 'Caregiving Information',
      id: 'hoursPerDay',
      question: 'Hours Spent Caring per Day:',
      type: 'select',
      options: ['Less than 2 hours', '2-4 hours', '5-8 hours', 'More than 8 hours'],
      required: true
    },
    {
      section: 'Caregiving Information',
      id: 'durationOfCaregiving',
      question: 'Duration of Caregiving (since starting caregiving):',
      type: 'select',
      options: ['Less than 6 months', '6-12 months', '1-2 years', 'More than 2 years'],
      required: true
    },
    {
      section: 'Caregiving Information',
      id: 'previousExperience',
      question: 'Previous Experience as a Caregiver:',
      type: 'select',
      options: ['Yes', 'No'],
      required: true
    },
    {
      section: 'Caregiving Information',
      id: 'supportSystem',
      question: 'Support System Available (check all that apply):',
      type: 'multiSelect',
      options: ['Family Support', 'Friends', 'Community Support Groups', 'Religious/Spiritual Support', 'None'],
      required: true
    }
  ];

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Generate ID and complete registration
      const generatedId = `CG${Date.now().toString(36).toUpperCase()}`;
      setFormData({ ...newAnswers, userType: 'caregiver', generatedId });

      // Submit to API
      submitRegistration({ ...newAnswers, userType: 'caregiver', caregiverId: generatedId });
      onNext();
    }
  };

  const submitRegistration = async (data) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <motion.div
      key={currentQuestion}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
    >
      <Card sx={{ maxWidth: 600, mx: 'auto', p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
          Question {currentQuestion + 1} of {questions.length}
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>
          {questions[currentQuestion].question}
        </Typography>

        {questions[currentQuestion].type === 'multiSelect' ? (
          <Box>
            <FormControl component="fieldset" fullWidth>
              {questions[currentQuestion].options.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={answers[questions[currentQuestion].id]?.includes(option) || false}
                      onChange={(e) => {
                        const currentAnswers = answers[questions[currentQuestion].id] || [];
                        let newAnswers;
                        if (option === 'None') {
                          // If "None" is selected, uncheck all others
                          newAnswers = e.target.checked ? ['None'] : [];
                        } else {
                          if (e.target.checked) {
                            // If another option is selected, remove "None" if it exists
                            newAnswers = [...currentAnswers.filter(a => a !== 'None'), option];
                          } else {
                            newAnswers = currentAnswers.filter(a => a !== option);
                          }
                        }
                        const updatedAnswers = {
                          ...answers,
                          [questions[currentQuestion].id]: newAnswers
                        };
                        setAnswers(updatedAnswers);
                      }}
                    />
                  }
                  label={option}
                />
              ))}
            </FormControl>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                endIcon={<FaArrowRight />}
                onClick={() => {
                  if (answers[questions[currentQuestion].id]?.length > 0) {
                    handleAnswer(answers[questions[currentQuestion].id]);
                  }
                }}
                disabled={!answers[questions[currentQuestion].id]?.length}
              >
                {currentQuestion === questions.length - 1 ? 'Complete Registration' : 'Next Question'}
              </Button>
            </Box>
          </Box>
        ) : questions[currentQuestion].type === 'select' ? (
          <Grid container spacing={2}>
            {questions[currentQuestion].options.map((option) => (
              <Grid item xs={12} sm={6} key={option}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleAnswer(option)}
                  sx={{
                    p: 2,
                    textAlign: 'left',
                    '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                  }}
                >
                  {option}
                </Button>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box>
            <input
              type={questions[currentQuestion].type}
              placeholder="Enter your answer..."
              value={currentInputValue}
              onChange={(e) => {
                const { value } = e.target;
                const questionId = questions[currentQuestion].id;
                
                // Clear validation error when user starts typing
                if (validationError) {
                  setValidationError('');
                }
                
                // Apply validation based on field type
                if (questionId === 'name') {
                  if (validateNameInput(value)) {
                    setCurrentInputValue(value);
                  }
                } else if (questionId === 'phone') {
                  if (validatePhoneInput(value) && value.length <= 10) {
                    setCurrentInputValue(value);
                  }
                } else {
                  setCurrentInputValue(value);
                }
              }}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '8px'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && currentInputValue.trim()) {
                  handleAnswer(currentInputValue.trim());
                }
              }}
            />
            {/* Helper text for validation */}
            {(questions[currentQuestion].id === 'name' || questions[currentQuestion].id === 'phone') && (
              <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block', fontSize: '0.875rem' }}>
                {questions[currentQuestion].id === 'name' 
                  ? 'Only letters, spaces, hyphens and apostrophes are allowed'
                  : 'Enter exactly 10 digits for phone number'
                }
              </Typography>
            )}
            {validationError && (
              <Typography color="error" variant="body2" sx={{ mb: 2, display: 'block', fontSize: '0.875rem' }}>
                {validationError}
              </Typography>
            )}
            <Button
              fullWidth
              variant="contained"
              endIcon={<FaArrowRight />}
              onClick={() => {
                const questionId = questions[currentQuestion].id;
                
                // Check if it's a phone field and validate length
                if (questionId === 'phone') {
                  if (!currentInputValue || currentInputValue.length !== 10) {
                    setValidationError('Phone number must be exactly 10 digits');
                    return;
                  }
                }
                
                // Clear any existing validation errors
                setValidationError('');
                
                if (currentInputValue.trim()) {
                  handleAnswer(currentInputValue.trim());
                }
              }}
              disabled={!currentInputValue.trim()}
            >
              {currentQuestion === questions.length - 1 ? 'Complete Registration' : 'Next Question'}
            </Button>
          </Box>
        )}
      </Card>
    </motion.div>
  );
};

export default CaregiverForm;