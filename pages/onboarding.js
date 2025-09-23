import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUserMd,
  FaUser,
  FaArrowRight,
  FaArrowLeft,
  FaSun,
  FaMoon,
  FaHeart
} from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'next/router';

const steps = ['Choose Role', 'Answer Questions', 'Consent Form', 'Complete Registration'];

import ConsentForm from '../components/ConsentForm';

export default function Onboarding() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({});
  const router = useRouter();

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    setActiveStep(1);
  };

  const handleBack = () => {
    if (activeStep === 1) {
      setActiveStep(0);
      setUserType('');
    }
  };

  const UserTypeSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            mb: 2,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome to Cancer Care Support
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Please select your role to begin the onboarding process
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={6} md={5}>
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              onClick={() => handleUserTypeSelection('caregiver')}
              sx={{
                cursor: 'pointer',
                height: 280,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)',
                }
              }}
            >
              <CardContent>
                <FaUserMd style={{ fontSize: '4rem', marginBottom: '1rem' }} />
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                  Caregiver
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  I'm here to provide support and care to a cancer patient
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={5}>
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              onClick={() => handleUserTypeSelection('patient')}
              sx={{
                cursor: 'pointer',
                height: 280,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 20px 40px rgba(124, 58, 237, 0.3)',
                }
              }}
            >
              <CardContent>
                <FaUser style={{ fontSize: '4rem', marginBottom: '1rem' }} />
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                  Patient
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  I'm a cancer patient seeking support and care
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );

  const QuestionnaireForm = () => {
    if (userType === 'caregiver') {
      return <CaregiverForm formData={formData} setFormData={setFormData} onNext={() => setActiveStep(2)} />;
    } else {
      return <PatientForm formData={formData} setFormData={setFormData} onNext={() => setActiveStep(2)} />;
    }
  };

  const ConsentForm = ({ userType, onAccept, formData }) => {
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const router = useRouter();

  const studyDetails = {
    title: "The Impact of a Nurse-led Family Caregiver Program Among Cancer Patients at a Tertiary Care Hospital in Bangalore.",
    investigator: {
      name: "MR. James Raj K",
      role: "PHD Scholar",
      institution: "KLE Institute of Nursing Science, Belgaum",
      contact: "9500482944"
    },
    purpose: "The purpose of this study is to evaluate the impact of a nurse-led family caregiver program on alleviating caregiver burden, improving quality of life, and reducing stress among cancer patients and their caregivers.",
    procedures: [
      "Pre-test Assessment: to assess baseline caregiver burden, quality of life, and stress levels using standardized tools.",
      "Intervention: Participation in a nurse-led family caregiver program designed to address areas identified in the pre-test.",
      "Immediate Post-test Assessment: immediately following the intervention to reassess caregiver burden, quality of life, and stress levels.",
      "Follow-up Post-test Assessment: 12 weeks after the intervention to assess the long-term impact on caregiver burden, quality of life, and stress levels."
    ],
    duration: "Participation will last approximately 12 weeks, including the pre-test, intervention, and the two post-test assessments.",
    risks: [
      "There may be some emotional discomfort when discussing personal experiences and stressors.",
      "Participation in the program requires a time commitment that might be challenging for some caregivers."
    ],
    benefits: [
      "Potential improvement in caregiver burden, quality of life, and stress levels.",
      "Contribution to research that may help other caregivers in the future."
    ]
  };

  const handleConsent = () => {
    if (accepted) {
      onAccept();
      router.push('/login');
    }
  };

  const handleDecline = () => {
    setDeclined(true);
  };

  if (declined) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card sx={{ maxWidth: 600, mx: 'auto', p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Thank you for your response
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Take your time and come back when you're ready.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          Consent Form
        </Typography>
        
        <Typography variant="h5" sx={{ mb: 2 }}>
          Title of Study:
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {studyDetails.title}
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Principal Investigator:
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {studyDetails.investigator.name}<br />
          {studyDetails.investigator.role}<br />
          {studyDetails.investigator.institution}
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Purpose of the Study:
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {studyDetails.purpose}
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Study Procedures:
        </Typography>
        <Box sx={{ mb: 3 }}>
          {studyDetails.procedures.map((proc, index) => (
            <Typography key={index} variant="body1" sx={{ mb: 1 }}>
              • {proc}
            </Typography>
          ))}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Duration:
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {studyDetails.duration}
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Risks and Discomforts:
        </Typography>
        <Box sx={{ mb: 3 }}>
          {studyDetails.risks.map((risk, index) => (
            <Typography key={index} variant="body1" sx={{ mb: 1 }}>
              • {risk}
            </Typography>
          ))}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Benefits:
        </Typography>
        <Box sx={{ mb: 3 }}>
          {studyDetails.benefits.map((benefit, index) => (
            <Typography key={index} variant="body1" sx={{ mb: 1 }}>
              • {benefit}
            </Typography>
          ))}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Contact Information:
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          For questions or concerns, contact:<br />
          {studyDetails.investigator.name}<br />
          {studyDetails.investigator.role}<br />
          {studyDetails.investigator.institution}<br />
          Mob: {studyDetails.investigator.contact}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
            }
            label="I have read and understood the information above. I voluntarily agree to participate in this study and understand I can withdraw at any time without penalty."
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleDecline}
          >
            Decline
          </Button>
          <Button
            variant="contained"
            disabled={!accepted}
            onClick={handleConsent}
          >
            Accept and Continue to Login
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
};

const CompletionStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Box textAlign="center">
        <FaHeart style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '2rem' }} />
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
          Registration Complete!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Your account has been created successfully. Please wait for admin approval to access your dashboard.
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, p: 3, backgroundColor: 'action.hover', borderRadius: 2 }}>
          <strong>Your ID:</strong> {formData.generatedId}
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push('/')}
          sx={{ px: 4, py: 2 }}
        >
          Back to Home
        </Button>
      </Box>
    </motion.div>
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: 'background.default',
      py: 4
    }}>
      {/* Header */}
      <Box sx={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1000
      }}>
        <IconButton onClick={toggleTheme}>
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </IconButton>
      </Box>

      <Container maxWidth="lg">
        {/* Stepper */}
        <Box sx={{ mb: 6 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeStep === 0 && <UserTypeSelection />}
          {activeStep === 1 && (
            userType === 'caregiver' ? 
              <CaregiverForm formData={formData} setFormData={setFormData} onNext={() => setActiveStep(2)} /> :
              <PatientForm formData={formData} setFormData={setFormData} onNext={() => setActiveStep(2)} />
          )}
          {activeStep === 2 && (
            <ConsentForm 
              userType={userType} 
              formData={formData}
              onAccept={() => setActiveStep(3)} 
            />
          )}
          {activeStep === 3 && <CompletionStep formData={formData} />}
        </AnimatePresence>

        {/* Navigation */}
        {activeStep > 0 && activeStep < 2 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              startIcon={<FaArrowLeft />}
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

// Caregiver Form Component
const CaregiverForm = ({ formData, setFormData, onNext }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 'name',
      question: 'What is your full name?',
      type: 'text',
      required: true
    },
    {
      id: 'email',
      question: 'What is your email address?',
      type: 'email',
      required: true
    },
    {
      id: 'phone',
      question: 'What is your phone number?',
      type: 'tel',
      required: true
    },
    {
      id: 'experience',
      question: 'How many years of caregiving experience do you have?',
      type: 'select',
      options: ['0-1 years', '1-3 years', '3-5 years', '5+ years'],
      required: true
    },
    {
      id: 'specialization',
      question: 'What is your area of specialization?',
      type: 'select',
      options: ['General Care', 'Oncology', 'Mental Health', 'Palliative Care', 'Other'],
      required: true
    },
    {
      id: 'relationshipToPatient',
      question: 'What is your relationship to cancer patients?',
      type: 'select',
      options: ['Professional Caregiver', 'Family Member', 'Friend', 'Volunteer'],
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

        {questions[currentQuestion].type === 'select' ? (
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
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '16px'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleAnswer(e.target.value.trim());
                }
              }}
            />
            <Button
              fullWidth
              variant="contained"
              endIcon={<FaArrowRight />}
              onClick={() => {
                const input = document.querySelector('input');
                if (input.value.trim()) {
                  handleAnswer(input.value.trim());
                }
              }}
            >
              {currentQuestion === questions.length - 1 ? 'Complete Registration' : 'Next Question'}
            </Button>
          </Box>
        )}
      </Card>
    </motion.div>
  );
};

// Patient Form Component
const PatientForm = ({ formData, setFormData, onNext }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 'name',
      question: 'What is your full name?',
      type: 'text',
      required: true
    },
    {
      id: 'email',
      question: 'What is your email address?',
      type: 'email',
      required: true
    },
    {
      id: 'phone',
      question: 'What is your phone number?',
      type: 'tel',
      required: true
    },
    {
      id: 'age',
      question: 'What is your age?',
      type: 'number',
      required: true
    },
    {
      id: 'cancerType',
      question: 'What type of cancer have you been diagnosed with?',
      type: 'select',
      options: ['Breast Cancer', 'Lung Cancer', 'Prostate Cancer', 'Colorectal Cancer', 'Other'],
      required: true
    },
    {
      id: 'stage',
      question: 'What stage is your cancer?',
      type: 'select',
      options: ['Stage I', 'Stage II', 'Stage III', 'Stage IV', 'Unknown'],
      required: true
    },
    {
      id: 'treatmentStatus',
      question: 'What is your current treatment status?',
      type: 'select',
      options: ['Newly Diagnosed', 'Currently in Treatment', 'Post Treatment', 'Remission'],
      required: true
    },
    {
      id: 'diagnosisDate',
      question: 'When were you diagnosed? (Approximate date)',
      type: 'date',
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
      const generatedId = `PT${Date.now().toString(36).toUpperCase()}`;
      setFormData({ ...newAnswers, userType: 'patient', generatedId });

      // Submit to API
      submitRegistration({ ...newAnswers, userType: 'patient', patientId: generatedId });
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

        {questions[currentQuestion].type === 'select' ? (
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
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '16px'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleAnswer(e.target.value.trim());
                }
              }}
            />
            <Button
              fullWidth
              variant="contained"
              endIcon={<FaArrowRight />}
              onClick={() => {
                const input = document.querySelector('input');
                if (input.value.trim()) {
                  handleAnswer(input.value.trim());
                }
              }}
            >
              {currentQuestion === questions.length - 1 ? 'Complete Registration' : 'Next Question'}
            </Button>
          </Box>
        )}
      </Card>
    </motion.div>
  );
};
