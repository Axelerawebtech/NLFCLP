// Test file for Zarit Burden Assessment functionality
// This file can be accessed at http://localhost:3000/test-assessment

import { useState } from 'react';
import { Box, Container, Typography, Button, Paper, Alert } from '@mui/material';
import ZaritBurdenAssessment from '../components/ZaritBurdenAssessment';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeContextProvider } from '../contexts/ThemeContext';

export default function TestAssessment() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);

  const handleComplete = (assessmentResult) => {
    console.log('Assessment completed with result:', assessmentResult);
    setResult(assessmentResult);
    setCompleted(true);
    setShowAssessment(false);
  };

  const resetTest = () => {
    setCompleted(false);
    setResult(null);
    setShowAssessment(false);
  };

  return (
    <ThemeContextProvider>
      <LanguageProvider>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h3" textAlign="center" gutterBottom color="primary">
              🧠 Zarit Burden Assessment Test
            </Typography>
            
            <Typography variant="body1" textAlign="center" sx={{ mb: 4, color: 'text.secondary' }}>
              This page tests the Zarit Burden Assessment component functionality
            </Typography>

            {!showAssessment && !completed && (
              <Box textAlign="center" sx={{ mb: 4 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  color="primary"
                  onClick={() => setShowAssessment(true)}
                  sx={{ px: 4, py: 2 }}
                >
                  🚀 Start Assessment Test
                </Button>
              </Box>
            )}

            {completed && result && (
              <Box sx={{ mb: 4 }}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="h6">
                    ✅ Assessment Completed Successfully!
                  </Typography>
                </Alert>
                
                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    Assessment Results:
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', overflow: 'auto' }}>
                    {JSON.stringify(result, null, 2)}
                  </Typography>
                </Paper>
                
                <Box textAlign="center" sx={{ mt: 3 }}>
                  <Button 
                    variant="outlined" 
                    onClick={resetTest}
                    sx={{ mr: 2 }}
                  >
                    🔄 Test Again
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={() => window.location.href = '/caregiver/dashboard'}
                  >
                    📊 Go to Dashboard
                  </Button>
                </Box>
              </Box>
            )}

            {showAssessment && !completed && (
              <Box sx={{ mt: 4 }}>
                <ZaritBurdenAssessment
                  caregiverId="TEST_CAREGIVER_123"
                  onComplete={handleComplete}
                />
              </Box>
            )}
          </Paper>
        </Container>
      </LanguageProvider>
    </ThemeContextProvider>
  );
}