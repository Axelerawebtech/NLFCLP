// Script to add question translations (q1..q26) and optionTranslations to the active WHOQOL questionnaire
// Usage: node scripts/add-question-translations.js

const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const mongoose = require('mongoose');
const dbConnect = require('../lib/mongodb').default || require('../lib/mongodb');
const Questionnaire = require('../models/Questionnaire').default || require('../models/Questionnaire');
const { translations } = require('../lib/translations');

(async function main() {
  try {
    await dbConnect();
    console.log('Connected to DB');

    const questionnaire = await Questionnaire.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (!questionnaire) {
      console.error('No active questionnaire found');
      process.exit(1);
    }

    console.log('Found questionnaire:', questionnaire.title);

    const canonicalOptionSets = {
      qualityOfLife: ['Very poor', 'Poor', 'Neither poor nor good', 'Good', 'Very good'],
      satisfaction: ['Very dissatisfied', 'Dissatisfied', 'Neither satisfied nor dissatisfied', 'Satisfied', 'Very satisfied'],
      extent: ['Not at all', 'A little', 'A moderate amount', 'Very much', 'An extreme amount'],
    };

    const optionKeys = {
      qualityOfLife: ['veryPoor','poor','neitherPoorNorGood','good','veryGood'],
      satisfaction: ['veryDissatisfied','dissatisfied','neitherSatisfiedNorDissatisfied','satisfied','verySatisfied'],
      extent: ['notAtAll','aLittle','aModerateAmount','veryMuch','anExtremeAmount'],
    };

    const normalize = s => (s||'').toString().trim().toLowerCase();

    // common synonyms mapping to canonical translation keys
    const synonymToKey = {
      'moderately': 'aModerateAmount',
      'mostly': 'veryMuch',
      'completely': 'anExtremeAmount',
      'never': 'notAtAll',
      'seldom': 'aLittle',
      'quite often': 'aModerateAmount',
      'quiteoften': 'aModerateAmount',
      'very often': 'veryMuch',
      'always': 'anExtremeAmount'
    };

    const qDocs = questionnaire.questions || [];
    for (let i=0;i<qDocs.length;i++){
      const q = qDocs[i];
      const qIndex = i+1;
      // Attach translations from translations.js if available
      q.translations = q.translations || {};
      q.translations.en = translations.en[`q${qIndex}`] || q.questionText;
      q.translations.hi = translations.hi[`q${qIndex}`] || q.translations.hi || q.questionText;
      q.translations.kn = translations.kn[`q${qIndex}`] || q.translations.kn || q.questionText;

      // Prepare optionTranslations
      if (Array.isArray(q.options) && q.options.length>0) {
        q.optionTranslations = q.optionTranslations || {};
        q.optionTranslations.en = q.options.slice();
        // determine which canonical set this question uses
        const optNorm = q.options.map(normalize);
        let matchedSet = null;
        for (const [setName, canon] of Object.entries(canonicalOptionSets)) {
          const canonNorm = canon.map(normalize);
          if (canonNorm.length === optNorm.length) {
            // fuzzy match by substring
            const ok = canonNorm.every((c, idx) => optNorm[idx] === c || optNorm[idx].includes(c) || c.includes(optNorm[idx]));
            if (ok) { matchedSet = setName; break; }
          }
        }

        if (!matchedSet) {
          // try to find by matching individual option items to any canonical set
          for (const [setName, canon] of Object.entries(canonicalOptionSets)) {
            const canonNorm = canon.map(normalize);
            let score = 0;
            for (let j=0;j<optNorm.length;j++){
              for (let k=0;k<canonNorm.length;k++){
                if (optNorm[j] === canonNorm[k] || optNorm[j].includes(canonNorm[k]) || canonNorm[k].includes(optNorm[j])) {
                  score++;
                  break;
                }
              }
            }
            if (score >= optNorm.length) { matchedSet = setName; break; }
          }

          // try synonyms mapping: map each option to a known translation key
          if (!matchedSet) {
            const synonymKeys = [];
            let allSynonyms = true;
            for (let j=0;j<optNorm.length;j++){
              const o = optNorm[j];
              // direct lookup
              if (synonymToKey[o]) {
                synonymKeys.push(synonymToKey[o]);
                continue;
              }
              // try substrings
              let found = false;
              for (const sKey of Object.keys(synonymToKey)) {
                if (o.includes(sKey) || sKey.includes(o)) {
                  synonymKeys.push(synonymToKey[sKey]);
                  found = true;
                  break;
                }
              }
              if (!found) { allSynonyms = false; break; }
            }
            if (allSynonyms) {
              q.optionTranslations.hi = synonymKeys.map(k => translations.hi[k] || k);
              q.optionTranslations.kn = synonymKeys.map(k => translations.kn[k] || k);
              // skip further handling for this question
              continue;
            }
          }

        }

        if (matchedSet) {
          const keys = optionKeys[matchedSet];
          q.optionTranslations.hi = keys.map(k => translations.hi[k] || q.options[keys.indexOf(k)]);
          q.optionTranslations.kn = keys.map(k => translations.kn[k] || q.options[keys.indexOf(k)]);
        } else {
          // fallback: try to translate each option by loose mapping to known translation keys
          q.optionTranslations.hi = q.options.map(opt => {
            // try to find a matching key in translations.en
            for (let kName in translations.en) {
              if (kName.startsWith('q')) continue;
              const enVal = normalize(translations.en[kName]);
              if (enVal && normalize(opt).includes(enVal) || enVal.includes(normalize(opt))) return translations.hi[kName] || opt;
            }
            return opt;
          });
          q.optionTranslations.kn = q.options.map(opt => {
            for (let kName in translations.en) {
              if (kName.startsWith('q')) continue;
              const enVal = normalize(translations.en[kName]);
              if (enVal && normalize(opt).includes(enVal) || enVal.includes(normalize(opt))) return translations.kn[kName] || opt;
            }
            return opt;
          });
        }
      }
    }

    questionnaire.questions = qDocs;
    await questionnaire.save();
    console.log('Questionnaire updated with translations and optionTranslations');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
