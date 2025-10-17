// Script to update all existing caregiver programs with Day 0 content from ProgramConfig
// Run this script after uploading Day 0 videos in admin dashboard

const mongoose = require('mongoose');
const dbConnect = require('../lib/mongodb');
const CaregiverProgram = require('../models/CaregiverProgram');
const ProgramConfig = require('../models/ProgramConfig');

async function updateAllDay0Content() {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    
    console.log('Fetching global program configuration...');
    const programConfig = await ProgramConfig.findOne({ configType: 'global' });
    
    if (!programConfig || !programConfig.day0IntroVideo) {
      console.error('❌ Day 0 configuration not found in ProgramConfig');
      console.log('Please upload Day 0 videos in the admin dashboard first.');
      process.exit(1);
    }
    
    console.log('✅ Day 0 configuration found');
    console.log('Video titles:', programConfig.day0IntroVideo.title);
    
    console.log('\nFetching all caregiver programs...');
    const programs = await CaregiverProgram.find({});
    
    if (programs.length === 0) {
      console.log('No caregiver programs found.');
      process.exit(0);
    }
    
    console.log(`Found ${programs.length} caregiver program(s)`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const program of programs) {
      const day0Module = program.dayModules.find(m => m.day === 0);
      
      if (!day0Module) {
        console.log(`⚠️  Skipping caregiver ${program.caregiverId}: No Day 0 module found`);
        skippedCount++;
        continue;
      }
      
      // Update Day 0 content
      day0Module.videoTitle = programConfig.day0IntroVideo.title;
      day0Module.videoUrl = programConfig.day0IntroVideo.videoUrl;
      day0Module.content = programConfig.day0IntroVideo.description;
      
      await program.save();
      updatedCount++;
      console.log(`✅ Updated Day 0 content for caregiver ${program.caregiverId}`);
    }
    
    console.log('\n=== Update Summary ===');
    console.log(`Total programs: ${programs.length}`);
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`⚠️  Skipped: ${skippedCount}`);
    console.log('\nDay 0 content update completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating Day 0 content:', error);
    process.exit(1);
  }
}

// Run the script
updateAllDay0Content();
