require('dotenv').config({ path: '.env.local' });
const dbConnect = require('./lib/mongodb.js').default;
const ProgramConfig = require('./models/ProgramConfig.js').default;

async function debugQuestionStructure() {
  try {
    console.log('🔍 Debugging question structure...');
    await dbConnect();
    console.log('✅ Database connected');

    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    if (!config || !config.day1 || !config.day1.burdenTestQuestions) {
      console.log('❌ No burden test questions found');
      return;
    }

    console.log('📊 Question structure analysis:');
    console.log(`Total questions: ${config.day1.burdenTestQuestions.length}`);
    
    const firstQuestion = config.day1.burdenTestQuestions[0];
    console.log('\n🔍 First question raw structure:');
    console.log('Raw question object:', JSON.stringify(firstQuestion, null, 2));
    
    console.log('\n🔍 Options analysis:');
    console.log('Options exists:', !!firstQuestion.options);
    console.log('Options type:', typeof firstQuestion.options);
    console.log('Options length:', firstQuestion.options ? firstQuestion.options.length : 'N/A');
    console.log('Options array:', firstQuestion.options);
    
    if (firstQuestion.options && firstQuestion.options.length > 0) {
      console.log('\n📝 First option structure:');
      console.log('First option:', JSON.stringify(firstQuestion.options[0], null, 2));
    }
    
    // Check what the API would return
    console.log('\n🔍 Simulating API response structure:');
    const apiResponse = {
      success: true,
      config: {
        questions: config.day1.burdenTestQuestions,
        scoreRanges: config.day1.scoreRanges
      }
    };
    
    console.log('API would return questions count:', apiResponse.config.questions.length);
    console.log('First question from API:', {
      questionText: apiResponse.config.questions[0].questionText,
      options: apiResponse.config.questions[0].options,
      optionsLength: apiResponse.config.questions[0].options?.length
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugQuestionStructure();