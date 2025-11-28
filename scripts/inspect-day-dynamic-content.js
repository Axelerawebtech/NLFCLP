const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const targetDay = parseInt(process.argv[2] || '4', 10);

(async function inspectDay() {
  try {
    if (Number.isNaN(targetDay)) {
      throw new Error('Invalid day number provided');
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(mongoUri);
    const ProgramConfig = mongoose.models.ProgramConfig || mongoose.model(
      'ProgramConfig',
      new mongoose.Schema({}, { strict: false }),
      'programconfigs'
    );

    const configs = await ProgramConfig.find({});
    console.log(`Found ${configs.length} ProgramConfig documents.`);

    configs.forEach(doc => {
      const docId = doc._id?.toString();
      const type = doc.configType || 'unknown';
      const matchesDay = (entry) => Number(entry?.dayNumber) === targetDay;

      const structureMatches = (doc.dynamicDayStructures || []).filter(matchesDay);
      const translationMatches = (doc.dynamicDayTranslations || []).filter(matchesDay);
      const legacyMatches = (doc.dynamicDays || []).filter(matchesDay);

      if (structureMatches.length || translationMatches.length || legacyMatches.length) {
        console.log(`\nDoc ${docId} [${type}] contains Day ${targetDay}:`);
        if (structureMatches.length) {
          console.log(' • Structures:', structureMatches.map(s => ({ dayNumber: s.dayNumber, baseLanguage: s.baseLanguage, hasTest: s.hasTest })));        }
        if (translationMatches.length) {
          console.log(' • Translations:', translationMatches.map(t => ({ dayNumber: t.dayNumber, language: t.language })));        }
        if (legacyMatches.length) {
          console.log(' • Legacy dynamicDays:', legacyMatches.map(d => ({ dayNumber: d.dayNumber, language: d.language, hasTest: d.hasTest })));        }
      }
    });
  } catch (err) {
    console.error('Error inspecting day config:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  }
})();
