import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { Button, Typography, Box, Card } from '@mui/material';
import LanguageSelector from '../components/LanguageSelector';

export default function TestTranslations() {
  const { currentLanguage } = useLanguage();

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Translation Test Page
        </Typography>
        
        <LanguageSelector />
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Current Language: {currentLanguage}</Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              <strong>consentFormTitle:</strong> {getTranslation(currentLanguage, 'consentFormTitle')}
            </Typography>
            
            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>studyTitle:</strong> {getTranslation(currentLanguage, 'studyTitle')}
            </Typography>
            
            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>studyPurposeContent:</strong> {getTranslation(currentLanguage, 'studyPurposeContent')}
            </Typography>
            
            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>principalInvestigator:</strong> {getTranslation(currentLanguage, 'principalInvestigator')}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}