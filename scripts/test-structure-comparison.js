import mongoose from 'mongoose';
import ProgramConfig from '../models/ProgramConfig.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
}

async function analyzeStructure() {
  try {
    await connectDB();
    
    const config = await ProgramConfig.findOne({ configType: 'global', caregiverId: null });
    
    if (!config) {
      console.log('❌ No global config found');
      return;
    }
    
    console.log('\n📊 Current Structure Analysis:');
    console.log('====================================');
    
    // Show current contentManagement structure
    if (config.contentManagement) {
      if (config.contentManagement.audioContent) {
        console.log('\n🎵 audioContent structure:');
        console.log(JSON.stringify(config.contentManagement.audioContent, null, 2));
        
        // Check for both possible structures
        console.log('\n🔍 Checking for Day 0 content:');
        
        // Check numeric key approach (what our manual test used)
        if (config.contentManagement.audioContent['0']) {
          console.log('📁 Found audioContent[0]:', config.contentManagement.audioContent['0']);
        }
        
        // Check string key approach
        if (config.contentManagement.audioContent['Day 0']) {
          console.log('📁 Found audioContent["Day 0"]:', config.contentManagement.audioContent['Day 0']);
        }
        
        // Check direct day approach
        if (config.contentManagement.audioContent.day) {
          console.log('📁 Found audioContent.day:', config.contentManagement.audioContent.day);
        }
        
        // List all keys
        console.log('\n🗂️ All audioContent keys:', Object.keys(config.contentManagement.audioContent));
      } else {
        console.log('❌ No audioContent found in contentManagement');
      }
    } else {
      console.log('❌ No contentManagement found');
    }
    
    console.log('\n✅ Analysis complete');
    
  } catch (error) {
    console.error('❌ Error analyzing structure:', error);
  } finally {
    mongoose.connection.close();
  }
}

analyzeStructure();