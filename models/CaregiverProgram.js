import mongoose from 'mongoose';

const ZaritBurdenSchema = new mongoose.Schema({
  question1: { type: Number, min: 0, max: 4, required: true }, // relative asks for more help
  question2: { type: Number, min: 0, max: 4, required: true }, // affects relationship with family
  question3: { type: Number, min: 0, max: 4, required: true }, // relative is dependent
  question4: { type: Number, min: 0, max: 4, required: true }, // privacy affected
  question5: { type: Number, min: 0, max: 4, required: true }, // social life suffered
  question6: { type: Number, min: 0, max: 4, required: true }, // relative expects only you
  question7: { type: Number, min: 0, max: 4, required: true }, // wish to leave care to someone else
  totalScore: { type: Number, required: true },
  burdenLevel: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe'], 
    required: true 
  },
  completedAt: { type: Date, default: Date.now }
});

const DailyTaskSchema = new mongoose.Schema({
  day: { type: Number, required: true }, // 0-7
  task1: { type: Boolean, default: null }, // "Did you take one 2-minute break today?"
  task2: { type: Boolean, default: null }, // "Did you practice deep breathing today?" or other tasks
  problemSolution: { 
    problem: { type: String },
    solution: { type: String },
    helpfulResponse: { type: Boolean, default: null } // For weekly check-in
  },
  reflectionText: { type: String }, // For severe burden reflection
  completedAt: { type: Date, default: Date.now }
});

const DayModuleSchema = new mongoose.Schema({
  day: { type: Number, required: true }, // 0-7
  videoWatched: { type: Boolean, default: false },
  videoProgress: { type: Number, default: 0 }, // percentage
  tasksCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  progressPercentage: { type: Number, default: 0 }, // overall module completion
  adminPermissionGranted: { type: Boolean, default: false }
});

const CaregiverProgramSchema = new mongoose.Schema({
  caregiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Caregiver', 
    required: true,
    unique: true 
  },
  zaritBurdenAssessment: ZaritBurdenSchema,
  dayModules: [DayModuleSchema],
  dailyTasks: [DailyTaskSchema],
  currentDay: { type: Number, default: 0 }, // Current active day (0-7)
  overallProgress: { type: Number, default: 0 }, // Overall program progress percentage
  burdenLevel: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe'], 
    default: null 
  },
  programStartedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
  notifications: [{
    message: { type: String, required: true },
    type: { type: String, enum: ['daily', 'weekly', 'support'], required: true },
    sentAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  supportTriggered: { type: Boolean, default: false }, // For severe burden auto-support
  consecutiveNoCount: { type: Number, default: 0 } // Track consecutive "No" responses
}, {
  timestamps: true
});

// Initialize day modules for new caregiver
CaregiverProgramSchema.methods.initializeDayModules = function() {
  this.dayModules = [];
  for (let i = 0; i <= 7; i++) {
    this.dayModules.push({
      day: i,
      adminPermissionGranted: i === 0 ? true : false // Day 0 is always available
    });
  }
};

// Calculate Zarit Burden Level
CaregiverProgramSchema.methods.calculateBurdenLevel = function(responses) {
  const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
  
  let burdenLevel;
  if (totalScore <= 10) burdenLevel = 'mild';
  else if (totalScore <= 20) burdenLevel = 'moderate';
  else burdenLevel = 'severe';
  
  this.zaritBurdenAssessment = {
    ...responses,
    totalScore,
    burdenLevel
  };
  
  this.burdenLevel = burdenLevel;
  return burdenLevel;
};

// Grant permission for next day
CaregiverProgramSchema.methods.grantDayPermission = function(day) {
  const dayModule = this.dayModules.find(module => module.day === day);
  if (dayModule) {
    dayModule.adminPermissionGranted = true;
  }
};

// Complete day module
CaregiverProgramSchema.methods.completeDayModule = function(day) {
  const dayModule = this.dayModules.find(module => module.day === day);
  if (dayModule) {
    dayModule.videoWatched = true;
    dayModule.tasksCompleted = true;
    dayModule.completedAt = new Date();
    dayModule.progressPercentage = 100;
    
    // Update overall progress
    const completedModules = this.dayModules.filter(module => module.progressPercentage === 100).length;
    this.overallProgress = (completedModules / 8) * 100; // 8 days total (0-7)
    
    this.lastActiveAt = new Date();
  }
};

// Add daily task response
CaregiverProgramSchema.methods.addDailyTaskResponse = function(day, taskData) {
  this.dailyTasks.push({
    day,
    ...taskData
  });
  
  // Check for consecutive "No" responses for severe burden
  if (this.burdenLevel === 'severe' && taskData.task1 === false && taskData.task2 === false) {
    this.consecutiveNoCount += 1;
    if (this.consecutiveNoCount >= 3 && !this.supportTriggered) {
      this.triggerSupportMessage();
    }
  } else {
    this.consecutiveNoCount = 0; // Reset if any "Yes" response
  }
  
  this.lastActiveAt = new Date();
};

// Trigger support message for severe burden
CaregiverProgramSchema.methods.triggerSupportMessage = function() {
  this.supportTriggered = true;
  this.notifications.push({
    message: "It seems you are having a difficult week. Please call your nurse or Tele-MANAS (14416) for support.",
    type: 'support'
  });
};

const CaregiverProgram = mongoose.models.CaregiverProgram || mongoose.model('CaregiverProgram', CaregiverProgramSchema);

export default CaregiverProgram;