/**
 * MANUAL DATABASE CHECKING GUIDE
 * ================================
 * This file shows you how to manually query the database for caregiver data.
 * You can use these queries in MongoDB Compass, Studio 3T, or the MongoDB shell.
 */

// ============================================================================
// METHOD 1: Using MongoDB Compass (Visual Tool)
// ============================================================================
// 1. Open MongoDB Compass
// 2. Connect using your MONGODB_URI
// 3. Select your database
// 4. Use the queries below in the filter field

// STEP 1: Find the Caregiver
// Collection: caregivers (NOT users!)
// Filter:
// {
//   "name": { "$regex": "checkyyy", "$options": "i" }
// }

// You'll see output like:
// {
//   "_id": ObjectId("..."),
//   "name": "checkyy",
//   "email": "...",
//   "role": "caregiver",
//   "burdenLevel": "mild",
//   ...
// }

// Copy the _id value for next steps


// STEP 2: Find User Progress
// Collection: userprogresses
// Filter (replace USER_ID with the _id from step 1):
// {
//   "userId": ObjectId("USER_ID_HERE")
// }

// You'll see:
// {
//   "_id": ObjectId("..."),
//   "userId": ObjectId("..."),
//   "currentDay": 1,
//   "dayProgress": {
//     "day0": { "completed": true, "testCompleted": true, ... },
//     "day1": { "completed": true, "testScore": 45, ... }
//   }
// }


// STEP 3: Find Test Responses
// Collection: testresponses
// Filter:
// {
//   "userId": ObjectId("USER_ID_HERE")
// }

// You'll see all test submissions:
// {
//   "_id": ObjectId("..."),
//   "userId": ObjectId("..."),
//   "dayNumber": 1,
//   "testName": "Zarit Burden Interview",
//   "totalScore": 45,
//   "levelKey": "severe",
//   "answers": [...]
// }


// STEP 4: Find Task Responses
// Collection: taskresponses
// Filter:
// {
//   "userId": ObjectId("USER_ID_HERE")
// }

// Sort by: { "createdAt": 1 }
// You'll see all completed tasks:
// {
//   "_id": ObjectId("..."),
//   "userId": ObjectId("..."),
//   "dayNumber": 1,
//   "taskId": "day1_sev_urgent",
//   "taskType": "motivation-message",
//   "responseText": "...",
//   "completed": true
// }


// ============================================================================
// METHOD 2: Using MongoDB Shell (mongosh)
// ============================================================================

// Connect to database:
// mongosh "YOUR_MONGODB_URI"

// Then run these commands:

// 1. Find caregiver
// db.caregivers.findOne({ 
//   name: /checkyyy/i
// })

// 2. Get the user ID (copy from above result), then:
// const userId = ObjectId("PASTE_USER_ID_HERE")

// 3. Find progress
// db.userprogresses.findOne({ userId: userId })

// 4. Find all test responses
// db.testresponses.find({ userId: userId }).sort({ createdAt: 1 })

// 5. Find all task responses
// db.taskresponses.find({ userId: userId }).sort({ createdAt: 1 })

// 6. Count responses
// db.testresponses.countDocuments({ userId: userId })
// db.taskresponses.countDocuments({ userId: userId })


// ============================================================================
// METHOD 3: Using Node.js Script (What we created)
// ============================================================================

// Run from terminal:
// node scripts/find-caregiver-data.js checkyyy

// This script automatically:
// - Finds the caregiver by name in 'caregivers' collection
// - Retrieves all progress data
// - Shows all test responses
// - Shows all task responses
// - Formats everything nicely in the terminal


// ============================================================================
// USEFUL AGGREGATION QUERIES
// ============================================================================

// Get summary of all days completed by user:
// db.userprogresses.aggregate([
//   { $match: { userId: ObjectId("USER_ID_HERE") } },
//   { $project: {
//       userId: 1,
//       currentDay: 1,
//       dayProgress: { $objectToArray: "$dayProgress" },
//       updatedAt: 1
//   }},
//   { $unwind: "$dayProgress" },
//   { $project: {
//       day: "$dayProgress.k",
//       completed: "$dayProgress.v.completed",
//       testScore: "$dayProgress.v.testScore",
//       levelKey: "$dayProgress.v.levelKey"
//   }}
// ])


// Get test scores by day:
db.testresponses.aggregate([
  { $match: { userId: ObjectId("USER_ID_HERE") } },
  { $group: {
      _id: "$dayNumber",
      testName: { $first: "$testName" },
      score: { $first: "$totalScore" },
      level: { $first: "$levelKey" },
      date: { $first: "$createdAt" }
  }},
  { $sort: { _id: 1 } }
])


// Count tasks completed per day:
db.taskresponses.aggregate([
  { $match: { userId: ObjectId("USER_ID_HERE"), completed: true } },
  { $group: {
      _id: "$dayNumber",
      taskCount: { $sum: 1 },
      tasks: { $push: "$taskId" }
  }},
  { $sort: { _id: 1 } }
])


// ============================================================================
// COLLECTIONS SCHEMA REFERENCE
// ============================================================================

// caregivers collection:
// {
//   _id: ObjectId,
//   name: String,
//   email: String,
//   phone: String,
//   language: String,          // "english", "hindi", "kannada"
//   burdenLevel: String,       // "mild", "moderate", "severe"
//   createdAt: Date,
//   updatedAt: Date
// }

// userprogresses collection:
// {
//   _id: ObjectId,
//   userId: ObjectId,
//   currentDay: Number,
//   programType: String,
//   daysCompleted: [Number],
//   dayProgress: {
//     day0: {
//       completed: Boolean,
//       testCompleted: Boolean,
//       testScore: Number,
//       levelKey: String,
//       completedTasks: [String],
//       completedAt: Date
//     },
//     day1: { ... }
//   },
//   createdAt: Date,
//   updatedAt: Date
// }

// testresponses collection:
// {
//   _id: ObjectId,
//   userId: ObjectId,
//   dayNumber: Number,
//   testName: String,
//   testType: String,
//   totalScore: Number,
//   levelKey: String,
//   language: String,
//   answers: [{
//     questionId: Number,
//     questionText: String,
//     selectedOption: String,
//     selectedScore: Number
//   }],
//   createdAt: Date
// }

// taskresponses collection:
// {
//   _id: ObjectId,
//   userId: ObjectId,
//   dayNumber: Number,
//   taskId: String,
//   taskType: String,
//   responseText: String,
//   completed: Boolean,
//   metadata: Object,          // Additional task-specific data
//   createdAt: Date,
//   updatedAt: Date
// }
