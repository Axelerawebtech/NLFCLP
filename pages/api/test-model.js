// Test script to verify CaregiverProgram model works without validation errors
import dbConnect from '../lib/mongodb';
import CaregiverProgram from '../models/CaregiverProgramEnhanced';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Test creating a new caregiver program
    const testCaregiverId = new mongoose.Types.ObjectId();
    
    const testProgram = new CaregiverProgram({ 
      caregiverId: testCaregiverId 
    });
    
    // Initialize day modules
    testProgram.initializeDayModules();
    
    console.log('Test program created:', testProgram.toObject());
    
    // Try to save (this should not throw validation errors)
    await testProgram.save();
    
    console.log('Test program saved successfully');
    
    // Clean up - delete the test record
    await CaregiverProgram.deleteOne({ _id: testProgram._id });
    
    res.status(200).json({
      success: true,
      message: 'Model validation test passed successfully',
      testId: testProgram._id
    });

  } catch (error) {
    console.error('Model test error:', error);
    res.status(500).json({
      error: 'Model test failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}