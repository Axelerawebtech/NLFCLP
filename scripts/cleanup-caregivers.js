const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const Caregiver = mongoose.model('Caregiver', new mongoose.Schema({}, { strict: false, collection: 'caregivers' }));
const CaregiverProgram = mongoose.model('CaregiverProgram', new mongoose.Schema({}, { strict: false, collection: 'caregiverprograms' }));
const UserProgress = mongoose.model('UserProgress', new mongoose.Schema({}, { strict: false, collection: 'userprogresses' }));
const TestResponse = mongoose.model('TestResponse', new mongoose.Schema({}, { strict: false, collection: 'testresponses' }));
const TaskResponse = mongoose.model('TaskResponse', new mongoose.Schema({}, { strict: false, collection: 'taskresponses' }));

async function cleanupCaregivers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: List all caregivers
    const allCaregivers = await Caregiver.find({}, { name: 1, email: 1, phone: 1, createdAt: 1 }).sort({ createdAt: -1 });
    
    console.log(`📊 Found ${allCaregivers.length} caregivers in database:\n`);
    
    allCaregivers.forEach((caregiver, index) => {
      console.log(`${index + 1}. Name: ${caregiver.name || 'N/A'}`);
      console.log(`   ID: ${caregiver._id}`);
      console.log(`   Email: ${caregiver.email || 'N/A'}`);
      console.log(`   Phone: ${caregiver.phone || 'N/A'}`);
      console.log(`   Created: ${caregiver.createdAt || 'N/A'}`);
      console.log('');
    });

    // Step 2: Ask which caregiver to keep
    console.log('\n⚠️  CAUTION: This script will DELETE caregivers and ALL their associated data!');
    console.log('\nTo keep a specific caregiver, edit this script and set CAREGIVER_TO_KEEP variable.\n');
    
    // SET THIS TO THE NAME OR ID OF THE CAREGIVER YOU WANT TO KEEP
    const CAREGIVER_TO_KEEP = 'caregiverone'; // Change this to your caregiver's name or ObjectId
    
    // Find the caregiver to keep from the already fetched list
    let keepCaregiver = allCaregivers.find(c => {
      if (mongoose.Types.ObjectId.isValid(CAREGIVER_TO_KEEP)) {
        return c._id.toString() === CAREGIVER_TO_KEEP;
      } else {
        return c.name && c.name.toLowerCase() === CAREGIVER_TO_KEEP.toLowerCase();
      }
    });

    if (!keepCaregiver) {
      console.log(`❌ Could not find caregiver: ${CAREGIVER_TO_KEEP}`);
      console.log('Please check the name/ID and try again.');
      console.log(`\nAvailable caregivers: ${allCaregivers.map(c => c.name || 'N/A').join(', ')}`);
      process.exit(1);
    }
    
    // Get full document
    keepCaregiver = await Caregiver.findById(keepCaregiver._id);

    console.log(`\n✅ Will KEEP this caregiver:`);
    console.log(`   Name: ${keepCaregiver.name}`);
    console.log(`   ID: ${keepCaregiver._id}`);
    console.log(`   Email: ${keepCaregiver.email || 'N/A'}`);
    console.log('');

    // Step 3: Find caregivers to delete
    const caregiversToDelete = await Caregiver.find({ 
      _id: { $ne: keepCaregiver._id } 
    });

    console.log(`\n🗑️  Will DELETE ${caregiversToDelete.length} caregivers:\n`);
    caregiversToDelete.forEach((caregiver, index) => {
      console.log(`${index + 1}. ${caregiver.name || 'N/A'} (${caregiver._id})`);
    });

    // Step 4: DRY RUN - Show what will be deleted
    console.log('\n\n📋 CHECKING ASSOCIATED DATA...\n');
    
    const caregiverIdsToDelete = caregiversToDelete.map(c => c._id);
    
    const programsCount = await CaregiverProgram.countDocuments({ 
      caregiverId: { $in: caregiverIdsToDelete } 
    });
    
    const progressCount = await UserProgress.countDocuments({ 
      caregiverId: { $in: caregiverIdsToDelete } 
    });
    
    const testResponsesCount = await TestResponse.countDocuments({ 
      caregiverId: { $in: caregiverIdsToDelete } 
    });
    
    const taskResponsesCount = await TaskResponse.countDocuments({ 
      caregiverId: { $in: caregiverIdsToDelete } 
    });

    console.log(`Associated data to be deleted:`);
    console.log(`  - ${programsCount} caregiver program documents`);
    console.log(`  - ${progressCount} user progress documents`);
    console.log(`  - ${testResponsesCount} test response documents`);
    console.log(`  - ${taskResponsesCount} task response documents`);

    // Step 5: Execute deletion (UNCOMMENT TO ACTUALLY DELETE)
    console.log('\n\n⚠️  THIS IS A DRY RUN - NO DATA DELETED YET!\n');
    console.log('To actually delete the data, uncomment the deletion code in the script.\n');
    
    /*
    // UNCOMMENT THIS BLOCK TO ACTUALLY DELETE DATA
    console.log('\n🚨 STARTING DELETION...\n');
    
    // Delete associated data first
    const deletedPrograms = await CaregiverProgram.deleteMany({ 
      caregiverId: { $in: caregiverIdsToDelete } 
    });
    console.log(`✅ Deleted ${deletedPrograms.deletedCount} caregiver programs`);
    
    const deletedProgress = await UserProgress.deleteMany({ 
      caregiverId: { $in: caregiverIdsToDelete } 
    });
    console.log(`✅ Deleted ${deletedProgress.deletedCount} user progress documents`);
    
    const deletedTestResponses = await TestResponse.deleteMany({ 
      caregiverId: { $in: caregiverIdsToDelete } 
    });
    console.log(`✅ Deleted ${deletedTestResponses.deletedCount} test responses`);
    
    const deletedTaskResponses = await TaskResponse.deleteMany({ 
      caregiverId: { $in: caregiverIdsToDelete } 
    });
    console.log(`✅ Deleted ${deletedTaskResponses.deletedCount} task responses`);
    
    // Finally delete the caregivers
    const deletedCaregivers = await Caregiver.deleteMany({ 
      _id: { $in: caregiverIdsToDelete } 
    });
    console.log(`✅ Deleted ${deletedCaregivers.deletedCount} caregivers`);
    
    console.log('\n✅ CLEANUP COMPLETE!\n');
    
    // Verify final count
    const remainingCount = await Caregiver.countDocuments();
    console.log(`Remaining caregivers in database: ${remainingCount}`);
    */

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanupCaregivers();
