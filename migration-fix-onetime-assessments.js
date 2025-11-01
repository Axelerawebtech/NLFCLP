const mongoose = require('mongoose');

// Import the enhanced model
const CaregiverProgram = require('./models/CaregiverProgramEnhanced').default;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/NLFC';

/**
 * Migration Script: Fix Missing One-Time Assessments
 * 
 * This script identifies caregivers who have completed burden assessments
 * but don't have proper records in their oneTimeAssessments array.
 * It migrates data from dailyAssessments or other locations to oneTimeAssessments.
 */

async function migrateOneTimeAssessments() {
  try {
    console.log('🔄 Starting one-time assessments migration...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all caregiver programs
    const programs = await CaregiverProgram.find({});
    console.log(`📊 Found ${programs.length} caregiver programs to check`);

    let migratedCount = 0;
    let alreadyCorrectCount = 0;
    let issuesFound = [];

    for (const program of programs) {
      console.log(`\n🔍 Checking caregiver: ${program.caregiverName} (ID: ${program.caregiverId})`);
      
      let needsMigration = false;
      let migrationActions = [];

      // Check if program has burden level but no one-time assessment
      if (program.burdenLevel && (!program.oneTimeAssessments || program.oneTimeAssessments.length === 0)) {
        console.log('  ⚠️ Has burden level but no one-time assessments');
        needsMigration = true;
        
        // Look for Zarit assessment in dailyAssessments (Day 1)
        const day1Module = program.dayModules?.find(m => m.day === 1);
        if (day1Module?.dailyAssessment?.assessmentType === 'zarit_burden') {
          console.log('  📋 Found Zarit assessment in Day 1 dailyAssessments');
          
          // Create one-time assessment from daily assessment
          const zaritAssessment = {
            type: 'zarit_burden',
            responses: Array.isArray(day1Module.dailyAssessment.responses) 
              ? day1Module.dailyAssessment.responses 
              : [],
            totalScore: day1Module.dailyAssessment.totalScore || 0,
            scoreLevel: day1Module.dailyAssessment.scoreLevel || program.burdenLevel,
            completedAt: day1Module.dailyAssessment.completedAt || new Date(),
            language: 'english',
            totalQuestions: 22, // Standard Zarit has 22 questions
            // Migration metadata
            assessmentDetails: {
              migratedFrom: 'dailyAssessments',
              migrationDate: new Date(),
              originalLocation: 'dayModules[day:1].dailyAssessment'
            },
            metadata: {
              submissionMethod: 'migrated_from_daily',
              migrationSource: 'fix_missing_onetime_assessments_script',
              timestamp: new Date().toISOString()
            },
            locked: false,
            canRetakeAssessment: true,
            retakeCount: 0,
            maxRetakes: 3
          };
          
          if (!program.oneTimeAssessments) {
            program.oneTimeAssessments = [];
          }
          
          program.oneTimeAssessments.push(zaritAssessment);
          migrationActions.push('Added Zarit assessment from dailyAssessments');
          
        } else {
          // Create placeholder assessment based on burden level
          console.log('  🔧 Creating placeholder assessment based on burden level');
          
          // Estimate score based on burden level (for tracking purposes)
          let estimatedScore = 0;
          if (program.burdenLevel === 'mild') estimatedScore = 20;
          else if (program.burdenLevel === 'moderate') estimatedScore = 50;
          else if (program.burdenLevel === 'severe') estimatedScore = 70;
          
          const placeholderAssessment = {
            type: 'zarit_burden',
            responses: [], // No detailed responses available
            totalScore: estimatedScore,
            scoreLevel: program.burdenLevel,
            completedAt: program.programStartedAt || new Date(),
            language: 'english',
            totalQuestions: 22,
            // Migration metadata
            assessmentDetails: {
              migratedFrom: 'burden_level_only',
              migrationDate: new Date(),
              isPlaceholder: true,
              note: 'Created from existing burden level - detailed responses not available'
            },
            metadata: {
              submissionMethod: 'migrated_placeholder',
              migrationSource: 'fix_missing_onetime_assessments_script',
              timestamp: new Date().toISOString()
            },
            locked: false,
            canRetakeAssessment: true,
            retakeCount: 0,
            maxRetakes: 3
          };
          
          if (!program.oneTimeAssessments) {
            program.oneTimeAssessments = [];
          }
          
          program.oneTimeAssessments.push(placeholderAssessment);
          migrationActions.push('Created placeholder Zarit assessment from burden level');
        }
      }

      // Check for duplicate assessments
      if (program.oneTimeAssessments && program.oneTimeAssessments.length > 0) {
        const zaritAssessments = program.oneTimeAssessments.filter(a => a.type === 'zarit_burden');
        if (zaritAssessments.length > 1) {
          console.log(`  ⚠️ Found ${zaritAssessments.length} duplicate Zarit assessments`);
          
          // Keep the most recent one
          const mostRecent = zaritAssessments.sort((a, b) => 
            new Date(b.completedAt) - new Date(a.completedAt)
          )[0];
          
          program.oneTimeAssessments = program.oneTimeAssessments.filter(a => 
            a.type !== 'zarit_burden' || a._id.equals(mostRecent._id)
          );
          
          migrationActions.push(`Removed ${zaritAssessments.length - 1} duplicate assessments`);
          needsMigration = true;
        }
      }

      // Save changes if needed
      if (needsMigration) {
        try {
          program.markModified('oneTimeAssessments');
          await program.save();
          
          console.log('  ✅ Migration completed:', migrationActions.join(', '));
          migratedCount++;
          
        } catch (saveError) {
          console.error('  ❌ Error saving migration:', saveError.message);
          issuesFound.push({
            caregiverId: program.caregiverId,
            caregiverName: program.caregiverName,
            error: saveError.message,
            actions: migrationActions
          });
        }
      } else {
        console.log('  ✅ Already has correct one-time assessments');
        alreadyCorrectCount++;
      }
    }

    console.log('\n📊 MIGRATION SUMMARY:');
    console.log(`  ✅ Programs migrated: ${migratedCount}`);
    console.log(`  ✅ Programs already correct: ${alreadyCorrectCount}`);
    console.log(`  ❌ Issues encountered: ${issuesFound.length}`);

    if (issuesFound.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      issuesFound.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.caregiverName} (${issue.caregiverId})`);
        console.log(`     Error: ${issue.error}`);
        console.log(`     Attempted: ${issue.actions.join(', ')}`);
      });
    }

    console.log('\n🎯 MIGRATION COMPLETE');
    console.log('All future burden test submissions will now be properly recorded in oneTimeAssessments.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateOneTimeAssessments()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration script error:', error);
      process.exit(1);
    });
}

module.exports = { migrateOneTimeAssessments };