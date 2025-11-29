/**
 * Admin API to fix corrupted questionnaire answers
 * Detects and clears patient objects stored in questionnaireAnswers
 */

import dbConnect from '../../../lib/mongodb';
import Patient from '../../../models/Patient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const patients = await Patient.find({});
    let fixedCount = 0;
    const results = [];

    for (const patient of patients) {
      if (!patient.questionnaireAnswers || !Array.isArray(patient.questionnaireAnswers) || patient.questionnaireAnswers.length === 0) {
        continue;
      }

      // Check if answers contain corrupted data (patient objects instead of answers)
      const hasCorrupted = patient.questionnaireAnswers.some(answer => {
        // If answer contains patient object properties like 'name', 'phone', 'age'
        if (!answer) return false;
        return answer.name || answer.phone || answer.age || answer.gender || answer.cancerType;
      });

      if (hasCorrupted) {
        console.log(`[Cleanup] Fixing corrupted data for patient: ${patient.patientId}`);
        
        // Clear corrupted data
        await Patient.updateOne({ _id: patient._id }, { questionnaireAnswers: [] });
        fixedCount++;
        
        results.push({
          patientId: patient.patientId,
          name: patient.name,
          status: 'fixed',
          previousLength: patient.questionnaireAnswers.length
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Fixed ${fixedCount} patients with corrupted data`,
      fixedCount,
      results
    });
  } catch (error) {
    console.error('[Cleanup API] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean corrupted data',
      error: error.message
    });
  }
}
