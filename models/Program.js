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

// Program Progress Tracking for each caregiver
const ProgramProgressSchema = new mongoose.Schema({
  caregiverId: {
    type: String,
    required: true,
    unique: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  currentDay: {
    type: Number,
    default: 1,
  },
  completedDays: [{
    day: Number,
    completedAt: Date,
    notes: String,
    timeSpent: Number, // in minutes
  }],
  startedAt: {
    type: Date,
    default: Date.now,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
  totalTimeSpent: {
    type: Number,
    default: 0, // in minutes
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
});

// Program Control for timing and admin management
const ProgramControlSchema = new mongoose.Schema({
  caregiverId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'terminated', 'completed'],
    default: 'active',
  },
  delayHours: {
    type: Number,
    default: 24, // Default 24 hours between days
  },
  customSettings: {
    skipWeekends: {
      type: Boolean,
      default: false,
    },
    allowedStartHours: {
      start: { type: Number, default: 8 }, // 8 AM
      end: { type: Number, default: 20 }, // 8 PM
    },
    maxDailyHours: {
      type: Number,
      default: 3, // Maximum 3 hours per day
    },
  },
  adminActions: [{
    action: {
      type: String,
      enum: ['pause', 'resume', 'terminate', 'modify_delay', 'reset_day', 'force_unlock'],
    },
    adminId: String,
    adminName: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    reason: String,
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Day Gating Logic Schema
const DayGatingSchema = new mongoose.Schema({
  caregiverId: {
    type: String,
    required: true,
    unique: true,
  },
  currentAvailableDay: {
    type: Number,
    default: 1,
  },
  nextAvailableAt: {
    type: Date,
    default: Date.now,
  },
  canStartCurrentDay: {
    type: Boolean,
    default: true,
  },
  lastDayCompletedAt: Date,
  blockedReason: String, // 'time_restriction', 'admin_pause', 'weekend_block', etc.
  overrides: [{
    day: Number,
    unlockedBy: String, // adminId
    unlockedAt: Date,
    reason: String,
  }],
});

export const ProgramDay = mongoose.models.ProgramDay || mongoose.model('ProgramDay', ProgramDaySchema);
export const HealthTip = mongoose.models.HealthTip || mongoose.model('HealthTip', HealthTipSchema);
export const PostTestQuestion = mongoose.models.PostTestQuestion || mongoose.model('PostTestQuestion', PostTestQuestionSchema);
export const ProgramProgress = mongoose.models.ProgramProgress || mongoose.model('ProgramProgress', ProgramProgressSchema);
export const ProgramControl = mongoose.models.ProgramControl || mongoose.model('ProgramControl', ProgramControlSchema);
export const DayGating = mongoose.models.DayGating || mongoose.model('DayGating', DayGatingSchema);
