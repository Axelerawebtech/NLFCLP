const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// WHOQOL Assessment Questions (26 items) with options
const WHOQOL_QUESTIONS = [
    {
      order: 1,
      questionText: 'How would you rate your quality of life?',
      type: 'radio',
      required: true,
      options: [
        'Very poor',
        'Poor',
        'Neither poor nor good',
        'Good',
        'Very good'
      ]
    },
    {
      order: 2,
      questionText: 'How satisfied are you with your health?',
      type: 'radio',
      required: true,
      options: [
        'Very dissatisfied',
        'Dissatisfied',
        'Neither satisfied nor dissatisfied',
        'Satisfied',
        'Very satisfied'
      ]
    },
    {
      order: 3,
      questionText: 'To what extent do you feel that (physical) pain prevents you from doing what you need to do?',
      type: 'radio',
      required: true,
      options: [
        'Not at all',
        'A little',
        'A moderate amount',
        'Very much',
        'An extreme amount'
      ]
    },
    {
      order: 4,
      questionText: 'How much do you need any medical treatment to function in your daily life?',
      type: 'radio',
      required: true,
      options: [
        'Not at all',
        'A little',
        'A moderate amount',
        'Very much',
        'An extreme amount'
      ]
    },
    {
      order: 5,
      questionText: 'How much do you enjoy life?',
      type: 'radio',
      required: true,
      options: [
        'Not at all',
        'A little',
        'A moderate amount',
        'Very much',
        'An extreme amount'
      ]
    },
    {
      order: 6,
      questionText: 'To what extent do you feel your life to be meaningful?',
      type: 'radio',
      required: true,
      options: [
        'Not at all',
        'A little',
        'A moderate amount',
        'Very much',
        'An extreme amount'
      ]
    },
    {
      order: 7,
      questionText: 'How well are you able to concentrate?',
      type: 'radio',
      required: true,
      options: [
        'Not at all',
        'A little',
        'A moderate amount',
        'Very much',
        'An extreme amount'
      ]
    },
    {
      order: 8,
      questionText: 'How safe do you feel in your daily life?',
      type: 'radio',
      required: true,
      options: [
        'Not at all',
        'A little',
        'A moderate amount',
        'Very much',
        'An extreme amount'
      ]
    },
    {
      order: 9,
      questionText: 'How healthy is your physical environment?',
      type: 'radio',
      required: true,
      options: [
        'Not at all',
        'A little',
        'A moderate amount',
        'Very much',
        'An extreme amount'
      ]
    },
    {
      order: 10,
      questionText: 'Do you have enough energy for everyday life?',
      type: 'radio',
      required: true,
      options: [
        'Not at all',
        'A little',
        'Moderately',
        'Mostly',
        'Completely'
      ]
    },
    {
      order: 11,
      questionText: 'Are you able to accept your bodily appearance?',
      type: 'radio',
      required: true,
      options: [
        'Not at all',
        'A little',
        'Moderately',
        'Mostly',
        'Completely'
      ]
    },
    {
      order: 12,
      questionText: 'Have you enough money to meet your needs?',
      type: 'radio',
      required: true,
      options: [
        'Not at all',
        'A little',
        'Moderately',
        'Mostly',
        'Completely'
      ]
    },
    {
      order: 13,
      questionText: 'How available to you is the information that you need in your day-to-day life?',
      type: 'radio',
      required: true,
      options: [
        'Not at all',
        'A little',
        'Moderately',
        'Mostly',
        'Completely'
      ]
    },
    {
      order: 14,
      questionText: 'To what extent do you have the opportunity for leisure activities?',
      type: 'radio',
      required: true,
      options: [
        'Not at all',
        'A little',
        'Moderately',
        'Mostly',
        'Completely'
      ]
    },
    {
      order: 15,
      questionText: 'How well are you able to get around?',
      type: 'radio',
      required: true,
      options: [
        'Very poor',
        'Poor',
        'Neither poor nor good',
        'Good',
        'Very good'
      ]
    },
    {
      order: 16,
      questionText: 'How satisfied are you with your sleep?',
      type: 'radio',
      required: true,
      options: [
        'Very dissatisfied',
        'Dissatisfied',
        'Neither satisfied nor dissatisfied',
        'Satisfied',
        'Very satisfied'
      ]
    },
    {
      order: 17,
      questionText: 'How satisfied are you with your ability to perform your daily living activities?',
      type: 'radio',
      required: true,
      options: [
        'Very dissatisfied',
        'Dissatisfied',
        'Neither satisfied nor dissatisfied',
        'Satisfied',
        'Very satisfied'
      ]
    },
    {
      order: 18,
      questionText: 'How satisfied are you with your capacity for work?',
      type: 'radio',
      required: true,
      options: [
        'Very dissatisfied',
        'Dissatisfied',
        'Neither satisfied nor dissatisfied',
        'Satisfied',
        'Very satisfied'
      ]
    },
    {
      order: 19,
      questionText: 'How satisfied are you with yourself?',
      type: 'radio',
      required: true,
      options: [
        'Very dissatisfied',
        'Dissatisfied',
        'Neither satisfied nor dissatisfied',
        'Satisfied',
        'Very satisfied'
      ]
    },
    {
      order: 20,
      questionText: 'How satisfied are you with your personal relationships?',
      type: 'radio',
      required: true,
      options: [
        'Very dissatisfied',
        'Dissatisfied',
        'Neither satisfied nor dissatisfied',
        'Satisfied',
        'Very satisfied'
      ]
    },
    {
      order: 21,
      questionText: 'How satisfied are you with your sex life?',
      type: 'radio',
      required: true,
      options: [
        'Very dissatisfied',
        'Dissatisfied',
        'Neither satisfied nor dissatisfied',
        'Satisfied',
        'Very satisfied'
      ]
    },
    {
      order: 22,
      questionText: 'How satisfied are you with the support you get from your friends?',
      type: 'radio',
      required: true,
      options: [
        'Very dissatisfied',
        'Dissatisfied',
        'Neither satisfied nor dissatisfied',
        'Satisfied',
        'Very satisfied'
      ]
    },
    {
      order: 23,
      questionText: 'How satisfied are you with the conditions of your living place?',
      type: 'radio',
      required: true,
      options: [
        'Very dissatisfied',
        'Dissatisfied',
        'Neither satisfied nor dissatisfied',
        'Satisfied',
        'Very satisfied'
      ]
    },
    {
      order: 24,
      questionText: 'How satisfied are you with your access to health services?',
      type: 'radio',
      required: true,
      options: [
        'Very dissatisfied',
        'Dissatisfied',
        'Neither satisfied nor dissatisfied',
        'Satisfied',
        'Very satisfied'
      ]
    },
    {
      order: 25,
      questionText: 'How satisfied are you with your transport?',
      type: 'radio',
      required: true,
      options: [
        'Very dissatisfied',
        'Dissatisfied',
        'Neither satisfied nor dissatisfied',
        'Satisfied',
        'Very satisfied'
      ]
    },
    {
      order: 26,
      questionText: 'How often do you have negative feelings such as blue mood, despair, anxiety, depression?',
      type: 'radio',
      required: true,
      options: [
        'Never',
        'Seldom',
        'Quite often',
        'Very often',
        'Always'
      ]
    }
];

