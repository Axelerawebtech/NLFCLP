const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const ProgramConfigSchema = new mongoose.Schema({
  configType: String,
  dynamicDays: Array
}, { strict: false });

const ProgramConfig = mongoose.model('ProgramConfig', ProgramConfigSchema);

async function cleanup() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    if (!config) {
      console.log('❌ No global config found');
      return;
    }

    console.log(`📊 Found ${config.dynamicDays?.length || 0} dynamic days in database\n`);

    if (config.dynamicDays && config.dynamicDays.length > 0) {
      console.log('🗑️  Cleaning up old dynamic days data...');
      
      // Remove all old dynamic days
      config.dynamicDays = [];
      config.markModified('dynamicDays');
      await config.save();
      
      console.log('✅ All dynamic days data cleared!\n');
      console.log('🎉 You can now create new language-specific configurations');
    } else {
      console.log('✨ No dynamic days to clean up');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

cleanup();
