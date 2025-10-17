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
  day: { type: Number, required: true }, // 0-9 (10 days)
  videoWatched: { type: Boolean, default: false },
  videoProgress: { type: Number, default: 0 }, // percentage
  videoId: { type: String }, // Dynamic video based on burden level
  
  // Multi-language video support (admin uploads via Cloudinary)
  videoTitle: {
    english: { type: String },
    kannada: { type: String },
    hindi: { type: String }
  },
  videoUrl: {
    english: { type: String },
    kannada: { type: String },
    hindi: { type: String }
  },
  
  // Multi-language content (Day 2-9 content varies by burden level)
  content: {
    english: { type: String },
    kannada: { type: String },
    hindi: { type: String }
  },
  
  tasksCompleted: { type: Boolean, default: false },
  taskResponses: [{
    taskId: String,
    taskDescription: String,
    response: mongoose.Schema.Types.Mixed, // Can be Boolean, String, or Object
    completedAt: { type: Date, default: Date.now }
  }],
  completedAt: { type: Date },
  progressPercentage: { type: Number, default: 0 }, // overall module completion
  adminPermissionGranted: { type: Boolean, default: false },
  unlockedAt: { type: Date }, // When this day was unlocked
  scheduledUnlockAt: { type: Date } // When this day should unlock based on wait time
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
  currentDay: { type: Number, default: 0 }, // Current active day (0-9 for 10 days)
  overallProgress: { type: Number, default: 0 }, // Overall program progress percentage
  burdenLevel: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe'], 
    default: null 
  },
  burdenTestScore: { type: Number, default: null }, // Percentage score from Day 1 test
  burdenTestCompletedAt: { type: Date, default: null },
  programStartedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
  // Wait time configuration (can override global config)
  customWaitTimes: {
    day0ToDay1: { type: Number }, // hours, null means use global config
    betweenDays: { type: Number } // hours, null means use global config
  },
  // Track when each day should unlock
  dayUnlockSchedule: [{
    day: Number,
    scheduledUnlockAt: Date,
    actualUnlockedAt: Date,
    unlockMethod: { type: String, enum: ['automatic', 'manual-admin'], default: 'automatic' }
  }],
  notifications: [{
    message: { type: String, required: true },
    type: { type: String, enum: ['daily', 'weekly', 'support'], required: true },
    sentAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  supportTriggered: { type: Boolean, default: false }, // For severe burden auto-support
  consecutiveNoCount: { type: Number, default: 0 }, // Track consecutive "No" responses
  contentAssignedDynamically: { type: Boolean, default: false }, // Flag for dynamic content assignment
  adminNotes: [{ 
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Initialize day modules for new caregiver (10 days: 0-9)
CaregiverProgramSchema.methods.initializeDayModules = function() {
  this.dayModules = [];
  const now = new Date();
  
  for (let i = 0; i <= 9; i++) {
    this.dayModules.push({
      day: i,
      adminPermissionGranted: i === 0 ? true : false, // Day 0 is always available
      unlockedAt: i === 0 ? now : null,
      scheduledUnlockAt: i === 0 ? now : null
    });
  }
  
  // Initialize unlock schedule
  this.dayUnlockSchedule = [];
  this.dayUnlockSchedule.push({
    day: 0,
    scheduledUnlockAt: now,
    actualUnlockedAt: now,
    unlockMethod: 'automatic'
  });
};

// Calculate Zarit Burden Level and set up Day 1 unlock schedule
CaregiverProgramSchema.methods.calculateBurdenLevel = function(responses) {
  const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
  const maxScore = 7 * 4; // 7 questions, max 4 points each
  const percentage = (totalScore / maxScore) * 100;
  
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
  this.burdenTestScore = percentage;
  this.burdenTestCompletedAt = new Date();
  
  return { burdenLevel, percentage };
};

// Schedule day unlock based on wait time
CaregiverProgramSchema.methods.scheduleDayUnlock = function(day, waitTimeHours) {
  const previousDay = this.dayModules.find(m => m.day === day - 1);
  if (!previousDay) return null;
  
  const baseTime = previousDay.completedAt || previousDay.unlockedAt || new Date();
  const scheduledUnlockAt = new Date(baseTime.getTime() + waitTimeHours * 60 * 60 * 1000);
  
  const dayModule = this.dayModules.find(m => m.day === day);
  if (dayModule) {
    dayModule.scheduledUnlockAt = scheduledUnlockAt;
  }
  
  this.dayUnlockSchedule.push({
    day,
    scheduledUnlockAt,
    actualUnlockedAt: null,
    unlockMethod: 'automatic'
  });
  
  return scheduledUnlockAt;
};

// Unlock day (automatically or manually by admin)
CaregiverProgramSchema.methods.unlockDay = function(day, method = 'automatic') {
  const dayModule = this.dayModules.find(m => m.day === day);
  if (!dayModule) return false;
  
  const now = new Date();
  dayModule.adminPermissionGranted = true;
  dayModule.unlockedAt = now;
  
  const scheduleEntry = this.dayUnlockSchedule.find(s => s.day === day);
  if (scheduleEntry) {
    scheduleEntry.actualUnlockedAt = now;
    scheduleEntry.unlockMethod = method;
  } else {
    this.dayUnlockSchedule.push({
      day,
      scheduledUnlockAt: now,
      actualUnlockedAt: now,
      unlockMethod: method
    });
  }
  
  return true;
};

// Assign dynamic content to days 2-9 based on burden level
CaregiverProgramSchema.methods.assignDynamicContent = async function(programConfig) {
  if (!this.burdenLevel || this.contentAssignedDynamically) {
    return false;
  }
  
  const contentRules = programConfig.contentRules[this.burdenLevel];
  if (!contentRules || !contentRules.days) {
    return false;
  }
  
  // Assign content for days 2-9
  for (let day = 2; day <= 9; day++) {
    const dayContent = contentRules.days.get(String(day));
    const dayModule = this.dayModules.find(m => m.day === day);
    
    if (dayContent && dayModule) {
      dayModule.videoId = dayContent.videoId;
      dayModule.videoTitle = dayContent.videoTitle;
      dayModule.videoUrl = dayContent.videoUrl;
    }
  }
  
  this.contentAssignedDynamically = true;
  return true;
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
    
    // Update overall progress (10 days total: 0-9)
    const completedModules = this.dayModules.filter(module => module.progressPercentage === 100).length;
    this.overallProgress = (completedModules / 10) * 100;
    
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