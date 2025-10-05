import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
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
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { useRouter } from 'next/router';

import ConsentForm from '../components/ConsentForm';
import CaregiverQuestions from '../components/CaregiverQuestions';
import LanguageSelector from '../components/LanguageSelector';

export default function Onboarding() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentLanguage } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({});
  const [consentAccepted, setConsentAccepted] = useState(false);
  const router = useRouter();

  const getSteps = () => [
    getTranslation(currentLanguage, 'chooseRole'),
    getTranslation(currentLanguage, 'consentForm'),
    getTranslation(currentLanguage, 'demographicQuestions'),
    getTranslation(currentLanguage, 'completeRegistration')
  ];

  const steps = getSteps();

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
          {getTranslation(currentLanguage, 'welcome')}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          {getTranslation(currentLanguage, 'selectRole')}
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
                  {getTranslation(currentLanguage, 'caregiver')}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {getTranslation(currentLanguage, 'caregiverDesc')}
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
                  {getTranslation(currentLanguage, 'patient')}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {getTranslation(currentLanguage, 'patientDesc')}
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
      onAccept(); // This will trigger setActiveStep(2) to show demographic questions
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
            label={getTranslation(currentLanguage, "consentText")}
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

const CompletionStep = ({ formData }) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Only start countdown if we have the required data
    if (formData?.generatedId && formData?.userType) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Redirect to login with pre-filled data
            router.push(`/login?userId=${formData.generatedId}&userType=${formData.userType}&auto=true`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [formData?.generatedId, formData?.userType, router]);

  const handleLoginNow = () => {
    if (formData?.generatedId && formData?.userType) {
      router.push(`/login?userId=${formData.generatedId}&userType=${formData.userType}&auto=true`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Box textAlign="center">
        <FaHeart style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '2rem' }} />
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
          {getTranslation(currentLanguage, 'registrationComplete')}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          {getTranslation(currentLanguage, 'accountCreatedSuccess')}
        </Typography>
        {formData?.generatedId ? (
          <>
            <Typography variant="body1" sx={{ mb: 2, p: 3, backgroundColor: 'action.hover', borderRadius: 2 }}>
              <strong>{getTranslation(currentLanguage, 'yourId')}</strong> {formData.generatedId}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              {getTranslation(currentLanguage, 'saveIdForLogin')}
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {getTranslation(currentLanguage, 'redirectingToLogin')} {countdown} {getTranslation(currentLanguage, 'seconds')}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleLoginNow}
                sx={{ px: 4, py: 2, mr: 2 }}
              >
                {getTranslation(currentLanguage, 'loginNow')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/')}
                sx={{ px: 4, py: 2 }}
              >
                {getTranslation(currentLanguage, 'backToHome')}
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {getTranslation(currentLanguage, 'registrationCompletedSuccess')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/login')}
              sx={{ px: 4, py: 2, mr: 2 }}
            >
              {getTranslation(currentLanguage, 'goToLogin')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/')}
              sx={{ px: 4, py: 2 }}
            >
              {getTranslation(currentLanguage, "backToHome")}
            </Button>
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: 'background.default',
      py: 4
    }}>
      {/* Header */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        px: 3, 
        py: 1.5, 
        backgroundColor: 'background.paper', 
        boxShadow: 1, 
        zIndex: 1100 
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          Cancer Care Support
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LanguageSelector />
          <IconButton onClick={toggleTheme} color="inherit">
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </IconButton>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ pt: 10 }}>
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
            <ConsentForm 
              userType={userType} 
              formData={formData}
              onAccept={() => {
                setConsentAccepted(true);
                setActiveStep(2);
              }} 
            />
          )}
          {activeStep === 2 && (
            userType === 'caregiver' ? 
              <CaregiverForm 
                formData={formData} 
                setFormData={setFormData} 
                onNext={() => setActiveStep(3)} 
                onBack={() => setActiveStep(1)}
                consentAccepted={consentAccepted}
              /> :
              <PatientForm 
                formData={formData} 
                setFormData={setFormData} 
                onNext={() => setActiveStep(3)} 
                onBack={() => setActiveStep(1)}
                consentAccepted={consentAccepted}
              />
          )}
          {activeStep === 3 && <CompletionStep formData={formData} />}
        </AnimatePresence>


      </Container>
    </Box>
  );
}

