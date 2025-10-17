import dbConnect from '../../../lib/mongodb';
import Caregiver from '../../../models/Caregiver';
import Patient from '../../../models/Patient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { type } = req.query; // 'caregivers', 'patients', or 'all'

    let csvData = '';
    
    if (type === 'caregivers' || type === 'all') {
      const caregivers = await Caregiver.find({});
      
      // CSV Headers for caregivers - expanded to include individual questionnaire fields
      const caregiverHeaders = [
        'Type', 'Caregiver ID', 'Name', 'Email', 'Phone', 'Relationship to Patient',
        'Assigned Status', 'Consent Accepted', 'Consent Date', 'Registration Date',
        // Questionnaire fields
        'Q1: Comfort with Technology', 'Q2: Daily Support Hours', 'Q3: Previous Caregiving Experience',
        'Q4: Primary Concerns', 'Q5: Support Preferences', 'Q6: Communication Method',
        'Q7: Emergency Contact', 'Q8: Special Needs', 'All Questionnaire Answers (JSON)'
      ];
      
      csvData += caregiverHeaders.join(',') + '\n';
      
      caregivers.forEach(caregiver => {
        const answers = caregiver.questionnaireAnswers || {};
        
        const row = [
          'Caregiver',
          `"${caregiver.caregiverId || ''}"`,
          `"${(caregiver.name || '').replace(/"/g, '""')}"`,
          `"${(caregiver.email || '').replace(/"/g, '""')}"`,
          `"${(caregiver.phone || '').replace(/"/g, '""')}"`,
          `"${(caregiver.relationshipToPatient || '').replace(/"/g, '""')}"`,
          caregiver.isAssigned ? 'Assigned' : 'Available',
          caregiver.consentAccepted ? 'Yes' : 'No',
          caregiver.consentAcceptedAt ? `"${new Date(caregiver.consentAcceptedAt).toLocaleDateString()}"` : '',
          caregiver.createdAt ? `"${new Date(caregiver.createdAt).toLocaleDateString()}"` : '',
          // Individual questionnaire answers
          `"${(answers.comfortWithTechnology || answers.q1 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.dailySupportHours || answers.q2 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.previousExperience || answers.q3 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.primaryConcerns || answers.q4 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.supportPreferences || answers.q5 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.communicationMethod || answers.q6 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.emergencyContact || answers.q7 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.specialNeeds || answers.q8 || '').toString().replace(/"/g, '""')}"`,
          `"${JSON.stringify(answers).replace(/"/g, '""')}"`
        ];
        csvData += row.join(',') + '\n';
      });
      
      if (type === 'all') csvData += '\n';
    }
    
    if (type === 'patients' || type === 'all') {
      const patients = await Patient.find({});
      
      // CSV Headers for patients - expanded to include individual questionnaire fields
      const patientHeaders = [
        'Type', 'Patient ID', 'Name', 'Email', 'Phone', 'Age', 'Cancer Type', 'Cancer Stage',
        'Diagnosis Date', 'Assigned Status', 'Consent Accepted', 'Consent Date', 'Registration Date',
        // Questionnaire fields
        'Q1: Current Symptoms', 'Q2: Pain Level', 'Q3: Treatment Status', 'Q4: Side Effects',
        'Q5: Mobility Level', 'Q6: Support Needs', 'Q7: Medical History', 'Q8: Medications',
        'All Questionnaire Answers (JSON)'
      ];
      
      if (type === 'patients') {
        csvData += patientHeaders.join(',') + '\n';
      } else {
        csvData += patientHeaders.join(',') + '\n';
      }
      
      patients.forEach(patient => {
        const answers = patient.questionnaireAnswers || {};
        
        const row = [
          'Patient',
          `"${patient.patientId || ''}"`,
          `"${(patient.name || '').replace(/"/g, '""')}"`,
          `"${(patient.email || '').replace(/"/g, '""')}"`,
          `"${(patient.phone || '').replace(/"/g, '""')}"`,
          `"${(patient.age || '').toString().replace(/"/g, '""')}"`,
          `"${(patient.cancerType || '').replace(/"/g, '""')}"`,
          `"${(patient.cancerStage || '').replace(/"/g, '""')}"`,
          patient.diagnosisDate ? `"${new Date(patient.diagnosisDate).toLocaleDateString()}"` : '',
          patient.isAssigned ? 'Assigned' : 'Waiting',
          patient.consentAccepted ? 'Yes' : 'No',
          patient.consentAcceptedAt ? `"${new Date(patient.consentAcceptedAt).toLocaleDateString()}"` : '',
          patient.createdAt ? `"${new Date(patient.createdAt).toLocaleDateString()}"` : '',
          // Individual questionnaire answers
          `"${(answers.currentSymptoms || answers.q1 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.painLevel || answers.q2 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.treatmentStatus || answers.q3 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.sideEffects || answers.q4 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.mobilityLevel || answers.q5 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.supportNeeds || answers.q6 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.medicalHistory || answers.q7 || '').toString().replace(/"/g, '""')}"`,
          `"${(answers.medications || answers.q8 || '').toString().replace(/"/g, '""')}"`,
          `"${JSON.stringify(answers).replace(/"/g, '""')}"`
        ];
        csvData += row.join(',') + '\n';
      });
    }

    // Set headers for CSV file download with proper encoding
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="users_${type}_${new Date().toISOString().split('T')[0]}.csv"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Add BOM for proper Excel compatibility
    const csvWithBOM = '\uFEFF' + csvData;
    
    res.status(200).send(csvWithBOM);

  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ message: 'Failed to export CSV', error: error.message });
  }
}