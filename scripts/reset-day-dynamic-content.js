const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const targetDay = parseInt(process.argv[2] || '4', 10);

if (Number.isNaN(targetDay)) {
  console.error('❌ Invalid day number provided. Pass a numeric day (e.g. "4").');
  process.exit(1);
}

async function resetDay() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined. Add it to .env.local');
  }

  console.log(`🔌 Connecting to MongoDB… (day ${targetDay})`);
  await mongoose.connect(mongoUri);

  const ProgramConfig = mongoose.models.ProgramConfig || mongoose.model(
    'ProgramConfig',
    new mongoose.Schema({}, { strict: false }),
    'programconfigs'
  );

  const config = await ProgramConfig.findOne({ configType: 'global' });
  if (!config) {
    console.log('⚠️  Global ProgramConfig not found. Nothing to reset.');
    return;
  }

  const summary = {
    structuresRemoved: 0,
    translationsRemoved: 0,
    legacyRemoved: 0
  };

  const matchesDay = (entry) => Number(entry?.dayNumber) === targetDay;

  if (Array.isArray(config.dynamicDayStructures)) {
    const existing = config.dynamicDayStructures.filter(matchesDay);
    if (existing.length) {
      console.log(`Found ${existing.length} matching structures before removal`);
    }
    const before = config.dynamicDayStructures.length;
    const normalizedStructures = config.dynamicDayStructures.map(entry => entry?.toObject?.() ?? entry);
    const filtered = normalizedStructures.filter(entry => !matchesDay(entry));
    config.set('dynamicDayStructures', filtered);
    summary.structuresRemoved = before - config.dynamicDayStructures.length;
    if (summary.structuresRemoved > 0) {
      config.markModified('dynamicDayStructures');
    }
  }

  if (Array.isArray(config.dynamicDayTranslations)) {
    const existing = config.dynamicDayTranslations.filter(matchesDay);
    if (existing.length) {
      console.log(`Found ${existing.length} matching translations before removal`);
    }
    const before = config.dynamicDayTranslations.length;
    const normalizedTranslations = config.dynamicDayTranslations.map(entry => entry?.toObject?.() ?? entry);
    const filtered = normalizedTranslations.filter(entry => !matchesDay(entry));
    config.set('dynamicDayTranslations', filtered);
    summary.translationsRemoved = before - config.dynamicDayTranslations.length;
    if (summary.translationsRemoved > 0) {
      config.markModified('dynamicDayTranslations');
    }
  }

  if (Array.isArray(config.dynamicDays)) {
    const existing = config.dynamicDays.filter(matchesDay);
    if (existing.length) {
      console.log(`Found ${existing.length} legacy dynamic days before removal`);
    }
    const before = config.dynamicDays.length;
    const normalizedLegacy = config.dynamicDays.map(entry => entry?.toObject?.() ?? entry);
    const filtered = normalizedLegacy.filter(entry => !matchesDay(entry));
    config.set('dynamicDays', filtered);
    summary.legacyRemoved = before - config.dynamicDays.length;
    if (summary.legacyRemoved > 0) {
      config.markModified('dynamicDays');
    }
  }

  await config.save();

  console.log('✅ Reset complete. Removed entries:', summary);
  console.log('   • dynamicDayStructures:', summary.structuresRemoved);
  console.log('   • dynamicDayTranslations:', summary.translationsRemoved);
  console.log('   • legacy dynamicDays:', summary.legacyRemoved);
  console.log('ℹ️  You can now re-import or rebuild Day', targetDay);
}

resetDay()
  .catch(err => {
    console.error('❌ Failed to reset day:', err.message);
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  });
