// Test the burden assessment config API to see question structure

async function testBurdenConfig() {
  try {
    const response = await fetch('http://localhost:3002/api/admin/burden-assessment/config');
    const data = await response.json();
    
    console.log('🔍 API Response Status:', response.status);
    console.log('📊 Config Success:', data.success);
    
    if (data.success && data.config?.questions) {
      console.log('📋 Questions Count:', data.config.questions.length);
      
      // Examine the first question structure
      const firstQuestion = data.config.questions[0];
      console.log('\n📝 First Question Structure:');
      console.log('Question keys:', Object.keys(firstQuestion));
      console.log('Question ID:', firstQuestion.id);
      console.log('Question Text:', firstQuestion.questionText);
      console.log('Options count:', firstQuestion.options?.length);
      
      if (firstQuestion.options && firstQuestion.options.length > 0) {
        console.log('\n🔧 First Option Structure:');
        const firstOption = firstQuestion.options[0];
        console.log('Option keys:', Object.keys(firstOption));
        console.log('Option text:', firstOption.optionText);
        console.log('Option score:', firstOption.score);
      }
      
      // Check if we have proper English text
      console.log('\n🌐 Language Support Check:');
      console.log('Question Text English:', firstQuestion.questionText?.english);
      console.log('First Option Text English:', firstQuestion.options?.[0]?.optionText?.english);
      
    } else {
      console.log('❌ No questions found in config');
      console.log('Config data:', data);
    }
    
  } catch (error) {
    console.error('❌ Error testing config:', error);
  }
}

console.log('🚀 Testing burden assessment config API...');
testBurdenConfig();