// Test file to debug assessment issues
// This file can be accessed at http://localhost:3000/test-assessment

import { useState } from 'react';

export default function TestAssessment() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAssessmentQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/caregiver/assessment-questions?day=0');
      const data = await response.json();
      setResult(`Questions API: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Questions API Error: ${error.message}`);
    }
    setLoading(false);
  };

  const testAssessmentSubmission = async () => {
    setLoading(true);
    try {
      const testData = {
        caregiverId: 'test-caregiver-123',
        day: 0,
        assessmentType: 'quick_assessment',
        responses: {
          'q1': 1,
          'q2': 0
        },
        totalScore: 1
      };

      const response = await fetch('/api/caregiver/daily-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      setResult(`Submission API: Status ${response.status}\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Submission API Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Assessment API Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testAssessmentQuestions}
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          Test Questions API
        </button>
        
        <button 
          onClick={testAssessmentSubmission}
          disabled={loading}
          style={{ padding: '10px' }}
        >
          Test Submission API
        </button>
      </div>

      {loading && <p>Loading...</p>}
      
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '5px',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
      }}>
        {result || 'Click a button to test the APIs'}
      </pre>
    </div>
  );
}