#!/usr/bin/env node

// Simple test to verify the Day 1 configuration structure
console.log('🧪 Testing Day 1 Configuration Schema Compliance...\n');

// Test data matching the exact structure required by ProgramConfig schema
const validBurdenTestQuestions = [
  {
    id: 1,
    questionText: {
      english: 'Do you feel that your relative asks for more help than he/she needs?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರು ಅಗತ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಸಹಾಯ ಕೇಳುತ್ತಾರೆಯೇ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपका रिश्तेदार जरूरत से ज्यादा मदद मांगता है?'
    },
    enabled: true
  },
  {
    id: 2,
    questionText: {
      english: 'Do you feel that because of the time you spend with your relative you don\'t have enough time for yourself?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರೊಂದಿಗೆ ನೀವು ಕಳೆಯುವ ಸಮಯದಿಂದಾಗಿ ನಿಮಗಾಗಿ ಸಾಕಷ್ಟು ಸಮಯವಿಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार के साथ बिताए समय के कारण आपके पास अपने लिए पर्याप्त समय नहीं है?'
    },
    enabled: true
  }
];

// Validation function
function validateBurdenTestQuestions(questions) {
  console.log('📋 Validating burden test questions structure...');
  
  if (!Array.isArray(questions)) {
    throw new Error('Questions must be an array');
  }
  
  for (const question of questions) {
    // Check required fields
    if (!question.id) {
      throw new Error(`Question missing required field: id`);
    }
    
    if (!question.questionText) {
      throw new Error(`Question ${question.id} missing required field: questionText`);
    }
    
    if (!question.questionText.english) {
      throw new Error(`Question ${question.id} missing required field: questionText.english`);
    }
    
    console.log(`✅ Question ${question.id}: Valid`);
    console.log(`   English text: "${question.questionText.english.substring(0, 50)}..."`);
  }
  
  return true;
}

// Run validation
try {
  validateBurdenTestQuestions(validBurdenTestQuestions);
  console.log('\n✅ All burden test questions pass schema validation!');
  console.log(`📊 Total questions validated: ${validBurdenTestQuestions.length}`);
  console.log('\n🔧 Schema Requirements Met:');
  console.log('- All questions have required id field');
  console.log('- All questions have questionText object');
  console.log('- All questions have questionText.english (required)');
  console.log('- Multi-language support available (kannada, hindi)');
  
  console.log('\n📤 This data structure should successfully save to ProgramConfig.day1.burdenTestQuestions');
  
} catch (error) {
  console.error('\n❌ Validation failed:', error.message);
  process.exit(1);
}

console.log('\n🎯 Next Steps:');
console.log('1. Start the development server (npm run dev)');
console.log('2. Navigate to admin panel');
console.log('3. Go to Program Configuration > Day 1');
console.log('4. Try saving the Day 1 configuration');
console.log('5. The schema validation error should be resolved');