// Caregiver Form Component
function CaregiverForm({ formData, setFormData, onNext, onBack, consentAccepted }) {
  const { currentLanguage } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  // Helper function to translate options
  const translateOption = (option) => {
    const optionMap = {
      'Male': getTranslation(currentLanguage, 'male'),
      'Female': getTranslation(currentLanguage, 'female'),
      'Non-binary': getTranslation(currentLanguage, 'nonBinary'),
      'Prefer not to say': getTranslation(currentLanguage, 'preferNotToSay'),
      'Other': getTranslation(currentLanguage, 'other'),
      'Single': getTranslation(currentLanguage, 'single'),
      'Married': getTranslation(currentLanguage, 'married'),
      'Widowed': getTranslation(currentLanguage, 'widowed'),
      'Divorced': getTranslation(currentLanguage, 'divorced'),
      'Separated': getTranslation(currentLanguage, 'separated'),
      'No formal education': getTranslation(currentLanguage, 'noFormalEducation'),
      'Primary education': getTranslation(currentLanguage, 'primaryEducation'),
      'Secondary education': getTranslation(currentLanguage, 'secondaryEducation'),
      'Higher secondary': getTranslation(currentLanguage, 'higherSecondary'),
      'Undergraduate degree': getTranslation(currentLanguage, 'undergraduateDegree'),
      'Postgraduate degree': getTranslation(currentLanguage, 'postgraduateDegree'),
      'Full-time employed': getTranslation(currentLanguage, 'fullTimeEmployed'),
      'Part-time employed': getTranslation(currentLanguage, 'partTimeEmployed'),
      'Self-employed': getTranslation(currentLanguage, 'selfEmployed'),
      'Unemployed': getTranslation(currentLanguage, 'unemployed'),
      'Retired': getTranslation(currentLanguage, 'retired'),
      'Student': getTranslation(currentLanguage, 'student'),
      'Homemaker': getTranslation(currentLanguage, 'homemaker'),
      
      // Residential Area options
      'Urban': getTranslation(currentLanguage, 'urban'),
      'Rural': getTranslation(currentLanguage, 'rural'),
      'Suburban': getTranslation(currentLanguage, 'suburban'),
      
      // Relationship options
      'Spouse': getTranslation(currentLanguage, 'spouse'),
      'Parent': getTranslation(currentLanguage, 'parent'),
      'Child': getTranslation(currentLanguage, 'child'),
      'Sibling': getTranslation(currentLanguage, 'sibling'),
      
      // Hours per day options
      'Less than 2 hours': getTranslation(currentLanguage, 'lessThanTwoHours'),
      '2-4 hours': getTranslation(currentLanguage, 'twoToFourHours'),
      '5-8 hours': getTranslation(currentLanguage, 'fiveToEightHours'),
      'More than 8 hours': getTranslation(currentLanguage, 'moreThanEightHours'),
      
      // Age options
      'sixtyOneAndAbove': getTranslation(currentLanguage, 'sixtyOneAndAbove'),
      
      // Caregiver-specific options
      'Less than 6 months': getTranslation(currentLanguage, 'lessThanSixMonths'),
      '6-12 months': getTranslation(currentLanguage, 'sixToTwelveMonths'),
      '1-2 years': getTranslation(currentLanguage, 'oneToTwoYears'),
      '2-5 years': getTranslation(currentLanguage, 'twoToFiveYears'),
      'More than 5 years': getTranslation(currentLanguage, 'moreThanFiveYears'),
      'Yes': getTranslation(currentLanguage, 'yes'),
      'No': getTranslation(currentLanguage, 'no'),
      'Family Support': getTranslation(currentLanguage, 'familySupport'),
      'Friends': getTranslation(currentLanguage, 'friends'),
      'Community Support Groups': getTranslation(currentLanguage, 'communitySupportGroups'),
      'Religious/Spiritual Support': getTranslation(currentLanguage, 'religiousSupport'),
      'Professional Support Services': getTranslation(currentLanguage, 'professionalSupport'),
      'None': getTranslation(currentLanguage, 'none'),
      'Diabetes': getTranslation(currentLanguage, 'diabetes'),
      'Hypertension': getTranslation(currentLanguage, 'hypertension'),
      'Heart Disease': getTranslation(currentLanguage, 'heartDisease'),
      'Arthritis': getTranslation(currentLanguage, 'arthritis'),
      'Back Pain': getTranslation(currentLanguage, 'backPain'),
      'Respiratory Issues': getTranslation(currentLanguage, 'respiratoryIssues'),
      'Depression': getTranslation(currentLanguage, 'depression'),
      'Anxiety': getTranslation(currentLanguage, 'anxiety'),
      'Stress-related disorder': getTranslation(currentLanguage, 'stressDisorder'),
      'Sleep Issues': getTranslation(currentLanguage, 'sleepIssues')
    };
    return optionMap[option] || option;
  };
  
  // Helper function to get translated question
  const getQuestionText = (questionId) => {
    const translations = {
      name: getTranslation(currentLanguage, 'fullName'),
      phone: getTranslation(currentLanguage, 'phoneNumber'), 
      age: getTranslation(currentLanguage, 'age'),
      gender: getTranslation(currentLanguage, 'gender'),
      maritalStatus: getTranslation(currentLanguage, 'maritalStatusQuestion'),
      educationLevel: getTranslation(currentLanguage, 'educationLevelQuestion'),
      employmentStatus: getTranslation(currentLanguage, 'employmentStatusQuestion')
    };
    return translations[questionId] || questionId;
  };
  
  // Helper function to get translated options
  const getOptionText = (optionValue) => {
    const optionTranslations = {
      'Male': getTranslation(currentLanguage, 'male'),
      'Female': getTranslation(currentLanguage, 'female'),
      'Non-binary': getTranslation(currentLanguage, 'nonBinary'),
      'Prefer not to say': getTranslation(currentLanguage, 'preferNotToSay'),
      'Other': getTranslation(currentLanguage, 'other'),
      'Single': getTranslation(currentLanguage, 'single'),
      'Married': getTranslation(currentLanguage, 'married'),
      'Widowed': getTranslation(currentLanguage, 'widowed'),
      'Divorced': getTranslation(currentLanguage, 'divorced'),
      'Separated': getTranslation(currentLanguage, 'separated'),
      'No formal education': getTranslation(currentLanguage, 'noFormalEducation'),
      'Primary education': getTranslation(currentLanguage, 'primaryEducation'),
      'Secondary education': getTranslation(currentLanguage, 'secondaryEducation'),
      'Higher secondary': getTranslation(currentLanguage, 'higherSecondary'),
      'Undergraduate degree': getTranslation(currentLanguage, 'undergraduateDegree'),
      'Postgraduate degree': getTranslation(currentLanguage, 'postgraduateDegree'),
      'Full-time employed': getTranslation(currentLanguage, 'fullTimeEmployed'),
      'Part-time employed': getTranslation(currentLanguage, 'partTimeEmployed'),
      'Self-employed': getTranslation(currentLanguage, 'selfEmployed'),
      'Unemployed': getTranslation(currentLanguage, 'unemployed'),
      'Retired': getTranslation(currentLanguage, 'retired'),
      'Student': getTranslation(currentLanguage, 'student'),
      'Homemaker': getTranslation(currentLanguage, 'homemaker')
    };
    return optionTranslations[optionValue] || optionValue;
  };

  const handleSubmitAnswer = (value) => {
    const currentQ = questions[currentQuestion];
    let finalValue = value;

    // Handle 'Other' option for fields that allow it
    if (currentQ.allowOther && value === 'Other') {
      finalValue = answers[`${currentQ.id}Other`] || 'Other';
    }

    // Merge current answer into state
    const mergedAnswers = { ...answers, [currentQ.id]: finalValue };

    if (currentQuestion < questions.length - 1) {
      setAnswers(mergedAnswers);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Generate ID and complete registration
      const generatedId = `CG${Date.now().toString(36).toUpperCase()}`;
      setFormData({ ...mergedAnswers, userType: 'caregiver', generatedId });

      // Submit to API with full caregiver payload
      submitRegistration({
        ...mergedAnswers,
        userType: 'caregiver',
        caregiverId: generatedId,
        consentAccepted: !!consentAccepted,
        questionnaireAnswers: mergedAnswers
      });

      onNext();
    }
  };

  const questions = [
    {
      section: 'Personal Details',
      id: 'name',
      question: 'What is your full name?',
      type: 'text',
      placeholder: 'Enter your full name',
      pattern: '^[a-zA-Z ]+$',
      required: true
    },
    {
      section: 'Personal Details',
      id: 'phone',
      question: 'What is your phone number?',
      type: 'tel',
      placeholder: 'Enter your phone number',
      pattern: '^[0-9]{10}$',
      required: true
    },

    {
      section: 'Personal Details',
      id: 'age',
      question: 'Age (in years):',
      type: 'radio',
      options: ['18-30', '31-40', '41-50', '51-60', 'sixtyOneAndAbove'],
      allowOther: true,
      required: true
    },
  
    {
      section: 'Personal Details',
      id: 'gender',
      question: 'Gender:',
      type: 'radio',
      options: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'],
      allowOther: true,
      required: true
    },
    {
      section: 'Personal Details',
      id: 'maritalStatus',
      question: 'Marital Status:',
      type: 'radio',
      options: ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'],
      required: true
    },
    {
      section: 'Personal Details',
      id: 'educationLevel',
      question: 'Educational Level:',
      type: 'radio',
      options: ['No formal education', 'Primary education', 'Secondary education', 'Higher secondary', 'Undergraduate degree', 'Postgraduate degree'],
      required: true
    },
    {
      section: 'Personal Details',
      id: 'employmentStatus',
      question: 'Employment Status:',
      type: 'radio',
      options: ['Full-time employed', 'Part-time employed', 'Self-employed', 'Unemployed', 'Retired', 'Student', 'Homemaker'],
      required: true
    },
    {
      section: 'Personal Details',
      id: 'residentialArea',
      question: 'Residential Area:',
      type: 'radio',
      options: ['Urban', 'Rural', 'Suburban'],
      required: true
    },
  

    {
      section: 'Caregiving Information',
      id: 'relationshipToPatient',
      question: 'Relationship to the Patient:',
      type: 'radio',
      options: ['Spouse', 'Parent', 'Child', 'Sibling', 'Other'],
      allowOther: true,
      required: true
    },
    {
      section: 'Caregiving Information',
      id: 'hoursPerDay',
      question: 'Hours Spent Caring per Day:',
      type: 'radio',
      options: ['Less than 2 hours', '2-4 hours', '5-8 hours', 'More than 8 hours'],
      required: true
    },
    {
      section: 'Caregiving Information',
      id: 'durationOfCaregiving',
      question: 'Duration of Caregiving:',
      type: 'radio',
      options: ['Less than 6 months', '6-12 months', '1-2 years', '2-5 years', 'More than 5 years'],
      required: true
    },
    {
      section: 'Caregiving Information',
      id: 'previousExperience',
      question: 'Previous Experience as a Caregiver:',
      type: 'radio',
      options: ['Yes', 'No'],
      required: true
    },
   
    {
      section: 'Caregiving Information',
      id: 'supportSystem',
      question: 'Support System Available (select all that apply):',
      type: 'multiSelect',
      options: ['Family Support', 'Friends', 'Community Support Groups', 'Religious/Spiritual Support', 'Professional Support Services', 'None'],
      required: true
    },
    {
      section: 'Health and Well-being',
      id: 'physicalHealth',
      question: 'Physical Health Conditions (select all that apply):',
      type: 'multiSelect',
      options: ['None', 'Diabetes', 'Hypertension', 'Heart Disease', 'Arthritis', 'Back Pain', 'Respiratory Issues', 'Other'],
      allowOther: true,
      required: true
    },
    {
      section: 'Health and Well-being',
      id: 'mentalHealth',
      question: 'Mental Health Conditions (select all that apply):',
      type: 'multiSelect',
      options: ['None', 'Depression', 'Anxiety', 'Stress-related disorder', 'Sleep Issues', 'Other'],
      allowOther: true,
      required: true
    },
  
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
      submitRegistration({ 
        ...newAnswers, 
        userType: 'caregiver', 
        caregiverId: generatedId,
        consentAccepted: consentAccepted,
        questionnaireAnswers: newAnswers
      });
      onNext();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      // If on first question, go back to consent form
      onBack();
    }
  };

  const submitRegistration = async (data) => {
    try {
      console.log('Submitting caregiver registration data:', data);
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      console.log('Caregiver registration response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || getTranslation(currentLanguage, 'registrationFailed'));
      }
      
      console.log('Caregiver registration successful:', result);
    } catch (error) {
      console.error('Caregiver registration error:', error);
      alert(getTranslation(currentLanguage, 'registrationFailed') + ': ' + error.message);
    }
  };

  const renderField = () => {
    const question = questions[currentQuestion];
    const currentValue = answers[question.id] || (question.type === 'multiSelect' ? [] : '');

    switch (question.type) {
      case 'multiSelect':
        return (
          <Grid container spacing={2}>
            {question.options.map((option) => {
              const isSelected = currentValue.includes(option);
              const isNoneSelected = option === 'None' ? isSelected : currentValue.includes('None');
              
              return (
                <Grid item xs={12} sm={6} key={translateOption(option)}>
                  <Button
                    fullWidth
                    variant={isSelected ? "contained" : "outlined"}
                    onClick={() => {
                      let newValue;
                      if (option === 'None') {
                        newValue = isSelected ? [] : ['None'];
                      } else {
                        if (isNoneSelected) {
                          newValue = [option];
                        } else {
                          newValue = isSelected
                            ? currentValue.filter(val => val !== option)
                            : [...currentValue, option];
                        }
                      }
                      setAnswers({ ...answers, [question.id]: newValue });
                    }}
                    disabled={option !== 'None' && isNoneSelected}
                    sx={{
                      p: 2,
                      textAlign: 'left',
                      backgroundColor: isSelected ? 'primary.main' : 'transparent',
                      color: isSelected ? 'white' : 'inherit',
                      '&:hover': isSelected 
                        ? { backgroundColor: 'primary.dark' }
                        : { backgroundColor: 'primary.main', color: 'white' }
                    }}
                  >
                    {translateOption(option)}
                  </Button>
                </Grid>
              );
            })}
            {question.allowOther && currentValue.includes('Other') && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Please specify other condition"
                  value={answers[`${question.id}Other`] || ''}
                  onChange={(e) => setAnswers({
                    ...answers,
                    [`${question.id}Other`]: e.target.value
                  })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      // Replace "Other" with the custom text in the current value
                      let finalValue = currentValue.map(val => 
                        val === 'Other' ? e.target.value.trim() : val
                      );
                      handleAnswer(finalValue);
                    }
                  }}
                  sx={{ mt: 2 }}
                  label={getTranslation(currentLanguage, "pleaseSpecify")}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  let finalValue = currentValue;
                  // If "Other" is selected and there's text in the other field, replace "Other" with the custom text
                  if (question.allowOther && currentValue.includes('Other') && answers[`${question.id}Other`]) {
                    finalValue = currentValue.map(val => 
                      val === 'Other' ? answers[`${question.id}Other`] : val
                    );
                  }
                  handleAnswer(finalValue);
                }}
                disabled={!currentValue.length || (question.allowOther && currentValue.includes('Other') && !answers[`${question.id}Other`])}
                sx={{ mt: 2 }}
              >
                {currentQuestion === questions.length - 1 ? getTranslation(currentLanguage, 'completeRegistration') : getTranslation(currentLanguage, 'nextQuestion')}
              </Button>
            </Grid>
          </Grid>
        );

      case 'radio':
        return (
          <Grid container spacing={2}>
            {question.options.map((option) => (
              <Grid item xs={12} sm={6} key={translateOption(option)}>
                <Button
                  fullWidth
                  variant={currentValue === option ? "contained" : "outlined"}
                  onClick={() => handleAnswer(option)}
                  sx={{
                    p: 2,
                    textAlign: 'left',
                    backgroundColor: currentValue === option ? 'primary.main' : 'transparent',
                    color: currentValue === option ? 'white' : 'inherit',
                    '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                  }}
                >
                  {translateOption(option)}
                </Button>
              </Grid>
            ))}
            {question.allowOther && currentValue === 'Other' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder={getTranslation(currentLanguage, "pleaseSpecify")}
                  value={answers[`${question.id}Other`] || ''}
                  onChange={(e) => setAnswers({
                    ...answers,
                    [`${question.id}Other`]: e.target.value
                  })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      handleAnswer(e.target.value.trim());
                    }
                  }}
                  sx={{ mt: 2 }}
                />
              </Grid>
            )}
          </Grid>
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder={question.placeholder}
            value={currentValue}
            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && e.target.value.trim()) {
                e.preventDefault();
                handleAnswer(e.target.value.trim());
              }
            }}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            type={question.type}
            placeholder={question.placeholder}
            value={currentValue}
            inputProps={{
              min: question.min,
              max: question.max,
              pattern: question.pattern
            }}
            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                e.preventDefault();
                handleAnswer(e.target.value.trim());
              }
            }}
          />
        );
    }
  };

  const renderQuestionField = () => {
    const question = questions[currentQuestion];
    const currentValue = answers[question.id] || (question.type === 'multiSelect' ? [] : '');

    switch (question.type) {
      case 'multiSelect':
        return (
          <Grid container spacing={2}>
            {question.options.map((option) => {
              const isSelected = currentValue.includes(option);
              const isNoneSelected = option === 'None' ? isSelected : currentValue.includes('None');
              
              return (
                <Grid item xs={12} sm={6} key={translateOption(option)}>
                  <Button
                    fullWidth
                    variant={isSelected ? "contained" : "outlined"}
                    onClick={() => {
                      let newValue;
                      if (option === 'None') {
                        newValue = isSelected ? [] : ['None'];
                      } else {
                        if (isNoneSelected) {
                          newValue = [option];
                        } else {
                          newValue = isSelected
                            ? currentValue.filter(val => val !== option)
                            : [...currentValue, option];
                        }
                      }
                      setAnswers({ ...answers, [question.id]: newValue });
                    }}
                    disabled={option !== 'None' && isNoneSelected}
                    sx={{
                      p: 2,
                      textAlign: 'left',
                      backgroundColor: isSelected ? 'primary.main' : 'transparent',
                      color: isSelected ? 'white' : 'inherit',
                      '&:hover': isSelected 
                        ? { backgroundColor: 'primary.dark' }
                        : { backgroundColor: 'primary.main', color: 'white' }
                    }}
                  >
                    {translateOption(option)}
                  </Button>
                </Grid>
              );
            })}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleSubmitAnswer(currentValue)}
                disabled={!currentValue.length}
                sx={{ mt: 2 }}
              >
                {currentQuestion === questions.length - 1 ? getTranslation(currentLanguage, 'completeRegistration') : getTranslation(currentLanguage, 'nextQuestion')}
              </Button>
            </Grid>
          </Grid>
        );

      case 'radio':
        return (
          <Grid container spacing={2}>
            {question.options.map((option) => (
              <Grid item xs={12} sm={6} key={translateOption(option)}>
                <Button
                  fullWidth
                  variant={currentValue === option ? "contained" : "outlined"}
                  onClick={() => handleSubmitAnswer(option)}
                  sx={{
                    p: 2,
                    textAlign: 'left',
                    backgroundColor: currentValue === option ? 'primary.main' : 'transparent',
                    color: currentValue === option ? 'white' : 'inherit',
                    '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                  }}
                >
                  {translateOption(option)}
                </Button>
              </Grid>
            ))}
            {question.allowOther && currentValue === 'Other' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder={getTranslation(currentLanguage, "pleaseSpecify")}
                  value={answers[`${question.id}Other`] || ''}
                  onChange={(e) => setAnswers({
                    ...answers,
                    [`${question.id}Other`]: e.target.value
                  })}
                  sx={{ mt: 2 }}
                />
              </Grid>
            )}
          </Grid>
        );

      case 'textarea':
        return (
          <>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder={question.placeholder}
              value={currentValue}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleSubmitAnswer(currentValue)}
              disabled={!currentValue.trim()}
              sx={{ mt: 2 }}
            >
              {currentQuestion === questions.length - 1 ? getTranslation(currentLanguage, 'completeRegistration') : getTranslation(currentLanguage, 'nextQuestion')}
            </Button>
          </>
        );

      default:
        return (
          <>
            <TextField
              fullWidth
              type={question.type}
              placeholder={question.placeholder}
              value={currentValue}
              inputProps={{
                min: question.min,
                max: question.max,
                pattern: question.pattern
              }}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleSubmitAnswer(currentValue)}
              disabled={!currentValue.trim()}
              sx={{ mt: 2 }}
            >
              {currentQuestion === questions.length - 1 ? getTranslation(currentLanguage, 'completeRegistration') : getTranslation(currentLanguage, 'nextQuestion')}
            </Button>
          </>
        );
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
          {getTranslation(currentLanguage, "question")} {currentQuestion + 1} {getTranslation(currentLanguage, "of")} {questions.length}
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>
          {questions[currentQuestion].id === 'name' ? getTranslation(currentLanguage, 'fullName') :
           questions[currentQuestion].id === 'phone' ? getTranslation(currentLanguage, 'phoneNumber') :
           questions[currentQuestion].id === 'age' ? getTranslation(currentLanguage, 'age') :
           questions[currentQuestion].id === 'gender' ? getTranslation(currentLanguage, 'gender') :
           questions[currentQuestion].id === 'maritalStatus' ? getTranslation(currentLanguage, 'maritalStatusQuestion') :
           questions[currentQuestion].id === 'educationLevel' ? getTranslation(currentLanguage, 'educationLevelQuestion') :
           questions[currentQuestion].id === 'employmentStatus' ? getTranslation(currentLanguage, 'employmentStatusQuestion') :
           questions[currentQuestion].id === 'residentialArea' ? getTranslation(currentLanguage, 'residentialAreaQuestion') :
           questions[currentQuestion].id === 'relationshipToPatient' ? getTranslation(currentLanguage, 'relationshipToPatientQuestion') :
           questions[currentQuestion].id === 'hoursPerDay' ? getTranslation(currentLanguage, 'hoursPerDayQuestion') :
           questions[currentQuestion].id === 'durationOfCaregiving' ? getTranslation(currentLanguage, 'durationOfCaregivingQuestion') :
           questions[currentQuestion].id === 'previousExperience' ? getTranslation(currentLanguage, 'previousExperienceQuestion') :
           questions[currentQuestion].id === 'supportSystem' ? getTranslation(currentLanguage, 'supportSystemQuestion') :
           questions[currentQuestion].id === 'physicalHealth' ? getTranslation(currentLanguage, 'physicalHealthQuestion') :
           questions[currentQuestion].id === 'mentalHealth' ? getTranslation(currentLanguage, 'mentalHealthQuestion') :
           questions[currentQuestion].question}
        </Typography>
        {renderQuestionField()}
      </Card>
      
      {/* Back Button - Outside the card */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3, maxWidth: 600, mx: 'auto' }}>
        <Button
          startIcon={<FaArrowLeft />}
          onClick={handlePrevious}
          variant="outlined"
          sx={{ mr: 2 }}
        >
          {currentQuestion === 0 ? getTranslation(currentLanguage, 'backToConsentForm') : getTranslation(currentLanguage, 'previousQuestion')}
        </Button>
      </Box>
    </motion.div>
  );
};

