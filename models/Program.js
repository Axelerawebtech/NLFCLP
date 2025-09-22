import mongoose from 'mongoose';

const ProgramDaySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  activities: [{
    title: String,
    description: String,
    duration: String,
  }],
  learningObjectives: [String],
  emotionalSupport: [{
    topic: String,
    techniques: [String],
    resources: [String],
  }],
  stressManagement: [{
    technique: String,
    steps: [String],
    benefits: String,
  }],
  reflectionQuestions: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
});

const HealthTipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['nutrition', 'exercise', 'mental_health', 'medication', 'lifestyle'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const PostTestQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  correctAnswer: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  points: {
    type: Number,
    default: 1,
  },
});

export const ProgramDay = mongoose.models.ProgramDay || mongoose.model('ProgramDay', ProgramDaySchema);
export const HealthTip = mongoose.models.HealthTip || mongoose.model('HealthTip', HealthTipSchema);
export const PostTestQuestion = mongoose.models.PostTestQuestion || mongoose.model('PostTestQuestion', PostTestQuestionSchema);
