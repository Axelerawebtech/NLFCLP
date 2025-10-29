require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Use dynamic import since model uses ES6 syntax
async function testBurdenAssessmentAPI() {
  console.log('🧪 Testing burden assessment API simulation...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');

    // Simulate what the API endpoint /api/admin/burden-assessment/config would do
    console.log('\n📊 Simulating API: GET /api/admin/burden-assessment/config');
    
    // Use the ProgramConfig model schema directly
    const ProgramConfigSchema = new mongoose.Schema({}, { strict: false });
    const ProgramConfig = mongoose.models.ProgramConfig || mongoose.model('ProgramConfig', ProgramConfigSchema);
    
    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    if (!config) {
      console.log('❌ No ProgramConfig found');
      return;
    }

    // Check day1.burdenTestQuestions as per the API endpoint structure
    const burdenTestQuestions = config.day1?.burdenTestQuestions;
    
    if (!burdenTestQuestions || !Array.isArray(burdenTestQuestions)) {
      console.log('❌ No day1.burdenTestQuestions in config');
      console.log('Available config fields:', Object.keys(config.toObject()));
      return;
    }

    console.log(`✅ Found burden assessment with ${burdenTestQuestions.length} questions`);
    
    // Test first question specifically
    const firstQuestion = burdenTestQuestions[0];
    console.log('\n🔍 First question analysis:');
    console.log('Question text (English):', firstQuestion.questionText.english);
    console.log('Options count:', firstQuestion.options.length);
    console.log('Has options array:', Array.isArray(firstQuestion.options));
    
    if (firstQuestion.options.length > 0) {
      console.log('\n📝 First option details:');
      console.log('Option text (English):', firstQuestion.options[0].optionText.english);
      console.log('Option score:', firstQuestion.options[0].score);
    }

    // Simulate the API response structure
    const apiResponse = {
      success: true,
      config: {
        questions: burdenTestQuestions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options.map(opt => ({
            _id: opt._id,
            optionText: opt.optionText,
            score: opt.score
          }))
        }))
      }
    };

    console.log('\n🎯 API Response Summary:');
    console.log('Success:', apiResponse.success);
    console.log('Total questions:', apiResponse.config.questions.length);
    console.log('First question options count:', apiResponse.config.questions[0].options.length);
    
    // Test what the frontend would receive
    const frontendData = apiResponse.config.questions[0];
    console.log('\n🖥️ Frontend would receive:');
    console.log('hasCurrentQuestion:', !!frontendData);
    console.log('hasOptions:', !!frontendData.options);
    console.log('optionsLength:', frontendData.options.length);
    console.log('optionsData sample:', frontendData.options.slice(0, 2));

    if (frontendData.options.length === 0) {
      console.log('❌ ISSUE: Frontend would still see 0 options!');
    } else {
      console.log('✅ SUCCESS: Frontend would see', frontendData.options.length, 'options');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

testBurdenAssessmentAPI();