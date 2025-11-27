const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://axeleratest:FPJrR5K9YP8Z4I9X@axeleracluster.e3tm5.mongodb.net/axelera-nlf?retryWrites=true&w=majority';

async function checkDay3ApiResponse() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const ProgramConfig = mongoose.model('ProgramConfig', new mongoose.Schema({}, { strict: false }), 'programconfigs');
    
    // Get global config
    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    if (!config) {
      console.log('❌ No global config found');
      return;
    }

    console.log('\n=== Day 3 Configurations ===\n');
    
    const day3Configs = config.dynamicDays?.filter(d => d.dayNumber === 3);
    
    if (!day3Configs || day3Configs.length === 0) {
      console.log('❌ No Day 3 configurations found');
      return;
    }

    day3Configs.forEach((dayConfig, index) => {
      console.log(`\n--- Day 3 Config ${index + 1} (${dayConfig.language}) ---`);
      console.log('Day Number:', dayConfig.dayNumber);
      console.log('Language:', dayConfig.language);
      console.log('Enabled:', dayConfig.enabled);
      console.log('Has Test:', dayConfig.hasTest);
      console.log('Day Name:', dayConfig.dayName);
      
      if (dayConfig.testConfig) {
        console.log('\nTest Config:');
        console.log('  Test Name:', dayConfig.testConfig.testName);
        console.log('  Test Type:', dayConfig.testConfig.testType);
        console.log('  Questions Count:', dayConfig.testConfig.questions?.length || 0);
        
        if (dayConfig.testConfig.questions && dayConfig.testConfig.questions.length > 0) {
          console.log('\n  First Question:');
          const firstQ = dayConfig.testConfig.questions[0];
          console.log('    ID:', firstQ.id);
          console.log('    Text:', firstQ.questionText?.substring(0, 100));
          console.log('    Options:', firstQ.options?.length || 0);
          if (firstQ.options && firstQ.options.length > 0) {
            console.log('    First Option:', firstQ.options[0].optionText);
            console.log('    First Option Score:', firstQ.options[0].score);
          }
        }
        
        console.log('\n  Score Ranges:', dayConfig.testConfig.scoreRanges?.length || 0);
        if (dayConfig.testConfig.scoreRanges) {
          dayConfig.testConfig.scoreRanges.forEach(range => {
            console.log(`    ${range.min}-${range.max}: ${range.levelKey} (${range.levelLabel})`);
          });
        }
      } else {
        console.log('\n❌ NO TEST CONFIG FOUND!');
      }
      
      console.log('\nContent By Level:');
      if (dayConfig.contentByLevel && dayConfig.contentByLevel.length > 0) {
        dayConfig.contentByLevel.forEach(level => {
          const taskCount = level.tasks?.filter(t => t.enabled)?.length || 0;
          console.log(`  ${level.levelKey} (${level.levelLabel}): ${taskCount} tasks`);
        });
      } else {
        console.log('  No content levels defined');
      }
    });

    // Simulate API response for English
    console.log('\n\n=== Simulating API Response for Day 3 (English) ===\n');
    const englishDay3 = day3Configs.find(d => d.language === 'english');
    
    if (!englishDay3) {
      console.log('❌ No English Day 3 config found');
      return;
    }

    const hasTest = englishDay3.hasTest && 
                    Array.isArray(englishDay3.testConfig?.questions) && 
                    englishDay3.testConfig.questions.length > 0;

    console.log('hasTest:', hasTest);
    
    if (hasTest) {
      const testResponse = {
        testName: englishDay3.testConfig.testName || '',
        testType: englishDay3.testConfig.testType,
        questions: englishDay3.testConfig.questions?.map(q => ({
          id: q.id,
          questionText: q.questionText || '',
          options: q.options?.map(opt => ({
            optionText: opt.optionText || '',
            score: opt.score
          }))
        })),
        scoreRanges: englishDay3.testConfig.scoreRanges || []
      };
      
      console.log('\nTest Object Structure:');
      console.log('  testName:', testResponse.testName);
      console.log('  testType:', testResponse.testType);
      console.log('  questions count:', testResponse.questions?.length);
      console.log('  scoreRanges count:', testResponse.scoreRanges?.length);
      
      console.log('\nFirst 3 questions:');
      testResponse.questions?.slice(0, 3).forEach((q, i) => {
        console.log(`\n  Question ${i + 1}:`);
        console.log(`    Text: ${q.questionText?.substring(0, 80)}...`);
        console.log(`    Options: ${q.options?.length}`);
      });
    } else {
      console.log('\n❌ Test would NOT be included in API response!');
      console.log('Reasons:');
      console.log('  hasTest:', englishDay3.hasTest);
      console.log('  testConfig exists:', !!englishDay3.testConfig);
      console.log('  questions is array:', Array.isArray(englishDay3.testConfig?.questions));
      console.log('  questions length:', englishDay3.testConfig?.questions?.length || 0);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkDay3ApiResponse();