// Patient Form Component
const PatientForm = ({ formData, setFormData, onNext, onBack, consentAccepted }) => {
  const { currentLanguage } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  // Helper function to translate options
  const translateOption = (option) => {
    const optionMap = {
      'Male': getTranslation(currentLanguage, 'male'),
      'Female': getTranslation(currentLanguage, 'female'),
      'Other': getTranslation(currentLanguage, 'other'),
      'Single': getTranslation(currentLanguage, 'single'),
      'Married': getTranslation(currentLanguage, 'married'),
      'Widowed': getTranslation(currentLanguage, 'widowed'),
      'Divorced': getTranslation(currentLanguage, 'divorced'),
      'Separated': getTranslation(currentLanguage, 'separated'),
      'No formal education': getTranslation(currentLanguage, 'noFormalEducation'),
      'Primary education': getTranslation(currentLanguage, 'primaryEducation'),
      'Secondary education': getTranslation(currentLanguage, 'secondaryEducation'),
      'Higher secondary': getTranslation(currentLanguage, 'higherSecondary'),
      'Undergraduate degree': getTranslation(currentLanguage, 'undergraduateDegree'),
      'Postgraduate degree': getTranslation(currentLanguage, 'postgraduateDegree'),
      'Full-time employed': getTranslation(currentLanguage, 'fullTimeEmployed'),
      'Part-time employed': getTranslation(currentLanguage, 'partTimeEmployed'),
      'Self-employed': getTranslation(currentLanguage, 'selfEmployed'),
      'Unemployed': getTranslation(currentLanguage, 'unemployed'),
      'Retired': getTranslation(currentLanguage, 'retired'),
      'Student': getTranslation(currentLanguage, 'student'),
      'Homemaker': getTranslation(currentLanguage, 'homemaker')
    };
    return optionMap[option] || option;
  };
  
  // Helper function to get translated question
  const getQuestionText = (questionId) => {
    const translations = {
      name: getTranslation(currentLanguage, 'fullName'),
      phone: getTranslation(currentLanguage, 'phoneNumber'), 
      age: getTranslation(currentLanguage, 'age'),
      gender: getTranslation(currentLanguage, 'gender'),
      maritalStatus: getTranslation(currentLanguage, 'maritalStatusQuestion'),
      educationLevel: getTranslation(currentLanguage, 'educationLevelQuestion'),
      employmentStatus: getTranslation(currentLanguage, 'employmentStatusQuestion')
    };
    return translations[questionId] || questionId;
  };
  
  // Helper function to get translated options
  const getOptionText = (optionValue) => {
    const optionTranslations = {
      'Male': getTranslation(currentLanguage, 'male'),
      'Female': getTranslation(currentLanguage, 'female'),
      'Other': getTranslation(currentLanguage, 'other'),
      'Single': getTranslation(currentLanguage, 'single'),
      'Married': getTranslation(currentLanguage, 'married'),
      'Widowed': getTranslation(currentLanguage, 'widowed'),
      'Divorced': getTranslation(currentLanguage, 'divorced'),
      'Separated': getTranslation(currentLanguage, 'separated'),
      'No formal education': getTranslation(currentLanguage, 'noFormalEducation'),
      'Primary education': getTranslation(currentLanguage, 'primaryEducation'),
      'Secondary education': getTranslation(currentLanguage, 'secondaryEducation'),
      'Higher secondary': getTranslation(currentLanguage, 'higherSecondary'),
      'Undergraduate degree': getTranslation(currentLanguage, 'undergraduateDegree'),
      'Postgraduate degree': getTranslation(currentLanguage, 'postgraduateDegree'),
      'Full-time employed': getTranslation(currentLanguage, 'fullTimeEmployed'),
      'Part-time employed': getTranslation(currentLanguage, 'partTimeEmployed'),
      'Self-employed': getTranslation(currentLanguage, 'selfEmployed'),
      'Unemployed': getTranslation(currentLanguage, 'unemployed'),
      'Retired': getTranslation(currentLanguage, 'retired'),
      'Student': getTranslation(currentLanguage, 'student'),
      'Homemaker': getTranslation(currentLanguage, 'homemaker')
    };
    return optionTranslations[optionValue] || optionValue;
  };

  const questions = [
    // Basic Information
    {
      id: 'name',
      question: 'What is your full name?',
      type: 'text',
      section: 'Basic Information',
      required: true
    },
    {
      id: 'phone',
      question: 'What is your phone number?',
      type: 'tel',
      section: 'Basic Information',
      required: true
    },

    // Section I: Demographic Questions
    {
      id: 'age',
      question: '1. Age (in years):',
      type: 'radio',
      section: 'Demographic Information',
      options: ['18-30', '31-40', '41-50', '51-60', 'sixtyOneAndAbove'],
      required: true
    },
    {
      id: 'gender',
      question: '2. Gender:',
      type: 'radio',
      section: 'Demographic Information',
      options: ['Male', 'Female', 'Other'],
      required: true
    },
    {
      id: 'maritalStatus',
      question: '3. Marital Status:',
      type: 'radio',
      section: 'Demographic Information',
      options: ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'],
      required: true
    },
    {
      id: 'educationLevel',
      question: '4. Educational Level:',
      type: 'radio',
      section: 'Demographic Information',
      options: ['No formal education', 'Primary education', 'Secondary education', 'Higher secondary', 'Undergraduate degree', 'Postgraduate degree'],
      required: true
    },
    {
      id: 'employmentStatus',
      question: '5. Employment Status:',
      type: 'radio',
      section: 'Demographic Information',
      options: ['Employed (Full-time/Part-time)', 'Unemployed', 'Retired', 'Homemaker', 'Student'],
      required: true
    },
    {
      id: 'residentialArea',
      question: '6. Residential Area:',
      type: 'radio',
      section: 'Demographic Information',
      options: ['Urban', 'Rural'],
      required: true
    },

    // Section II: Medical Information
    {
      id: 'cancerType',
      question: '7. Type of Cancer:',
      type: 'text',
      section: 'Medical Information',
      placeholder: 'Please specify your cancer type',
      required: true
    },
    {
      id: 'cancerStage',
      question: '8. Stage of Cancer:',
      type: 'radio',
      section: 'Medical Information',
      options: ['Stage I', 'Stage II', 'Stage III', 'Stage IV'],
      required: true
    },
    {
      id: 'treatmentModality',
      question: '9. Current Treatment Modality (check all that apply):',
      type: 'multiSelect',
      section: 'Medical Information',
      options: ['Chemotherapy', 'Radiation Therapy', 'Surgery', 'Immunotherapy', 'Hormone Therapy', 'Other'],
      allowOther: true,
      required: true
    },
    {
      id: 'illnessDuration',
      question: '10. Duration of Illness (since diagnosis):',
      type: 'radio',
      section: 'Medical Information',
      options: ['Less than 6 months', '6-12 months', '1-2 years', 'More than 2 years'],
      required: true
    },
    {
      id: 'comorbidities',
      question: '11. Other Comorbidities (check all that apply):',
      type: 'multiSelect',
      section: 'Medical Information',
      options: ['Diabetes', 'Hypertension', 'Cardiovascular disease', 'Respiratory Disorders', 'None', 'Other'],
      allowOther: true,
      required: true
    },
    {
      id: 'healthInsurance',
      question: '12. Health Insurance Coverage:',
      type: 'radio',
      section: 'Medical Information',
      options: ['Yes - Government', 'Yes - Private', 'No'],
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
      submitRegistration({ 
        ...newAnswers, 
        userType: 'patient', 
        patientId: generatedId,
        consentAccepted: !!consentAccepted,
        questionnaireAnswers: newAnswers
      });
      onNext();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      // If on first question, go back to consent form
      onBack();
    }
  };

  const submitRegistration = async (data) => {
    try {
      console.log('Submitting patient registration data:', data);
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      console.log('Patient registration response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || getTranslation(currentLanguage, 'registrationFailed'));
      }
      
      console.log('Patient registration successful:', result);
    } catch (error) {
      console.error('Patient registration error:', error);
      alert(getTranslation(currentLanguage, 'registrationFailed') + ': ' + error.message);
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
          {getTranslation(currentLanguage, "question")} {currentQuestion + 1} {getTranslation(currentLanguage, "of")} {questions.length}
        </Typography>
        {questions[currentQuestion].section && (
          <Typography variant="subtitle1" sx={{ mb: 2, color: 'primary.main', textAlign: 'center', fontWeight: 600 }}>
            {questions[currentQuestion].section}
          </Typography>
        )}
        <Typography variant="h6" sx={{ mb: 4 }}>
          {questions[currentQuestion].id === 'name' ? getTranslation(currentLanguage, 'fullName') :
           questions[currentQuestion].id === 'phone' ? getTranslation(currentLanguage, 'phoneNumber') :
           questions[currentQuestion].id === 'age' ? getTranslation(currentLanguage, 'age') :
           questions[currentQuestion].id === 'gender' ? getTranslation(currentLanguage, 'gender') :
           questions[currentQuestion].id === 'maritalStatus' ? getTranslation(currentLanguage, 'maritalStatusQuestion') :
           questions[currentQuestion].id === 'educationLevel' ? getTranslation(currentLanguage, 'educationLevelQuestion') :
           questions[currentQuestion].id === 'employmentStatus' ? getTranslation(currentLanguage, 'employmentStatusQuestion') :
           questions[currentQuestion].id === 'residentialArea' ? getTranslation(currentLanguage, 'residentialAreaQuestion') :
           questions[currentQuestion].id === 'cancerType' ? getTranslation(currentLanguage, 'cancerTypeQuestion') :
           questions[currentQuestion].id === 'cancerStage' ? getTranslation(currentLanguage, 'cancerStageQuestion') :
           questions[currentQuestion].id === 'treatmentModality' ? getTranslation(currentLanguage, 'treatmentModalityQuestion') :
           questions[currentQuestion].id === 'illnessDuration' ? getTranslation(currentLanguage, 'illnessDurationQuestion') :
           questions[currentQuestion].id === 'comorbidities' ? getTranslation(currentLanguage, 'comorbiditiesQuestion') :
           questions[currentQuestion].question}
        </Typography>

        {(() => {
          const question = questions[currentQuestion];
          const currentValue = answers[question.id] || (question.type === 'multiSelect' ? [] : '');

          switch (question.type) {
            case 'multiSelect':
              return (
                <Grid container spacing={2}>
                  {question.options.map((option) => {
                    const isSelected = currentValue.includes(option);
                    const isNoneSelected = option === 'None' ? isSelected : currentValue.includes('None');
                    
                    return (
                      <Grid item xs={12} sm={6} key={translateOption(option)}>
                        <Button
                          fullWidth
                          variant={isSelected ? "contained" : "outlined"}
                          onClick={() => {
                            let newValue;
                            if (option === 'None') {
                              newValue = isSelected ? [] : ['None'];
                            } else {
                              if (isNoneSelected) {
                                newValue = [option];
                              } else {
                                newValue = isSelected
                                  ? currentValue.filter(val => val !== option)
                                  : [...currentValue, option];
                              }
                            }
                            setAnswers({ ...answers, [question.id]: newValue });
                          }}
                          disabled={option !== 'None' && isNoneSelected}
                          sx={{
                            p: 2,
                            textAlign: 'left',
                            backgroundColor: isSelected ? 'primary.main' : 'transparent',
                            color: isSelected ? 'white' : 'inherit',
                            '&:hover': isSelected 
                              ? { backgroundColor: 'primary.dark' }
                              : { backgroundColor: 'primary.main', color: 'white' }
                          }}
                        >
                          {translateOption(option)}
                        </Button>
                      </Grid>
                    );
                  })}
                  {question.allowOther && currentValue.includes('Other') && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        placeholder="Please specify other treatment/condition"
                        value={answers[`${question.id}Other`] || ''}
                        onChange={(e) => setAnswers({
                          ...answers,
                          [`${question.id}Other`]: e.target.value
                        })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            e.preventDefault();
                            // Replace "Other" with the custom text in the current value
                            let finalValue = currentValue.map(val => 
                              val === 'Other' ? e.target.value.trim() : val
                            );
                            handleAnswer(finalValue);
                          }
                        }}
                        sx={{ mt: 2 }}
                        label={getTranslation(currentLanguage, "pleaseSpecify")}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => {
                        let finalValue = currentValue;
                        // If "Other" is selected and there's text in the other field, replace "Other" with the custom text
                        if (question.allowOther && currentValue.includes('Other') && answers[`${question.id}Other`]) {
                          finalValue = currentValue.map(val => 
                            val === 'Other' ? answers[`${question.id}Other`] : val
                          );
                        }
                        handleAnswer(finalValue);
                      }}
                      disabled={!currentValue.length || (currentValue.includes('Other') && question.allowOther && !answers[`${question.id}Other`])}
                      sx={{ mt: 2 }}
                    >
                      {currentQuestion === questions.length - 1 ? getTranslation(currentLanguage, 'completeRegistration') : getTranslation(currentLanguage, 'nextQuestion')}
                    </Button>
                  </Grid>
                </Grid>
              );

            case 'radio':
              return (
                <Grid container spacing={2}>
                  {question.options.map((option) => (
                    <Grid item xs={12} sm={6} key={translateOption(option)}>
                      <Button
                        fullWidth
                        variant={currentValue === option ? "contained" : "outlined"}
                        onClick={() => {
                          if (option === 'Other' && question.allowOther) {
                            setAnswers({ ...answers, [question.id]: option });
                          } else {
                            handleAnswer(option);
                          }
                        }}
                        sx={{
                          p: 2,
                          textAlign: 'left',
                          backgroundColor: currentValue === option ? 'primary.main' : 'transparent',
                          color: currentValue === option ? 'white' : 'inherit',
                          '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                        }}
                      >
                        {translateOption(option)}
                      </Button>
                    </Grid>
                  ))}
                  {question.allowOther && currentValue === 'Other' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        placeholder={getTranslation(currentLanguage, "pleaseSpecify")}
                        value={answers[`${question.id}Other`] || ''}
                        onChange={(e) => setAnswers({
                          ...answers,
                          [`${question.id}Other`]: e.target.value
                        })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            e.preventDefault();
                            handleAnswer(e.target.value.trim());
                          }
                        }}
                        sx={{ mt: 2 }}
                        label={getTranslation(currentLanguage, "pleaseSpecify")}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleAnswer(answers[`${question.id}Other`] || 'Other')}
                        disabled={!answers[`${question.id}Other`]}
                        sx={{ mt: 2 }}
                      >
                        {currentQuestion === questions.length - 1 ? getTranslation(currentLanguage, 'completeRegistration') : getTranslation(currentLanguage, 'nextQuestion')}
                      </Button>
                    </Grid>
                  )}
                </Grid>
              );

            case 'textarea':
              return (
                <>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder={question.placeholder}
                    value={currentValue}
                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleAnswer((currentValue || '').trim())}
                    disabled={!((currentValue || '').trim())}
                    sx={{ mt: 2 }}
                  >
                    {currentQuestion === questions.length - 1 ? getTranslation(currentLanguage, 'completeRegistration') : getTranslation(currentLanguage, 'nextQuestion')}
                  </Button>
                </>
              );

            default:
              return (
                <>
                  <TextField
                    fullWidth
                    type={question.type}
                    placeholder={question.placeholder}
                    value={currentValue}
                    inputProps={{
                      min: question.min,
                      max: question.max,
                      pattern: question.pattern
                    }}
                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleAnswer((currentValue || '').trim())}
                    disabled={!((currentValue || '').trim())}
                    sx={{ mt: 2 }}
                  >
                    {currentQuestion === questions.length - 1 ? getTranslation(currentLanguage, 'completeRegistration') : getTranslation(currentLanguage, 'nextQuestion')}
                  </Button>
                </>
              );
          }
        })()}
      </Card>

      {/* Back Button - Outside the card */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3, maxWidth: 600, mx: 'auto' }}>
        <Button
          startIcon={<FaArrowLeft />}
          onClick={handlePrevious}
          variant="outlined"
          sx={{ mr: 2 }}
        >
          {currentQuestion === 0 ? getTranslation(currentLanguage, 'backToConsentForm') : getTranslation(currentLanguage, 'previousQuestion')}
        </Button>
      </Box>
    </motion.div>
  );
};
