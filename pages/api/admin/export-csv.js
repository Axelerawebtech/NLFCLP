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
      
      // CSV Headers for caregivers
      const caregiverHeaders = [
        'Type', 'ID', 'Name', 'Email', 'Phone', 'Assigned', 'Consent Accepted', 
        'Consent Date', 'Created At', 'Questionnaire Answers'
      ];
      
      csvData += caregiverHeaders.join(',') + '\n';
      
      caregivers.forEach(caregiver => {
        const row = [
          'Caregiver',
          caregiver.caregiverId || '',
          `"${caregiver.name || ''}"`,
          caregiver.email || '',
          caregiver.phone || '',
          caregiver.isAssigned ? 'Yes' : 'No',
          caregiver.consentAccepted ? 'Yes' : 'No',
          caregiver.consentAcceptedAt ? new Date(caregiver.consentAcceptedAt).toLocaleDateString() : '',
          caregiver.createdAt ? new Date(caregiver.createdAt).toLocaleDateString() : '',
          `"${JSON.stringify(caregiver.questionnaireAnswers || {}).replace(/"/g, '""')}"`
        ];
        csvData += row.join(',') + '\n';
      });
      
      if (type === 'all') csvData += '\n';
    }
    
    if (type === 'patients' || type === 'all') {
      const patients = await Patient.find({});
      
      // CSV Headers for patients
      const patientHeaders = [
        'Type', 'ID', 'Name', 'Email', 'Phone', 'Age', 'Cancer Type', 'Diagnosis Date',
        'Assigned', 'Consent Accepted', 'Consent Date', 'Created At', 'Questionnaire Answers'
      ];
      
      if (type === 'patients') {
        csvData += patientHeaders.join(',') + '\n';
      } else {
        csvData += patientHeaders.join(',') + '\n';
      }
      
      patients.forEach(patient => {
        const row = [
          'Patient',
          patient.patientId || '',
          `"${patient.name || ''}"`,
          patient.email || '',
          patient.phone || '',
          patient.age || '',
          patient.cancerType || '',
          patient.diagnosisDate ? new Date(patient.diagnosisDate).toLocaleDateString() : '',
          patient.isAssigned ? 'Yes' : 'No',
          patient.consentAccepted ? 'Yes' : 'No',
          patient.consentAcceptedAt ? new Date(patient.consentAcceptedAt).toLocaleDateString() : '',
          patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '',
          `"${JSON.stringify(patient.questionnaireAnswers || {}).replace(/"/g, '""')}"`
        ];
        csvData += row.join(',') + '\n';
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="users_${type}_${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.status(200).send(csvData);

  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ message: 'Failed to export CSV', error: error.message });
  }
}