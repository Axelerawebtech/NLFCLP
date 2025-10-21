import { useState, useEffect } from 'react';
import Head from 'next/head';
import EnhancedCaregiverDashboard from '../components/EnhancedCaregiverDashboard';
import { LanguageProvider } from '../contexts/LanguageContext';

export default function TestEnhancedDashboard() {
  const [caregiverId, setCaregiverId] = useState('68ee51492d97086cc432aa26'); // Use the test caregiver ID

  return (
    <LanguageProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Head>
          <title>Enhanced Dashboard Test</title>
        </Head>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              🧪 Enhanced Dashboard Test
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              marginBottom: '16px'
            }}>
              Testing the new enhanced caregiver dashboard with content sequencing:
            </p>
            <ul style={{ fontSize: '14px', color: '#374151', paddingLeft: '20px' }}>
              <li>✅ Sequential content progression (video → audio → completion)</li>
              <li>✅ Day 0 completion tracking</li>
              <li>✅ Day 1 burden assessment with scoring</li>
              <li>✅ Module unlock system based on prerequisites</li>
              <li>✅ Progress tracking and percentage calculation</li>
            </ul>
          </div>

          <EnhancedCaregiverDashboard caregiverId={caregiverId} />
        </div>
      </div>
    </LanguageProvider>
  );
}