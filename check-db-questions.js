const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://axelerawebtech_db_user:M7EOU2FK8vqO7vs3@cluster0.e6faone.mongodb.net/cancercare?retryWrites=true&w=majority&appName=Cluster0';

async function checkQuestionStructure() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('cancercare');
    const programConfigCollection = db.collection('programconfigs');

    // Get the burden assessment configuration
    const config = await programConfigCollection.findOne({ configType: 'global' });

    if (!config || !config.day1?.burdenTestQuestions) {
      console.log('❌ No burden test questions found in configuration');
      return;
    }

    const questions = config.day1.burdenTestQuestions;
    console.log(`📊 Found ${questions.length} questions in database`);

    if (questions.length > 0) {
      const firstQuestion = questions[0];
      console.log('\n📝 First Question Database Structure:');
      console.log('Keys:', Object.keys(firstQuestion));
      console.log('ID:', firstQuestion.id);
      console.log('Question Text Object:', firstQuestion.questionText);
      console.log('Question Text English:', firstQuestion.questionText?.english);
      console.log('Options Count:', firstQuestion.options?.length);

      if (firstQuestion.options && firstQuestion.options.length > 0) {
        console.log('\n🔧 First Option Database Structure:');
        const firstOption = firstQuestion.options[0];
        console.log('Option Keys:', Object.keys(firstOption));
        console.log('Option Text Object:', firstOption.optionText);
        console.log('Option Text English:', firstOption.optionText?.english);
        console.log('Option Score:', firstOption.score);

        console.log('\n📋 All Options for First Question:');
        firstQuestion.options.forEach((option, index) => {
          console.log(`Option ${index}: "${option.optionText?.english}" (Score: ${option.score})`);
        });
      }

      console.log('\n🌐 Language Availability Check:');
      const hasEnglish = questions.every(q => q.questionText?.english);
      const hasOptionsEnglish = questions.every(q => 
        q.options?.every(opt => opt.optionText?.english)
      );
      
      console.log('All questions have English text:', hasEnglish);
      console.log('All options have English text:', hasOptionsEnglish);

      if (!hasEnglish || !hasOptionsEnglish) {
        console.log('\n⚠️  Some questions or options missing English text!');
      } else {
        console.log('\n✅ Database structure looks correct');
        console.log('💡 Issue might be in how frontend passes data to backend');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔚 Disconnected from MongoDB');
  }
}

console.log('🚀 Checking question structure in database...');
checkQuestionStructure();