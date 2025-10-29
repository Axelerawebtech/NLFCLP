// Simple API test to verify burden assessment
const fetch = require('node-fetch');

async function testBurdenAPI() {
  try {
    console.log('🧪 Testing burden assessment API...');
    
    const response = await fetch('http://localhost:3000/api/admin/burden-assessment/config');
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response body:', text);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response received');
    console.log('📊 Questions count:', data.config?.questions?.length || 0);
    console.log('📊 First question:', data.config?.questions?.[0]?.questionText?.english || 'N/A');
    console.log('📊 Score ranges defined:', !!data.config?.scoreRanges);
    
    if (data.config?.questions?.length > 0) {
      console.log('📋 Sample questions:');
      data.config.questions.slice(0, 3).forEach((q, i) => {
        console.log(`  ${i+1}. ${q.questionText?.english}`);
        console.log(`     Options: ${q.options?.length || 0}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBurdenAPI();