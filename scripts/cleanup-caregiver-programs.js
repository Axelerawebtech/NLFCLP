// Import the model with proper ES module syntax for Next.js
import mongoose from 'mongoose';
import CaregiverProgram from '../models/CaregiverProgramEnhanced.js';
import { config } from 'dotenv';

// Load environment variables
config({ path: './.env.local' });

async function cleanupCaregiverPrograms() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cancercare');
    console.log('Connected to MongoDB');

    // Delete all CaregiverProgram records to start fresh
    const deleteResult = await CaregiverProgram.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing CaregiverProgram records`);

    console.log('Cleanup completed successfully');
    
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the cleanup
cleanupCaregiverPrograms();