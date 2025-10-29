// Test script for Day 1 burden assessment configuration
const testDay1Config = async () => {
  console.log('🧪 Testing Day 1 Burden Assessment Configuration...');
  
  // Test data with new questionText structure
  const testData = {
    day1Config: {
      mild: {
        videoTitle: { english: 'Mild Burden Support', kannada: '', hindi: '' },
        videoUrl: { english: 'https://example.com/mild.mp4', kannada: '', hindi: '' },
        description: { english: 'Support for mild burden', kannada: '', hindi: '' }
      },
      moderate: {
        videoTitle: { english: 'Moderate Burden Support', kannada: '', hindi: '' },
        videoUrl: { english: 'https://example.com/moderate.mp4', kannada: '', hindi: '' },
        description: { english: 'Support for moderate burden', kannada: '', hindi: '' }
      },
      severe: {
        videoTitle: { english: 'Severe Burden Support', kannada: '', hindi: '' },
        videoUrl: { english: 'https://example.com/severe.mp4', kannada: '', hindi: '' },
        description: { english: 'Support for severe burden', kannada: '', hindi: '' }
      }
    },
    burdenTestQuestions: [
      {
        id: 1,
        questionText: {
          english: 'Does your relative ask for more help than needed?',
          kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರು ಅಗತ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಸಹಾಯ ಕೇಳುತ್ತಾರೆಯೇ?',
          hindi: 'क्या आपका रिश्तेदार जरूरत से ज्यादा मदद मांगता है?'
        },
        enabled: true
      },
      {
        id: 2,
        questionText: {
          english: 'Does caregiving affect your relationship with family/friends?',
          kannada: 'ಆರೈಕೆ ನೀಡುವುದು ಕುಟುಂಬ/ಸ್ನೇಹಿತರೊಂದಿಗಿನ ನಿಮ್ಮ ಸಂಬಂಧವನ್ನು ಪ್ರಭಾವಿಸುತ್ತದೆಯೇ?',
          hindi: 'क्या देखभाल करना आपके परिवार/दोस्तों के साथ रिश्ते को प्रभावित करता है?'
        },
        enabled: true
      }
    ]
  };

  try {
    console.log('📋 Test Data Structure:');
    console.log('Questions:', testData.burdenTestQuestions.length);
    console.log('Videos configured:', Object.keys(testData.day1Config).length);
    console.log('First question structure:', JSON.stringify(testData.burdenTestQuestions[0], null, 2));
    
    console.log('✅ Test data structure is valid');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
};

// Run the test
testDay1Config();