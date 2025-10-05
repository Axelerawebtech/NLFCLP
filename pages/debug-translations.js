import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { Box, Typography, Button } from '@mui/material';

export default function DebugTranslations() {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Debug Translation System</Typography>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Current Language: {currentLanguage}</Typography>
        
        <Box sx={{ mt: 2 }}>
          <Button onClick={() => changeLanguage('en')} variant={currentLanguage === 'en' ? 'contained' : 'outlined'}>
            English
          </Button>
          <Button onClick={() => changeLanguage('hi')} variant={currentLanguage === 'hi' ? 'contained' : 'outlined'} sx={{ ml: 1 }}>
            हिंदी
          </Button>
          <Button onClick={() => changeLanguage('kn')} variant={currentLanguage === 'kn' ? 'contained' : 'outlined'} sx={{ ml: 1 }}>
            ಕನ್ನಡ
          </Button>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Testing Key Translations:</Typography>
          
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>consentFormTitle:</strong> "{getTranslation(currentLanguage, 'consentFormTitle')}"
          </Typography>
          
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>studyTitle:</strong> "{getTranslation(currentLanguage, 'studyTitle')}"
          </Typography>
          
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>studyPurposeContent:</strong> "{getTranslation(currentLanguage, 'studyPurposeContent')}"
          </Typography>
          
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>principalInvestigator:</strong> "{getTranslation(currentLanguage, 'principalInvestigator')}"
          </Typography>

          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Raw translation check:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            EN consentFormTitle: "{getTranslation('en', 'consentFormTitle')}"
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            HI consentFormTitle: "{getTranslation('hi', 'consentFormTitle')}"
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            KN consentFormTitle: "{getTranslation('kn', 'consentFormTitle')}"
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}