import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

const ConsentForm = ({ userType, onAccept, formData }) => {
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const { currentLanguage } = useLanguage();
  const router = useRouter();

  // Force re-render when language changes
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [currentLanguage]);

  // Debug logging
  console.log('ConsentForm render - currentLanguage:', currentLanguage);
  console.log('ConsentForm - consentFormTitle:', getTranslation(currentLanguage, 'consentFormTitle'));
  console.log('ConsentForm - studyTitle:', getTranslation(currentLanguage, 'studyTitle'));

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
        key={`consent-declined-${currentLanguage}`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card sx={{ maxWidth: 600, mx: 'auto', p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            {getTranslation(currentLanguage, 'thankYouResponse')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            {getTranslation(currentLanguage, 'takeYourTime')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/')}
          >
            {getTranslation(currentLanguage, 'returnToHome')}
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={`consent-form-${currentLanguage}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
        {/* Debug Info */}
        <Box sx={{ mb: 2, p: 2, backgroundColor: '#f0f0f0', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Debug: Language = {currentLanguage} | Title = "{getTranslation(currentLanguage, 'consentFormTitle')}"
          </Typography>
        </Box>
        
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'consentFormTitle')}
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', whiteSpace: 'pre-line' }}>
          {getTranslation(currentLanguage, 'studyTitle')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {currentLanguage === 'hi' ? 'मुख्य शोधकर्ता:' : currentLanguage === 'kn' ? 'ಮುಖ್ಯ ತನಿಖಾಧಿಕಾರಿ:' : 'Principal Investigator:'}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
          {getTranslation(currentLanguage, 'principalInvestigator')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'purposeOfStudy')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {getTranslation(currentLanguage, 'studyPurposeContent')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'studyProcedures')}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'procedure1')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'procedure2')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'procedure3')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'procedure4')}
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'duration')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {getTranslation(currentLanguage, 'studyDurationContent')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'voluntaryParticipation')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {getTranslation(currentLanguage, 'voluntaryParticipationContent')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'risksAndDiscomforts')}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'risk1')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'risk2')}
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'benefits')}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'benefit1')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {getTranslation(currentLanguage, 'benefit2')}
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'confidentiality')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {getTranslation(currentLanguage, 'confidentialityContent')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'compensation')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {getTranslation(currentLanguage, 'compensationContent')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'contactInformation')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
          {getTranslation(currentLanguage, 'contactText')}
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {getTranslation(currentLanguage, 'consentDeclaration')}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
            }
            label={
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {getTranslation(currentLanguage, 'consentText')}
              </Typography>
            }
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleDecline}
          >
            {getTranslation(currentLanguage, 'decline')}
          </Button>
          <Button
            variant="contained"
            disabled={!accepted}
            onClick={handleConsent}
          >
            {getTranslation(currentLanguage, 'acceptAndContinue')}
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
};

export default ConsentForm;