async function seedWhoqolQuestionnaire() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Get the Admin model to retrieve a system admin ID
    const Admin = mongoose.models.Admin || require('../models/Admin').default || 
                  mongoose.model('Admin', new mongoose.Schema({}, { strict: false }));

    // Define Questionnaire schema to match the model
    const QuestionSchema = new mongoose.Schema({
      questionText: String,
      type: { type: String, enum: ['text', 'textarea', 'radio', 'checkbox', 'select', 'scale'], default: 'text' },
      options: [String],
      required: { type: Boolean, default: true },
      order: { type: Number, default: 0 }
    });

    const QuestionnaireSchema = new mongoose.Schema({
      title: String,
      description: String,
      questions: [QuestionSchema],
      isActive: { type: Boolean, default: true },
      createdBy: mongoose.Schema.Types.ObjectId,
      createdAt: Date,
      updatedAt: Date
    });

    const Questionnaire = mongoose.models.Questionnaire || 
      mongoose.model('Questionnaire', QuestionnaireSchema);

    // Try to get a system admin (or use a placeholder)
    let adminId = null;
    try {
      const admin = await Admin.findOne();
      if (admin) {
        adminId = admin._id;
      }
    } catch (e) {
      console.log('⚠️  Could not retrieve admin ID - using placeholder');
    }

    if (!adminId) {
      adminId = new mongoose.Types.ObjectId();
    }

    // Check if WHOQOL questionnaire already exists
    console.log('🔍 Checking for existing WHOQOL questionnaire...');
    let existingQuestionnaire = await Questionnaire.findOne({
      title: 'WHOQOL-BREF (Quality of Life Assessment)'
    });

    const questionnaireData = {
      title: 'WHOQOL-BREF (Quality of Life Assessment)',
      description: 'World Health Organization Quality of Life Assessment - Brief Version. This assessment evaluates your overall quality of life across multiple dimensions including physical health, psychological well-being, social relationships, and environment.',
      questions: WHOQOL_QUESTIONS,
      isActive: true,
      createdBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (existingQuestionnaire) {
      console.log('♻️  Updating existing WHOQOL questionnaire...');
      existingQuestionnaire.description = questionnaireData.description;
      existingQuestionnaire.questions = questionnaireData.questions;
      existingQuestionnaire.isActive = questionnaireData.isActive;
      existingQuestionnaire.updatedAt = new Date();
      await existingQuestionnaire.save();
      console.log('✅ WHOQOL questionnaire updated successfully!');
    } else {
      console.log('➕ Creating new WHOQOL questionnaire...');
      const questionnaire = new Questionnaire(questionnaireData);
      await questionnaire.save();
      console.log('✅ WHOQOL questionnaire created successfully!');
    }

    console.log('\n📊 Questionnaire Details:');
    console.log(`   Title: ${questionnaireData.title}`);
    console.log(`   Total Questions: ${questionnaireData.questions.length}`);
    console.log(`   Question Type: ${questionnaireData.questions[0].type}`);
    console.log(`   Active: ${questionnaireData.isActive}`);

    console.log('\n📝 Questions Summary:');
    WHOQOL_QUESTIONS.forEach((q, idx) => {
      console.log(`   Q${q.order}: ${q.questionText.substring(0, 60)}...`);
      console.log(`           Options: ${q.options.length} choices`);
    });

    console.log('\n✅ WHOQOL questionnaire successfully seeded to database!');
    console.log('\n📌 Next Steps:');
    console.log('   1. Go to Admin Dashboard');
    console.log('   2. Navigate to "Patient Profiles"');
    console.log('   3. Find patient and enable "Questionnaire"');
    console.log('   4. Patient dashboard will show WHOQOL questions');

  } catch (err) {
    console.error('❌ Error seeding WHOQOL questionnaire:', err.message);
    console.error(err.stack || err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected.');
  }
}

// Run the seeding function
seedWhoqolQuestionnaire();
