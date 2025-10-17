import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { Box, Typography, Card } from '@mui/material';
import LanguageSelector from '../components/LanguageSelector';

export default function SimpleTest() {
  const { currentLanguage } = useLanguage();

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Simple Translation Test
        </Typography>
        
        <LanguageSelector />
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Current Language: {currentLanguage}</Typography>
          
          <Typography variant="h5" sx={{ mt: 2 }}>
            {getTranslation(currentLanguage, 'consentFormTitle')}
          </Typography>
          
          <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
            {getTranslation(currentLanguage, 'studyTitle')}
          </Typography>
          
          <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
            {getTranslation(currentLanguage, 'principalInvestigator')}
          </Typography>
          
          <Typography variant="body1" sx={{ mt: 2 }}>
            {getTranslation(currentLanguage, 'studyPurposeContent')}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}