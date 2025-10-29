import { useState, useEffect } from 'react';
import { Box, Typography, Card } from '@mui/material';

export default function SimpleBurdenTest() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadQuestions() {
      try {
        console.log('Fetching burden assessment config...');
        const response = await fetch('/api/admin/burden-assessment/config');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        
        if (data.success && data.config && data.config.questions) {
          setQuestions(data.config.questions);
          console.log('Questions loaded:', data.config.questions.length);
        } else {
          throw new Error('Invalid data structure');
        }
      } catch (err) {
        console.error('Error loading questions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadQuestions();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading questions...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Burden Assessment Questions Test
      </Typography>
      <Typography variant="h6" gutterBottom>
        Total Questions: {questions.length}
      </Typography>
      
      {questions.slice(0, 3).map((question, index) => (
        <Card key={question.id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">
            Question {index + 1}: {question.questionText?.english}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Options: {question.options?.length || 0}
          </Typography>
          {question.options && question.options.length > 0 && (
            <Box sx={{ ml: 2, mt: 1 }}>
              {question.options.map((option, optIndex) => (
                <Typography key={optIndex} variant="body2">
                  {option.score}: {option.optionText?.english}
                </Typography>
              ))}
            </Box>
          )}
        </Card>
      ))}
    </Box>
  );
}